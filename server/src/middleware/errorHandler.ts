import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err.name === 'ZodError') {
    res.status(400).json({ error: 'Validation failed', details: err.message });
    return;
  }

  if (err.message.includes('OpenAI') || err.message.includes('API')) {
    res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env['NODE_ENV'] === 'development' && { message: err.message }),
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const start = Date.now();
  console.log(`→ ${req.method} ${req.path}`);
  _res.on('finish', () => {
    console.log(`← ${req.method} ${req.path} ${_res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
}
