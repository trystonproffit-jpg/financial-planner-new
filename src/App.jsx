import React, { useEffect, useMemo, useRef, useState } from "react";
import AiImportPanel from "./components/AiImportPanel";
import AuthScreen from "./components/AuthScreen";
import ExpenseMixChart from "./components/ExpenseMixChart";
import HeroSection from "./components/HeroSection";
import InsightsPanel from "./components/InsightsPanel";
import MetricsGrid from "./components/MetricsGrid";
import MonthlyCashFlowChart from "./components/MonthlyCashFlowChart";
import PlanControls from "./components/PlanControls";
import SupabaseSetupScreen from "./components/SupabaseSetupScreen";
import TransactionsTable from "./components/TransactionsTable";
import {
  extractDocumentText,
  inspectFileForFreeImport,
  summarizeCostWarning,
} from "./lib/documentExtraction";
import {
  buildTransaction,
  CATEGORY_COLORS,
  createImportReviewItems,
  currencyFormatter,
  DEFAULT_CATEGORIES,
  defaultFormState,
  defaultImportState,
  MONTH_LABELS,
  parseImportedText,
} from "./lib/finance";
import { DEFAULT_PLANNER_STATE, loadPlannerState, savePlannerState } from "./lib/plannerStore";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [plannerLoading, setPlannerLoading] = useState(true);
  const [transactions, setTransactions] = useState(DEFAULT_PLANNER_STATE.transactions);
  const [budgetTarget, setBudgetTarget] = useState(DEFAULT_PLANNER_STATE.budgetTarget);
  const [customCategories, setCustomCategories] = useState(DEFAULT_PLANNER_STATE.customCategories);
  const [categoryBudgets, setCategoryBudgets] = useState(DEFAULT_PLANNER_STATE.categoryBudgets);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [importState, setImportState] = useState(defaultImportState);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [costWarning, setCostWarning] = useState(null);
  const [importStatus, setImportStatus] = useState({
    type: "idle",
    message: "",
  });
  const [saveStatus, setSaveStatus] = useState("synced");
  const [loadError, setLoadError] = useState("");
  const hasHydratedPlanner = useRef(false);

  const categoryOptions = useMemo(() => {
    const categorySet = new Set([
      ...DEFAULT_CATEGORIES,
      ...customCategories,
      ...transactions.map((entry) => entry.category).filter(Boolean),
    ]);

    return [...categorySet].sort((left, right) => left.localeCompare(right));
  }, [customCategories, transactions]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setPlannerLoading(false);
      hasHydratedPlanner.current = false;
      setTransactions(DEFAULT_PLANNER_STATE.transactions);
      setBudgetTarget(DEFAULT_PLANNER_STATE.budgetTarget);
      setCustomCategories(DEFAULT_PLANNER_STATE.customCategories);
      setCategoryBudgets(DEFAULT_PLANNER_STATE.categoryBudgets);
      return;
    }

    let active = true;

    async function hydratePlanner() {
      setPlannerLoading(true);
      setLoadError("");

      try {
        const plannerState = await loadPlannerState(session.user);
        if (!active) {
          return;
        }

        setTransactions(plannerState.transactions);
        setBudgetTarget(plannerState.budgetTarget);
        setCustomCategories(plannerState.customCategories);
        setCategoryBudgets(plannerState.categoryBudgets);
        setSaveStatus("synced");
        hasHydratedPlanner.current = true;
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadError(error.message || "Unable to load planner data.");
      } finally {
        if (active) {
          setPlannerLoading(false);
        }
      }
    }

    hydratePlanner();

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session?.user || !hasHydratedPlanner.current) {
      return undefined;
    }

    setSaveStatus("saving");

    const saveTimer = setTimeout(async () => {
      try {
        await savePlannerState(session.user, {
          budgetTarget,
          transactions,
          customCategories,
          categoryBudgets,
        });
        setSaveStatus("synced");
      } catch (error) {
        setSaveStatus("error");
        setLoadError(error.message || "Unable to save planner data.");
      }
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [budgetTarget, categoryBudgets, customCategories, session, transactions]);

  const financials = useMemo(() => {
    const income = transactions.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = transactions.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    const balance = income - expenses;
    const savingsRate = income ? ((balance / income) * 100) : 0;
    const budgetUsed = budgetTarget ? Math.min((expenses / budgetTarget) * 100, 999) : 0;
    const recurringCount = transactions.filter((entry) => entry.isRecurring).length;

    return {
      income,
      expenses,
      balance,
      savingsRate,
      budgetUsed,
      recurringCount,
    };
  }, [budgetTarget, transactions]);

  const categoryBreakdown = useMemo(() => {
    const grouped = transactions
      .filter((entry) => entry.type === "expense")
      .reduce((accumulator, entry) => {
        accumulator[entry.category] = (accumulator[entry.category] ?? 0) + entry.amount;
        return accumulator;
      }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other }))
      .sort((left, right) => right.value - left.value);
  }, [transactions]);

  const categoryBudgetSummaries = useMemo(() => {
    return categoryOptions
      .map((category) => {
        const spent = transactions
          .filter((entry) => entry.type === "expense" && entry.category === category)
          .reduce((sum, entry) => sum + entry.amount, 0);
        const limit = Number(categoryBudgets[category]) || 0;
        const percentUsed = limit ? Math.min((spent / limit) * 100, 999) : 0;
        const status = !limit ? "unset" : spent > limit ? "over" : percentUsed >= 80 ? "watch" : "healthy";
        const statusLabel =
          status === "unset"
            ? "No limit"
            : status === "over"
              ? "Over budget"
              : status === "watch"
                ? "Watch"
                : "On track";

        return {
          category,
          spent,
          limit,
          percentUsed,
          status,
          statusLabel,
        };
      })
      .filter((summary) => summary.spent > 0 || summary.limit > 0 || customCategories.includes(summary.category));
  }, [categoryBudgets, categoryOptions, customCategories, transactions]);

  const monthlyTrend = useMemo(() => {
    const seed = MONTH_LABELS.map((label) => ({
      month: label,
      income: 0,
      expenses: 0,
    }));

    transactions.forEach((entry) => {
      const monthIndex = new Date(entry.date).getMonth();
      if (Number.isNaN(monthIndex)) {
        return;
      }

      if (entry.type === "income") {
        seed[monthIndex].income += entry.amount;
      } else {
        seed[monthIndex].expenses += entry.amount;
      }
    });

    return seed.filter((item) => item.income > 0 || item.expenses > 0);
  }, [transactions]);

  const recentTransactions = useMemo(
    () => [...transactions].sort((left, right) => new Date(right.date) - new Date(left.date)),
    [transactions],
  );

  const insights = useMemo(() => {
    const topCategory = categoryBreakdown[0];
    const largestExpense = recentTransactions
      .filter((entry) => entry.type === "expense")
      .sort((left, right) => right.amount - left.amount)[0];
    const overBudgetCategory = categoryBudgetSummaries.find((summary) => summary.status === "over");

    return [
      `You have spent ${currencyFormatter(financials.expenses)} against a ${currencyFormatter(budgetTarget)} expense target this cycle.`,
      topCategory
        ? `${topCategory.name} is your largest expense category at ${currencyFormatter(topCategory.value)}.`
        : "Add expenses to see category insights.",
      overBudgetCategory
        ? `${overBudgetCategory.category} is over its monthly category budget by ${currencyFormatter(overBudgetCategory.spent - overBudgetCategory.limit)}.`
        : "No category budgets are over their limit right now.",
      largestExpense
        ? `Your largest recent expense is ${largestExpense.description} at ${currencyFormatter(largestExpense.amount)}.`
        : "Import a receipt or add transactions to surface spending outliers.",
      financials.recurringCount
        ? `${financials.recurringCount} transactions are marked as recurring, which can help later cash-flow forecasting.`
        : "Mark recurring transactions so fixed expenses and repeating income are easier to track over time.",
    ];
  }, [budgetTarget, categoryBreakdown, categoryBudgetSummaries, financials.expenses, financials.recurringCount, recentTransactions]);

  function handleFieldChange(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImportStateChange(field, value) {
    setImportState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImportFiles(fileList) {
    const files = Array.from(fileList);
    const queueableFiles = [];
    const paidFiles = [];

    files.forEach((file) => {
      const inspection = inspectFileForFreeImport(file);

      if (inspection.freeSupported) {
        queueableFiles.push(file);
      } else {
        paidFiles.push({
          fileName: file.name,
          estimatedCost: inspection.estimatedCost,
          reason: inspection.message,
        });
      }
    });

    const nextDocuments = queueableFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      name: file.name,
      sizeLabel: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || "Unknown file",
      status: "queued",
    }));

    setUploadedDocuments((current) => {
      const knownIds = new Set(current.map((entry) => entry.id));
      return [...current, ...nextDocuments.filter((entry) => !knownIds.has(entry.id))];
    });
    setImportStatus({ type: "idle", message: "" });

    if (paidFiles.length) {
      setCostWarning({
        phase: "selection",
        ...summarizeCostWarning(paidFiles),
      });
    }
  }

  function handleRemoveDocument(id) {
    setUploadedDocuments((current) => current.filter((entry) => entry.id !== id));
  }

  function resetForm() {
    setFormState({
      ...defaultFormState,
      date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const transaction = buildTransaction({
      ...formState,
      amount: Number(formState.amount),
    });

    if (!transaction.description || !transaction.amount) {
      return;
    }

    if (editingId) {
      setTransactions((current) =>
        current.map((entry) => (entry.id === editingId ? { ...transaction, id: editingId } : entry)),
      );
    } else {
      setTransactions((current) => [transaction, ...current]);
    }

    resetForm();
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id);
    setFormState({
      description: transaction.description,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      source: transaction.source,
      notes: transaction.notes,
      isRecurring: Boolean(transaction.isRecurring),
    });
  }

  function handleDelete(id) {
    setTransactions((current) => current.filter((entry) => entry.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  async function runImportSimulation() {
    const textFromFiles = [];
    const paidFallbackFiles = [];
    setImportStatus({ type: "idle", message: "" });
    setImportStatus({
      type: "info",
      message: "Analyzing uploaded documents with the free extraction pipeline.",
    });

    try {
      const fileResults = await Promise.all(
        uploadedDocuments.map(async (document) => {
          const result = await extractDocumentText(document.file);
          return {
            ...result,
            id: document.id,
          };
        }),
      );

      fileResults.forEach((entry) => {
        if (entry.mode === "free" && entry.text.trim()) {
          textFromFiles.push(...parseImportedText(entry.text, importState.documentType, entry.fileName));
          return;
        }

        if (entry.mode === "paid_required") {
          paidFallbackFiles.push({
            id: entry.id,
            fileName: entry.fileName,
            estimatedCost: entry.estimatedCost,
            reason: entry.reason,
          });
        }
      });

      const manualEntries = importState.rawText.trim()
        ? parseImportedText(importState.rawText, importState.documentType, "Pasted statement text")
        : [];

      const reviewItems = createImportReviewItems([...textFromFiles, ...manualEntries], transactions);
      setParsedTransactions(reviewItems);

      if (paidFallbackFiles.length) {
        setCostWarning({
          phase: "analysis",
          ...summarizeCostWarning(paidFallbackFiles),
        });
      }

      if (!reviewItems.length && paidFallbackFiles.length) {
        setImportStatus({
          type: "error",
          message: "The free extractor could not read the queued documents. Review the cost warning before continuing.",
        });
      } else if (paidFallbackFiles.length) {
        setImportStatus({
          type: "info",
          message: `Prepared ${reviewItems.length} transaction${reviewItems.length === 1 ? "" : "s"} for review. Some files were paused because they would need a paid fallback.`,
        });
      } else {
        setImportStatus({
          type: "success",
          message: `Prepared ${reviewItems.length} transaction${reviewItems.length === 1 ? "" : "s"} for review.`,
        });
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: error.message || "Unable to analyze the uploaded content.",
      });
    }
  }

  function importParsedTransactions() {
    const approvedTransactions = parsedTransactions
      .filter((entry) => entry.approved)
      .map(({ approved, duplicate, duplicateId, duplicateReason, ...entry }) => entry);

    if (!approvedTransactions.length) {
      return;
    }

    setTransactions((current) => [...approvedTransactions, ...current]);
    setParsedTransactions([]);
    setUploadedDocuments([]);
    setImportStatus({
      type: "success",
      message: `Imported ${approvedTransactions.length} approved transaction${approvedTransactions.length === 1 ? "" : "s"}.`,
    });
  }

  function removeParsedTransaction(id) {
    setParsedTransactions((current) => current.filter((entry) => entry.id !== id));
  }

  function handleParsedTransactionChange(id, field, value) {
    setParsedTransactions((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              [field]:
                field === "amount"
                  ? Number(value)
                  : value,
            }
          : entry,
      ),
    );
  }

  function handleParsedTransactionApproval(id, approved) {
    setParsedTransactions((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              approved,
            }
          : entry,
      ),
    );
  }

  function handleApproveAllParsedTransactions() {
    setParsedTransactions((current) =>
      current.map((entry) => ({
        ...entry,
        approved: true,
      })),
    );
  }

  const approvedImportCount = useMemo(
    () => parsedTransactions.filter((entry) => entry.approved).length,
    [parsedTransactions],
  );

  function handleAddCustomCategory(categoryName) {
    setCustomCategories((current) => {
      const normalized = categoryName.trim();
      if (!normalized || current.includes(normalized) || DEFAULT_CATEGORIES.includes(normalized)) {
        return current;
      }

      return [...current, normalized].sort((left, right) => left.localeCompare(right));
    });
  }

  function handleRemoveCustomCategory(categoryName) {
    setCustomCategories((current) => current.filter((category) => category !== categoryName));
    setCategoryBudgets((current) => {
      const next = { ...current };
      delete next[categoryName];
      return next;
    });
  }

  function handleCategoryBudgetChange(category, value) {
    setCategoryBudgets((current) => {
      const next = { ...current };
      const trimmed = String(value).trim();

      if (!trimmed || Number(trimmed) <= 0) {
        delete next[category];
        return next;
      }

      next[category] = Number(trimmed);
      return next;
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setParsedTransactions([]);
    setUploadedDocuments([]);
    setFormState(defaultFormState);
    setImportState(defaultImportState);
  }

  function closeCostWarning() {
    setCostWarning(null);
  }

  function removeCostWarningFiles() {
    if (!costWarning?.items?.length) {
      setCostWarning(null);
      return;
    }

    const blockedNames = new Set(costWarning.items.map((item) => item.fileName));
    setUploadedDocuments((current) => current.filter((document) => !blockedNames.has(document.name)));
    setCostWarning(null);
    setImportStatus({
      type: "info",
      message: "Paid-fallback files were removed from the queue. Free-supported uploads remain available.",
    });
  }

  const plannerHealthTone =
    financials.balance >= 0 && financials.budgetUsed <= 100
      ? "on-track"
      : financials.balance >= 0
        ? "watchlist"
        : "needs-attention";

  if (!isSupabaseConfigured) {
    return <SupabaseSetupScreen />;
  }

  if (authLoading) {
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

  if (!session) {
    return <AuthScreen />;
  }

  if (plannerLoading) {
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
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((current) => !current)}
          onSignOut={handleSignOut}
          plannerHealthTone={plannerHealthTone}
          saveStatus={saveStatus}
          userEmail={session.user.email}
        />

        {loadError ? <div className="status-banner error">{loadError}</div> : null}

        <MetricsGrid financials={financials} />

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <MonthlyCashFlowChart monthlyTrend={monthlyTrend} />
          <ExpenseMixChart categoryBreakdown={categoryBreakdown} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <PlanControls
            budgetTarget={budgetTarget}
            categoryBudgetSummaries={categoryBudgetSummaries}
            categoryBudgets={categoryBudgets}
            categoryOptions={categoryOptions}
            customCategories={customCategories}
            financials={financials}
            formState={formState}
            editingId={editingId}
            onAddCustomCategory={handleAddCustomCategory}
            onCategoryBudgetChange={handleCategoryBudgetChange}
            onSetBudgetTarget={setBudgetTarget}
            onFieldChange={handleFieldChange}
            onRemoveCustomCategory={handleRemoveCustomCategory}
            onSubmit={handleSubmit}
            onResetForm={resetForm}
          />

          <AiImportPanel
            importState={importState}
            importStatus={importStatus}
            parsedTransactions={parsedTransactions}
            uploadedDocuments={uploadedDocuments}
            approvedImportCount={approvedImportCount}
            categoryOptions={categoryOptions}
            onImportStateChange={handleImportStateChange}
            onFilesSelected={handleImportFiles}
            onRemoveDocument={handleRemoveDocument}
            onAnalyze={runImportSimulation}
            onImport={importParsedTransactions}
            onParsedTransactionChange={handleParsedTransactionChange}
            onParsedTransactionApproval={handleParsedTransactionApproval}
            onApproveAll={handleApproveAllParsedTransactions}
            onRemoveParsedTransaction={removeParsedTransaction}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <InsightsPanel insights={insights} />
          <TransactionsTable transactions={recentTransactions} onEdit={handleEdit} onDelete={handleDelete} />
        </section>
      </main>

      {costWarning ? (
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
                Est. {costWarning.totalEstimateLabel}
              </span>
            </div>

            <p className="panel-subtitle">
              {costWarning.phase === "selection"
                ? "Some selected files are outside the free extractor, so they were not queued for analysis."
                : "Some queued files could not be read for free and would likely need a paid OCR or AI parser to continue."}
            </p>

            <div className="cost-warning-list">
              {costWarning.items.map((item) => (
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
              <button type="button" className="ghost-button" onClick={closeCostWarning}>
                Keep free-only flow
              </button>
              <button type="button" className="secondary-button" onClick={removeCostWarningFiles}>
                Cancel upload for these files
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
