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

### Import history and audit trail

- Added persistent import session storage so analyses and import reviews can be reopened later instead of disappearing after one pass.
- Added recent import history cards in the AI intake area to show source files, counts, duplicates, and whether a session was imported or only reviewed.
- Updated the import workflow so review edits and final imports sync back into the saved session history for a more trustworthy audit trail.

### Multi-page app structure and code cleanup

- Split the single crowded dashboard into dedicated Home, Import, Transactions, and Coach Chat pages using client-side routing.
- Moved the planner state and workflow logic into a reusable hook so `App.jsx` now acts more like a route shell than a giant controller file.
- Broke the older all-in-one controls panel into focused budget and manual-entry components so each page can stay clearer and easier to maintain.

### Bundle cleanup and live coach chat foundation

- Lazy-loaded the PDF and OCR runtimes so the heavy import tooling only downloads when the user actually analyzes documents.
- Added a real planner chat request flow from the Coach page, using current saved planner data as context for each answer.
- Added a Supabase Edge Function scaffold for secure OpenAI Responses API calls so the browser does not expose an API key.

### Free chat provider switch

- Switched the planner chat function from an OpenAI-specific backend path to OpenRouter so the coach page can use a free model route.
- Updated the local setup example to use `OPENROUTER_API_KEY` and `OPENROUTER_MODEL=openrouter/free` for zero-cost MVP chat testing.

## 2026-04-22

### OCR and import parsing reliability pass

- Added browser-side image preprocessing before OCR so uploaded photos and screenshots get cleaner contrast and more readable text extraction.
- Reworked statement-line parsing to filter common statement noise, normalize more date formats, and score imported rows with more realistic confidence values.
- Updated the import review queue to visually flag low-confidence rows so users can spot and correct questionable extractions faster before saving.

### Statement-specific import modes

- Added import-source modes for auto-detect, bank statements, credit card statements, and generic text so users can nudge the parser when OCR output is messy.
- Split the import parser into statement-aware strategies so bank-style balance columns and credit-card-style transaction lines are handled more intentionally before falling back to generic parsing.

### Broader bank-statement format support

- Expanded import parsing to recognize ISO-style statement dates like `2003-10-14` in addition to month-first formats.
- Improved bank-statement auto-detection to catch labels like `chequing`, `withdrawals`, `deposits`, and `balance`, which helps OCR-clean statements avoid falling through to zero parsed rows.

### Dense OCR statement recovery

- Added OCR text normalization for common punctuation and dash variants so dates and amounts survive parsing more reliably after image extraction.
- Added a fallback that reconstructs candidate transaction rows from repeated date anchors when OCR collapses statement tables into a few long lines instead of preserving row breaks.

### Import review bulk clear

- Added a `Remove all` action to the import review toolbar so a mistaken analysis can be cleared in one click instead of deleting parsed rows individually.

### User-facing copy cleanup

- Rewrote page and panel descriptions across home, imports, transactions, and coaching so the app speaks directly to end users instead of sounding like internal product notes.

### Brand rename to Ledgr

- Updated the main visible app branding to `Ledgr` across the browser title, workspace header, home hero, sign-in screen, and setup screen.

### Ledgr dashboard and brand polish

- Redesigned the homepage around a stronger Ledgr product dashboard with a branded hero, clearer status snapshot, attention-first insights, one featured cash-flow chart, and faster quick-action paths.
- Added a reusable Ledgr mark plus a matching favicon so the app identity feels more intentional across the shell, hero, and browser tab.
- Shifted the visual palette toward a cleaner modern-fintech look with deeper ink and emerald accents to better match the Ledgr brand direction.

## Logging Rules

- Add a short dated entry whenever a meaningful code or product change is made.
- Keep entries focused on outcomes rather than low-level implementation noise.
- Record important verification notes when relevant.
