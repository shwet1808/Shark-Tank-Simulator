import OpenAI from 'openai';
import { config } from '../config/index.js';

const openRouter = new OpenAI({
  apiKey: config.ai.openRouterKey || 'missing',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3001',
    'X-Title': 'Shark Tank Simulator',
  },
});

export type AIChatParams = {
  messages: any[];
  max_tokens?: number;
  temperature?: number;
};

export async function createChatCompletion(
  params: AIChatParams,
): Promise<string> {
  try {
    const res = await openRouter.chat.completions.create({
      model: config.ai.openRouterModel,
      messages: params.messages,
      max_tokens: params.max_tokens ?? 200,
      temperature: params.temperature ?? 0.7,
    });
    
    const content = res.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('The AI response was empty.');
    }
    return content;
  } catch (error: any) {
    console.error('[AI Router] Error:', error?.message || error);
    const msg = error?.message || 'AI session failed. Please try again.';
    throw new Error(msg);
  }
}
