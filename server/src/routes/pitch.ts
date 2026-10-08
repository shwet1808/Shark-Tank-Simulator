import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PitchSchema, TextPitchSchema } from '../middleware/validation.js';
import { sessionStore } from '../services/sessionStore.js';
import { analyzePitch, computeOverallScore } from '../services/pitchAnalyzer.js';
import { StartupPitch, SessionState } from '../types/index.js';

const router: Router = Router();

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

function extractPitchMetrics(text: string) {
  const marginMatch = text.match(/(?:gross\s*margin|margin)[:\s]+(\d+)%/i);
  const cacMatch = text.match(/cac[:\s]+\$?([\d,]+)/i);
  const ltvMatch = text.match(/ltv[:\s]+\$?([\d,]+)/i);
  const mrrMatch = text.match(/mrr[:\s]+\$?([\d,]+k?)/i);
  const runwayMatch = text.match(/runway[:\s]+(\d+)\s*months/i);
  const burnMatch = text.match(/burn[:\s]+\$?([\d,]+k?)/i);
  const revMatch = text.match(/\$?([0-9.]+)\s*M\s*ARR/i) || text.match(/\$?([0-9.]+)\s*k\s*ARR/i);
  const teamMatch = text.match(/team[:\s]+([^\n\r]+)/i);
  const moatMatch = text.match(/(?:moat|our moat is)[:\s]+([^\n\r]+)/i);
  const tractionMatch = text.match(/traction[:\s]+([^\n\r]+)/i);

  let mrr: number | null = null;
  if (mrrMatch && mrrMatch[1]) {
    const raw = mrrMatch[1].toLowerCase();
    mrr = raw.includes('k') ? parseFloat(raw) * 1000 : parseFloat(raw);
  }

  let burnRate: number | null = null;
  if (burnMatch && burnMatch[1]) {
    const raw = burnMatch[1].toLowerCase();
    burnRate = raw.includes('k') ? parseFloat(raw) * 1000 : parseFloat(raw);
  }

  let revenue: number | null = null;
  if (revMatch && revMatch[1]) {
    const isMillion = revMatch[0]?.toLowerCase().includes('m');
    revenue = parseFloat(revMatch[1]) * (isMillion ? 1000000 : 1000);
  }

  return {
    margin: marginMatch && marginMatch[1] ? parseInt(marginMatch[1], 10) : null,
    cac: cacMatch && cacMatch[1] ? parseInt(cacMatch[1].replace(/,/g, ''), 10) : null,
    ltv: ltvMatch && ltvMatch[1] ? parseInt(ltvMatch[1].replace(/,/g, ''), 10) : null,
    mrr,
    runway: runwayMatch && runwayMatch[1] ? parseInt(runwayMatch[1], 10) : null,
    burnRate,
    revenue,
    founderNames: teamMatch && teamMatch[1] ? teamMatch[1].trim().slice(0, 50) : 'Founding Team',
    background: teamMatch && teamMatch[1] ? teamMatch[1].trim() : 'Experienced founders',
    moat: moatMatch && moatMatch[1] ? moatMatch[1].trim() : 'Proprietary IP and market positioning',
    traction: tractionMatch && tractionMatch[1] ? tractionMatch[1].trim() : 'Early traction with active users',
  };
}

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
    const extracted = extractPitchMetrics(pitchText);

    const pitch: StartupPitch = {
      id: uuidv4(),
      companyName,
      tagline: `Innovative solution in ${companyName}`,
      industry: 'Technology',
      stage: extracted.revenue ? 'growth' : 'mvp',
      askAmount,
      equityOffered,
      impliedValuation,
      problem: pitchText.slice(0, 500),
      marketSize: 'Growing multi-billion dollar market',
      solution: pitchText.slice(0, 400),
      traction: extracted.traction,
      businessModel: 'Direct sales and subscription model',
      unitEconomics: {
        cac: extracted.cac,
        ltv: extracted.ltv,
        margin: extracted.margin,
        burnRate: extracted.burnRate,
        runway: extracted.runway,
        mrr: extracted.mrr,
      },
      competition: 'Incumbents and legacy solutions',
      moat: extracted.moat,
      team: {
        founderNames: extracted.founderNames,
        background: extracted.background,
        relevantExperience: extracted.background,
        teamSize: 4,
      },
      scalability: 'High operating leverage with cloud infrastructure',
      financials: {
        revenue: extracted.revenue,
        revenueGrowth: '15-25% MoM',
        currentValuation: impliedValuation,
        previousFunding: null,
        useOfFunds: 'Product expansion and sales growth',
      },
      exitPotential: 'Strategic acquisition target for industry leaders',
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
