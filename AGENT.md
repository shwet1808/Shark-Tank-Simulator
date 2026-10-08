# AI Operating Rules & Directives (AGENT.md)

## 1. Core Workflow & Planning Rules
* **Plan First, Execute Second:** Outline the implementation plan, affected files, and architectural impact *before* writing or modifying any code. 
* **Explicit Permission Required:** Wait for explicit user confirmation before executing major code changes, installing new packages, or restructuring directories.
* **Explanation Standard:** Provide a concise, clear explanation of every code change made, outlining *what* was done and *why* it was structured that way.

## 2. Code Quality, Clarity, & Formatting Standards
* **Line Width Limit:** Hard limit of **80 characters** per line for Python (PEP 8) and **100 characters** for JavaScript/TypeScript/JSON/Markdown to prevent horizontal scrolling.
* **Vertical & Horizontal Spacing:** 
  * Use **2 spaces** for indentation in JS/TS/HTML/CSS/YAML/Markdown and **4 spaces** for Python.
  * Separate major functions and class methods with exactly **two blank lines**.
  * Separate logical blocks inside functions with **one blank line** accompanied by a brief comment if logic is complex.
* **File & Component Size Limit:** Keep individual source files under **300 lines of code**. If a file grows larger, refactor and split it into modular sub-components or helper utilities.
* **Naming Conventions:** 
  * PascalCase for components and classes (`UserProfileCard.jsx`).
  * camelCase for variables, functions, and hooks (`getUserData.js`).
  * UPPER_SNAKE_CASE for global constants (`MAX_RETRY_LIMIT`).
  * snake_case for Python modules and functions (`parse_user_data.py`).
* **Zero Dead Code:** Never leave commented-out code blocks, unused imports, or placeholder debugging statements in final outputs.

## 3. GitHub & Repository Constraints
* **10 MB File Size Limit:** Strictly ensure that **no individual file** (images, assets, database dumps, build artifacts, or dependency bundles) exceeds **10 MB**. If storing larger assets, use cloud URLs or external storage.
* **Clean Commits & Ignore Files:** Maintain a strict `.gitignore` file blocking heavy folders (e.g., `node_modules/`, `venv/`, `.next/`, build caches) from ever hitting GitHub.

## 4. Architecture & Documentation Tracking
Maintain living project documentation in the root directory that updates continuously alongside code changes:
* **`ARCHITECTURE.md`:** A visual and textual blueprint detailing component relationships, data flow, state management, and API request-response lifecycles.
* **`REPORT.md`:** A chronological milestone tracker listing completed features, active tech stack versions, known limitations, and quick setup instructions.

## 5. Engineering & Design Patterns
* **Frontend Design Pattern:** Implement modern, unique, and conversion-focused UI patterns inspired by Linear, Vercel, and modern SaaS dashboards (e.g., asymmetrical bento-grid layouts, ultra-thin borders `border-zinc-800`, deep dark themes `bg-zinc-950`, and advanced glassmorphism `backdrop-blur-md bg-white/10`). Strictly avoid generic purple gradients and flat templates.
* **Backend Coding Approach:** Maintain a clean, simple, and robust approach using stateless endpoints, explicit error handling, and clean separation of concerns.
* **Language Agnostic Agility:** Write idiomatic, clean code whether building in JavaScript/TypeScript (Node.js/Next.js) or Python (Flask/FastAPI), enforcing uniform formatting.
* **Folder Structure Blueprint:** Adhere strictly to this modular organization:
  ```text
  /
  ├── ARCHITECTURE.md
  ├── REPORT.md
  ├── AGENT.md
  ├── src/ or backend/
  │   ├── components/  # Reusable UI building blocks
  │   ├── features/    # Page or domain-specific modules
  │   ├── services/    # API calls, SDK clients, and state handlers
  │   └── utils/       # Pure helper functions and formatters
  └── .env.example