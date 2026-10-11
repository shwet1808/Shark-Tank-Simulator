import clsx from 'clsx';
import { ReactNode } from 'react';
import { FinalDeal, SharkId, SharkProfile } from '../types/index';
import { SHARK_PROFILES } from '../types/constants';
import { Download, RotateCcw, TrendingUp, Wrench, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

interface Props {
  deal: FinalDeal;
}

export default function DealResolution({ deal }: Props) {
  const navigate = useNavigate();
  const { reset } = useSessionStore();
  const isDeal = deal.status === 'deal';
  const dealShark = deal.shark
    ? SHARK_PROFILES[deal.shark as SharkId]
    : null;

  // Trigger a text file download with the investment memo
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

  // Reset the session and return to the pitch page
  function handleNewPitch() {
    reset();
    navigate('/pitch');
  }

  return (
    <div
      className={clsx(
        'glass-card p-6 border-2 animate-in',
        isDeal ? 'border-emerald-500/40' : 'border-red-500/30',
      )}
    >
      {/* Verdict header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{isDeal ? '🎉' : '😤'}</div>
        <div
          className={clsx(
            'text-2xl font-black tracking-tight',
            isDeal ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          {isDeal ? 'DEAL CLOSED' : 'NO DEAL'}
        </div>
        <div className="text-sm text-[var(--color-text-muted)] mt-1">
          {deal.verdict}
        </div>
      </div>

      {/* Deal terms */}
      {isDeal && dealShark && (
        <div
          className="rounded-xl p-4 mb-6 border"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.2)',
            background: `linear-gradient(to bottom right, ${dealShark.gradient.replace('/', ', ').replace('from-', 'from-').replace('to-', 'to-')})`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{dealShark.emoji}</span>
            <span className={clsx('text-sm font-semibold', dealShark.color)}>
              {dealShark.name}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] ml-auto">
              Winning Shark
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {deal.amount && (
              <div>
                <div className="text-lg font-black text-emerald-400">
                  ${deal.amount / 1e6 >= 1 ? `${(deal.amount / 1e6).toFixed(1)}M` : deal.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Investment</div>
              </div>
            )}
            {deal.equity && (
              <div>
                <div className="text-lg font-black text-emerald-400">
                  {deal.equity}%
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Equity</div>
              </div>
            )}
            {deal.valuation && (
              <div>
                <div className="text-lg font-black text-emerald-400">
                  ${(deal.valuation / 1e6).toFixed(1)}M
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Valuation</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Pitch Score
          </div>
          <div
            className={clsx('text-xl font-black', {
              'text-emerald-400': deal.overallScore >= 7,
              'text-amber-400': deal.overallScore >= 5,
              'text-red-400': deal.overallScore < 5,
            })}
          >
            {deal.overallScore.toFixed(1)}
            <span className="text-sm font-normal text-[var(--color-text-muted)]">/10</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {Object.entries(deal.scores).slice(0, 6).map(([factor, score]) => (
            <div key={factor} className="flex items-center gap-3">
              <div className="text-xs text-[var(--color-text-muted)] w-28 truncate">
                {factor}
              </div>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-1000',
                    score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500',
                  )}
                  style={{ width: `${score * 10}%` }}
                />
              </div>
              <div className="text-xs text-[var(--color-text-muted)] w-6 text-right">
                {score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment memo */}
      <div
        className="p-4 rounded-xl mb-6"
        style={{
          backgroundColor: 'rgba(23, 23, 23, 0.4)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Investment Memo
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed italic">
          "{deal.memo}"
        </p>
      </div>

      {/* Shark review */}
      <div
        className="p-4 rounded-xl mb-6"
        style={{
          backgroundColor: 'rgba(23, 23, 23, 0.4)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Shark Review
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mt-2">
              {deal.review.summary}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
              Estimated Value
            </div>
            <div className="text-xl font-black text-amber-400">
              {formatMoney(deal.review.estimatedValue)}
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
          {deal.review.valuationReasoning}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <ReviewList
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            title="Strengths"
            items={deal.review.strengths}
          />
          <ReviewList
            icon={<Wrench className="w-4 h-4 text-amber-400" />}
            title="Improve"
            items={deal.review.improvements}
          />
          <ReviewList
            icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
            title="Next Steps"
            items={deal.review.nextSteps}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleExportMemo}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Download className="w-4 h-4" />
          Export Memo
        </button>
        <button
          onClick={handleNewPitch}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-semibold text-sm transition-all"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <RotateCcw className="w-4 h-4" />
          New Pitch
        </button>
      </div>
    </div>
  );
}

// Generate a plain-text investment memo for download
function generateMemoText(
  deal: FinalDeal,
  shark: SharkProfile | null,
): string {
  return `Shark Tank Simulator — Investment Memo
Date: ${new Date().toLocaleDateString()}
Status: ${deal.status.toUpperCase()}
${deal.verdict}

Overall Pitch Score: ${deal.overallScore.toFixed(1)}/10

${shark && deal.amount ? `Deal Terms:
Investor: ${shark.name}
Amount: $${deal.amount.toLocaleString()}
Equity: ${deal.equity}%
Implied Valuation: $${deal.valuation?.toLocaleString() ?? 'N/A'}
` : ''}
Score Breakdown:
${Object.entries(deal.scores).map(([f, s]) => `  ${f}: ${s}/10`).join('\n')}

Investment Memo:
${deal.memo}

Shark Review:
Estimated Value: ${formatMoney(deal.review.estimatedValue)}
${deal.review.summary}
${deal.review.valuationReasoning}

Strengths:
${deal.review.strengths.map((item) => `  - ${item}`).join('\n')}

Improvements:
${deal.review.improvements.map((item) => `  - ${item}`).join('\n')}

Next Steps:
${deal.review.nextSteps.map((item) => `  - ${item}`).join('\n')}

Generated by Shark Tank Simulator
}`;
}

function ReviewList({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)] mb-2">
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toLocaleString()}`;
}
