function HeroSection({ darkMode, onToggleDarkMode, plannerHealthTone }) {
  return (
    <section className="hero-panel">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <span className="eyebrow">Financial planning workspace</span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Track cash flow, surface spending trends, and review AI-scanned documents in one place.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            This version focuses on ease of use: fast manual entry, visual planning tools, and an AI intake panel
            that turns pasted receipt or bank statement text into categorized transactions you can approve.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onToggleDarkMode} className="secondary-button">
            {darkMode ? "Switch to light mode" : "Switch to dark mode"}
          </button>
          <div className={`health-pill health-pill-${plannerHealthTone}`}>
            {plannerHealthTone === "on-track" && "Planner health: On track"}
            {plannerHealthTone === "watchlist" && "Planner health: Watch expenses"}
            {plannerHealthTone === "needs-attention" && "Planner health: Balance is negative"}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
