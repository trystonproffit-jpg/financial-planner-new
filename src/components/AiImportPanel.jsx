import { currencyFormatter } from "../lib/finance";
import ImportHistoryList from "./ImportHistoryList";

function AiImportPanel({
  activeImportSessionId,
  approvedImportCount,
  categoryOptions,
  importHistory,
  importState,
  importStatus,
  parsedTransactions,
  uploadedDocuments,
  onAnalyze,
  onApproveAll,
  onFilesSelected,
  onImport,
  onImportStateChange,
  onRemoveAllParsedTransactions,
  onParsedTransactionApproval,
  onParsedTransactionChange,
  onRemoveDocument,
  onRemoveParsedTransaction,
  onRestoreSession,
}) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">AI receipt and statement intake</h2>
          <p className="panel-subtitle">
            Upload a statement or receipt, review the results, and save only the transactions you want to keep.
          </p>
        </div>
      </div>

      <div className="import-panel-grid">
        <div className="grid gap-4 md:grid-cols-[180px_180px_1fr]">
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

          <label className="field">
            <span className="field-label">Statement source</span>
            <select
              className="field-input"
              value={importState.statementSource}
              onChange={(event) => onImportStateChange("statementSource", event.target.value)}
            >
              <option value="auto">Auto-detect</option>
              <option value="bank-statement">Bank statement</option>
              <option value="credit-card">Credit card statement</option>
              <option value="generic">Generic text</option>
            </select>
          </label>

          <div className="insight-box">
            <span className="field-label">How it works</span>
            <p>
              Most files can be analyzed directly in your browser. Auto-detect works for most uploads, and you can choose a statement
              type yourself if the results need a little help.
            </p>
          </div>
        </div>

        <div className="import-workspace">
          <label className="upload-dropzone">
            <span className="field-label">Statement files</span>
            <div className="upload-dropzone-inner">
              <strong>Drop files here or click to choose</strong>
              <p>Supported for free: `.txt`, `.csv`, searchable `.pdf`, and common image files. Scanned PDFs may show a cost warning.</p>
            </div>
            <input
              className="sr-only"
              type="file"
              multiple
              accept=".txt,.csv,.pdf,image/*"
              onChange={(event) => onFilesSelected(event.target.files)}
            />
          </label>

          <div className="document-list">
            {uploadedDocuments.length ? (
              uploadedDocuments.map((document) => (
                <div key={document.id} className="document-card">
                  <div>
                    <strong>{document.name}</strong>
                    <p className="preview-meta">
                      {document.type} | {document.sizeLabel}
                    </p>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => onRemoveDocument(document.id)}>
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">No files added yet. You can still paste text below and analyze it.</div>
            )}
          </div>

          <label className="field">
            <span className="field-label">Scanned or pasted text</span>
            <textarea
              className="field-input min-h-44"
              value={importState.rawText}
              onChange={(event) => onImportStateChange("rawText", event.target.value)}
              placeholder="Paste statement text or OCR results here"
            />
          </label>

          {importStatus.message ? (
            <div className={`status-banner ${importStatus.type}`}>
              {importStatus.message}
            </div>
          ) : null}

          <div className="import-toolbar">
            <div className="import-summary-badge">
              <span className="field-label">Review queue</span>
              <strong>{parsedTransactions.length} items ready</strong>
              <p>{approvedImportCount} approved for import</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="primary-button" onClick={onAnalyze}>
                Analyze sources
              </button>
              <button type="button" className="secondary-button" onClick={onApproveAll} disabled={!parsedTransactions.length}>
                Approve all
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={onRemoveAllParsedTransactions}
                disabled={!parsedTransactions.length}
              >
                Remove all
              </button>
              <button type="button" className="secondary-button" onClick={onImport} disabled={!approvedImportCount}>
                Import approved items
              </button>
            </div>
          </div>
        </div>

        <div className="preview-stack">
          {parsedTransactions.length ? (
            parsedTransactions.map((entry) => (
              <div
                key={entry.id}
                className={`preview-card preview-card-editor ${entry.duplicate ? "duplicate" : ""} ${entry.confidence < 0.7 ? "low-confidence" : ""}`}
              >
                <div className="preview-editor-header">
                  <div>
                    <div className="preview-title-row">
                      <strong>{entry.description}</strong>
                      <span className={`confidence-badge ${entry.type === "income" ? "income" : "expense"}`}>
                        {entry.type} | {Math.round(entry.confidence * 100)}% confidence
                      </span>
                      {entry.duplicate ? <span className="budget-health over">Duplicate match</span> : null}
                      {entry.confidence < 0.7 ? <span className="budget-health watch">Needs review</span> : null}
                    </div>
                    <p className="preview-meta">
                      {entry.source} | {entry.date}
                    </p>
                    {entry.duplicateReason ? <p className="duplicate-note">{entry.duplicateReason}</p> : null}
                    {entry.confidence < 0.7 ? (
                      <p className="confidence-note">This line looks incomplete or ambiguous. Review the description, date, and amount before importing.</p>
                    ) : null}
                  </div>

                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={entry.approved}
                      onChange={(event) => onParsedTransactionApproval(entry.id, event.target.checked)}
                    />
                    <span>Approve</span>
                  </label>
                </div>

                <div className="preview-editor-grid">
                  <label className="field">
                    <span className="field-label">Description</span>
                    <input
                      className="field-input"
                      value={entry.description}
                      onChange={(event) => onParsedTransactionChange(entry.id, "description", event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Amount</span>
                    <input
                      className="field-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.amount}
                      onChange={(event) => onParsedTransactionChange(entry.id, "amount", event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Date</span>
                    <input
                      className="field-input"
                      type="date"
                      value={entry.date}
                      onChange={(event) => onParsedTransactionChange(entry.id, "date", event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Type</span>
                    <select
                      className="field-input"
                      value={entry.type}
                      onChange={(event) => onParsedTransactionChange(entry.id, "type", event.target.value)}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Category</span>
                    <select
                      className="field-input"
                      value={entry.category}
                      onChange={(event) => onParsedTransactionChange(entry.id, "category", event.target.value)}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Recurring</span>
                    <select
                      className="field-input"
                      value={entry.isRecurring ? "yes" : "no"}
                      onChange={(event) => onParsedTransactionChange(entry.id, "isRecurring", event.target.value === "yes")}
                    >
                      <option value="no">One-time</option>
                      <option value="yes">Recurring</option>
                    </select>
                  </label>
                </div>

                <div className="preview-actions-row">
                  <strong>{currencyFormatter(entry.amount)}</strong>
                  <button type="button" className="ghost-button" onClick={() => onRemoveParsedTransaction(entry.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              Add files or paste text, then run analysis to build a review list you can edit before saving.
            </div>
          )}
        </div>

        <div className="import-history-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Recent import sessions</h3>
              <p className="panel-subtitle">
                Reopen an earlier review to see what was approved, skipped, or imported.
                {activeImportSessionId ? " This review is already saved to your history." : ""}
              </p>
            </div>
          </div>

          <ImportHistoryList sessions={importHistory} onRestoreSession={onRestoreSession} />
        </div>
      </div>
    </article>
  );
}

export default AiImportPanel;
