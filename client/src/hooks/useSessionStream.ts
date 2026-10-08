import { useEffect, useRef } from 'react';
import { createSessionStream } from '../services/api';
import { useSessionStore } from '../stores/sessionStore';
import { SharkMessage, FinalDeal, SharkId } from '../types/index';

export function useSessionStream(sessionId: string | null) {
  const esRef = useRef<EventSource | null>(null);
  const { addMessage, setPhase, setFinalDeal, setStreaming, setError } = useSessionStore();

  useEffect(() => {
    if (!sessionId) return;

    setStreaming(true);
    setError(null);
    const es = createSessionStream(sessionId);
    esRef.current = es;

    es.addEventListener('shark_message', (e: MessageEvent) => {
      const msg = JSON.parse(e.data) as SharkMessage;
      addMessage(msg);
    });

    es.addEventListener('phase_change', (e: MessageEvent) => {
      const { phase } = JSON.parse(e.data) as { phase: 'analysis' | 'questions' | 'negotiation' | 'decision' };
      setPhase(phase);
    });

    es.addEventListener('deal_offer', (e: MessageEvent) => {
      const { sharkId, offer } = JSON.parse(e.data) as { sharkId: SharkId; offer: unknown };
      console.log('Deal offer from', sharkId, offer);
    });

    es.addEventListener('session_complete', (e: MessageEvent) => {
      const { finalDeal } = JSON.parse(e.data) as { sessionId: string; finalDeal: FinalDeal };
      setFinalDeal(finalDeal);
      setStreaming(false);
      es.close();
    });

    es.addEventListener('error', (e: MessageEvent) => {
      if (e.data) {
        const err = JSON.parse(e.data) as { message: string };
        setError(err.message);
      }
      setStreaming(false);
      es.close();
    });

    es.onerror = () => {
      // Only set error if not intentionally closed
      if (es.readyState === EventSource.CLOSED) return;
      setError('Connection lost. The session may have ended.');
      setStreaming(false);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [sessionId, addMessage, setPhase, setFinalDeal, setStreaming, setError]);
}
