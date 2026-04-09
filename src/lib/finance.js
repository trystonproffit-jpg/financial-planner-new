export const CATEGORY_RULES = [
  { category: "Groceries", keywords: ["grocery", "market", "aldi", "trader", "kroger", "whole foods", "publix", "costco"] },
  { category: "Eating Out", keywords: ["restaurant", "cafe", "coffee", "doordash", "uber eats", "grubhub", "pizza", "diner", "mcdonald", "starbucks"] },
  { category: "Housing", keywords: ["rent", "mortgage", "hoa", "property"] },
  { category: "Utilities", keywords: ["electric", "water", "gas bill", "internet", "utility", "phone"] },
  { category: "Transportation", keywords: ["uber", "lyft", "shell", "chevron", "exxon", "gas", "transit", "parking"] },
  { category: "Healthcare", keywords: ["pharmacy", "doctor", "clinic", "dental", "vision", "medical"] },
  { category: "Entertainment", keywords: ["netflix", "spotify", "movie", "cinema", "concert", "steam"] },
  { category: "Shopping", keywords: ["amazon", "target", "walmart", "best buy", "shop"] },
  { category: "Travel", keywords: ["hotel", "airbnb", "flight", "delta", "united", "southwest"] },
  { category: "Salary", keywords: ["payroll", "salary", "direct deposit", "paycheck", "bonus"] },
  { category: "Freelance", keywords: ["invoice", "client payment", "contract", "consulting"] },
];

export const CATEGORY_COLORS = {
  Groceries: "#16a34a",
  "Eating Out": "#f97316",
  Housing: "#2563eb",
  Utilities: "#7c3aed",
  Transportation: "#0891b2",
  Healthcare: "#dc2626",
  Entertainment: "#ec4899",
  Shopping: "#8b5cf6",
  Travel: "#0f766e",
  Salary: "#22c55e",
  Freelance: "#14b8a6",
  Other: "#64748b",
};

export const SAMPLE_TRANSACTIONS = [
  { id: 1, description: "Biweekly payroll", amount: 3450, type: "income", category: "Salary", date: "2026-04-05", source: "ACME Corp", notes: "Primary paycheck", confidence: 1 },
  { id: 2, description: "Whole Foods Market", amount: 124.63, type: "expense", category: "Groceries", date: "2026-04-04", source: "Visa ending 2811", notes: "Weekly stock-up", confidence: 1 },
  { id: 3, description: "Rent payment", amount: 1650, type: "expense", category: "Housing", date: "2026-04-01", source: "Bank transfer", notes: "Downtown loft", confidence: 1 },
  { id: 4, description: "Dinner with friends", amount: 62.18, type: "expense", category: "Eating Out", date: "2026-04-03", source: "Mastercard ending 8822", notes: "Italian place", confidence: 1 },
  { id: 5, description: "Freelance design invoice", amount: 820, type: "income", category: "Freelance", date: "2026-04-02", source: "Stripe payout", notes: "Landing page project", confidence: 1 },
  { id: 6, description: "Shell fuel stop", amount: 48.91, type: "expense", category: "Transportation", date: "2026-04-06", source: "Visa ending 2811", notes: "Commute", confidence: 1 },
];

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const defaultFormState = {
  description: "",
  amount: "",
  type: "expense",
  category: "Other",
  date: new Date().toISOString().slice(0, 10),
  source: "",
  notes: "",
};

export const defaultImportState = {
  rawText: `04/02/2026 WHOLE FOODS MARKET $82.14
04/03/2026 STARBUCKS $7.80
04/04/2026 ACME PAYROLL +$3450.00
04/04/2026 UBER TRIP $23.56`,
  documentType: "mixed",
};

export function inferType(text, amount) {
  const lowered = text.toLowerCase();
  if (amount > 0 && (lowered.includes("payroll") || lowered.includes("deposit") || lowered.includes("salary") || lowered.includes("invoice") || lowered.includes("bonus"))) {
    return "income";
  }

  return "expense";
}

export function suggestCategory(description, type) {
  const lowered = description.toLowerCase();
  const match = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => lowered.includes(keyword)),
  );

  if (match) {
    return match.category;
  }

  return type === "income" ? "Salary" : "Other";
}

export function buildTransaction(entry) {
  const type = entry.type ?? inferType(entry.description, entry.amount);
  const normalizedAmount = Math.abs(Number(entry.amount) || 0);
  const category = entry.category || suggestCategory(entry.description, type);

  return {
    id: entry.id ?? Date.now() + Math.random(),
    description: entry.description.trim(),
    amount: normalizedAmount,
    type,
    category,
    date: entry.date || new Date().toISOString().slice(0, 10),
    source: entry.source || "Manual entry",
    notes: entry.notes || "",
    confidence: entry.confidence ?? 0.94,
  };
}

export function parseImportedText(rawText, documentType) {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const dateMatch = line.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
      const amountMatch = line.match(/([+-]?\$?\d[\d,]*\.?\d{0,2})\s*$/);

      if (!amountMatch) {
        return null;
      }

      const rawAmount = amountMatch[1].replace(/\$/g, "").replace(/,/g, "");
      const parsedAmount = Number(rawAmount);
      const detectedType =
        documentType === "income"
          ? "income"
          : documentType === "expense"
            ? "expense"
            : inferType(line, parsedAmount);

      const description = line
        .replace(dateMatch?.[0] ?? "", "")
        .replace(amountMatch[0], "")
        .replace(/\s+/g, " ")
        .trim();

      const isoDate = dateMatch
        ? new Date(dateMatch[0]).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      return buildTransaction({
        description: description || "Imported transaction",
        amount: Math.abs(parsedAmount),
        type: detectedType,
        date: isoDate,
        source: "AI document scan",
        notes: "Parsed from uploaded receipt or bank statement text.",
        confidence: description ? 0.92 : 0.71,
      });
    })
    .filter(Boolean);
}

export function currencyFormatter(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function percentFormatter(value) {
  return `${Math.round(value)}%`;
}
