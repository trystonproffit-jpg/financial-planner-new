# Change Log

## 2026-04-08

### Initial project logging setup

- Added `FEATURES.md` to document the app vision, core features, AI intake goals, and future milestones.
- Added `CHANGELOG.md` to keep a running summary of project changes as development continues.

### App structure refactor

- Split the dashboard into focused components so `App.jsx` only manages state and page composition.
- Moved finance constants, sample data, formatting helpers, and import parsing into `src/lib/finance.js`.
- Removed older placeholder files that no longer matched the current dashboard implementation.

### Existing app changes completed in this session

- Reworked the main app into a richer financial planning dashboard.
- Added summary metrics for income, expenses, balance, and savings rate.
- Added budget target tracking and budget progress indicators.
- Added a monthly cash flow chart and an expense category chart.
- Added a more complete transaction entry flow with metadata like date, category, source, and notes.
- Added an AI-style document intake area for pasted receipt or statement text.
- Added transaction parsing and auto-categorization heuristics for common categories.
- Added a review step before importing parsed transactions into the main ledger.
- Refreshed global styling for a more polished dashboard layout.
- Added a local PostCSS config so the project builds cleanly within this repo.

## 2026-04-21

### Product planning refinement

- Rewrote `FEATURES.md` into a more concrete MVP product spec based on clarified product decisions.
- Documented the target user, required AI import behavior, chatbot scope, saved data rules, recommended screens, and phase 2 boundaries.
- Narrowed the app direction around web-first budgeting with account-based persistence, statement import, and advice-only coaching chat.

### Authentication and persistence foundation

- Added a Supabase-based authentication flow with sign-in and account creation screens.
- Added a user-scoped planner data store so transactions and budgets can persist in a real database instead of browser-only storage.
- Added setup scaffolding including `.env.example`, a Supabase client, planner store helpers, and a SQL schema with row-level security policies.
- Updated the main app to load and save planner data per authenticated user and added sign-out plus save-status indicators to the dashboard header.

### Category budgets and recurring transaction controls

- Added saved custom category management so users can create and remove their own budgeting categories.
- Added category-level monthly budget controls with per-category health summaries and progress bars.
- Added recurring transaction support in the planner form, saved transaction model, dashboard metrics, and transaction table.
- Updated planner insights so category overages and recurring transaction counts show up in the budget guidance.

### UI system pass

- Refined the shared visual system across the hero, dashboard metrics, import panel, and transaction table.
- Improved hierarchy with stronger hero content, better metric card accents, and more product-like section framing.
- Tightened the import and transaction surfaces so they feel less like placeholders and more like a cohesive budgeting app.

### Import review workflow upgrade

- Reworked the AI import area into a real review queue with file uploads, editable extracted rows, approval toggles, and bulk approval.
- Added basic duplicate detection against saved transactions so likely duplicate imports are flagged before save.
- Improved the import pipeline so supported uploaded text and CSV files can be analyzed alongside pasted statement text.

### Free-first extraction and cost guardrails

- Added a browser-based extraction utility for text files, searchable PDFs, and image OCR so common imports can stay on the cheapest path.
- Added cost warning checkpoints for unsupported formats and scanned PDFs that would likely need a paid OCR or AI fallback.
- Updated the import experience so users can cancel those cost-triggering files and continue with the free-supported queue.

## Logging Rules

- Add a short dated entry whenever a meaningful code or product change is made.
- Keep entries focused on outcomes rather than low-level implementation noise.
- Record important verification notes when relevant.
