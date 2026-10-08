import clsx from 'clsx';
import { FinalDeal, SharkId } from '../types/index';
import { SHARK_PROFILES } from '../types/constants';
import { Download, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

interface Props {
  deal: FinalDeal;
}

export default function DealResolution({ deal }: Props) {
  const navigate = useNavigate();
  const { reset } = useSessionStore();
  const isDeal = deal.status === 'deal';
  const dealShark = deal.shark ? SHARK_PROFILES[deal.shark as SharkId] : null;

  function handleExportMemo() {
    const content = generateMemoText(deal, dealShark);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shark-tank-memo-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleNewPitch() {
    reset();
    navigate('/pitch');
  }

  return (
    <div className={clsx(
      'glass-card p-6 border-2 animate-in',
      isDeal ? 'border-emerald-500/40' : 'border-red-500/30',
    )}>
      {/* Verdict header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{isDeal ? '🎉' : '😤'}</div>
        <div className={clsx(
          'text-2xl font-black tracking-tight',
          isDeal ? 'text-emerald-400' : 'text-red-400',
        )}>
          {isDeal ? 'DEAL CLOSED' : 'NO DEAL'}
        </div>
        <div className="text-sm text-zinc-400 mt-1">{deal.verdict}</div>
      </div>

      {/* Deal terms */}
      {isDeal && dealShark && (
        <div className={clsx(
          'rounded-xl p-4 mb-6 bg-gradient-to-br border border-emerald-500/20',
          `${dealShark.gradient}`,
        )}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{dealShark.emoji}</span>
            <span className={clsx('text-sm font-semibold', dealShark.color)}>{dealShark.name}</span>
            <span className="text-xs text-zinc-500 ml-auto">Winning Shark</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {deal.amount && (
              <div>
                <div className="text-lg font-black text-emerald-400">${(deal.amount / 1e6 >= 1 ? (deal.amount / 1e6).toFixed(1) + 'M' : deal.amount.toLocaleString())}</div>
                <div className="text-[10px] text-zinc-500">Investment</div>
              </div>
            )}
            {deal.equity && (
              <div>
                <div className="text-lg font-black text-emerald-400">{deal.equity}%</div>
                <div className="text-[10px] text-zinc-500">Equity</div>
              </div>
            )}
            {deal.valuation && (
              <div>
                <div className="text-lg font-black text-emerald-400">${(deal.valuation / 1e6).toFixed(1)}M</div>
                <div className="text-[10px] text-zinc-500">Valuation</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pitch Score</div>
          <div className={clsx(
            'text-xl font-black',
            deal.overallScore >= 7 ? 'text-emerald-400' : deal.overallScore >= 5 ? 'text-amber-400' : 'text-red-400',
          )}>
            {deal.overallScore.toFixed(1)}<span className="text-sm font-normal text-zinc-600">/10</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {Object.entries(deal.scores).slice(0, 6).map(([factor, score]) => (
            <div key={factor} className="flex items-center gap-3">
              <div className="text-xs text-zinc-500 w-28 truncate">{factor}</div>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-1000',
                    score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500',
                  )}
                  style={{ width: `${score * 10}%` }}
                />
              </div>
              <div className="text-xs text-zinc-400 w-6 text-right">{score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment memo */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 mb-6">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Investment Memo</div>
        <p className="text-sm text-zinc-300 leading-relaxed italic">"{deal.memo}"</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleExportMemo}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-700
            text-zinc-300 text-sm hover:border-zinc-600 hover:text-white transition-all">
          <Download className="w-4 h-4" />
          Export Memo
        </button>
        <button onClick={handleNewPitch}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500
            hover:bg-sky-400 text-white text-sm font-semibold transition-all">
          <RotateCcw className="w-4 h-4" />
          New Pitch
        </button>
      </div>
    </div>
  );
}

function generateMemoText(deal: FinalDeal, shark: typeof SHARK_PROFILES[SharkId] | null): string {
  return `SHARK TANK SIMULATOR — INVESTMENT MEMO
====================================
Date: ${new Date().toLocaleDateString()}
Status: ${deal.status.toUpperCase()}
${deal.verdict}

OVERALL PITCH SCORE: ${deal.overallScore.toFixed(1)}/10

${shark && deal.amount ? `DEAL TERMS:
Investor: ${shark.name}
Amount: $${deal.amount.toLocaleString()}
Equity: ${deal.equity}%
Implied Valuation: $${deal.valuation?.toLocaleString() ?? 'N/A'}
` : ''}
SCORE BREAKDOWN:
${Object.entries(deal.scores).map(([f, s]) => `  ${f}: ${s}/10`).join('\n')}

INVESTMENT MEMO:
${deal.memo}

---
Generated by Shark Tank Simulator
`;
}
