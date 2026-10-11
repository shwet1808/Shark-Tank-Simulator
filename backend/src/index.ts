import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler, notFound, requestLogger } from './middleware/errorHandler.js';
import pitchRouter from './routes/pitch.js';
import sessionRouter from './routes/session.js';

const app: express.Express = express();

// Security: Helmet with relaxed CSP (SSE needs inline scripts)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
  }),
);

// Only allow configured frontend origins; credentials cannot be used with a wildcard.
const corsOrigin = config.cors.origin;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.isDev) app.use(requestLogger);

// Rate limiting on all /api routes
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// API routes
app.use('/api/pitch', pitchRouter);
app.use('/api/session', sessionRouter);

// 404 handler (must come after routes)
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server — bind to 0.0.0.0 so Render can reach it
app.listen(config.port, '0.0.0.0', () => {
  console.log(`Shark Tank Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`AI Provider order: ${config.ai.primaryProvider} first`);
});

export default app;
