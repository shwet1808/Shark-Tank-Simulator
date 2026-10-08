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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-4xl mb-3">🦈</div>
          <div className="text-sm text-zinc-500">The sharks are preparing their analysis...</div>
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
          <div key={msg.id} className={clsx('animate-in', `stagger-${Math.min(i % 4 + 1, 4)}`)}>
            {/* Phase label */}
            {i === 0 || messages[i - 1]?.phase !== msg.phase ? (
              <div className="flex items-center gap-2 mb-3 mt-1">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-2">
                  {msg.phase.replace('-', ' ')}
                </span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
            ) : null}

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5',
                `bg-gradient-to-br ${profile.gradient} border border-zinc-800`,
              )}>
                {profile.emoji}
              </div>

              {/* Message bubble */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx('text-xs font-semibold', profile.color)}>{profile.name}</span>
                  <span className={clsx('shark-badge text-[10px]', moodCfg.class)}>
                    {moodCfg.icon} {moodCfg.label}
                  </span>
                  <span className="text-[10px] text-zinc-700 ml-auto">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="glass-card p-3 text-sm text-zinc-200 leading-relaxed">
                  {msg.content}
                </div>

                {/* Deal offer card */}
                {msg.offer && (
                  <div className="mt-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Term Sheet Offer</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-zinc-500">Amount</div>
                        <div className="text-white font-semibold">${msg.offer.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Equity</div>
                        <div className="text-white font-semibold">{msg.offer.equity}%</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Valuation</div>
                        <div className="text-white font-semibold">${(msg.offer.valuation / 1e6).toFixed(1)}M</div>
                      </div>
                    </div>
                    {msg.offer.conditions && msg.offer.conditions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-zinc-800/60">
                        <div className="text-[10px] text-zinc-500 mb-1">Conditions:</div>
                        {msg.offer.conditions.map((c, ci) => (
                          <div key={ci} className="text-[10px] text-zinc-400 flex items-start gap-1">
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
        <div className="flex items-center gap-2 px-3 py-2 w-fit rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-zinc-600">Shark thinking...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
