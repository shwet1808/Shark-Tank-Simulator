import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';

export type AIChatParams = {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
};

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const geminiKey = process.env['GEMINI_API_KEY'] || config.ai.geminiKey;
  if (!geminiKey || geminiKey.trim().length === 0) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Call Gemini API via @google/genai SDK
async function callGemini(params: AIChatParams): Promise<string> {
  const ai = getGenAI();
  if (!ai) throw new Error('No Gemini API key configured');

  const systemMsg = params.messages.find((m) => m.role === 'system');
  const chatMessages = params.messages.filter((m) => m.role !== 'system');

  const contents = chatMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
    config: {
      systemInstruction: systemMsg?.content,
      temperature: params.temperature ?? 0.7,
      maxOutputTokens: params.max_tokens ?? 250,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Gemini returned empty candidate response');
  }

  return text;
}

export async function createChatCompletion(params: AIChatParams): Promise<string> {
  // Strategy 1: Google Gemini via @google/genai
  const geminiKey = process.env['GEMINI_API_KEY'] || config.ai.geminiKey;
  if (geminiKey && geminiKey.length > 5) {
    try {
      const result = await callGemini(params);
      return result;
    } catch (err: any) {
      console.warn(`[AI Router] Gemini failed: ${err?.message || err}. Trying next...`);
    }
  }

  // Strategy 2: OpenRouter if valid key present
  const openRouterKey = process.env['OPENROUTER_API_KEY'] || config.ai.openRouterKey;
  if (openRouterKey && !openRouterKey.includes('missing')) {
    try {
      const openRouter = new OpenAI({
        apiKey: openRouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Shark Tank Simulator',
        },
      });

      const res = await openRouter.chat.completions.create({
        model: config.ai.openRouterModel || 'meta-llama/llama-3.2-3b-instruct:free',
        messages: params.messages as any,
        max_tokens: params.max_tokens ?? 220,
        temperature: params.temperature ?? 0.7,
      });

      const content = res.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err: any) {
      console.warn(`[AI Router] OpenRouter failed: ${err?.message || err}`);
    }
  }

  // Strategy 3: Standard OpenAI if key present
  const openaiKey = process.env['OPENAI_API_KEY'] || config.ai.openaiKey;
  if (openaiKey && !openaiKey.startsWith('sk-proj-Gd8084G')) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const res = await openai.chat.completions.create({
        model: config.ai.model || 'gpt-4o-mini',
        messages: params.messages as any,
        max_tokens: params.max_tokens ?? 220,
        temperature: params.temperature ?? 0.7,
      });
      const content = res.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err: any) {
      console.warn(`[AI Router] OpenAI failed: ${err?.message || err}`);
    }
  }

  throw new Error('All AI providers exhausted');
}
