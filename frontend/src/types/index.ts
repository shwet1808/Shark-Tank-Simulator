// Shared types mirroring the server types (no shared package needed)

export type SharkId = 'vikram' | 'alya' | 'kabir' | 'devika';
export type SharkMood = 'skeptical' | 'intrigued' | 'aggressive' | 'interested' | 'neutral';
export type DealStatus = 'pending' | 'negotiating' | 'deal' | 'no-deal';
export type SessionPhase = 'analysis' | 'questions' | 'negotiation' | 'decision';

export interface SharkProfile {
  id: SharkId;
  name: string;
  title: string;
  emoji: string;
  focus: string[];
  color: string;
  gradient: string;
}

export interface SharkMessage {
  id: string;
  sharkId: SharkId;
  sharkName: string;
  content: string;
  mood: SharkMood;
  timestamp: number;
  phase: SessionPhase;
  offer?: DealOffer;
}

export interface DealOffer {
  amount: number;
  equity: number;
  valuation: number;
  conditions?: string[];
  isCounterOffer: boolean;
}

export interface FinalDeal {
  status: 'deal' | 'no-deal';
  shark?: SharkId;
  amount?: number;
  equity?: number;
  valuation?: number;
  memo: string;
  review: BusinessReview;
  scores: Record<string, number>;
  overallScore: number;
  verdict: string;
}

export interface BusinessReview {
  summary: string;
  estimatedValue: number;
  valuationReasoning: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  weaknesses?: string[];
  actionItems?: string[];
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

export interface PitchFormData {
  companyName: string;
  tagline: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'early-traction' | 'growth' | 'scale';
  askAmount: number;
  equityOffered: number;
  impliedValuation: number;
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
  additionalContext?: string;
}

export interface SessionState {
  id: string;
  messages: SharkMessage[];
  phase: SessionPhase;
  dealStatus: DealStatus;
  sharkMoods: Record<SharkId, SharkMood>;
  finalDeal?: FinalDeal;
}

export interface SSEEventData {
  type: 'shark_message' | 'phase_change' | 'deal_offer' | 'session_complete' | 'error';
  data: unknown;
}
