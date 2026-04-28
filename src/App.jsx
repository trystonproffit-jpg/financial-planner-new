import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthScreen from "./components/AuthScreen";
import SupabaseSetupScreen from "./components/SupabaseSetupScreen";
import usePlannerApp from "./hooks/usePlannerApp";

const AppLayout = lazy(() => import("./components/AppLayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

function RouteLoading() {
  return (
    <div className="panel text-center">
      <h2 className="panel-title">Loading page</h2>
      <p className="panel-subtitle mt-3">Preparing this workspace view.</p>
    </div>
  );
}

function App() {
  const planner = usePlannerApp();

  if (!planner.isSupabaseConfigured) {
    return <SupabaseSetupScreen />;
  }

  if (planner.authLoading) {
    return (
      <div className="app-shell">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-8">
          <div className="panel text-center">
            <h1 className="panel-title">Loading account</h1>
            <p className="panel-subtitle mt-3">Connecting to authentication and your saved planner data.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!planner.session) {
    return <AuthScreen />;
  }

  if (planner.plannerLoading) {
    return (
      <div className="app-shell">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-8">
          <div className="panel text-center">
            <h1 className="panel-title">Loading planner</h1>
            <p className="panel-subtitle mt-3">Fetching your saved transactions and budget data.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8"><RouteLoading /></main>}>
        <Routes>
          <Route
            path="/"
            element={(
              <AppLayout
                darkMode={planner.darkMode}
                onSignOut={planner.handleSignOut}
                onToggleDarkMode={() => planner.setDarkMode((current) => !current)}
                plannerHealthTone={planner.plannerHealthTone}
                saveStatus={planner.saveStatus}
                userEmail={planner.session.user.email}
              />
            )}
          >
            <Route
              index
              element={(
                <HomePage
                  budgetTarget={planner.budgetTarget}
                  categoryBudgetSummaries={planner.categoryBudgetSummaries}
                  categoryBreakdown={planner.categoryBreakdown}
                  customCategories={planner.customCategories}
                  financials={planner.financials}
                  insights={planner.insights}
                  monthlyTrend={planner.monthlyTrend}
                  recentTransactions={planner.recentTransactions}
                  userEmail={planner.session.user.email}
                />
              )}
            />
            <Route
              path="import"
              element={(
                <ImportPage
                  activeImportSessionId={planner.activeImportSessionId}
                  approvedImportCount={planner.approvedImportCount}
                  categoryOptions={planner.categoryOptions}
                  editingId={planner.editingId}
                  formState={planner.formState}
                  importHistory={planner.importHistory}
                  importState={planner.importState}
                  importStatus={planner.importStatus}
                  onAnalyze={planner.runImportSimulation}
                  onApproveAll={planner.handleApproveAllParsedTransactions}
                  onFieldChange={planner.handleFieldChange}
                  onFilesSelected={planner.handleImportFiles}
                  onImport={planner.importParsedTransactions}
                  onImportStateChange={planner.handleImportStateChange}
                  onParsedTransactionApproval={planner.handleParsedTransactionApproval}
                  onParsedTransactionChange={planner.handleParsedTransactionChange}
                  onRemoveAllParsedTransactions={planner.handleRemoveAllParsedTransactions}
                  onRemoveDocument={planner.handleRemoveDocument}
                  onRemoveParsedTransaction={planner.removeParsedTransaction}
                  onResetForm={planner.resetForm}
                  onRestoreSession={planner.restoreImportSession}
                  onSubmit={planner.handleSubmit}
                  parsedTransactions={planner.parsedTransactions}
                  uploadedDocuments={planner.uploadedDocuments}
                />
              )}
            />
            <Route
              path="transactions"
              element={(
                <TransactionsPage
                  onDelete={planner.handleDelete}
                  onEdit={planner.handleEdit}
                  transactions={planner.recentTransactions}
                />
              )}
            />
            <Route
              path="chat"
              element={(
                <ChatPage
                  coachError={planner.coachError}
                  coachInput={planner.coachInput}
                  coachLoading={planner.coachLoading}
                  coachMessages={planner.coachMessages}
                  coachPromptOptions={planner.coachPromptOptions}
                  coachResponses={planner.coachResponses}
                  financials={planner.financials}
                  insights={planner.insights}
                  onCoachInputChange={planner.setCoachInput}
                  onSendCoachMessage={planner.sendCoachMessage}
                />
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>

      {planner.loadError ? <div className="floating-status-banner error">{planner.loadError}</div> : null}

      {planner.costWarning ? (
        <div className="modal-scrim" role="presentation">
          <div className="cost-warning-modal" role="dialog" aria-modal="true" aria-labelledby="cost-warning-title">
            <div className="cost-warning-header">
              <div>
                <p className="field-label">Cost check</p>
                <h2 id="cost-warning-title" className="panel-title">
                  This upload may require a paid fallback
                </h2>
              </div>
              <span className="budget-health watch">
                Est. {planner.costWarning.totalEstimateLabel}
              </span>
            </div>

            <p className="panel-subtitle">
              {planner.costWarning.phase === "selection"
                ? "Some selected files are outside the free extractor, so they were not queued for analysis."
                : planner.costWarning.phase === "history"
                  ? "This restored review includes files that previously triggered a paid-fallback warning."
                  : "Some queued files could not be read for free and would likely need a paid OCR or AI parser to continue."}
            </p>

            <div className="cost-warning-list">
              {planner.costWarning.items.map((item) => (
                <div key={`${item.fileName}-${item.reason}`} className="cost-warning-item">
                  <div>
                    <strong>{item.fileName}</strong>
                    <p className="preview-meta">{item.reason}</p>
                  </div>
                  <strong>{item.estimatedCostLabel}</strong>
                </div>
              ))}
            </div>

            <div className="cost-warning-actions">
              <button type="button" className="ghost-button" onClick={planner.closeCostWarning}>
                Keep free-only flow
              </button>
              <button type="button" className="secondary-button" onClick={planner.removeCostWarningFiles}>
                Cancel upload for these files
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </BrowserRouter>
  );
}

export default App;
