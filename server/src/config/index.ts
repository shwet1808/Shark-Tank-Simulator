import dotenv from 'dotenv';
import { AIProvider } from '../types/index.js';

dotenv.config();

function resolveCorsOrigins(): string[] {
  const configured = process.env['CORS_ORIGIN']
    ?.split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (configured?.length) return configured;
  if (process.env['NODE_ENV'] !== 'production') return ['http://localhost:5173'];

  throw new Error(
    'CORS_ORIGIN is required in production. Set it to the Vercel site origin (comma-separate preview origins).',
  );
}

export const config = {
  // Render provides PORT via env — fall back to 3000 for local dev
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',

  ai: {
    openaiKey: process.env['OPENAI_API_KEY'] ?? '',
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
    openRouterKey: process.env['OPENROUTER_API_KEY'] ?? '',
    geminiKey: process.env['GEMINI_API_KEY'] ?? '',
    primaryProvider: (process.env['PRIMARY_AI_PROVIDER'] ?? 'openrouter') as AIProvider,
    openRouterModel: process.env['OPENROUTER_MODEL'] ?? 'google/gemini-2.5-flash',
  },

  cors: {
    origin: resolveCorsOrigins(),
  },

  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '30', 10),
  },
} as const;
