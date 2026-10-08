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
  const {
    messages, phase, sharkMoods, finalDeal, isStreaming, error,
  } = useSessionStore();

  // Kick off the SSE stream
  useSessionStream(sessionId ?? null);

  // Get last message per shark for the card preview
  function getLastMessageFor(sharkId: SharkId) {
    const sharkMsgs = messages.filter((m) => m.sharkId === sharkId);
    return sharkMsgs[sharkMsgs.length - 1];
  }

  // Which shark spoke last
  const lastSpeakerId = messages[messages.length - 1]?.sharkId;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-zinc-800/40 px-4 py-3 flex items-center justify-between gap-4">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs">
          <ChevronLeft className="w-3.5 h-3.5" />Back
        </button>

        <PhaseIndicator phase={phase} />

        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <>
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">LIVE</span>
            </>
          ) : finalDeal ? (
            <span className="text-xs text-zinc-500">Session ended</span>
          ) : (
            <span className="text-xs text-zinc-600">Starting...</span>
          )}
        </div>
      </header>

      {/* Main layout: Left panel + Right chat */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Shark status panel */}
        <aside className="w-72 flex-shrink-0 border-r border-zinc-800/40 flex flex-col overflow-y-auto scrollbar-hide p-3 gap-3">
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-1 pt-1">
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
          <div className="mt-auto pt-3 border-t border-zinc-800/60">
            <div className="glass-card p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-600">Messages</span>
                <span className="text-zinc-300 font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-600">Phase</span>
                <span className="text-zinc-300 font-medium capitalize">{phase}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-600">Status</span>
                <span className={`font-medium text-xs ${isStreaming ? 'text-red-400' : 'text-zinc-400'}`}>
                  {isStreaming ? 'Live' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: Chat stream + Deal resolution */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Error banner */}
          {error && (
            <div className="flex-shrink-0 flex items-start gap-2 m-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-400">{error}</div>
            </div>
          )}

          {/* Chat */}
          <ChatStream messages={messages} isStreaming={isStreaming} />

          {/* Deal resolution (shown when complete) */}
          {finalDeal && (
            <div className="flex-shrink-0 p-4 border-t border-zinc-800/40 overflow-y-auto max-h-[50vh] scrollbar-hide">
              <DealResolution deal={finalDeal} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
