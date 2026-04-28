import AiImportPanel from "../components/AiImportPanel";
import TransactionFormPanel from "../components/TransactionFormPanel";

function ImportPage({
  activeImportSessionId,
  approvedImportCount,
  categoryOptions,
  importHistory,
  importState,
  importStatus,
  parsedTransactions,
  uploadedDocuments,
  editingId,
  formState,
  onAnalyze,
  onApproveAll,
  onFieldChange,
  onFilesSelected,
  onImport,
  onImportStateChange,
  onParsedTransactionApproval,
  onParsedTransactionChange,
  onRemoveAllParsedTransactions,
  onRemoveDocument,
  onRemoveParsedTransaction,
  onResetForm,
  onRestoreSession,
  onSubmit,
}) {
  return (
    <>
      <section className="page-intro">
        <span className="eyebrow">Import & Add</span>
        <h2 className="page-title">Bring in new activity, review it, and save only what looks right.</h2>
        <p className="page-copy">
          Add transactions by hand or import them from statements and images, then review everything before it is saved.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <TransactionFormPanel
          categoryOptions={categoryOptions}
          editingId={editingId}
          formState={formState}
          onFieldChange={onFieldChange}
          onResetForm={onResetForm}
          onSubmit={onSubmit}
        />

        <AiImportPanel
          activeImportSessionId={activeImportSessionId}
          approvedImportCount={approvedImportCount}
          categoryOptions={categoryOptions}
          importHistory={importHistory}
          importState={importState}
          importStatus={importStatus}
          parsedTransactions={parsedTransactions}
          uploadedDocuments={uploadedDocuments}
          onAnalyze={onAnalyze}
          onApproveAll={onApproveAll}
          onFilesSelected={onFilesSelected}
          onImport={onImport}
          onImportStateChange={onImportStateChange}
          onParsedTransactionApproval={onParsedTransactionApproval}
          onParsedTransactionChange={onParsedTransactionChange}
          onRemoveAllParsedTransactions={onRemoveAllParsedTransactions}
          onRemoveDocument={onRemoveDocument}
          onRemoveParsedTransaction={onRemoveParsedTransaction}
          onRestoreSession={onRestoreSession}
        />
      </section>
    </>
  );
}

export default ImportPage;
