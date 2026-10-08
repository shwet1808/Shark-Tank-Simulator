import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler, notFound, requestLogger } from './middleware/errorHandler.js';
import pitchRouter from './routes/pitch.js';
import sessionRouter from './routes/session.js';

const app = express();

// Security & parsing
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.isDev) app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// Routes
app.use('/api/pitch', pitchRouter);
app.use('/api/session', sessionRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🦈 Shark Tank Server running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   OpenAI Model: ${config.openai.model}`);
});

export default app;
