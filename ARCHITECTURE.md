# Shark Tank Simulator — System Architecture

## Project Overview
A production-grade, full-stack AI Shark Tank simulation platform.
Backend: Node.js + Express + TypeScript. Frontend: React + Vite + TailwindCSS.

---

## Monorepo Structure

```
shark-tank-simulator/
├── server/
│   ├── src/
│   │   ├── index.ts               # App entry, middleware wiring
│   │   ├── config/index.ts        # Env config with validation
│   │   ├── config/sharks.ts       # 4 shark personas + factor weights
│   │   ├── types/index.ts         # Domain types (Pitch, Session, etc.)
│   │   ├── services/openai.ts     # AI generation (phase-aware, multi-persona)
│   │   ├── services/pitchAnalyzer.ts # 12-factor pitch scoring (sync)
│   │   ├── services/sessionStore.ts  # In-memory session store with TTL
│   │   ├── routes/pitch.ts        # POST /submit & /text, GET /session/:id
│   │   ├── routes/session.ts      # GET /:id/stream (SSE), GET /:id
│   │   ├── middleware/validation.ts  # Zod schemas
│   │   └── middleware/errorHandler.ts
│
├── client/
│   ├── src/
│   │   ├── main.tsx / App.tsx     # Root + routes
│   │   ├── index.css              # Tailwind + glassmorphism utilities
│   │   ├── types/index.ts         # Client TS types
│   │   ├── types/constants.ts     # Shark profiles, moods, industry list
│   │   ├── stores/sessionStore.ts # Zustand store for live session
│   │   ├── services/api.ts        # Fetch wrappers + SSE factory
│   │   ├── hooks/useSessionStream.ts # SSE → Zustand dispatcher
│   │   ├── pages/HomePage.tsx     # Landing: hero + stats + sharks
│   │   ├── pages/PitchPage.tsx    # Intake: structured or text mode
│   │   ├── pages/TankPage.tsx     # Live tank: split-screen layout
│   │   ├── components/StructuredPitchForm.tsx  # 4-step wizard
│   │   ├── components/TextPitchForm.tsx        # Paste form
│   │   ├── components/SharkCard.tsx            # Status + mood
│   │   ├── components/ChatStream.tsx           # Real-time messages
│   │   ├── components/PhaseIndicator.tsx       # Phase progress
│   │   └── components/DealResolution.tsx       # Verdict + export
│
├── package.json   # Workspace root
├── ARCHITECTURE.md
└── REPORT.md
```

---

## Architecture Diagram

```
BROWSER CLIENT
──────────────────────────────────────
 HomePage → PitchPage → TankPage
                │            │
           PitchForm    ChatStream ← SSE EventSource
                │        SharkCard
                │        PhaseIndicator
                │        DealResolution
                │
        Zustand SessionStore
──────────────────────────────────────
          │ HTTP POST     │ GET /stream (SSE)
          ▼               ▼
EXPRESS SERVER
──────────────────────────────────────
 /api/pitch/submit  → Zod → SessionStore.set()
 /api/session/:id/stream → SSE phases:
   Phase 1: analysis     → generateSharkAnalysis() × 4
   Phase 2: questions    → generateSharkAnalysis() × 4
   Phase 3: negotiation  → generateSharkAnalysis() + generateDealOffer()
   Phase 4: decision     → generateSharkAnalysis() × 4 + generateFinalMemo()
   → session_complete { FinalDeal }
──────────────────────────────────────
          │
          ▼
   OpenAI API (GPT-4o-mini)
   Per-shark system prompts
```

---

## The 4 Shark Personas

| Shark | Focus | Personality |
|-------|-------|-------------|
| Vikram "The Hawk" Malhotra | Unit Economics, CAC, LTV, Burn | Ruthless numbers enforcer |
| Alya Sharma | Problem, Moat, Brand | Sharp product thinker |
| Kabir Mehta | Market Size, Scalability, Exit | Macro pragmatist |
| Devika Roy | Team, Valuation, Negotiation | Deal architect |

---

## 12 Core Startup Factors

| # | Factor | Weight |
|---|--------|--------|
| 1 | Problem | 10% |
| 2 | Market Size | 12% |
| 3 | Product/Solution | 10% |
| 4 | Traction | 12% |
| 5 | Business Model | 8% |
| 6 | Unit Economics | 12% |
| 7 | Competition | 8% |
| 8 | Competitive Moat | 10% |
| 9 | Founding Team | 10% |
| 10 | Scalability | 8% |
| 11 | Financials | 5% |
| 12 | Exit Potential | 5% |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/pitch/submit | Structured pitch |
| POST | /api/pitch/text | Free-text pitch |
| GET | /api/pitch/session/:id | Session state |
| GET | /api/session/:id/stream | SSE stream |
| GET | /api/session/:id | Full session |
