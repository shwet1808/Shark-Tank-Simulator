import OpenAI from 'openai';
import { config } from '../config/index.js';
import { SHARK_PERSONAS } from '../config/sharks.js';
import {
  StartupPitch,
  SharkId,
  SharkMessage,
  SharkMood,
  SessionState,
  DealOffer,
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

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

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: persona.systemPrompt },
      { role: 'user', content: `${pitchContext}\n\n---\nPHASE: ${phaseInstruction}` },
      ...recentHistory,
      { role: 'user', content: `Now respond as ${persona.name}.` },
    ],
    max_tokens: 200,
    temperature: 0.85,
  });

  const content = completion.choices[0]?.message?.content ?? 'No response generated.';
  const mood = parseMoodFromContent(content);

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


export async function generateDealOffer(
  pitch: StartupPitch,
  sharkId: SharkId,
): Promise<DealOffer | null> {
  const persona = SHARK_PERSONAS[sharkId];
  const pitchContext = buildPitchContext(pitch);

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
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

  try {
    const raw = completion.choices[0]?.message?.content ?? '{}';
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

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
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

  return completion.choices[0]?.message?.content ?? 'Session concluded.';
}
