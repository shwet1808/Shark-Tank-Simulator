import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useSessionStream } from '../hooks/useSessionStream';
import SharkCard from '../components/SharkCard';
import ChatStream from '../components/ChatStream';
import PhaseIndicator from '../components/PhaseIndicator';
import DealResolution from '../components/DealResolution';
import { SharkId } from '../types/index';
import { AlertCircle, ChevronLeft, Radio } from 'lucide-react';

const SHARK_IDS: SharkId[] = ['vikram', 'alya', 'kabir', 'devika'];

export default function TankPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { messages, phase, sharkMoods, finalDeal, isStreaming, error } =
    useSessionStore();

  // Kick off the SSE stream on mount
  useSessionStream(sessionId ?? null);

  // Get last message per shark for the card preview
  function getLastMessageFor(sharkId: SharkId) {
    const sharkMsgs = messages.filter((m) => m.sharkId === sharkId);
    return sharkMsgs[sharkMsgs.length - 1];
  }

  // Which shark spoke last (for active highlight)
  const lastSpeakerId = messages[messages.length - 1]?.sharkId;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Top bar */}
      <header
        className="flex-shrink-0 border-b px-4 py-3 flex items-center justify-between gap-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-xs"
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
            <span className="text-xs text-[var(--color-text-muted)]">
              Session ended
            </span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">Starting...</span>
          )}
        </div>
      </header>

      {/* Main layout: shark panel + chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Shark status panel */}
        <aside
          className="w-72 flex-shrink-0 border-r flex flex-col overflow-y-auto scrollbar-hide p-3 gap-3"
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
                <span className="font-medium text-[var(--color-text)]">
                  {messages.length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Phase</span>
                <span className="font-medium text-[var(--color-text)] capitalize">
                  {phase}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Status</span>
                <span
                  className={`font-medium text-xs ${
                    isStreaming ? 'text-red-400' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {isStreaming ? 'Live' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: Chat + Deal resolution */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Error popup modal */}
          {error && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-zinc-950 border border-red-500/30 p-6 rounded-xl max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-zinc-100 mb-1">Session Error</h3>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mt-2 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm rounded-lg transition-colors border border-zinc-800"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}

          {/* Chat stream */}
          <ChatStream messages={messages} isStreaming={isStreaming} />

          {/* Deal resolution panel */}
          {finalDeal && (
            <div
              className="flex-shrink-0 p-4 border-t overflow-y-auto max-h-[50vh] scrollbar-hide"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <DealResolution deal={finalDeal} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
