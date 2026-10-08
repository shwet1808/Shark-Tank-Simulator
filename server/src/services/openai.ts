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



function buildPitchContext(pitch: StartupPitch): string {
  const { unitEconomics: ue, team, financials: fin } = pitch;
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
  
  // Logical block: check for intrigued keywords
  if (lower.includes('impressed') || lower.includes('intrigued') || lower.includes('interesting')) {
    return 'intrigued';
  }

  // Logical block: check for aggressive keywords
  if (lower.includes('unacceptable') || lower.includes('ridiculous') || lower.includes('no deal')) {
    return 'aggressive';
  }

  // Logical block: check for interested keywords
  if (lower.includes('offer') || lower.includes('deal') || lower.includes('willing')) {
    return 'interested';
  }

  // Logical block: check for skeptical keywords
  if (lower.includes('concern') || lower.includes('worried') || lower.includes('skeptical')) {
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
    analysis: `Deliver your INITIAL sharp analysis of this pitch. ` + 
      `Focus on your specialty areas: ${persona.focus.join(', ')}. Be direct and specific.`,
    questions: `Ask ONE specific, hard-hitting follow-up question about the weakest point you ` + 
      `see. Make the founder uncomfortable.`,
    negotiation: `Make a SPECIFIC deal offer or counter-offer. State: amount, equity %, ` + 
      `implied valuation, and ONE condition. Be aggressive on terms.`,
    decision: `Give your FINAL verdict. Are you IN or OUT? If in, restate your final offer ` + 
      `terms. If out, explain your single deal-breaker.`,
  }[phase];

  const recentHistory = conversationHistory.slice(-6).map((m) => ({
    role: 'assistant' as const,
    content: `[${m.sharkName}]: ${m.content}`,
  }));

  try {
    const content = await createChatCompletion({
      messages: [
        { role: 'system', content: persona.systemPrompt },
        { role: 'user', content: `${pitchContext}\n\n---\nPHASE: ${phaseInstruction}` },
        ...recentHistory,
        { role: 'user', content: `Now respond as ${persona.name}.` },
      ],
      max_tokens: 200,
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
    console.error(`Fallback triggered for ${sharkId} in phase ${phase}`);
    const fallbackContent = {
      analysis: 'I see potential in the idea, but I need more proof on the execution and unit economics.',
      questions: 'What exactly is your customer acquisition cost, and how does it scale?',
      negotiation: `I'll give you $${pitch.askAmount.toLocaleString()} for 30% equity, because you need my expertise.`,
      decision: 'I am out. The valuation is just too rich for me right now.',
    }[phase];
    
    return {
      id: uuidv4(),
      sharkId,
      sharkName: persona.name,
      content: fallbackContent,
      mood: phase === 'negotiation' ? 'interested' : 'skeptical',
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
          content: `${pitchContext}\n\nGenerate a JSON deal offer with this exact structure ` + 
            `(no markdown):\n{"amount": number, "equity": number, "valuation": number, ` + 
            `"conditions": ["string"], "isCounterOffer": true}\nThe amount must be between ` + 
            `50000 and ${pitch.askAmount * 1.5}. Equity between 5 and 40. Be realistic.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
  } catch (error) {
    // If API fails, return a mock offer
    content = JSON.stringify({
      amount: pitch.askAmount,
      equity: 35,
      valuation: Math.round(pitch.askAmount / 0.35),
      conditions: ["Contingent on a tech due diligence"],
      isCounterOffer: true
    });
  }

  try {
    const raw = content || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as DealOffer;
  } catch {
    return null;
  }
}


export async function generateFinalMemo(session: SessionState): Promise<string> {
  const { pitch, messages } = session;
  const summary = messages.slice(-4).map((m) => `${m.sharkName}: ${m.content}`).join('\n');

  try {
    const content = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are generating a concise, professional investment memo for a Shark Tank session.',
        },
        {
          role: 'user',
          content: `Pitch: ${pitch.companyName} — ${pitch.tagline}\n` + 
            `Ask: $${pitch.askAmount} for ${pitch.equityOffered}%\n\nFinal exchanges:\n${summary}\n\n` + 
            `Write a 3-sentence investment memo summarizing the outcome.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.6,
    });
    return content || 'Session concluded.';
  } catch (error) {
    return `The panel reviewed ${pitch.companyName}. After rigorous questioning on unit economics, the founders received mixed feedback. The ultimate decision reflected the challenges in their valuation and competitive moat.`;
  }
}

function fallbackReview(session: SessionState): BusinessReview {
  const valuation = session.pitch.impliedValuation;
  return {
    summary: `${session.pitch.companyName} has a workable starting point, but the pitch needs sharper proof around demand, margins, and execution before it earns a premium valuation.`,
    estimatedValue: valuation,
    valuationReasoning: `Using the founder ask of $${session.pitch.askAmount.toLocaleString()} for ${session.pitch.equityOffered}% equity implies a $${valuation.toLocaleString()} valuation.`,
    strengths: ['Clear founder ask', 'Defined market narrative', 'Enough information for an investor review'],
    improvements: ['Add stronger traction metrics', 'Show clearer unit economics', 'Defend the competitive moat'],
    nextSteps: ['Validate pricing with customers', 'Improve CAC to LTV visibility', 'Prepare a 12-month use-of-funds plan'],
  };
}

export async function generateBusinessReview(session: SessionState): Promise<BusinessReview> {
  const pitchContext = buildPitchContext(session.pitch);
  const sharkSummary = session.messages
    .slice(-8)
    .map((m) => `${m.sharkName}: ${m.content}`)
    .join('\n');

  let content = '';
  try {
    content = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are the combined Shark Tank investor panel. Return only valid JSON with practical founder feedback.',
        },
        {
          role: 'user',
          content: `${pitchContext}\n\nRecent shark comments:\n${sharkSummary}\n\n` +
            'Create a business review with this exact JSON shape and no markdown:\n' +
            '{"summary":"string","estimatedValue":number,"valuationReasoning":"string","strengths":["string"],"improvements":["string"],"nextSteps":["string"]}\n' +
            'estimatedValue must be a realistic investor valuation in dollars. Include 3-5 items in each array.',
        },
      ],
      max_tokens: 500,
      temperature: 0.55,
    });
  } catch (error) {
    return fallbackReview(session);
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackReview(session);
    const parsed = JSON.parse(jsonMatch[0]) as Partial<BusinessReview>;
    if (
      !parsed.summary ||
      typeof parsed.estimatedValue !== 'number' ||
      !parsed.valuationReasoning ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.improvements) ||
      !Array.isArray(parsed.nextSteps)
    ) {
      return fallbackReview(session);
    }
    return {
      summary: parsed.summary,
      estimatedValue: parsed.estimatedValue,
      valuationReasoning: parsed.valuationReasoning,
      strengths: parsed.strengths.slice(0, 5),
      improvements: parsed.improvements.slice(0, 5),
      nextSteps: parsed.nextSteps.slice(0, 5),
    };
  } catch {
    return fallbackReview(session);
  }
}
