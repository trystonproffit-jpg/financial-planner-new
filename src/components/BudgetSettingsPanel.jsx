import { useState } from "react";
import { currencyFormatter, percentFormatter } from "../lib/finance";

function BudgetSettingsPanel({
  budgetTarget,
  categoryBudgetSummaries,
  categoryBudgets,
  customCategories,
  financials,
  onAddCustomCategory,
  onCategoryBudgetChange,
  onRemoveCustomCategory,
  onSetBudgetTarget,
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
          <h2 className="panel-title">Budget settings</h2>
          <p className="panel-subtitle">Set your main target, tune category limits, and manage the custom labels your planner uses.</p>
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

      <div className="section-divider" />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="grid gap-4">
          <div>
            <h3 className="panel-title">Custom categories</h3>
            <p className="panel-subtitle">Create the spending buckets that make sense for how this user budgets in real life.</p>
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
              <div className="empty-state">Custom categories you add here will show up in manual entry, imports, and budgets.</div>
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

export default BudgetSettingsPanel;
