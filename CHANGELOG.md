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

## Logging Rules

- Add a short dated entry whenever a meaningful code or product change is made.
- Keep entries focused on outcomes rather than low-level implementation noise.
- Record important verification notes when relevant.
