import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',

  openai: {
    apiKey: requireEnv('OPENAI_API_KEY', 'sk-placeholder'),
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
  },

  cors: {
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '30', 10),
  },
} as const;
