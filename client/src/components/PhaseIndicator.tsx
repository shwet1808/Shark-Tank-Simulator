import clsx from 'clsx';
import { PHASE_CONFIG } from '../types/constants';
import { SessionPhase } from '../types/index';

interface Props {
  phase: SessionPhase;
}

const PHASES: SessionPhase[] = ['analysis', 'questions', 'negotiation', 'decision'];

export default function PhaseIndicator({ phase }: Props) {
  const currentStep = PHASE_CONFIG[phase].step;

  return (
    <div className="flex items-center gap-1.5 p-3 glass-card">
      {PHASES.map((p, i) => {
        const cfg = PHASE_CONFIG[p];
        const isActive = p === phase;
        const isDone = cfg.step < currentStep;

        return (
          <div key={p} className="flex items-center gap-1.5">
            <div
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-500',
                isActive
                  ? 'border'
                  : isDone
                    ? 'text-emerald-400'
                    : 'text-[var(--color-text-muted)]',
              )}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--color-accent-dim)',
                      borderColor: 'rgba(234, 88, 12, 0.3)',
                      color: 'var(--color-accent)',
                    }
                  : {}
              }
            >
              <div
                className={clsx(
                  'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                  isActive
                    ? 'text-white'
                    : isDone
                      ? 'bg-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 text-[var(--color-text-muted)]',
                )}
                style={isActive ? { backgroundColor: 'var(--color-accent)' } : {}}
              >
                {isDone ? '✓' : cfg.step}
              </div>
              <span className="hidden sm:block">{cfg.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div
                className="w-6 h-px transition-colors"
                style={{
                  backgroundColor: isDone
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'var(--color-border)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
