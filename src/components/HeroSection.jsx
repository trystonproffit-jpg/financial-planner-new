import { Link } from "react-router-dom";
import { currencyFormatter, percentFormatter } from "../lib/finance";
import LedgrMark from "./LedgrMark";

function HeroSection({ budgetTarget, financials, userEmail }) {
  return (
    <section className="hero-panel">
      <div className="hero-grid">
        <div className="max-w-3xl space-y-4">
          <LedgrMark className="hero-brand" />
          <div className="hero-kicker">Clearer money tracking, cleaner imports, and smarter next steps.</div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            A clearer way to track spending, income, and progress in one place.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Ledgr gives you a quick financial snapshot up front, then makes it easy to import activity, review history, and get guidance when you need it.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/import">Import activity</Link>
            <Link className="secondary-button" to="/transactions">View history</Link>
            <Link className="ghost-button" to="/chat">Ask Ledgr Coach</Link>
          </div>

          <div className="hero-points">
            <div className="hero-point">
              <span className="hero-point-label">Snapshot</span>
              <strong>See your income, expenses, balance, and budget progress at a glance</strong>
            </div>
            <div className="hero-point">
              <span className="hero-point-label">Import</span>
              <strong>Bring in statements and receipts, then review every result before saving</strong>
            </div>
            <div className="hero-point">
              <span className="hero-point-label">Coach</span>
              <strong>Get practical guidance grounded in your actual saved financial data</strong>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-control-card hero-status-card">
            <span className="field-label">This month's snapshot</span>
            <strong className="hero-status-value">{financials.balance >= 0 ? "On track" : "Needs review"}</strong>
            <p className="panel-subtitle mt-3">
              {financials.balance >= 0
                ? `${currencyFormatter(financials.balance)} remains after recorded expenses.`
                : `${currencyFormatter(financials.balance)} below break-even right now.`}
            </p>
            <div className="hero-status-grid">
              <div>
                <span className="field-label">Budget used</span>
                <strong>{percentFormatter(financials.budgetUsed)}</strong>
              </div>
              <div>
                <span className="field-label">Target</span>
                <strong>{currencyFormatter(budgetTarget)}</strong>
              </div>
            </div>
          </div>

          <div className="hero-control-card">
            <span className="field-label">Current account</span>
            <strong>{userEmail}</strong>
            <p className="panel-subtitle mt-3">
              Your Ledgr data stays connected to this account so it is ready whenever you sign in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
