import { create } from 'zustand';
import { SessionState, SharkMessage, SessionPhase, DealStatus, SharkId, SharkMood, FinalDeal } from '../types/index';

interface SessionStore extends SessionState {
  sessionId: string | null;
  isStreaming: boolean;
  error: string | null;
  setSessionId: (id: string) => void;
  addMessage: (msg: SharkMessage) => void;
  setPhase: (phase: SessionPhase) => void;
  setDealStatus: (status: DealStatus) => void;
  updateMood: (sharkId: SharkId, mood: SharkMood) => void;
  setFinalDeal: (deal: FinalDeal) => void;
  setStreaming: (val: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  id: '',
  messages: [],
  phase: 'analysis' as SessionPhase,
  dealStatus: 'pending' as DealStatus,
  sharkMoods: { vikram: 'neutral', alya: 'neutral', kabir: 'neutral', devika: 'neutral' } as Record<SharkId, SharkMood>,
  finalDeal: undefined,
  isStreaming: false,
  error: null,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setSessionId: (id) => set({ sessionId: id, id }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg],
    sharkMoods: { ...state.sharkMoods, [msg.sharkId]: msg.mood },
  })),

  setPhase: (phase) => set({ phase }),

  setDealStatus: (status) => set({ dealStatus: status }),

  updateMood: (sharkId, mood) => set((state) => ({
    sharkMoods: { ...state.sharkMoods, [sharkId]: mood },
  })),

  setFinalDeal: (deal) => set({ finalDeal: deal, dealStatus: deal.status }),

  setStreaming: (val) => set({ isStreaming: val }),

  setError: (err) => set({ error: err }),

  reset: () => set(initialState),
}));
