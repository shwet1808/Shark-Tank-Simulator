import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PitchSchema, TextPitchSchema } from '../middleware/validation.js';
import { sessionStore } from '../services/sessionStore.js';
import { analyzePitch, computeOverallScore } from '../services/pitchAnalyzer.js';
import { StartupPitch, SessionState } from '../types/index.js';

const router = Router();

// POST /api/pitch/submit — Structured form submission
router.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = PitchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const pitch: StartupPitch = { id: uuidv4(), ...parsed.data };
    const analyses = analyzePitch(pitch);
    const overallScore = computeOverallScore(analyses);

    const session: SessionState = {
      id: uuidv4(),
      pitch,
      messages: [],
      phase: 'analysis',
      dealStatus: 'pending',
      sharkMoods: { vikram: 'neutral', alya: 'neutral', kabir: 'neutral', devika: 'neutral' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    sessionStore.set(session.id, session);

    res.status(201).json({
      sessionId: session.id,
      pitchId: pitch.id,
      analyses,
      overallScore,
      message: 'Pitch submitted. The sharks are reviewing your deck.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/pitch/text — Paste text / pitch deck submission
router.post('/text', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = TextPitchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { pitchText, companyName, askAmount, equityOffered } = parsed.data;
    const impliedValuation = askAmount / (equityOffered / 100);

    const pitch: StartupPitch = {
      id: uuidv4(),
      companyName,
      tagline: 'Pitch submitted via text',
      industry: 'Unknown',
      stage: 'mvp',
      askAmount,
      equityOffered,
      impliedValuation,
      problem: pitchText,
      marketSize: 'See pitch text',
      solution: 'See pitch text',
      traction: 'See pitch text',
      businessModel: 'See pitch text',
      unitEconomics: { cac: null, ltv: null, margin: null, burnRate: null, runway: null, mrr: null },
      competition: 'See pitch text',
      moat: 'See pitch text',
      team: { founderNames: 'Unknown', background: 'See pitch text', relevantExperience: '', teamSize: null },
      scalability: 'See pitch text',
      financials: { revenue: null, revenueGrowth: '', currentValuation: impliedValuation, previousFunding: null, useOfFunds: '' },
      exitPotential: 'See pitch text',
      pitchDeckText: pitchText,
    };

    const session: SessionState = {
      id: uuidv4(),
      pitch,
      messages: [],
      phase: 'analysis',
      dealStatus: 'pending',
      sharkMoods: { vikram: 'neutral', alya: 'neutral', kabir: 'neutral', devika: 'neutral' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    sessionStore.set(session.id, session);

    res.status(201).json({
      sessionId: session.id,
      pitchId: pitch.id,
      message: 'Text pitch received. Preparing the sharks.',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/pitch/session/:id — Get session state
router.get('/session/:id', (req: Request, res: Response) => {
  const session = sessionStore.get(req.params['id'] ?? '');
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

export default router;
