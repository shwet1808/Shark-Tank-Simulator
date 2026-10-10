import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';
import { AIProvider } from '../types/index.js';

// --- Provider clients (lazily constructed) ---

// OpenRouter client — routes to various open-source and premium models
const openRouter = new OpenAI({
  apiKey: config.ai.openRouterKey || 'missing',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3001',
    'X-Title': 'Shark Tank Simulator',
  },
});

// Standard OpenAI client as final fallback
const standardOpenAI = new OpenAI({
  apiKey: config.ai.openaiKey || 'missing',
});

let genAIClient: GoogleGenAI | null = null;

// Singleton Gemini client — constructed only when a key is present
function getGenAI(): GoogleGenAI | null {
  const key = config.ai.geminiKey;
  if (!key || key.trim().length === 0) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: key });
  }
  return genAIClient;
}

export type AIChatParams = {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
};

// Status codes indicating a recoverable failure (try another provider)
const RECOVERABLE_STATUS = new Set([408, 429, 502, 503, 504]);

// Determine whether an error justifies a failover attempt
function isRecoverableError(err: any): boolean {
  const status = err?.status;
  if (status && RECOVERABLE_STATUS.has(status)) return true;
  // Network-level failures usually lack an HTTP status code
  if (!status && err?.code) return true;
  return false;
}

// Build the provider chain: [primary, secondary, openai]
function getProviderOrder(): AIProvider[] {
  const primary = config.ai.primaryProvider;
  const secondary: AIProvider =
    primary === 'gemini' ? 'openrouter' : 'gemini';
  // Always include standard OpenAI as the last resort
  return [primary, secondary, 'openai'];
}

// --- Individual provider call implementations ---

async function callGemini(params: AIChatParams): Promise<string> {
  const ai = getGenAI();
  if (!ai) throw new Error('No Gemini API key configured');

  // Gemini requires separating the system instruction from chat messages
  const systemMsg = params.messages.find((m) => m.role === 'system');
  const chatMessages = params.messages.filter((m) => m.role !== 'system');

  const contents = chatMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents:
      contents.length > 0
        ? contents
        : [{ role: 'user', parts: [{ text: 'Hello' }] }],
    config: {
      systemInstruction: systemMsg?.content,
      temperature: params.temperature ?? 0.7,
      maxOutputTokens: params.max_tokens ?? 250,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

async function callOpenRouter(params: AIChatParams): Promise<string> {
  const res = await openRouter.chat.completions.create({
    model: config.ai.openRouterModel,
    messages: params.messages as any,
    max_tokens: params.max_tokens ?? 220,
    temperature: params.temperature ?? 0.7,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

async function callOpenAI(params: AIChatParams): Promise<string> {
  const res = await standardOpenAI.chat.completions.create({
    model: config.ai.model,
    messages: params.messages as any,
    max_tokens: params.max_tokens ?? 220,
    temperature: params.temperature ?? 0.7,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

// Dispatch a request to a specific provider
async function dispatch(provider: AIProvider, params: AIChatParams): Promise<string> {
  switch (provider) {
    case 'gemini':
      return callGemini(params);
    case 'openrouter':
      return callOpenRouter(params);
    case 'openai':
      return callOpenAI(params);
    default:
      return callOpenAI(params);
  }
}

/**
 * Multi-provider AI router with automatic failover.
 *
 * Sends the request to the primary provider first (as configured by
 * PRIMARY_AI_PROVIDER). If a 429 rate-limit, timeout, or network error
 * occurs, it seamlessly falls over to the next provider in the chain.
 * This ensures zero downtime for chat and evaluation endpoints.
 */
export async function createChatCompletion(
  params: AIChatParams,
): Promise<string> {
  const providers = getProviderOrder();
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const result = await dispatch(provider, params);
      if (result) return result;
    } catch (err: any) {
      lastError = err;
      if (isRecoverableError(err)) {
        console.warn(
          `[AI Router] ${provider} failed (status ${err?.status ?? 'network'}), ` +
            'failover to next provider',
        );
        continue; // Try the next provider in the chain
      }
      // Non-recoverable error — propagate immediately
      throw err;
    }
  }

  // Every provider in the chain failed
  console.error(
    '[AI Router] All providers exhausted:',
    lastError?.message,
  );
  throw new Error('All AI providers failed. Please try again later.');
}
