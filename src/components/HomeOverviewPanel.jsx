import { Link } from "react-router-dom";
import { currencyFormatter, percentFormatter } from "../lib/finance";

function HomeOverviewPanel({ budgetTarget, financials }) {
  return (
    <article className="panel home-overview-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Quick tools</h2>
          <p className="panel-subtitle">Jump straight to the Ledgr workflow you need next.</p>
        </div>
      </div>

      <div className="home-overview-summary">
        <div>
          <span className="field-label">Budget target</span>
          <strong>{currencyFormatter(budgetTarget)}</strong>
        </div>
        <div>
          <span className="field-label">Budget used</span>
          <strong>{percentFormatter(financials.budgetUsed)}</strong>
        </div>
        <div>
          <span className="field-label">Cash flow</span>
          <strong>{financials.balance >= 0 ? "Positive" : "Needs attention"}</strong>
        </div>
      </div>

      <div className="home-quick-links">
        <Link className="home-quick-link" to="/import">
          <span className="field-label">Import & Add</span>
          <strong>Import statements, upload receipts, or add a transaction manually</strong>
        </Link>
        <Link className="home-quick-link" to="/transactions">
          <span className="field-label">Transactions</span>
          <strong>Open your full transaction history and search past entries</strong>
        </Link>
        <Link className="home-quick-link" to="/chat">
          <span className="field-label">Coach Chat</span>
          <strong>Ask for guidance based on your saved spending and income</strong>
        </Link>
      </div>
    </article>
  );
}

export default HomeOverviewPanel;
