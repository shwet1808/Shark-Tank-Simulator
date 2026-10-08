import { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { SharkMessage } from '../types/index';
import { SHARK_PROFILES, MOOD_CONFIG } from '../types/constants';
import { DollarSign } from 'lucide-react';

interface Props {
  messages: SharkMessage[];
  isStreaming: boolean;
}

export default function ChatStream({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Empty state — shown before the first shark speaks
  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-4xl mb-3">🦈</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            The sharks are preparing their analysis...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
      {messages.map((msg, i) => {
        const profile = SHARK_PROFILES[msg.sharkId];
        const moodCfg = MOOD_CONFIG[msg.mood];

        return (
          <div
            key={msg.id}
            className={clsx('animate-in', `stagger-${Math.min(i % 4 + 1, 4)}`)}
          >
            {/* Phase divider — shown at the start of each phase */}
            {i === 0 || messages[i - 1]?.phase !== msg.phase ? (
              <div className="flex items-center gap-2 mb-3 mt-1">
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: 'var(--color-border)' }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-2">
                  {msg.phase.replace('-', ' ')}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: 'var(--color-border)' }}
                />
              </div>
            ) : null}

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5 border',
                  `bg-gradient-to-br ${profile.gradient}`,
                )}
                style={{ borderColor: 'var(--color-border)' }}
              >
                {profile.emoji}
              </div>

              {/* Message bubble */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx('text-xs font-semibold', profile.color)}>
                    {profile.name}
                  </span>
                  <span className={clsx('shark-badge text-[10px]', moodCfg.class)}>
                    {moodCfg.icon} {moodCfg.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className="glass-card p-3 text-sm leading-relaxed"
                  style={{ color: 'var(--color-text)' }}
                >
                  {msg.content}
                </div>

                {/* Deal offer card */}
                {msg.offer && (
                  <div
                    className="mt-2 p-3 rounded-lg border"
                    style={{
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">
                        Term Sheet Offer
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-[var(--color-text-muted)]">Amount</div>
                        <div className="text-white font-semibold">
                          ${msg.offer.amount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--color-text-muted)]">Equity</div>
                        <div className="text-white font-semibold">
                          {msg.offer.equity}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--color-text-muted)]">Valuation</div>
                        <div className="text-white font-semibold">
                          ${(msg.offer.valuation / 1e6).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                    {msg.offer.conditions && msg.offer.conditions.length > 0 && (
                      <div
                        className="mt-2 pt-2 border-t"
                        style={{ borderColor: 'var(--color-border-subtle)' }}
                      >
                        <div className="text-[10px] text-[var(--color-text-muted)] mb-1">
                          Conditions:
                        </div>
                        {msg.offer.conditions.map((c, ci) => (
                          <div
                            key={ci}
                            className="text-[10px] text-zinc-400 flex items-start gap-1"
                          >
                            <span className="text-emerald-500 mt-0.5">•</span> {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isStreaming && (
        <div
          className="flex items-center gap-2 px-3 py-2 w-fit rounded-lg border"
          style={{
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--color-text-muted)',
                animationDelay: '0ms',
              }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--color-text-muted)',
                animationDelay: '150ms',
              }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--color-text-muted)',
                animationDelay: '300ms',
              }}
            />
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Shark thinking...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
