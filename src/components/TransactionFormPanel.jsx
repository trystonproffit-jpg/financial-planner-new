function TransactionFormPanel({
  categoryOptions,
  editingId,
  formState,
  onFieldChange,
  onResetForm,
  onSubmit,
}) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Manual transaction entry</h2>
          <p className="panel-subtitle">Add a transaction yourself or update one before saving it to your history.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2">
          <span className="field-label">Description</span>
          <input
            className="field-input"
            value={formState.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            placeholder="Trader Joe's, payroll, insurance, client invoice"
          />
        </label>

        <label className="field">
          <span className="field-label">Amount</span>
          <input
            className="field-input"
            type="number"
            step="0.01"
            min="0"
            value={formState.amount}
            onChange={(event) => onFieldChange("amount", event.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="field">
          <span className="field-label">Date</span>
          <input
            className="field-input"
            type="date"
            value={formState.date}
            onChange={(event) => onFieldChange("date", event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Type</span>
          <select
            className="field-input"
            value={formState.type}
            onChange={(event) => {
              const nextType = event.target.value;
              onFieldChange("type", nextType);
              onFieldChange("category", nextType === "income" ? "Salary" : "Other");
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Category</span>
          <select
            className="field-input"
            value={formState.category}
            onChange={(event) => onFieldChange("category", event.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Source</span>
          <input
            className="field-input"
            value={formState.source}
            onChange={(event) => onFieldChange("source", event.target.value)}
            placeholder="Checking account, card name, employer"
          />
        </label>

        <label className="field">
          <span className="field-label">Notes</span>
          <input
            className="field-input"
            value={formState.notes}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            placeholder="Optional context"
          />
        </label>

        <label className="field sm:col-span-2">
          <span className="checkbox-row">
            <input
              type="checkbox"
              checked={formState.isRecurring}
              onChange={(event) => onFieldChange("isRecurring", event.target.checked)}
            />
            <span>Mark as recurring transaction</span>
          </span>
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button type="submit" className="primary-button">
            {editingId ? "Update transaction" : "Add transaction"}
          </button>
          {editingId ? (
            <button type="button" className="secondary-button" onClick={onResetForm}>
              Cancel editing
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}

export default TransactionFormPanel;
