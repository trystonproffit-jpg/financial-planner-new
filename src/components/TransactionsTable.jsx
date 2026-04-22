import { currencyFormatter } from "../lib/finance";

function TransactionsTable({ transactions, onEdit, onDelete }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Transaction grid</h2>
          <p className="panel-subtitle">Review, edit, or delete entries from one sortable-style list.</p>
        </div>
        <div className="table-header-stat">
          <span className="field-label">Rows</span>
          <strong>{transactions.length}</strong>
        </div>
      </div>

      <div className="transaction-table-wrap">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Category</th>
              <th>Source</th>
              <th>Recurring</th>
              <th>Type</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {transactions.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <div className="transaction-primary text-slate-900 dark:text-white">{entry.description}</div>
                  {entry.notes ? <div className="table-note">{entry.notes}</div> : null}
                </td>
                <td className="table-emphasis">{entry.date}</td>
                <td>
                  <span className="table-pill">{entry.category}</span>
                </td>
                <td className="table-soft">{entry.source}</td>
                <td>
                  <span className={`table-pill ${entry.isRecurring ? "table-pill-recurring" : "table-pill-neutral"}`}>
                    {entry.isRecurring ? "Recurring" : "One-time"}
                  </span>
                </td>
                <td>
                  <span className={`confidence-badge ${entry.type === "income" ? "income" : "expense"}`}>
                    {entry.type}
                  </span>
                </td>
                <td className={entry.type === "income" ? "text-emerald-500" : "text-rose-500"}>
                  {currencyFormatter(entry.amount)}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button type="button" className="ghost-button" onClick={() => onEdit(entry)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => onDelete(entry.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default TransactionsTable;
