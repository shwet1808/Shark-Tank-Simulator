import { StartupPitch, PitchAnalysis } from '../types/index.js';
import { PITCH_ANALYSIS_FACTORS } from '../config/sharks.js';

function scoreField(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') {
    const len = value.trim().length;
    if (len === 0) return 0;
    if (len < 30) return 3;
    if (len < 100) return 6;
    if (len < 250) return 8;
    return 9;
  }
  if (typeof value === 'number') {
    return value > 0 ? 8 : 2;
  }
  return 5;
}


function analyzeUnitEconomics(pitch: StartupPitch): number {
  const { cac, ltv, margin, burnRate, runway, mrr } = pitch.unitEconomics;
  let score = 0;
  let count = 0;

  if (cac !== null && ltv !== null && cac > 0) {
    const ratio = ltv / cac;
    score += ratio >= 3 ? 10 : ratio >= 2 ? 7 : ratio >= 1 ? 4 : 1;
    count++;
  }
  if (margin !== null) { 
    score += margin >= 60 ? 10 : margin >= 40 ? 7 : margin >= 20 ? 5 : 2; 
    count++; 
  }
  if (burnRate !== null && runway !== null) { 
    score += runway >= 18 ? 10 : runway >= 12 ? 7 : runway >= 6 ? 4 : 1; 
    count++; 
  }
  if (mrr !== null) { score += mrr > 0 ? 8 : 0; count++; }

  return count > 0 ? Math.round(score / count) : 3;
}


function analyzeValuation(pitch: StartupPitch): { fair: boolean; ratio: number } {
  const { askAmount, equityOffered, impliedValuation } = pitch;
  const calculatedVal = askAmount / (equityOffered / 100);
  const ratio = impliedValuation / calculatedVal;
  return { fair: ratio >= 0.8 && ratio <= 1.3, ratio };
}


export function analyzePitch(pitch: StartupPitch): PitchAnalysis[] {
  return PITCH_ANALYSIS_FACTORS.map((factor) => {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (factor.key === 'unitEconomics') {
      score = analyzeUnitEconomics(pitch);
      if (score >= 7) strengths.push('Strong unit economics');
      if (score < 5) weaknesses.push('Weak or missing unit economics data');
    } else if (factor.key === 'team') {
      const { background, relevantExperience, teamSize } = pitch.team;
      score = Math.round((scoreField(background) + scoreField(relevantExperience)) / 2);
      if (teamSize && teamSize >= 3) strengths.push('Sufficient team size');
      if (score < 5) weaknesses.push('Team background needs more detail');
    } else if (factor.key === 'financials') {
      const { revenue, revenueGrowth } = pitch.financials;
      score = revenue && revenue > 0 ? 8 : 3;
      if (revenueGrowth.toLowerCase().includes('%')) strengths.push('Revenue growth tracked');
      if (!revenue) weaknesses.push('No revenue reported');
    } else {
      const value = (pitch as unknown as Record<string, unknown>)[factor.key];
      score = scoreField(value);
      if (score >= 7) strengths.push(`Strong ${factor.label.toLowerCase()} articulation`);
      if (score < 5) weaknesses.push(`${factor.label} needs more detail`);
    }

    return { factor: factor.label, score, strengths, weaknesses };
  });
}


export function computeOverallScore(analyses: PitchAnalysis[]): number {
  const factors = PITCH_ANALYSIS_FACTORS;
  let weightedSum = 0;
  analyses.forEach((analysis, i) => {
    weightedSum += analysis.score * (factors[i]?.weight ?? 0.08);
  });
  return Math.round(weightedSum * 10) / 10;
}

export { analyzeValuation };
