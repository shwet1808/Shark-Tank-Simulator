import { z } from 'zod';

const UnitEconomicsSchema = z.object({
  cac: z.number().nullable().default(null),
  ltv: z.number().nullable().default(null),
  margin: z.number().nullable().default(null),
  burnRate: z.number().nullable().default(null),
  runway: z.number().nullable().default(null),
  mrr: z.number().nullable().default(null),
});

const TeamInfoSchema = z.object({
  founderNames: z.string().min(2, 'Founder name required'),
  background: z.string().min(10, 'Team background required'),
  relevantExperience: z.string().min(10, 'Relevant experience required'),
  teamSize: z.number().nullable().default(null),
});

const FinancialInfoSchema = z.object({
  revenue: z.number().nullable().default(null),
  revenueGrowth: z.string().default(''),
  currentValuation: z.number().nullable().default(null),
  previousFunding: z.number().nullable().default(null),
  useOfFunds: z.string().default(''),
});

export const PitchSchema = z.object({
  companyName: z.string().min(2, 'Company name required').max(100),
  tagline: z.string().min(5, 'Tagline required').max(200),
  industry: z.string().min(2, 'Industry required').max(100),
  stage: z.enum(['idea', 'mvp', 'early-traction', 'growth', 'scale']),
  askAmount: z.number().positive('Ask amount must be positive'),
  equityOffered: z.number().min(0.1).max(99, 'Equity must be between 0.1% and 99%'),
  impliedValuation: z.number().positive(),

  problem: z.string().min(20, 'Problem statement required'),
  marketSize: z.string().min(20, 'Market size description required'),
  solution: z.string().min(20, 'Solution description required'),
  traction: z.string().min(10, 'Traction information required'),
  businessModel: z.string().min(20, 'Business model required'),
  unitEconomics: UnitEconomicsSchema,
  competition: z.string().min(10, 'Competition overview required'),
  moat: z.string().min(10, 'Competitive moat required'),
  team: TeamInfoSchema,
  scalability: z.string().min(10, 'Scalability plan required'),
  financials: FinancialInfoSchema,
  exitPotential: z.string().min(10, 'Exit potential required'),

  additionalContext: z.string().optional(),
  pitchDeckText: z.string().optional(),
});

export const TextPitchSchema = z.object({
  pitchText: z.string().min(100, 'Pitch text must be at least 100 characters'),
  companyName: z.string().min(2, 'Company name required'),
  askAmount: z.number().positive('Ask amount required'),
  equityOffered: z.number().min(0.1).max(99),
});

export const UserMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});
