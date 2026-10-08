import { createChatCompletion } from './aiRouter.js';
import { SHARK_PERSONAS } from '../config/sharks.js';
import {
  StartupPitch,
  SharkId,
  SharkMessage,
  SharkMood,
  SessionState,
  DealOffer,
  BusinessReview,
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

function isPitchStrong(pitch: StartupPitch): boolean {
  const text = (pitch.pitchDeckText || pitch.problem || '').toLowerCase();
  const ue = pitch.unitEconomics;
  
  if (ue.cac && ue.ltv && (ue.ltv / ue.cac >= 3)) return true;
  if (ue.margin && ue.margin >= 50) return true;
  if (pitch.financials.revenue && pitch.financials.revenue >= 400000) return true;
  if (/margin[:\s]+(?:5[0-9]|[6-9][0-9])%/i.test(text)) return true;
  if (/ltv[:\s]*cac[:\s]*=[:\s]*(?:[3-9]|\d{2,})/i.test(text)) return true;
  if (/\$[0-9.]+\s*m\s*arr/i.test(text)) return true;
  if (/profitable|cash flow positive/i.test(text)) return true;

  return false;
}

function buildPitchContext(pitch: StartupPitch): string {
  const { unitEconomics: ue, team, financials: fin } = pitch;

  if (pitch.pitchDeckText && pitch.pitchDeckText.trim().length > 30) {
    const ueLine = (ue.cac || ue.ltv || ue.margin)
      ? `\nMETRICS SUMMARY: CAC $${ue.cac ?? 'N/A'} | LTV $${ue.ltv ?? 'N/A'} | Gross Margin ${ue.margin ?? 'N/A'}% | Burn $${ue.burnRate ?? 'N/A'}/mo | Runway ${ue.runway ?? 'N/A'} mo | MRR $${ue.mrr ?? 'N/A'}`
      : '';
    return `
STARTUP PITCH BRIEF:
Company: ${pitch.companyName}
Ask: $${pitch.askAmount.toLocaleString()} for ${pitch.equityOffered}% equity
Implied Valuation: $${pitch.impliedValuation.toLocaleString()}
${ueLine}

FULL PITCH TEXT & DETAILS:
${pitch.pitchDeckText}
`.trim();
  }

  return `
STARTUP PITCH BRIEF:
Company: ${pitch.companyName} — "${pitch.tagline}"
Industry: ${pitch.industry} | Stage: ${pitch.stage}
Ask: $${pitch.askAmount.toLocaleString()} for ${pitch.equityOffered}% equity
Implied Valuation: $${pitch.impliedValuation.toLocaleString()}

PROBLEM: ${pitch.problem}
MARKET SIZE: ${pitch.marketSize}
SOLUTION: ${pitch.solution}
TRACTION: ${pitch.traction}
BUSINESS MODEL: ${pitch.businessModel}
UNIT ECONOMICS: CAC $${ue.cac ?? 'N/A'} | LTV $${ue.ltv ?? 'N/A'} | Margin ${ue.margin ?? 'N/A'}%
  | Burn $${ue.burnRate ?? 'N/A'}/mo | Runway ${ue.runway ?? 'N/A'} months | MRR $${ue.mrr ?? 'N/A'}
COMPETITION: ${pitch.competition}
MOAT: ${pitch.moat}
TEAM: ${team.founderNames} (${team.background}) — ${team.teamSize ?? 'N/A'} people
FINANCIALS: Revenue $${fin.revenue ?? 'N/A'} | Growth: ${fin.revenueGrowth} 
  | Previous funding: $${fin.previousFunding ?? 0}
SCALABILITY: ${pitch.scalability}
EXIT POTENTIAL: ${pitch.exitPotential}
${pitch.additionalContext ? `ADDITIONAL CONTEXT: ${pitch.additionalContext}` : ''}
`.trim();
}

function parseMoodFromContent(content: string): SharkMood {
  const lower = content.toLowerCase();
  
  if (lower.includes('impressed') || lower.includes('intrigued') || lower.includes('interesting') || lower.includes('promising')) {
    return 'intrigued';
  }
  if (lower.includes('unacceptable') || lower.includes('ridiculous') || lower.includes('disaster') || lower.includes('insulting')) {
    return 'aggressive';
  }
  if (lower.includes('i am in') || lower.includes("i'm in") || lower.includes('offer') || lower.includes('deal') || lower.includes('invest')) {
    return 'interested';
  }
  if (lower.includes('concern') || lower.includes('worried') || lower.includes('skeptical') || lower.includes('doubt')) {
    return 'skeptical';
  }
  return 'neutral';
}

export async function generateSharkAnalysis(
  pitch: StartupPitch,
  sharkId: SharkId,
  phase: SharkMessage['phase'],
  conversationHistory: SharkMessage[],
): Promise<SharkMessage> {
  const persona = SHARK_PERSONAS[sharkId];
  const pitchContext = buildPitchContext(pitch);

  const phaseInstruction = {
    analysis: `Deliver your INITIAL sharp analysis of this pitch. Focus on your specialty areas: ${persona.focus.join(', ')}. Be direct, authentic, and specific to the numbers given.`,
    questions: `Ask ONE specific, hard-hitting follow-up question about the weakest point or key opportunity you see. Make the founder think.`,
    negotiation: `State whether you are interested. If interested, make a SPECIFIC deal offer or counter-offer: state amount, equity %, and one condition. If not interested, explain why.`,
    decision: `Give your FINAL verdict clearly. If you want to invest, explicitly say "I AM IN" and state your final offer terms. If you decline, explicitly say "I AM OUT" and explain your dealbreaker reason.`,
  }[phase];

  const recentHistory = conversationHistory.slice(-6).map((m) => ({
    role: 'assistant' as const,
    content: `[${m.sharkName}]: ${m.content}`,
  }));

  try {
    const content = await createChatCompletion({
      messages: [
        { role: 'system', content: persona.systemPrompt },
        { role: 'user', content: `${pitchContext}\n\n---\nPHASE INSTRUCTION: ${phaseInstruction}` },
        ...recentHistory,
        { role: 'user', content: `Now speak as ${persona.name}. Be direct and state your verdict for this phase.` },
      ],
      max_tokens: 220,
      temperature: 0.85,
    });

    const finalContent = content || 'No response generated.';
    const mood = parseMoodFromContent(finalContent);

    return {
      id: uuidv4(),
      sharkId,
      sharkName: persona.name,
      content: finalContent,
      mood,
      timestamp: Date.now(),
      phase,
    };
  } catch (error) {
    // Dynamic pitch-aware fallback based on pitch quality
    const { askAmount, equityOffered, impliedValuation } = pitch;
    const isStrong = isPitchStrong(pitch);
    const valM = (impliedValuation / 1e6).toFixed(1);

    const sharkResponses: Record<SharkId, Record<string, string>> = {
      vikram: {
        analysis: isStrong
          ? `The unit economics here are compelling. Strong margins and a healthy LTV/CAC ratio give this business real operating leverage. I want to see if this holds up at scale.`
          : `A $${(askAmount / 1e6).toFixed(1)}M ask at a $${valM}M valuation with unproven unit economics is a non-starter. Show me real margins and payback periods before asking for checks.`,
        questions: isStrong
          ? `What is your 12-month CAC trend, and what is your average payback period in months?`
          : `How much cash have you burned to date, and what is your current monthly runway?`,
        negotiation: isStrong
          ? `I'm interested. I will offer $${askAmount.toLocaleString()} for ${equityOffered + 3}% equity. I bring institutional rigor and debt financing connections.`
          : `I cannot support a $${valM}M valuation on these fundamentals. If you cut the valuation in half, we can talk.`,
        decision: isStrong
          ? `I'm in! I will invest $${askAmount.toLocaleString()} for ${equityOffered + 3}%. The fundamentals are sound, and we have a deal.`
          : `I'm out. The unit economics do not justify the risk at this valuation.`,
      },
      devika: {
        analysis: isStrong
          ? `The team has demonstrated strong execution capability and domain pedigree. The ask is grounded in realistic business traction.`
          : `The valuation is disconnected from current traction. Early-stage execution risk is high here without seasoned leadership.`,
        questions: isStrong
          ? `How quickly can you deploy this capital into sales distribution without diluting margins?`
          : `Why should an investor accept this valuation when comparable startups trade at 40% less?`,
        negotiation: isStrong
          ? `I like this opportunity. I will do $${askAmount.toLocaleString()} for ${equityOffered + 2}% equity with board advisory rights.`
          : `I would need 35% equity to offset the risk here. Take it or I am stepping aside.`,
        decision: isStrong
          ? `I'm in! Let's close this deal at $${askAmount.toLocaleString()} for ${equityOffered + 2}%. You have a strong partner in me.`
          : `I'm out. We could not bridge the valuation gap.`,
      },
      alya: {
        analysis: isStrong
          ? `The defensibility and moat stand out. You have built real customer lock-in that will make it tough for competitors to copy.`
          : `I do not see a sustainable moat. A well-funded incumbent could replicate this product in four months.`,
        questions: isStrong
          ? `What keeps your largest customer from building an in-house alternative?`
          : `What is your proprietary intellectual property or exclusive distribution channel?`,
        negotiation: isStrong
          ? `I can accelerate your brand reach. I'll join Vikram or offer $${askAmount.toLocaleString()} for ${equityOffered + 4}%.`
          : `Without a clear brand moat, I cannot justify making an offer today.`,
        decision: isStrong
          ? `I'm in. Your product defensibility convinced me. Let's build a category leader.`
          : `I'm out. Defensibility is critical for me, and I don't see it here.`,
      },
      kabir: {
        analysis: isStrong
          ? `The addressable market is immense, and the scalability model allows international expansion with minimal capex.`
          : `The market size appears constrained and regional. This is a solid lifestyle business, but not a venture-scale platform.`,
        questions: isStrong
          ? `What is your roadmap for international expansion outside your primary market?`
          : `Can this business ever exceed $50M in annual revenue without massive operational bloat?`,
        negotiation: isStrong
          ? `I'll invest $${askAmount.toLocaleString()} for ${equityOffered + 5}% to lead your global roll-out.`
          : `The TAM is too small for my portfolio return requirements.`,
        decision: isStrong
          ? `I'm in! Huge market and solid execution. Count me in on this journey.`
          : `I'm out. The market potential does not fit my venture criteria.`,
      },
    };

    const fallbackForShark = sharkResponses[sharkId] || sharkResponses['vikram'];
    const content = fallbackForShark[phase] ?? 'No response generated.';
    const mood = isStrong ? 'interested' : 'skeptical';

    return {
      id: uuidv4(),
      sharkId,
      sharkName: persona.name,
      content,
      mood,
      timestamp: Date.now(),
      phase,
    };
  }
}

export async function generateDealOffer(
  pitch: StartupPitch,
  sharkId: SharkId,
): Promise<DealOffer | null> {
  const persona = SHARK_PERSONAS[sharkId];
  const pitchContext = buildPitchContext(pitch);

  let content = '{}';
  try {
    content = await createChatCompletion({
      messages: [
        { role: 'system', content: persona.systemPrompt },
        {
          role: 'user',
          content: `${pitchContext}\n\nGenerate a JSON deal offer with this exact structure (no markdown):\n{"amount": number, "equity": number, "valuation": number, "conditions": ["string"], "isCounterOffer": true}\nThe amount must be between 50000 and ${pitch.askAmount * 1.5}. Equity between 5 and 35. Be realistic.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
  } catch (error) {
    const isStrong = isPitchStrong(pitch);
    const offerEquity = isStrong ? pitch.equityOffered + 3 : pitch.equityOffered + 15;
    content = JSON.stringify({
      amount: pitch.askAmount,
      equity: offerEquity,
      valuation: Math.round(pitch.askAmount / (offerEquity / 100)),
      conditions: ['Subject to standard tech and financial due diligence'],
      isCounterOffer: true,
    });
  }

  try {
    const raw = content || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as DealOffer;
  } catch {
    return {
      amount: pitch.askAmount,
      equity: pitch.equityOffered + 3,
      valuation: Math.round(pitch.askAmount / ((pitch.equityOffered + 3) / 100)),
      conditions: ['Subject to standard financial audit'],
      isCounterOffer: true,
    };
  }
}

export async function generateFinalMemo(session: SessionState): Promise<string> {
  const isStrong = isPitchStrong(session.pitch);
  const prompt = `Write an executive investment memo (2-3 paragraphs) summarizing the Shark Tank pitch for ${session.pitch.companyName}.
Focus on key metrics, shark reactions, risk factors, and final outcome.
Pitch Details:
${buildPitchContext(session.pitch)}`;

  try {
    const res = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 280,
      temperature: 0.7,
    });
    return res;
  } catch {
    if (isStrong) {
      return `INVESTMENT MEMO — ${session.pitch.companyName.toUpperCase()}\n\n` +
        `The company presented a highly compelling pitch characterized by robust unit economics, demonstrable product-market fit, and defensible IP. With favorable margin structure and scalable distribution economics, the business model proved attractive to the investor syndicate.\n\n` +
        `While execution hurdles remain around aggressive customer acquisition timelines, the fundamental risk-reward ratio strongly supports investment. Terms were settled with favorable equity alignment to safeguard shareholder value.`;
    }
    return `INVESTMENT MEMO — ${session.pitch.companyName.toUpperCase()}\n\n` +
      `The company presented an ambitious concept but was unable to substantiate its valuation with verifiable unit economics or defensible traction. The gap between founder expectations and market comparables proved insurmountable for the investment committee.\n\n` +
      `Recommendation is to pass until the company can demonstrate sustained month-over-month revenue growth, verified margin profile, and a clearly articulated barrier to competitive entry.`;
  }
}

export async function generateBusinessReview(session: SessionState): Promise<BusinessReview> {
  const isStrong = isPitchStrong(session.pitch);
  const prompt = `Generate a JSON business review for ${session.pitch.companyName}.
Format (pure JSON only, no markdown):
{
  "strengths": ["3 key strengths"],
  "weaknesses": ["3 key weaknesses"],
  "actionItems": ["3 specific recommendations for the founder"]
}
Pitch Details:
${buildPitchContext(session.pitch)}`;

  try {
    const res = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0.6,
    });
    const match = res.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as BusinessReview;
  } catch {
    // Fallback
  }

  if (isStrong) {
    return {
      strengths: [
        'Superior unit economics with high gross margins and healthy LTV:CAC',
        'Demonstrated traction with verifiable customer demand and low churn',
        'Credible founding team with proven domain expertise and technical depth',
      ],
      weaknesses: [
        'Aggressive capital deployment could pressure short-term operational efficiency',
        'Enterprise sales cycles require sustained pipeline and longer cash conversion',
        'Need to reinforce intellectual property protection in secondary markets',
      ],
      actionItems: [
        'Accelerate sales team recruitment with quota-bearing account executives',
        'Establish automated customer onboarding to protect current gross margins',
        'Prepare enterprise security certifications to expand government and corporate accounts',
      ],
    };
  }

  return {
    strengths: [
      'Identified a clear macro problem in a sizeable industry space',
      'Passionate founder commitment to solving the core user pain point',
      'Initial prototype demonstrates core concept viability',
    ],
    weaknesses: [
      'Unsubstantiated valuation disconnected from current revenue and traction metrics',
      'Lacks verifiable unit economics (CAC, LTV, and gross margins are undefined)',
      'Vulnerable to rapid replication by established market incumbents',
    ],
    actionItems: [
      'Focus on securing 10-20 paying pilot customers before raising further capital',
      'Rigorously track and optimize CAC and customer retention for 6 consecutive months',
      'Reset valuation expectations to align with early-stage pre-revenue market benchmarks',
    ],
  };
}
