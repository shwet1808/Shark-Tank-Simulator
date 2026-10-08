import { SharkProfile, SharkId } from '../types/index';

export const SHARK_PROFILES: Record<SharkId, SharkProfile> = {
  vikram: {
    id: 'vikram',
    name: 'Vikram Malhotra',
    title: '"The Hawk"',
    emoji: '🦅',
    focus: ['Unit Economics', 'CAC/LTV', 'Burn Rate', 'Financials'],
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  alya: {
    id: 'alya',
    name: 'Alya Sharma',
    title: 'Brand & Moat',
    emoji: '🎯',
    focus: ['Problem', 'UX', 'Competitive Moat', 'Brand'],
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  kabir: {
    id: 'kabir',
    name: 'Kabir Mehta',
    title: 'Market Strategist',
    emoji: '🌍',
    focus: ['Market Size', 'Scalability', 'Exit Potential'],
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  devika: {
    id: 'devika',
    name: 'Devika Roy',
    title: 'Deal Architect',
    emoji: '💼',
    focus: ['Team', 'Valuation', 'Equity', 'Negotiation'],
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-violet-500/10',
  },
};

export const MOOD_CONFIG = {
  skeptical: { label: 'Skeptical', class: 'mood-skeptical', icon: '🤨' },
  intrigued: { label: 'Intrigued', class: 'mood-intrigued', icon: '🤔' },
  aggressive: { label: 'Aggressive', class: 'mood-aggressive', icon: '😤' },
  interested: { label: 'Interested', class: 'mood-interested', icon: '👀' },
  neutral: { label: 'Neutral', class: 'mood-neutral', icon: '😐' },
} as const;

export const PHASE_CONFIG = {
  analysis: { label: 'Initial Analysis', step: 1, description: 'Sharks review your pitch deck' },
  questions: { label: 'Hard Questions', step: 2, description: 'Sharks grill the founder' },
  negotiation: { label: 'Negotiation', step: 3, description: 'Term sheets on the table' },
  decision: { label: 'Final Decision', step: 4, description: 'Deal or no deal' },
} as const;

export const INDUSTRY_OPTIONS = [
  'SaaS / B2B Software', 'Consumer App', 'FinTech', 'HealthTech', 'EdTech',
  'E-commerce / D2C', 'MarketPlace', 'DeepTech / AI', 'CleanTech', 'FoodTech',
  'PropTech', 'LegalTech', 'HRTech', 'Gaming', 'Media / Creator Economy',
  'BioTech / Pharma', 'SpaceTech', 'Logistics / Supply Chain', 'Hardware', 'Other',
];

export const STAGE_OPTIONS = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'MVP Built' },
  { value: 'early-traction', label: 'Early Traction' },
  { value: 'growth', label: 'Growth Stage' },
  { value: 'scale', label: 'Scaling' },
] as const;

export const API_BASE = '/api';
