import MonthlyCashFlowChart from "./MonthlyCashFlowChart";
import { currencyFormatter, percentFormatter } from "../lib/finance";

function HomeChartPanel({ budgetTarget, categoryBreakdown, financials, monthlyTrend }) {
  const topCategory = categoryBreakdown[0];

  return (
    <section className="home-chart-layout">
      <MonthlyCashFlowChart monthlyTrend={monthlyTrend} />

      <article className="panel home-chart-side-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Spending spotlight</h2>
            <p className="panel-subtitle">A few quick signals to help you interpret the trend.</p>
          </div>
        </div>

        <div className="home-chart-side-list">
          <div className="home-chart-side-card">
            <span className="field-label">Top expense category</span>
            <strong>{topCategory ? topCategory.name : "No expenses yet"}</strong>
            <p>{topCategory ? currencyFormatter(topCategory.value) : "Add transactions to see category patterns."}</p>
          </div>

          <div className="home-chart-side-card">
            <span className="field-label">Budget usage</span>
            <strong>{percentFormatter(financials.budgetUsed)}</strong>
            <p>{budgetTarget ? `Tracking against a ${currencyFormatter(budgetTarget)} target.` : "Set a budget target to track monthly pacing."}</p>
          </div>

          <div className="home-chart-side-card">
            <span className="field-label">Recurring items</span>
            <strong>{financials.recurringCount}</strong>
            <p>{financials.recurringCount ? "Recurring transactions are included in your planning snapshot." : "Mark recurring items to improve planning accuracy."}</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default HomeChartPanel;
