import { SessionState, SharkId, SharkMood } from '../types/index.js';

// In-memory session store (production would use Redis)
const sessions = new Map<string, SessionState>();

export const sessionStore = {
  get(id: string): SessionState | undefined {
    return sessions.get(id);
  },

  set(id: string, state: SessionState): void {
    sessions.set(id, state);
  },

  update(id: string, updates: Partial<SessionState>): SessionState | null {
    const existing = sessions.get(id);
    if (!existing) return null;
    const updated: SessionState = { ...existing, ...updates, updatedAt: Date.now() };
    sessions.set(id, updated);
    return updated;
  },

  updateMood(id: string, sharkId: SharkId, mood: SharkMood): void {
    const session = sessions.get(id);
    if (!session) return;
    session.sharkMoods[sharkId] = mood;
    session.updatedAt = Date.now();
    sessions.set(id, session);
  },

  delete(id: string): boolean {
    return sessions.delete(id);
  },

  has(id: string): boolean {
    return sessions.has(id);
  },

  // Cleanup sessions older than 2 hours
  cleanup(): void {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [key, session] of sessions.entries()) {
      if (session.updatedAt < twoHoursAgo) sessions.delete(key);
    }
  },
};

// Run cleanup every 30 minutes
setInterval(() => sessionStore.cleanup(), 30 * 60 * 1000);
