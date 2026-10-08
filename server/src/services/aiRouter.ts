import OpenAI from 'openai';
import { config } from '../config/index.js';

export type AIChatParams = {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
};

// Call Gemini API via Google's REST interface
async function callGemini(params: AIChatParams, apiKey: string, model: string): Promise<string> {
  const systemMsg = params.messages.find((m) => m.role === 'system');
  const chatMessages = params.messages.filter((m) => m.role !== 'system');

  const contents = chatMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: params.temperature ?? 0.7,
      maxOutputTokens: params.max_tokens ?? 250,
    },
  };

  if (systemMsg) {
    body['systemInstruction'] = {
      parts: [{ text: systemMsg.content }],
    };
  }

  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${errorText}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };

  if (data.error) {
    throw new Error(data.error.message ?? 'Gemini API returned an error');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Gemini returned empty candidate response');
  }

  return text;
}

export async function createChatCompletion(params: AIChatParams): Promise<string> {
  // Strategy 1: Google Gemini (Free Tier / high quota)
  const geminiKey = process.env['GEMINI_API_KEY'] || config.ai.geminiKey;
  if (geminiKey && geminiKey.length > 10) {
    // Try flash-lite-latest first, then flash-latest
    const candidateModels = ['gemini-flash-lite-latest', 'gemini-flash-latest'];
    for (const model of candidateModels) {
      try {
        const result = await callGemini(params, geminiKey, model);
        return result;
      } catch (err: any) {
        console.warn(`[AI Router] Gemini (${model}) failed: ${err?.message || err}. Trying next...`);
      }
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
