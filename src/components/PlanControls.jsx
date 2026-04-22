import { useState } from "react";
import { currencyFormatter, percentFormatter } from "../lib/finance";

function PlanControls({
  budgetTarget,
  categoryBudgetSummaries,
  categoryBudgets,
  categoryOptions,
  customCategories,
  financials,
  formState,
  editingId,
  onAddCustomCategory,
  onCategoryBudgetChange,
  onFieldChange,
  onRemoveCustomCategory,
  onSetBudgetTarget,
  onSubmit,
  onResetForm,
}) {
  const [newCategoryName, setNewCategoryName] = useState("");

  function handleAddCategory(event) {
    event.preventDefault();
    const normalized = newCategoryName.trim();
    if (!normalized) {
      return;
    }

    onAddCustomCategory(normalized);
    setNewCategoryName("");
  }

  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Plan controls</h2>
          <p className="panel-subtitle">Adjust targets, manage categories, and add transactions without leaving the dashboard.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span className="field-label">Expense target</span>
          <input
            className="field-input"
            type="number"
            min="0"
            value={budgetTarget}
            onChange={(event) => onSetBudgetTarget(Number(event.target.value))}
          />
        </label>
        <div className="insight-box">
          <span className="field-label">Budget progress</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(financials.budgetUsed, 100)}%` }} />
          </div>
          <strong>{percentFormatter(financials.budgetUsed)}</strong>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
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

      <div className="section-divider" />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="grid gap-4">
          <div>
            <h3 className="panel-title">Custom categories</h3>
            <p className="panel-subtitle">Create your own spending buckets and reuse them across imports and manual entries.</p>
          </div>

          <form className="flex flex-wrap gap-3" onSubmit={handleAddCategory}>
            <input
              className="field-input flex-1"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Coffee, Pets, Childcare"
            />
            <button type="submit" className="primary-button">
              Add category
            </button>
          </form>

          <div className="chip-wrap">
            {customCategories.length ? (
              customCategories.map((category) => (
                <div key={category} className="category-chip">
                  <span>{category}</span>
                  <button type="button" className="chip-delete" onClick={() => onRemoveCustomCategory(category)}>
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">Custom categories you add here will show up in transaction forms and budgets.</div>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <div>
            <h3 className="panel-title">Category budgets</h3>
            <p className="panel-subtitle">Set optional monthly limits for the categories you care about most.</p>
          </div>

          <div className="budget-summary-list">
            {categoryBudgetSummaries.length ? (
              categoryBudgetSummaries.map((summary) => (
                <div key={summary.category} className="budget-summary-card">
                  <div className="budget-summary-header">
                    <strong>{summary.category}</strong>
                    <span className={`budget-health ${summary.status}`}>{summary.statusLabel}</span>
                  </div>

                  <label className="field">
                    <span className="field-label">Monthly limit</span>
                    <input
                      className="field-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={categoryBudgets[summary.category] ?? ""}
                      onChange={(event) => onCategoryBudgetChange(summary.category, event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <div className="budget-summary-meta">
                    <span>Spent {currencyFormatter(summary.spent)}</span>
                    <span>Budget {summary.limit ? currencyFormatter(summary.limit) : "Not set"}</span>
                  </div>

                  {summary.limit ? (
                    <div className="progress-track compact">
                      <div className="progress-fill" style={{ width: `${Math.min(summary.percentUsed, 100)}%` }} />
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty-state">Expense categories will show up here once you start adding or importing transactions.</div>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

export default PlanControls;
