import { currencyFormatter } from "../lib/finance";

function AiImportPanel({
  importState,
  parsedTransactions,
  onImportStateChange,
  onAnalyze,
  onImport,
  onRemoveParsedTransaction,
}) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">AI receipt and statement intake</h2>
          <p className="panel-subtitle">
            Paste OCR text from a receipt, PDF, bank statement, or email and preview extracted transactions before import.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <label className="field">
            <span className="field-label">Document type</span>
            <select
              className="field-input"
              value={importState.documentType}
              onChange={(event) => onImportStateChange("documentType", event.target.value)}
            >
              <option value="mixed">Mixed</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <div className="insight-box">
            <span className="field-label">How it works</span>
            <p>
              The parser looks for dates, amounts, merchant text, then applies category rules like grocery stores to
              <strong> Groceries</strong> and restaurants to <strong>Eating Out</strong>.
            </p>
          </div>
        </div>

        <label className="field">
          <span className="field-label">Scanned text</span>
          <textarea
            className="field-input min-h-44"
            value={importState.rawText}
            onChange={(event) => onImportStateChange("rawText", event.target.value)}
            placeholder="Paste OCR or statement lines here"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="primary-button" onClick={onAnalyze}>
            Analyze document
          </button>
          <button type="button" className="secondary-button" onClick={onImport} disabled={!parsedTransactions.length}>
            Import approved items
          </button>
        </div>

        <div className="preview-stack">
          {parsedTransactions.length ? (
            parsedTransactions.map((entry) => (
              <div key={entry.id} className="preview-card">
                <div>
                  <div className="preview-title-row">
                    <strong>{entry.description}</strong>
                    <span className={`confidence-badge ${entry.type === "income" ? "income" : "expense"}`}>
                      {entry.type} | {Math.round(entry.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="preview-meta">
                    {entry.category} | {entry.date} | {entry.source}
                  </p>
                </div>
                <div className="preview-actions">
                  <strong>{currencyFormatter(entry.amount)}</strong>
                  <button type="button" className="ghost-button" onClick={() => onRemoveParsedTransaction(entry.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              Run analysis to generate extracted transactions for review.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default AiImportPanel;
