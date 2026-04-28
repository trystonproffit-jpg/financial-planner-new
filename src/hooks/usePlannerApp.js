import { useEffect, useMemo, useRef, useState } from "react";
import {
  createImportSession,
  loadImportHistory,
  updateImportSession,
} from "../lib/importHistoryStore";
import {
  extractDocumentText,
  inspectFileForFreeImport,
  summarizeCostWarning,
} from "../lib/documentExtraction";
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
} from "../lib/finance";
import { requestPlannerChatResponse } from "../lib/plannerChat";
import { DEFAULT_PLANNER_STATE, loadPlannerState, savePlannerState } from "../lib/plannerStore";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const DEFAULT_COACH_MESSAGES = [
  {
    id: "coach-welcome",
    role: "assistant",
    content:
      "I can help review spending, spot pressure points, and suggest practical next steps based on the data in this planner. Ask a question whenever you want advice.",
  },
];

export default function usePlannerApp() {
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
  const [importHistory, setImportHistory] = useState([]);
  const [activeImportSessionId, setActiveImportSessionId] = useState(null);
  const [costWarning, setCostWarning] = useState(null);
  const [coachMessages, setCoachMessages] = useState(DEFAULT_COACH_MESSAGES);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
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
      setImportHistory([]);
      setActiveImportSessionId(null);
      setCoachMessages(DEFAULT_COACH_MESSAGES);
      setCoachInput("");
      setCoachError("");
      return;
    }

    let active = true;

    async function hydratePlanner() {
      setPlannerLoading(true);
      setLoadError("");

      try {
        const [plannerState, importHistoryRecords] = await Promise.all([
          loadPlannerState(session.user),
          loadImportHistory(session.user),
        ]);
        if (!active) {
          return;
        }

        setTransactions(plannerState.transactions);
        setBudgetTarget(plannerState.budgetTarget);
        setCustomCategories(plannerState.customCategories);
        setCategoryBudgets(plannerState.categoryBudgets);
        setImportHistory(importHistoryRecords);
        setCoachMessages(DEFAULT_COACH_MESSAGES);
        setCoachInput("");
        setCoachError("");
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

  const coachPromptOptions = useMemo(
    () => [
      "Where am I overspending this month?",
      "What should I adjust to improve my savings rate?",
      "Which categories look healthiest right now?",
      "What recurring expenses should I review first?",
    ],
    [],
  );

  const coachResponses = useMemo(
    () => ({
      [coachPromptOptions[0]]: categoryBudgetSummaries.find((summary) => summary.status === "over")
        ? `${categoryBudgetSummaries.find((summary) => summary.status === "over").category} is currently over budget. That is the first category I would review before trimming smaller line items.`
        : "No category budget is over its limit right now, so I would focus on your largest discretionary expense categories first.",
      [coachPromptOptions[1]]: financials.balance < 0
        ? "Your cash flow is negative, so the fastest improvement would come from trimming the biggest expense categories or raising income before adding new goals."
        : `Your current savings rate is ${Math.round(financials.savingsRate)}%. Reducing your top expense category or redirecting part of your positive balance into savings would improve that fastest.`,
      [coachPromptOptions[2]]: categoryBudgetSummaries.filter((summary) => summary.status === "healthy").length
        ? `Your strongest categories right now are ${categoryBudgetSummaries
          .filter((summary) => summary.status === "healthy")
          .slice(0, 3)
          .map((summary) => summary.category)
          .join(", ")}.`
        : "Most categories either do not have limits yet or need attention, so setting a few category budgets would make this view more useful.",
      [coachPromptOptions[3]]: financials.recurringCount
        ? `You already marked ${financials.recurringCount} recurring transactions. I would review the largest recurring expense first, then anything non-essential that renews automatically.`
        : "You do not have recurring items marked yet, so that is the first cleanup step I would recommend before deeper coaching.",
    }),
    [categoryBudgetSummaries, coachPromptOptions, financials.balance, financials.recurringCount, financials.savingsRate],
  );

  function buildCoachFallbackReply(question) {
    const normalized = question.toLowerCase();

    if (normalized.includes("cut back") || normalized.includes("overspend")) {
      return coachResponses[coachPromptOptions[0]];
    }

    if (normalized.includes("savings")) {
      return coachResponses[coachPromptOptions[1]];
    }

    if (normalized.includes("health") || normalized.includes("healthiest")) {
      return coachResponses[coachPromptOptions[2]];
    }

    if (normalized.includes("recurring")) {
      return coachResponses[coachPromptOptions[3]];
    }

    return "I could not reach the live coach service just now, but based on your current planner data I would start with the largest expense category, any over-budget category, and the biggest recurring charges first.";
  }

  const plannerHealthTone =
    financials.balance >= 0 && financials.budgetUsed <= 100
      ? "on-track"
      : financials.balance >= 0
        ? "watchlist"
        : "needs-attention";

  const plannerContext = useMemo(() => ({
    generatedAt: new Date().toISOString(),
    financials,
    budgetTarget,
    categoryBudgetSummaries,
    categoryBreakdown,
    recentTransactions: recentTransactions.slice(0, 40).map((entry) => ({
      description: entry.description,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      date: entry.date,
      source: entry.source,
      notes: entry.notes,
      isRecurring: entry.isRecurring,
    })),
  }), [budgetTarget, categoryBreakdown, categoryBudgetSummaries, financials, recentTransactions]);

  function summarizeUploadedDocuments(documents) {
    return documents.map((document) => ({
      name: document.name,
      sizeLabel: document.sizeLabel,
      type: document.type,
      status: document.status,
    }));
  }

  function buildImportSessionSnapshot({
    nextParsedTransactions = parsedTransactions,
    status = "review",
    importedCount = 0,
    sourceFiles = summarizeUploadedDocuments(uploadedDocuments),
    costWarningItems = costWarning?.items ?? [],
  } = {}) {
    const approvedCount = nextParsedTransactions.filter((entry) => entry.approved).length;
    const duplicateCount = nextParsedTransactions.filter((entry) => entry.duplicate).length;
    const totalCount = nextParsedTransactions.length;

    return {
      status,
      documentType: importState.documentType,
      statementSource: importState.statementSource,
      sourceFiles,
      rawTextPreview: importState.rawText.trim().slice(0, 400),
      parsedItems: nextParsedTransactions,
      costWarningItems,
      totalCount,
      approvedCount,
      duplicateCount,
      importedCount,
      skippedCount: Math.max(totalCount - importedCount, 0),
      importedAt: importedCount ? new Date().toISOString() : null,
    };
  }

  function mergeImportHistorySession(sessionRecord) {
    if (!sessionRecord) {
      return;
    }

    setImportHistory((current) => {
      const withoutCurrent = current.filter((entry) => entry.id !== sessionRecord.id);
      return [sessionRecord, ...withoutCurrent].slice(0, 8);
    });
  }

  async function persistImportSession(snapshot, sessionIdOverride = activeImportSessionId) {
    if (!session?.user) {
      return null;
    }

    if (sessionIdOverride) {
      const updatedSession = await updateImportSession(session.user, sessionIdOverride, snapshot);
      mergeImportHistorySession(updatedSession);
      return updatedSession;
    }

    const createdSession = await createImportSession(session.user, snapshot);

    if (createdSession) {
      setActiveImportSessionId(createdSession.id);
      mergeImportHistorySession(createdSession);
    }

    return createdSession;
  }

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
    let nextCostWarningItems = [];
    setActiveImportSessionId(null);
    setCostWarning(null);
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
          textFromFiles.push(...parseImportedText(entry.text, {
            documentType: importState.documentType,
            statementSource: importState.statementSource,
            sourceLabel: entry.fileName,
          }));
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
        ? parseImportedText(importState.rawText, {
            documentType: importState.documentType,
            statementSource: importState.statementSource,
            sourceLabel: "Pasted statement text",
          })
        : [];

      const reviewItems = createImportReviewItems([...textFromFiles, ...manualEntries], transactions);
      setParsedTransactions(reviewItems);

      if (paidFallbackFiles.length) {
        nextCostWarningItems = paidFallbackFiles;
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

      await persistImportSession(
        buildImportSessionSnapshot({
          nextParsedTransactions: reviewItems,
          status: paidFallbackFiles.length ? "review_with_warnings" : "review",
          sourceFiles: summarizeUploadedDocuments(uploadedDocuments),
          costWarningItems: nextCostWarningItems,
        }),
        null,
      );
    } catch (error) {
      setImportStatus({
        type: "error",
        message: error.message || "Unable to analyze the uploaded content.",
      });
    }
  }

  async function importParsedTransactions() {
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

    await persistImportSession(
      buildImportSessionSnapshot({
        nextParsedTransactions: parsedTransactions,
        status: "imported",
        importedCount: approvedTransactions.length,
      }),
    );
  }

  function removeParsedTransaction(id) {
    const nextTransactions = parsedTransactions.filter((entry) => entry.id !== id);
    setParsedTransactions(nextTransactions);
    void persistImportSession(buildImportSessionSnapshot({ nextParsedTransactions: nextTransactions }));
  }

  function handleRemoveAllParsedTransactions() {
    setParsedTransactions([]);
    setImportStatus({
      type: "info",
      message: "Cleared the review queue. Your uploaded files stay queued in case you want to analyze again.",
    });
    void persistImportSession(buildImportSessionSnapshot({ nextParsedTransactions: [] }));
  }

  function handleParsedTransactionChange(id, field, value) {
    const nextTransactions = parsedTransactions.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            [field]:
              field === "amount"
                ? Number(value)
                : value,
          }
        : entry,
    );
    setParsedTransactions(nextTransactions);
    void persistImportSession(buildImportSessionSnapshot({ nextParsedTransactions: nextTransactions }));
  }

  function handleParsedTransactionApproval(id, approved) {
    const nextTransactions = parsedTransactions.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            approved,
          }
        : entry,
    );
    setParsedTransactions(nextTransactions);
    void persistImportSession(buildImportSessionSnapshot({ nextParsedTransactions: nextTransactions }));
  }

  function handleApproveAllParsedTransactions() {
    const nextTransactions = parsedTransactions.map((entry) => ({
      ...entry,
      approved: true,
    }));
    setParsedTransactions(nextTransactions);
    void persistImportSession(buildImportSessionSnapshot({ nextParsedTransactions: nextTransactions }));
  }

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
    setImportHistory([]);
    setActiveImportSessionId(null);
    setCoachMessages(DEFAULT_COACH_MESSAGES);
    setCoachInput("");
    setCoachError("");
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

  function restoreImportSession(sessionRecord) {
    setActiveImportSessionId(sessionRecord.id);
    setParsedTransactions(sessionRecord.parsedItems);
    setUploadedDocuments([]);
    setImportState((current) => ({
      ...current,
      documentType: sessionRecord.documentType || current.documentType,
      statementSource: sessionRecord.statementSource || current.statementSource,
      rawText: sessionRecord.rawTextPreview || current.rawText,
    }));
    setImportStatus({
      type: "info",
      message: `Restored import review from ${sessionRecord.updatedAt ? new Date(sessionRecord.updatedAt).toLocaleString() : "history"}.`,
    });

    if (sessionRecord.costWarningItems.length) {
      setCostWarning({
        phase: "history",
        ...summarizeCostWarning(sessionRecord.costWarningItems),
      });
    } else {
      setCostWarning(null);
    }
  }

  const approvedImportCount = parsedTransactions.filter((entry) => entry.approved).length;

  async function sendCoachMessage(submittedPrompt) {
    const question = (submittedPrompt ?? coachInput).trim();

    if (!question || coachLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    const nextMessages = [...coachMessages, userMessage];
    setCoachMessages(nextMessages);
    setCoachInput("");
    setCoachError("");
    setCoachLoading(true);

    try {
      const reply = await requestPlannerChatResponse({
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        plannerContext,
      });

      setCoachMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      setCoachError("The live coach is temporarily unavailable, so I am showing planner-based backup guidance for now.");
      setCoachMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: buildCoachFallbackReply(question),
        },
      ]);
    } finally {
      setCoachLoading(false);
    }
  }

  return {
    activeImportSessionId,
    approvedImportCount,
    authLoading,
    budgetTarget,
    categoryBreakdown,
    categoryBudgetSummaries,
    categoryBudgets,
    categoryOptions,
    coachError,
    coachInput,
    coachLoading,
    coachMessages,
    coachPromptOptions,
    coachResponses,
    costWarning,
    customCategories,
    darkMode,
    editingId,
    financials,
    formState,
    importHistory,
    importState,
    importStatus,
    insights,
    isSupabaseConfigured,
    loadError,
    monthlyTrend,
    parsedTransactions,
    plannerHealthTone,
    plannerLoading,
    recentTransactions,
    saveStatus,
    session,
    transactions,
    uploadedDocuments,
    setBudgetTarget,
    setDarkMode,
    closeCostWarning,
    handleAddCustomCategory,
    handleApproveAllParsedTransactions,
    handleCategoryBudgetChange,
    handleDelete,
    handleEdit,
    handleFieldChange,
    handleImportFiles,
    handleImportStateChange,
    handleParsedTransactionApproval,
    handleParsedTransactionChange,
    handleRemoveAllParsedTransactions,
    handleRemoveCustomCategory,
    handleRemoveDocument,
    handleSignOut,
    handleSubmit,
    importParsedTransactions,
    removeCostWarningFiles,
    removeParsedTransaction,
    resetForm,
    restoreImportSession,
    runImportSimulation,
    sendCoachMessage,
    setCoachInput,
  };
}
