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

export const DEFAULT_CATEGORIES = Object.keys(CATEGORY_COLORS);

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
  isRecurring: false,
};

export const defaultImportState = {
  rawText: `04/02/2026 WHOLE FOODS MARKET $82.14
04/03/2026 STARBUCKS $7.80
04/04/2026 ACME PAYROLL +$3450.00
04/04/2026 UBER TRIP $23.56`,
  documentType: "mixed",
  statementSource: "auto",
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
    isRecurring: Boolean(entry.isRecurring),
    confidence: entry.confidence ?? 0.94,
  };
}

export function normalizeDescription(description) {
  return description.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findDuplicateTransaction(candidate, existingTransactions) {
  return existingTransactions.find((entry) => (
    entry.date === candidate.date
    && Number(entry.amount).toFixed(2) === Number(candidate.amount).toFixed(2)
    && normalizeDescription(entry.description) === normalizeDescription(candidate.description)
  ));
}

function looksLikeStatementNoise(line) {
  const lowered = line.toLowerCase();

  return (
    lowered.includes("transaction details")
    || lowered.includes("transaction history")
    || lowered.includes("date description")
    || lowered.includes("description amount")
    || lowered.includes("date transaction")
    || lowered.includes("posted transactions")
    || lowered.includes("deposits and additions")
    || lowered.includes("electronic withdrawals")
    || lowered.includes("amount balance")
    || lowered.includes("balance forward")
    || lowered.includes("beginning balance")
    || lowered.includes("ending balance")
    || lowered.includes("available balance")
    || lowered.includes("account number")
    || lowered.includes("page ")
    || lowered.includes("total fees")
    || lowered.includes("interest charged")
    || lowered.includes("payment due")
    || lowered.includes("new balance")
  );
}

function normalizeImportedDate(rawDate) {
  if (!rawDate) {
    return new Date().toISOString().slice(0, 10);
  }

  const cleaned = rawDate.replace(/\./g, "/").trim();
  const isoLikeMatch = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);

  if (isoLikeMatch) {
    const year = Number(isoLikeMatch[1]);
    const month = Number(isoLikeMatch[2]);
    const day = Number(isoLikeMatch[3]);
    const parsedDate = new Date(year, month - 1, day);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().slice(0, 10);
    }
  }

  const compactMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);

  if (compactMatch) {
    const month = Number(compactMatch[1]);
    const day = Number(compactMatch[2]);
    const rawYear = compactMatch[3];
    const year = rawYear
      ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear)
      : new Date().getFullYear();

    const parsedDate = new Date(year, month - 1, day);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().slice(0, 10);
    }
  }

  const parsedDate = new Date(cleaned);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsedDate.toISOString().slice(0, 10);
}

function scoreImportedRow({ amount, dateMatch, description, parserStrategy = "generic" }) {
  let confidence = 0.52;

  if (dateMatch) {
    confidence += 0.14;
  }

  if (amount >= 1) {
    confidence += 0.08;
  }

  if (description.length >= 6) {
    confidence += 0.1;
  }

  if (/[a-z]/i.test(description) && /\d/.test(description) === false) {
    confidence += 0.08;
  }

  if (description.length >= 14) {
    confidence += 0.06;
  }

  if (parserStrategy === "credit_card" || parserStrategy === "bank_statement") {
    confidence += 0.06;
  }

  return Math.min(Number(confidence.toFixed(2)), 0.97);
}

function cleanImportedDescription(value) {
  return value
    .replace(/\b(?:pos|dbt|purchase|payment|debit|credit|withdrawal|deposit|checkcard|visa|mc)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function findDateMatch(line) {
  return line.match(/\b(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/);
}

function findAmountTokens(line) {
  return [...line.matchAll(/([+-]?\$?\d[\d,]*\.\d{2})/g)];
}

function splitDenseStatementLine(line) {
  const datePattern = /\b(?:\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/g;
  const dateMatches = [...line.matchAll(datePattern)];

  if (dateMatches.length <= 1) {
    return [line];
  }

  return dateMatches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < dateMatches.length ? (dateMatches[index + 1].index ?? line.length) : line.length;
    return line.slice(start, end).trim();
  }).filter(Boolean);
}

function buildImportCandidateLines(rawText, statementSource) {
  const normalizedText = rawText
    .replace(/[–—−]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  const baseLines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidateLines = baseLines.flatMap((line) => {
    if ((statementSource === "bank-statement" || statementSource === "credit-card") && findDateMatch(line)) {
      return splitDenseStatementLine(line);
    }

    return [line];
  });

  const denseDateMatches = [...normalizedText.matchAll(/\b(?:\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/g)];

  if (denseDateMatches.length >= 3 && candidateLines.length <= 4) {
    return splitDenseStatementLine(normalizedText);
  }

  return candidateLines;
}

function inferStatementSource(rawText, sourceLabel = "") {
  const combined = `${sourceLabel}\n${rawText}`.toLowerCase();

  if (
    combined.includes("credit card")
    || combined.includes("card ending")
    || combined.includes("minimum payment")
    || combined.includes("payment due")
    || combined.includes("purchases and adjustments")
  ) {
    return "credit-card";
  }

  if (
    combined.includes("checking")
    || combined.includes("chequing")
    || combined.includes("savings")
    || combined.includes("deposits and additions")
    || combined.includes("electronic withdrawals")
    || combined.includes("account summary")
    || combined.includes("withdrawals")
    || combined.includes("deposits")
    || combined.includes("balance")
  ) {
    return "bank-statement";
  }

  return "generic";
}

function buildImportedTransaction({
  description,
  amount,
  documentType,
  dateMatch,
  sourceLabel,
  parserStrategy,
}) {
  if (!description || description.length < 3 || !Number.isFinite(amount)) {
    return null;
  }

  const detectedType =
    documentType === "income"
      ? "income"
      : documentType === "expense"
        ? "expense"
        : inferType(description, amount);

  return buildTransaction({
    description,
    amount: Math.abs(amount),
    type: detectedType,
    date: normalizeImportedDate(dateMatch?.[1] ?? dateMatch?.[0]),
    source: sourceLabel,
    notes: `Parsed from ${sourceLabel.toLowerCase()}.`,
    confidence: scoreImportedRow({
      amount: Math.abs(amount),
      dateMatch,
      description,
      parserStrategy,
    }),
  });
}

function parseCreditCardStatementLine(line, documentType, sourceLabel) {
  const dateMatch = findDateMatch(line);
  const amountMatches = findAmountTokens(line);
  const amountMatch = amountMatches.at(-1);

  if (!amountMatch || looksLikeStatementNoise(line)) {
    return null;
  }

  const rawAmount = amountMatch[1].replace(/\$/g, "").replace(/,/g, "");
  const parsedAmount = Number(rawAmount);

  if (!Number.isFinite(parsedAmount) || Math.abs(parsedAmount) === 0) {
    return null;
  }

  const description = cleanImportedDescription(
    line
      .replace(dateMatch?.[0] ?? "", "")
      .replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/, "")
      .replace(amountMatch[0], "")
      .replace(/\s+/g, " ")
      .trim(),
  );

  return buildImportedTransaction({
    description,
    amount: parsedAmount,
    documentType,
    dateMatch,
    sourceLabel,
    parserStrategy: "credit_card",
  });
}

function parseBankStatementLine(line, documentType, sourceLabel) {
  const dateMatch = findDateMatch(line);
  const amountMatches = findAmountTokens(line);

  if (!dateMatch || !amountMatches.length || looksLikeStatementNoise(line)) {
    return null;
  }

  let selectedAmountMatch = amountMatches.at(-1);

  if (amountMatches.length >= 2) {
    selectedAmountMatch = amountMatches.at(-2);
  }

  const parsedAmount = Number(selectedAmountMatch[1].replace(/\$/g, "").replace(/,/g, ""));

  if (!Number.isFinite(parsedAmount) || Math.abs(parsedAmount) === 0) {
    return null;
  }

  const description = cleanImportedDescription(
    line
      .replace(dateMatch[0], "")
      .replace(selectedAmountMatch[0], "")
      .replace(/\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/, "")
      .replace(/\s+/g, " ")
      .trim(),
  );

  if (!description || /^\d/.test(description)) {
    return null;
  }

  return buildImportedTransaction({
    description,
    amount: parsedAmount,
    documentType,
    dateMatch,
    sourceLabel,
    parserStrategy: "bank_statement",
  });
}

function parseGenericImportLine(line, documentType, sourceLabel) {
  const dateMatch = findDateMatch(line);
  const amountMatches = findAmountTokens(line);
  const amountMatch = amountMatches.at(-1);

  if (!amountMatch || looksLikeStatementNoise(line)) {
    return null;
  }

  const parsedAmount = Number(amountMatch[1].replace(/\$/g, "").replace(/,/g, ""));

  if (!Number.isFinite(parsedAmount) || Math.abs(parsedAmount) === 0) {
    return null;
  }

  const description = cleanImportedDescription(
    line
      .replace(dateMatch?.[0] ?? "", "")
      .replace(amountMatch[0], "")
      .replace(/\s+/g, " ")
      .trim(),
  );

  return buildImportedTransaction({
    description,
    amount: parsedAmount,
    documentType,
    dateMatch,
    sourceLabel,
    parserStrategy: "generic",
  });
}

function parseStructuredImportLine(line, documentType, sourceLabel, statementSource) {
  if (statementSource === "credit-card") {
    return parseCreditCardStatementLine(line, documentType, sourceLabel) || parseGenericImportLine(line, documentType, sourceLabel);
  }

  if (statementSource === "bank-statement") {
    return parseBankStatementLine(line, documentType, sourceLabel) || parseGenericImportLine(line, documentType, sourceLabel);
  }

  if (statementSource === "generic") {
    return parseGenericImportLine(line, documentType, sourceLabel);
  }

  return (
    parseCreditCardStatementLine(line, documentType, sourceLabel)
    || parseBankStatementLine(line, documentType, sourceLabel)
    || parseGenericImportLine(line, documentType, sourceLabel)
  );
}

export function parseImportedText(rawText, options = {}, legacySourceLabel = "AI document scan") {
  const config = typeof options === "string"
    ? {
        documentType: options,
        sourceLabel: legacySourceLabel,
      }
    : options;
  const documentType = config.documentType || "mixed";
  const sourceLabel = config.sourceLabel || "AI document scan";
  const statementSource =
    config.statementSource && config.statementSource !== "auto"
      ? config.statementSource
      : inferStatementSource(rawText, sourceLabel);

  return buildImportCandidateLines(rawText, statementSource)
    .map((line) => parseStructuredImportLine(line, documentType, sourceLabel, statementSource))
    .filter(Boolean);
}

export function createImportReviewItems(entries, existingTransactions) {
  return entries.map((entry) => {
    const duplicateMatch = findDuplicateTransaction(entry, existingTransactions);
    return {
      ...entry,
      approved: !duplicateMatch,
      duplicate: Boolean(duplicateMatch),
      duplicateId: duplicateMatch?.id ?? null,
      duplicateReason: duplicateMatch
        ? `Matches existing transaction "${duplicateMatch.description}" on ${duplicateMatch.date}.`
        : "",
    };
  });
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
