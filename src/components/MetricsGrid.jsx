import { currencyFormatter, percentFormatter } from "../lib/finance";

function MetricsGrid({ financials }) {
  return (
    <section className="stats-grid">
      <article className="metric-card">
        <span className="metric-label">Income</span>
        <strong className="metric-value text-emerald-500">{currencyFormatter(financials.income)}</strong>
        <p className="metric-helper">All recorded inflows across salary, freelance, and deposits.</p>
      </article>
      <article className="metric-card">
        <span className="metric-label">Expenses</span>
        <strong className="metric-value text-rose-500">{currencyFormatter(financials.expenses)}</strong>
        <p className="metric-helper">{percentFormatter(financials.budgetUsed)} of your target budget used.</p>
      </article>
      <article className="metric-card">
        <span className="metric-label">Net balance</span>
        <strong className={`metric-value ${financials.balance >= 0 ? "text-sky-500" : "text-amber-500"}`}>
          {currencyFormatter(financials.balance)}
        </strong>
        <p className="metric-helper">A quick read on whether this period is cash-flow positive.</p>
      </article>
      <article className="metric-card">
        <span className="metric-label">Savings rate</span>
        <strong className="metric-value text-violet-500">{percentFormatter(financials.savingsRate)}</strong>
        <p className="metric-helper">Balance divided by income for the current data set.</p>
      </article>
    </section>
  );
}

export default MetricsGrid;
