import { Router, Request, Response, NextFunction } from 'express';
import { sessionStore } from '../services/sessionStore.js';
import { generateSharkAnalysis, generateDealOffer, generateFinalMemo, generateBusinessReview } from '../services/openai.js';
import { analyzePitch, computeOverallScore } from '../services/pitchAnalyzer.js';
import { SharkId, SharkMessage, SessionState, FinalDeal } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const SHARK_ORDER: SharkId[] = ['vikram', 'alya', 'kabir', 'devika'];

function setSSEHeaders(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}


function sendSSE(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}


async function runSharkPhase(
  session: SessionState,
  phase: SharkMessage['phase'],
  res: Response,
): Promise<void> {
  sessionStore.update(session.id, { phase });
  sendSSE(res, 'phase_change', { phase });

  for (const sharkId of SHARK_ORDER) {
    const message = await generateSharkAnalysis(session.pitch, sharkId, phase, session.messages);
    session.messages.push(message);
    sessionStore.update(session.id, { messages: session.messages, sharkMoods: { ...session.sharkMoods, [sharkId]: message.mood } });
    sendSSE(res, 'shark_message', message);
    await new Promise((r) => setTimeout(r, 600)); // pacing between sharks
  }
}

// GET /api/session/:id/stream — SSE stream for the tank session
router.get('/:id/stream', async (req: Request, res: Response, next: NextFunction) => {
  const session = sessionStore.get(req.params['id'] ?? '');
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  setSSEHeaders(res);
  req.on('close', () => { console.log(`SSE client disconnected: ${session.id}`); });

  try {
    // Phase 1: Analysis
    await runSharkPhase(session, 'analysis', res);

    // Phase 2: Questions
    await runSharkPhase(session, 'questions', res);

    // Phase 3: Negotiation — sharks make offers
    sessionStore.update(session.id, { phase: 'negotiation', dealStatus: 'negotiating' });
    sendSSE(res, 'phase_change', { phase: 'negotiation' });

    for (const sharkId of SHARK_ORDER) {
      const message = await generateSharkAnalysis(session.pitch, sharkId, 'negotiation', session.messages);
      const offer = await generateDealOffer(session.pitch, sharkId);
      if (offer) message.offer = offer;
      session.messages.push(message);
      sessionStore.update(session.id, { messages: session.messages });
      sendSSE(res, 'shark_message', message);
      if (offer) sendSSE(res, 'deal_offer', { sharkId, offer });
      await new Promise((r) => setTimeout(r, 800));
    }

    // Phase 4: Final decision
    await runSharkPhase(session, 'decision', res);

    // Build final deal
    const analyses = analyzePitch(session.pitch);
    const overallScore = computeOverallScore(analyses);
    const scores: Record<string, number> = {};
    analyses.forEach((a) => { scores[a.factor] = a.score; });

    const dealShark = SHARK_ORDER.find((s) => session.sharkMoods[s] === 'interested' || session.sharkMoods[s] === 'intrigued');
    const memo = await generateFinalMemo(session);
    const review = await generateBusinessReview(session);
    const dealMessage = dealShark
      ? session.messages.find((message) => message.sharkId === dealShark && message.offer)
      : undefined;
    const acceptedOffer = dealMessage?.offer;

    const finalDeal: FinalDeal = {
      status: dealShark ? 'deal' : 'no-deal',
      shark: dealShark,
      amount: acceptedOffer?.amount,
      equity: acceptedOffer?.equity,
      valuation: acceptedOffer?.valuation,
      memo,
      review,
      scores,
      overallScore,
      verdict: dealShark
        ? `${dealShark.charAt(0).toUpperCase() + dealShark.slice(1)} made a deal!`
        : 'No deal. The sharks passed.',
    };

    sessionStore.update(session.id, { phase: 'decision', dealStatus: finalDeal.status, finalDeal });
    sendSSE(res, 'session_complete', { sessionId: session.id, finalDeal });
    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Session failed. Please try again.';
    sendSSE(res, 'error', { message: msg });
    res.end();
    next(err);
  }
});

// GET /api/session/:id — Get current session state
router.get('/:id', (req: Request, res: Response) => {
  const session = sessionStore.get(req.params['id'] ?? '');
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  res.json(session);
});

export default router;
