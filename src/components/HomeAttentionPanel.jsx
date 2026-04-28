import { currencyFormatter } from "../lib/finance";

function buildAttentionItems({ categoryBudgetSummaries, financials, recentTransactions }) {
  const overBudget = categoryBudgetSummaries.find((summary) => summary.status === "over");
  const watchBudget = categoryBudgetSummaries.find((summary) => summary.status === "watch");
  const largestRecurring = recentTransactions
    .filter((entry) => entry.isRecurring && entry.type === "expense")
    .sort((left, right) => right.amount - left.amount)[0];
  const latestIncome = recentTransactions.find((entry) => entry.type === "income");

  return [
    overBudget
      ? {
          title: `${overBudget.category} is over budget`,
          body: `${currencyFormatter(overBudget.spent - overBudget.limit)} over the monthly limit.`,
          tone: "alert",
        }
      : null,
    watchBudget
      ? {
          title: `${watchBudget.category} is getting close`,
          body: `${Math.round(watchBudget.percentUsed)}% of its monthly budget has already been used.`,
          tone: "watch",
        }
      : null,
    largestRecurring
      ? {
          title: "Recurring costs deserve a quick check",
          body: `${largestRecurring.description} is your largest recurring expense at ${currencyFormatter(largestRecurring.amount)}.`,
          tone: "neutral",
        }
      : null,
    latestIncome
      ? {
          title: "Latest income saved",
          body: `${latestIncome.description} was recorded for ${currencyFormatter(latestIncome.amount)}.`,
          tone: "positive",
        }
      : {
          title: "No income recorded yet",
          body: "Add or import income so Ledgr can give better cash-flow guidance.",
          tone: "watch",
        },
    financials.balance < 0
      ? {
          title: "Cash flow needs attention",
          body: `You are currently at ${currencyFormatter(financials.balance)} for the period.`,
          tone: "alert",
        }
      : {
          title: "Cash flow is positive",
          body: `${currencyFormatter(financials.balance)} remains available after recorded expenses.`,
          tone: "positive",
        },
  ].filter(Boolean).slice(0, 4);
}

function HomeAttentionPanel({ categoryBudgetSummaries, financials, recentTransactions }) {
  const attentionItems = buildAttentionItems({
    categoryBudgetSummaries,
    financials,
    recentTransactions,
  });

  return (
    <article className="panel home-attention-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">What needs attention</h2>
          <p className="panel-subtitle">A quick look at the items that are worth checking first.</p>
        </div>
        <span className={`health-pill ${financials.balance >= 0 ? "healthy" : "over"}`}>
          {financials.balance >= 0 ? "Stable" : "Review now"}
        </span>
      </div>

      <div className="home-attention-list">
        {attentionItems.map((item) => (
          <div key={item.title} className={`home-attention-card ${item.tone}`}>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default HomeAttentionPanel;
