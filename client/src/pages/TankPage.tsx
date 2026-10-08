import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useSessionStream } from '../hooks/useSessionStream';
import SharkCard from '../components/SharkCard';
import ChatStream from '../components/ChatStream';
import PhaseIndicator from '../components/PhaseIndicator';
import DealResolution from '../components/DealResolution';
import { SharkId } from '../types/index';
import { AlertCircle, ChevronLeft, Radio, CheckCircle2, LayoutList } from 'lucide-react';
import { useState } from 'react';

const SHARK_IDS: SharkId[] = ['vikram', 'alya', 'kabir', 'devika'];

type View = 'discussion' | 'report';

export default function TankPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { messages, phase, sharkMoods, finalDeal, isStreaming, error } = useSessionStore();
  const [view, setView] = useState<View>('discussion');

  // Kick off the SSE stream on mount
  useSessionStream(sessionId ?? null);

  function getLastMessageFor(sharkId: SharkId) {
    const sharkMsgs = messages.filter((m) => m.sharkId === sharkId);
    return sharkMsgs[sharkMsgs.length - 1];
  }

  const lastSpeakerId = messages[messages.length - 1]?.sharkId;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Error popup modal — overlays everything */}
      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-red-500/30 p-6 rounded-xl max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">Session Error</h3>
              <p className="text-sm text-red-400 leading-relaxed">{error}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => navigate('/pitch')}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm
                  rounded-lg transition-colors border border-zinc-800"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-sm
                  rounded-lg transition-colors border border-zinc-800"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header
        className="flex-shrink-0 border-b px-4 py-3 flex items-center justify-between gap-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[var(--color-text-muted)]
            hover:text-[var(--color-text)] transition-colors text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <PhaseIndicator phase={phase} />

        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <>
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">LIVE</span>
            </>
          ) : finalDeal ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Complete</span>
            </>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">Starting...</span>
          )}
        </div>
      </header>

      {/* Tab switcher — only visible once session ends */}
      {finalDeal && !isStreaming && (
        <div
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <button
            onClick={() => setView('discussion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'discussion'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            Discussion
          </button>
          <button
            onClick={() => setView('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'report'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Final Report
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Shark status panel */}
        <aside
          className="w-64 flex-shrink-0 border-r flex flex-col overflow-y-auto scrollbar-hide p-3 gap-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest px-1 pt-1">
            The Panel
          </div>
          {SHARK_IDS.map((sharkId) => {
            const lastMsg = getLastMessageFor(sharkId);
            return (
              <SharkCard
                key={sharkId}
                sharkId={sharkId}
                mood={sharkMoods[sharkId]}
                isActive={lastSpeakerId === sharkId && isStreaming}
                lastMessage={lastMsg?.content}
              />
            );
          })}

          {/* Session stats */}
          <div className="mt-auto pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="glass-card p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Messages</span>
                <span className="font-medium text-[var(--color-text)]">{messages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Phase</span>
                <span className="font-medium text-[var(--color-text)] capitalize">{phase}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Status</span>
                <span className={`font-medium text-xs ${isStreaming ? 'text-red-400' : finalDeal ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {isStreaming ? 'Live' : finalDeal ? 'Done' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Discussion view — always rendered, hidden only when viewing report */}
          <div className={`flex-1 overflow-hidden flex flex-col ${view === 'report' && finalDeal ? 'hidden' : ''}`}>
            <ChatStream messages={messages} isStreaming={isStreaming} />
          </div>

          {/* Report view — full scroll panel */}
          {view === 'report' && finalDeal && (
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
              <DealResolution deal={finalDeal} />
            </div>
          )}

          {/* Inline report preview strip when discussion tab active */}
          {view === 'discussion' && finalDeal && !isStreaming && (
            <div
              className="flex-shrink-0 border-t px-4 py-3 flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-zinc-300 font-medium">
                  {finalDeal.status === 'deal'
                    ? `🤝 Deal closed with ${finalDeal.shark}!`
                    : '❌ No deal — all sharks passed.'}
                </span>
              </div>
              <button
                onClick={() => setView('report')}
                className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700
                  text-zinc-200 transition-colors border border-zinc-700"
              >
                View Full Report →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
