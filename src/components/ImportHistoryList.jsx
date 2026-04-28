import { currencyFormatter } from "../lib/finance";

function formatSessionDate(value) {
  if (!value) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function summarizeSourceFiles(files) {
  if (!files.length) {
    return "Pasted text only";
  }

  return files.map((file) => file.name).join(", ");
}

function ImportHistoryList({ sessions, onRestoreSession }) {
  if (!sessions.length) {
    return (
      <div className="empty-state">
        Your import history will appear here after you analyze or import a statement.
      </div>
    );
  }

  return (
    <div className="history-list">
      {sessions.map((session) => (
        <div key={session.id} className="history-card">
          <div className="history-card-header">
            <div>
              <div className="preview-title-row">
                <strong>{session.importedCount ? "Imported session" : "Review session"}</strong>
                <span className={`budget-health ${session.importedCount ? "healthy" : "watch"}`}>
                  {session.status}
                </span>
              </div>
              <p className="preview-meta">{formatSessionDate(session.updatedAt || session.createdAt)}</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => onRestoreSession(session)}>
              Reopen review
            </button>
          </div>

          <p className="history-card-files">{summarizeSourceFiles(session.sourceFiles)}</p>

          <div className="history-metrics">
            <div className="history-metric">
              <span className="field-label">Items</span>
              <strong>{session.totalCount}</strong>
            </div>
            <div className="history-metric">
              <span className="field-label">Approved</span>
              <strong>{session.approvedCount}</strong>
            </div>
            <div className="history-metric">
              <span className="field-label">Imported</span>
              <strong>{session.importedCount}</strong>
            </div>
            <div className="history-metric">
              <span className="field-label">Skipped</span>
              <strong>{session.skippedCount}</strong>
            </div>
            <div className="history-metric">
              <span className="field-label">Duplicates</span>
              <strong>{session.duplicateCount}</strong>
            </div>
          </div>

          {session.parsedItems.length ? (
            <div className="history-sample-list">
              {session.parsedItems.slice(0, 3).map((item) => (
                <div key={item.id} className="history-sample-row">
                  <span>{item.description}</span>
                  <strong>{currencyFormatter(item.amount)}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default ImportHistoryList;
