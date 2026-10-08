<div align="center">

# 🦈 Shark Tank Simulator
**An AI-Powered Institutional Investor Pitch Platform**

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20TypeScript-orange?style=for-the-badge)]()
[![UI](https://img.shields.io/badge/UI-TailwindCSS%20%7C%20Glassmorphism-blue?style=for-the-badge)]()

*Subject your startup to unfiltered, institutional-grade scrutiny before risking real capital.*

</div>

---

## 🎯 The Mission
The startup world is filled with the "Polite Feedback Echo Chamber." Friends and family say your idea sounds great, but real venture capitalists care about unit economics, CAC/LTV, and competitive moats. **Shark Tank Simulator** uses an intelligent multi-agent AI panel to strip away politeness and cross-examine founders across 12 critical business pillars.

## ✨ Core Features
- **Dynamic AI Personas:** Face off against 4 specialized "Sharks" (The Hawk, The Market Strategist, The Brand Expert, and The Tech Visionary).
- **Dual Pitching Modes:** Paste your full text deck or use our guided 4-step structured form.
- **Real-time Interaction:** Watch live as the AI panel analyzes, grills, and negotiates terms via Server-Sent Events (SSE).
- **Bulletproof Graceful Fallbacks:** Guaranteed uninterrupted simulation via intelligent mock-data rendering if API connections drop.
- **Premium Dark UI:** Command-center aesthetic with glassmorphism and real-time phase indicators.

## 🚀 Quick Start
1. **Clone & Install:** `npm install` in both `/client` and `/server`.
2. **Environment:** Rename `.env.example` to `.env` in `/server`. Add your OpenRouter or Gemini keys.
3. **Run Services:** 
   - Backend: `cd server && npm run dev`
   - Frontend: `cd client && npm run dev`
4. **Test Data:** Use the provided `/demopitch` folder for perfectly formatted copy-paste examples.

## 🏗 Architecture
Built under a strict 3-hour hackathon constraint.
- **Frontend:** React + Vite + Tailwind (Sub-300 lines per file).
- **Backend:** Node + Express + TypeScript + OpenAI SDK (Smart Fallback AI Routing).

---
<div align="center">
<i>Are you ready to face the tank?</i>
</div>
