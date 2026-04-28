import { currencyFormatter, percentFormatter } from "../lib/finance";

function MetricsGrid({ financials }) {
  return (
    <section className="stats-grid">
      <article className="metric-card metric-card-income">
        <span className="metric-label">Income</span>
        <strong className="metric-value text-emerald-500">{currencyFormatter(financials.income)}</strong>
        <p className="metric-helper">All recorded inflows across paychecks, freelance work, and other deposits.</p>
      </article>
      <article className="metric-card metric-card-expense">
        <span className="metric-label">Expenses</span>
        <strong className="metric-value text-rose-500">{currencyFormatter(financials.expenses)}</strong>
        <p className="metric-helper">{percentFormatter(financials.budgetUsed)} of your current target budget has been used.</p>
      </article>
      <article className="metric-card metric-card-balance">
        <span className="metric-label">Net balance</span>
        <strong className={`metric-value ${financials.balance >= 0 ? "text-sky-500" : "text-amber-500"}`}>
          {currencyFormatter(financials.balance)}
        </strong>
        <p className="metric-helper">A quick read on whether this period is running positive or negative.</p>
      </article>
      <article className="metric-card metric-card-rate">
        <span className="metric-label">Savings rate</span>
        <strong className="metric-value text-violet-500">{percentFormatter(financials.savingsRate)}</strong>
        <p className="metric-helper">How much of your recorded income is left after expenses.</p>
      </article>
    </section>
  );
}

export default MetricsGrid;
