import { Router, Request, Response, NextFunction } from 'express';
import { sessionStore } from '../services/sessionStore.js';
import {
  generateSharkAnalysis,
  generateDealOffer,
  generateFinalMemo,
  generateBusinessReview,
} from '../services/openai.js';
import { analyzePitch, computeOverallScore, analyzeValuation } from '../services/pitchAnalyzer.js';
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

/** Detect if a shark's decision message indicates they are IN */
function isSharkIn(content: string): boolean {
  const lower = content.toLowerCase();

  const outPhrases = [
    "i'm out",
    "i am out",
    "i pass",
    "i'm passing",
    "i am passing",
    "i have to pass",
    "i must pass",
    "bow out",
    "not investing",
    "cannot invest",
    "can't invest",
    "won't invest",
    "stepping aside",
    "stepping out",
    "count me out",
    "not for me",
  ];

  const inPhrases = [
    "i'm in",
    "i am in",
    "i will invest",
    "i'll invest",
    "closed the deal",
    "we have a deal",
    "count me in",
    "ready to invest",
    "let's do this deal",
    "let's close this deal",
    "i accept",
    "my final offer is",
    "i'll offer",
    "i will offer",
    "i make you an offer",
    "i'm making an offer",
    "offer stands",
    "willing to invest",
  ];

  const hasExplicitIn = inPhrases.some((p) => lower.includes(p));
  const hasExplicitOut = outPhrases.some((p) => lower.includes(p));

  if (hasExplicitIn && !hasExplicitOut) return true;
  if (hasExplicitOut) return false;
  return hasExplicitIn;
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
    sessionStore.update(session.id, {
      messages: session.messages,
      sharkMoods: { ...session.sharkMoods, [sharkId]: message.mood },
    });
    sendSSE(res, 'shark_message', message);
    await new Promise((r) => setTimeout(r, 600));
  }
}

// GET /api/session/:id/stream — SSE stream for the tank session
router.get('/:id/stream', async (req: Request, res: Response, next: NextFunction) => {
  const session = sessionStore.get(req.params['id'] ?? '');
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  setSSEHeaders(res);
  req.on('close', () => { console.log(`SSE client disconnected: ${session.id}`); });

  try {
    const analyses = analyzePitch(session.pitch);
    const overallScore = computeOverallScore(analyses);
    const valuationCheck = analyzeValuation(session.pitch);
    console.log(`[Session] Pitch score: ${overallScore}/10, Valuation fair: ${valuationCheck.fair}`);

    // Phase 1: Analysis
    await runSharkPhase(session, 'analysis', res);

    // Phase 2: Questions
    await runSharkPhase(session, 'questions', res);

    // Phase 3: Negotiation
    sessionStore.update(session.id, { phase: 'negotiation', dealStatus: 'negotiating' });
    sendSSE(res, 'phase_change', { phase: 'negotiation' });

    for (const sharkId of SHARK_ORDER) {
      const message = await generateSharkAnalysis(
        session.pitch, sharkId, 'negotiation', session.messages,
      );

      const soundsInterested = isSharkIn(message.content) ||
        message.mood === 'interested' || message.mood === 'intrigued' || overallScore >= 7.0;

      if (soundsInterested) {
        const offer = await generateDealOffer(session.pitch, sharkId);
        if (offer) message.offer = offer;
      }

      session.messages.push(message);
      sessionStore.update(session.id, { messages: session.messages });
      sendSSE(res, 'shark_message', message);
      if (message.offer) sendSSE(res, 'deal_offer', { sharkId, offer: message.offer });
      await new Promise((r) => setTimeout(r, 700));
    }

    // Phase 4: Final decision
    await runSharkPhase(session, 'decision', res);

    // Determine who closed a deal
    const decisionMessages = session.messages.filter((m) => m.phase === 'decision');
    let dealSharkId = SHARK_ORDER.find((sharkId) => {
      const decMsg = decisionMessages.find((m) => m.sharkId === sharkId);
      return decMsg && isSharkIn(decMsg.content);
    });

    // Fallback 1: check if any shark made an offer in negotiation and didn't explicitly say "i'm out"
    if (!dealSharkId) {
      const negotiationMessages = session.messages.filter((m) => m.phase === 'negotiation' && m.offer);
      for (const negMsg of negotiationMessages) {
        const decMsg = decisionMessages.find((m) => m.sharkId === negMsg.sharkId);
        const saysOut = decMsg ? (decMsg.content.toLowerCase().includes("i'm out") || decMsg.content.toLowerCase().includes("i am out")) : false;
        if (!saysOut) {
          dealSharkId = negMsg.sharkId;
          break;
        }
      }
    }

    // Fallback 2: for high scoring pitches (score >= 7.0), award deal to the most interested shark
    if (!dealSharkId && overallScore >= 7.0) {
      dealSharkId = SHARK_ORDER.find(
        (s) => session.sharkMoods[s] === 'interested' || session.sharkMoods[s] === 'intrigued',
      ) ?? 'vikram';
    }

    const dealShark = dealSharkId;

    let acceptedOffer = dealShark
      ? session.messages.find((m) => m.sharkId === dealShark && m.offer)?.offer
      : undefined;

    if (dealShark && !acceptedOffer) {
      const counterEquity = Math.min(30, session.pitch.equityOffered + 3);
      acceptedOffer = {
        amount: session.pitch.askAmount,
        equity: counterEquity,
        valuation: Math.round(session.pitch.askAmount / (counterEquity / 100)),
        conditions: ['Subject to standard financial and IP due diligence'],
        isCounterOffer: counterEquity !== session.pitch.equityOffered,
      };
    }

    const memo = await generateFinalMemo(session);
    const review = await generateBusinessReview(session);

    const scores: Record<string, number> = {};
    analyses.forEach((a) => { scores[a.factor] = a.score; });

    const SHARK_NAMES: Record<SharkId, string> = {
      vikram: 'Vikram "The Hawk"',
      alya: 'Alya Sharma',
      kabir: 'Kabir Mehta',
      devika: 'Devika Roy',
    };

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
        ? `${SHARK_NAMES[dealShark]} closed the deal!`
        : 'No deal. All four sharks passed.',
    };

    sessionStore.update(session.id, {
      phase: 'decision',
      dealStatus: finalDeal.status,
      finalDeal,
    });
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
