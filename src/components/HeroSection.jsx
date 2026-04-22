function HeroSection({ darkMode, onToggleDarkMode, onSignOut, plannerHealthTone, saveStatus, userEmail }) {
  return (
    <section className="hero-panel">
      <div className="hero-grid">
        <div className="max-w-3xl space-y-4">
          <span className="eyebrow">Financial planning workspace</span>
          <div className="hero-kicker">Budget clarity with saved accounts, smart imports, and practical coaching.</div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Track cash flow, surface spending trends, and review AI-scanned documents in one place.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            This version focuses on ease of use: fast manual entry, visual planning tools, and an AI intake panel
            that turns pasted receipt or bank statement text into categorized transactions you can approve.
          </p>

          <div className="hero-points">
            <div className="hero-point">
              <span className="hero-point-label">Track</span>
              <strong>Income, expenses, and recurring activity in one view</strong>
            </div>
            <div className="hero-point">
              <span className="hero-point-label">Review</span>
              <strong>Approve AI-imported transactions before anything gets saved</strong>
            </div>
            <div className="hero-point">
              <span className="hero-point-label">Improve</span>
              <strong>Use coaching-style insights to refine monthly budgets over time</strong>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-account-block">
            <div className="account-chip">
              <span>{userEmail}</span>
              <span className={`save-indicator ${saveStatus}`}>{saveStatus === "saving" ? "Saving" : saveStatus === "error" ? "Save issue" : "Synced"}</span>
            </div>
            <div className={`health-pill health-pill-${plannerHealthTone}`}>
              {plannerHealthTone === "on-track" && "Planner health: On track"}
              {plannerHealthTone === "watchlist" && "Planner health: Watch expenses"}
              {plannerHealthTone === "needs-attention" && "Planner health: Balance is negative"}
            </div>
          </div>

          <div className="hero-control-card">
            <span className="field-label">Workspace controls</span>
            <div className="hero-actions">
              <button type="button" onClick={onToggleDarkMode} className="secondary-button">
                {darkMode ? "Switch to light mode" : "Switch to dark mode"}
              </button>
              <button type="button" onClick={onSignOut} className="ghost-button">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
