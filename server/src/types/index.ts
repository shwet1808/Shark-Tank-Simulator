// Core domain types for Shark Tank Simulator

export interface StartupPitch {
  id: string;
  companyName: string;
  tagline: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'early-traction' | 'growth' | 'scale';
  askAmount: number;
  equityOffered: number;
  impliedValuation: number;

  // 12 Core Factors
  problem: string;
  marketSize: string;
  solution: string;
  traction: string;
  businessModel: string;
  unitEconomics: UnitEconomics;
  competition: string;
  moat: string;
  team: TeamInfo;
  scalability: string;
  financials: FinancialInfo;
  exitPotential: string;

  // Optional supplementary text
  additionalContext?: string;
  pitchDeckText?: string;
}

export interface UnitEconomics {
  cac: number | null;
  ltv: number | null;
  margin: number | null;
  burnRate: number | null;
  runway: number | null;
  mrr: number | null;
}

export interface TeamInfo {
  founderNames: string;
  background: string;
  relevantExperience: string;
  teamSize: number | null;
}

export interface FinancialInfo {
  revenue: number | null;
  revenueGrowth: string;
  currentValuation: number | null;
  previousFunding: number | null;
  useOfFunds: string;
}

export type SharkId = 'vikram' | 'alya' | 'kabir' | 'devika';
export type SharkMood = 'skeptical' | 'intrigued' | 'aggressive' | 'interested' | 'neutral';
export type DealStatus = 'pending' | 'negotiating' | 'deal' | 'no-deal';

export interface SharkPersona {
  id: SharkId;
  name: string;
  title: string;
  emoji: string;
  focus: string[];
  personality: string;
  systemPrompt: string;
}

export interface SharkMessage {
  id: string;
  sharkId: SharkId;
  sharkName: string;
  content: string;
  mood: SharkMood;
  timestamp: number;
  phase: 'analysis' | 'questions' | 'negotiation' | 'decision';
  offer?: DealOffer;
}

export interface DealOffer {
  amount: number;
  equity: number;
  valuation: number;
  conditions?: string[];
  isCounterOffer: boolean;
}

export interface SessionState {
  id: string;
  pitch: StartupPitch;
  messages: SharkMessage[];
  phase: 'analysis' | 'questions' | 'negotiation' | 'decision';
  dealStatus: DealStatus;
  sharkMoods: Record<SharkId, SharkMood>;
  finalDeal?: FinalDeal;
  createdAt: number;
  updatedAt: number;
}

export interface FinalDeal {
  status: 'deal' | 'no-deal';
  shark?: SharkId;
  amount?: number;
  equity?: number;
  valuation?: number;
  memo: string;
  scores: Record<string, number>;
  overallScore: number;
  verdict: string;
}

export interface SSEEvent {
  type: 'shark_message' | 'phase_change' | 'deal_offer' | 'session_complete' | 'error';
  data: unknown;
}

export interface PitchAnalysis {
  factor: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}
