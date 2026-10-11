import { useEffect, useRef } from 'react';
import { API_BASE } from '../types/constants';
import { createSessionStream } from '../services/api';
import { useSessionStore } from '../stores/sessionStore';
import { SharkMessage, FinalDeal, SharkId } from '../types/index';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'AI provider authentication failed (401). Check your API key in the server .env file.',
  403: 'Access forbidden (403). Your API key may lack permissions.',
  429: 'Rate limit hit (429). The AI provider is throttling requests. Please wait a moment and try again.',
  500: 'The AI backend crashed (500). Check the server logs for details.',
  503: 'AI service unavailable (503). The provider may be down. Try again shortly.',
};

export function useSessionStream(sessionId: string | null) {
  const esRef = useRef<EventSource | null>(null);
  const { addMessage, setPhase, setFinalDeal, setStreaming, setError } = useSessionStore();

  useEffect(() => {
    if (!sessionId) return;

    setStreaming(true);
    setError(null);

    let es: EventSource;
    try {
      es = createSessionStream(sessionId);
    } catch {
      setError('Failed to connect to the session stream. Is the backend server running?');
      setStreaming(false);
      return;
    }

    esRef.current = es;

    es.addEventListener('shark_message', (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data) as SharkMessage;
        addMessage(msg);
      } catch {
        console.warn('[Stream] Failed to parse shark_message:', e.data);
      }
    });

    es.addEventListener('phase_change', (e: MessageEvent) => {
      try {
        const { phase } = JSON.parse(e.data) as {
          phase: 'analysis' | 'questions' | 'negotiation' | 'decision';
        };
        setPhase(phase);
      } catch {
        console.warn('[Stream] Failed to parse phase_change:', e.data);
      }
    });

    es.addEventListener('deal_offer', (e: MessageEvent) => {
      try {
        const { sharkId, offer } = JSON.parse(e.data) as { sharkId: SharkId; offer: unknown };
        console.log('[Stream] Deal offer from', sharkId, offer);
      } catch {
        console.warn('[Stream] Failed to parse deal_offer:', e.data);
      }
    });

    es.addEventListener('session_complete', (e: MessageEvent) => {
      try {
        const { finalDeal } = JSON.parse(e.data) as { sessionId: string; finalDeal: FinalDeal };
        setFinalDeal(finalDeal);
      } catch {
        console.warn('[Stream] Failed to parse session_complete:', e.data);
      } finally {
        setStreaming(false);
        es.close();
      }
    });

    // Named error event from server (intentional, carries message data)
    es.addEventListener('error', (e: MessageEvent) => {
      try {
        if (e.data) {
          const payload = JSON.parse(e.data) as { message: string };
          setError(payload.message || 'An unknown session error occurred.');
        } else {
          setError('Session ended unexpectedly. Please try again.');
        }
      } catch {
        setError('Session ended with an unreadable error. Please try again.');
      }
      setStreaming(false);
      es.close();
    });

    // Native onerror — network-level failure (no data)
    es.onerror = (event) => {
      if (es.readyState === EventSource.CLOSED) return;
      // Try to extract HTTP status if available (not all browsers expose it)
      const status = (event as any)?.status as number | undefined;
      const knownMsg = status ? ERROR_MESSAGES[status] : undefined;
      setError(
        knownMsg ??
          `Connection to the session stream was lost. Check that the backend at ${API_BASE} is running, CORS_ORIGIN allows this site, and this session still exists.`,
      );
      setStreaming(false);
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [sessionId, addMessage, setPhase, setFinalDeal, setStreaming, setError]);
}
