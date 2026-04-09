import React, { useEffect, useMemo, useState } from "react";
import AiImportPanel from "./components/AiImportPanel";
import ExpenseMixChart from "./components/ExpenseMixChart";
import HeroSection from "./components/HeroSection";
import InsightsPanel from "./components/InsightsPanel";
import MetricsGrid from "./components/MetricsGrid";
import MonthlyCashFlowChart from "./components/MonthlyCashFlowChart";
import PlanControls from "./components/PlanControls";
import TransactionsTable from "./components/TransactionsTable";
import {
  buildTransaction,
  CATEGORY_COLORS,
  currencyFormatter,
  defaultFormState,
  defaultImportState,
  MONTH_LABELS,
  parseImportedText,
  SAMPLE_TRANSACTIONS,
} from "./lib/finance";

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("financial-planner-transactions");
    if (!saved) {
      return SAMPLE_TRANSACTIONS;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return SAMPLE_TRANSACTIONS;
    }
  });
  const [budgetTarget, setBudgetTarget] = useState(() => Number(localStorage.getItem("financial-planner-budget-target")) || 4500);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [importState, setImportState] = useState(defaultImportState);
  const [parsedTransactions, setParsedTransactions] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("financial-planner-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("financial-planner-budget-target", String(budgetTarget));
  }, [budgetTarget]);

  const financials = useMemo(() => {
    const income = transactions.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = transactions.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    const balance = income - expenses;
    const savingsRate = income ? ((balance / income) * 100) : 0;
    const budgetUsed = budgetTarget ? Math.min((expenses / budgetTarget) * 100, 999) : 0;

    return {
      income,
      expenses,
      balance,
      savingsRate,
      budgetUsed,
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

    return [
      `You have spent ${currencyFormatter(financials.expenses)} against a ${currencyFormatter(budgetTarget)} expense target this cycle.`,
      topCategory
        ? `${topCategory.name} is your largest expense category at ${currencyFormatter(topCategory.value)}.`
        : "Add expenses to see category insights.",
      largestExpense
        ? `Your largest recent expense is ${largestExpense.description} at ${currencyFormatter(largestExpense.amount)}.`
        : "Import a receipt or add transactions to surface spending outliers.",
    ];
  }, [budgetTarget, categoryBreakdown, financials.expenses, recentTransactions]);

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
    });
  }

  function handleDelete(id) {
    setTransactions((current) => current.filter((entry) => entry.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  function runImportSimulation() {
    setParsedTransactions(parseImportedText(importState.rawText, importState.documentType));
  }

  function importParsedTransactions() {
    if (!parsedTransactions.length) {
      return;
    }

    setTransactions((current) => [...parsedTransactions, ...current]);
    setParsedTransactions([]);
  }

  function removeParsedTransaction(id) {
    setParsedTransactions((current) => current.filter((entry) => entry.id !== id));
  }

  const plannerHealthTone =
    financials.balance >= 0 && financials.budgetUsed <= 100
      ? "on-track"
      : financials.balance >= 0
        ? "watchlist"
        : "needs-attention";

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((current) => !current)}
          plannerHealthTone={plannerHealthTone}
        />

        <MetricsGrid financials={financials} />

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <MonthlyCashFlowChart monthlyTrend={monthlyTrend} />
          <ExpenseMixChart categoryBreakdown={categoryBreakdown} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <PlanControls
            budgetTarget={budgetTarget}
            financials={financials}
            formState={formState}
            editingId={editingId}
            onSetBudgetTarget={setBudgetTarget}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onResetForm={resetForm}
          />

          <AiImportPanel
            importState={importState}
            parsedTransactions={parsedTransactions}
            onImportStateChange={handleImportStateChange}
            onAnalyze={runImportSimulation}
            onImport={importParsedTransactions}
            onRemoveParsedTransaction={removeParsedTransaction}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <InsightsPanel insights={insights} />
          <TransactionsTable transactions={recentTransactions} onEdit={handleEdit} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}

export default App;
