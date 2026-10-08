# Shark Tank Simulator — Project Report

## Hackathon: 3-Hour Sprint Log

---

### MILESTONE 1 — Project Kickoff
**Time:** T+0:00
**Status:** ✅ Complete

**Actions:**
- Initialized monorepo with npm workspaces (`/server`, `/client`)
- Created `.gitignore`, root `package.json` with `concurrently` dev script
- Established strict constraints: 300 LOC/file, 100 char line width, modular architecture

---

### MILESTONE 2 — Backend Engine
**Time:** T+0:30
**Status:** ✅ Complete

**Files created:**
- `server/src/types/index.ts` — Core domain types (StartupPitch, SessionState, SharkPersona, etc.)
- `server/src/config/index.ts` — Centralized env config with validation
- `server/src/config/sharks.ts` — 4 shark personas with full system prompts + 12-factor weights
- `server/src/services/openai.ts` — Multi-phase AI generation, mood inference, deal offer JSON extraction
- `server/src/services/pitchAnalyzer.ts` — Synchronous 12-factor scoring engine (no AI, fast)
- `server/src/services/sessionStore.ts` — In-memory session store with 2hr TTL cleanup
- `server/src/middleware/validation.ts` — Zod schemas for all inputs
- `server/src/middleware/errorHandler.ts` — Global error handler + request logger
- `server/src/routes/pitch.ts` — Pitch submission routes (structured + text)
- `server/src/routes/session.ts` — SSE streaming session route (4-phase orchestration)
- `server/src/index.ts` — Express app with Helmet, CORS, rate limiting

**Key Design Decisions:**
- SSE chosen over WebSocket for simplicity and HTTP/2 compatibility
- Phase-aware prompting ensures each shark response addresses the right context
- Mood parsing from content (keyword heuristics) for instant feedback without extra API call
- Deal offers extracted via JSON regex from AI response to avoid hallucinations

---

### MILESTONE 3 — Frontend Foundation
**Time:** T+1:00
**Status:** ✅ Complete

**Files created:**
- `client/vite.config.ts` — Vite config with `/api` proxy to backend port 3001
- `client/tailwind.config.js` — Custom shark brand colors, animation keyframes
- `client/src/index.css` — Global styles: Tailwind layers, glassmorphism utilities,
  mood badge classes, scrollbar-hide, text-gradient utilities
- `client/src/types/index.ts` — Client-side TS types
- `client/src/types/constants.ts` — Shark profiles with gradients/colors, mood config, industries
- `client/src/stores/sessionStore.ts` — Zustand store for live session state
- `client/src/services/api.ts` — API service layer (submit + SSE factory)
- `client/src/hooks/useSessionStream.ts` — SSE hook dispatching to Zustand

---

### MILESTONE 4 — UI Pages & Components
**Time:** T+1:30
**Status:** ✅ Complete

**Pages:**
- `HomePage.tsx` — Hero section with gradient headline, stats bento grid, shark lineup, features
- `PitchPage.tsx` — Intake with mode switcher (structured/text), error banner, loading overlay
- `TankPage.tsx` — Split-screen: shark panel (left) + SSE chat stream (right), phase header

**Components:**
- `StructuredPitchForm.tsx` — 4-step wizard covering all 12 factors with inline validation
- `TextPitchForm.tsx` — Free-text paste form with character counter
- `SharkCard.tsx` — Status card with mood badge, focus tags, last message preview
- `ChatStream.tsx` — Real-time message stream: phase dividers, deal offer cards, typing indicator
- `PhaseIndicator.tsx` — 4-phase step progress with completion states
- `DealResolution.tsx` — Final verdict, score bars, investment memo, export + restart actions

---

### MILESTONE 5 — Documentation
**Time:** T+2:00
**Status:** ✅ Complete

- `ARCHITECTURE.md` — Full system diagram, data flow, API table, tech stack
- `REPORT.md` — This file

---

## Architecture Decisions Log

| Decision | Rationale |
|----------|-----------|
| SSE over WebSocket | Simpler, unidirectional, works with HTTP/2, no socket library needed |
| In-memory sessions | Sufficient for hackathon; interface designed for Redis swap |
| Zustand over Redux | Minimal boilerplate, no provider needed, perfect for this scale |
| Phase-aware prompts | Each shark addresses correct context without re-sending full history |
| Zod validation | Type-safe runtime validation at API boundary, great DX |
| GPT-4o-mini | Cost-effective, fast, sufficient quality for shark personas |

---

## File Line Count Summary (all under 300)

| File | Approx. Lines |
|------|--------------|
| server/src/types/index.ts | 85 |
| server/src/config/sharks.ts | 75 |
| server/src/services/openai.ts | 110 |
| server/src/services/pitchAnalyzer.ts | 75 |
| server/src/services/sessionStore.ts | 55 |
| server/src/routes/session.ts | 95 |
| server/src/routes/pitch.ts | 85 |
| client/src/pages/TankPage.tsx | 90 |
| client/src/pages/HomePage.tsx | 105 |
| client/src/components/StructuredPitchForm.tsx | 185 |
| client/src/components/ChatStream.tsx | 105 |
| client/src/components/DealResolution.tsx | 115 |

All files comply with the 300-line and 100-character width constraints.

---

## Setup Instructions

```bash
# 1. Clone and install root
npm install

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env and add your OPENAI_API_KEY

# 3. Start both services
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```
