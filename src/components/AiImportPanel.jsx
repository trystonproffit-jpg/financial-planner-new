import { currencyFormatter } from "../lib/finance";

function AiImportPanel({
  approvedImportCount,
  categoryOptions,
  importState,
  importStatus,
  parsedTransactions,
  uploadedDocuments,
  onAnalyze,
  onApproveAll,
  onFilesSelected,
  onImport,
  onImportStateChange,
  onParsedTransactionApproval,
  onParsedTransactionChange,
  onRemoveDocument,
  onRemoveParsedTransaction,
}) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">AI receipt and statement intake</h2>
          <p className="panel-subtitle">
            Upload statement files or paste extracted text, review every line item, then import only the entries you approve.
          </p>
        </div>
      </div>

      <div className="import-panel-grid">
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
              The intake flow stays free first: text, CSV, searchable PDFs, and images are analyzed in-browser, and anything
              that would need a paid fallback gets stopped behind a warning before you continue.
            </p>
          </div>
        </div>

        <div className="import-workspace">
          <label className="upload-dropzone">
            <span className="field-label">Statement files</span>
            <div className="upload-dropzone-inner">
              <strong>Drop files here or click to choose</strong>
              <p>Free-supported: `.txt`, `.csv`, searchable `.pdf`, and common images. Scanned PDFs may trigger a cost warning.</p>
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
              <div className="empty-state">No files queued yet. You can still analyze pasted OCR text below.</div>
            )}
          </div>

          <label className="field">
            <span className="field-label">Scanned or pasted text</span>
            <textarea
              className="field-input min-h-44"
              value={importState.rawText}
              onChange={(event) => onImportStateChange("rawText", event.target.value)}
              placeholder="Paste OCR or statement lines here"
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
              <button type="button" className="secondary-button" onClick={onImport} disabled={!approvedImportCount}>
                Import approved items
              </button>
            </div>
          </div>
        </div>

        <div className="preview-stack">
          {parsedTransactions.length ? (
            parsedTransactions.map((entry) => (
              <div key={entry.id} className={`preview-card preview-card-editor ${entry.duplicate ? "duplicate" : ""}`}>
                <div className="preview-editor-header">
                  <div>
                    <div className="preview-title-row">
                      <strong>{entry.description}</strong>
                      <span className={`confidence-badge ${entry.type === "income" ? "income" : "expense"}`}>
                        {entry.type} | {Math.round(entry.confidence * 100)}% confidence
                      </span>
                      {entry.duplicate ? <span className="budget-health over">Duplicate match</span> : null}
                    </div>
                    <p className="preview-meta">
                      {entry.source} | {entry.date}
                    </p>
                    {entry.duplicateReason ? <p className="duplicate-note">{entry.duplicateReason}</p> : null}
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
              Upload statement text or files, then run analysis to generate an editable approval queue.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default AiImportPanel;
