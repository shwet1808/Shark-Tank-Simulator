import dotenv from 'dotenv';

dotenv.config();

// Validate that a required env var is set, falling back if provided
function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: 3000,
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',

  ai: {
    openaiKey: process.env['OPENAI_API_KEY'],
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
    openRouterKey: process.env['OPENROUTER_API_KEY'],
    geminiKey: process.env['GEMINI_API_KEY'],
    strategy: process.env['AI_PROVIDER_STRATEGY'] ?? 'smart_fallback',
    openRouterModel: process.env['OPENROUTER_MODEL'] ?? 'google/gemini-2.5-flash',
  },

  cors: {
    origin: process.env['CORS_ORIGIN'] ?? '*',
  },

  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '30', 10),
  },
} as const;
