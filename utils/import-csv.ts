import { Category, NewExpenseData, Payment } from "@/types/expense";
import { CATEGORIES, PAYMENT_METHODS } from "@/constants/categories";
import { getExpenseDateKey, getPhilippinesDate, normalizeDate } from "@/utils/date";

export interface CsvImportResult {
  success: boolean;
  importedCount: number;
  expenses: NewExpenseData[];
  errors: string[];
}

function parseCsvRecords(content: string): { records: string[][]; malformed: boolean } {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (char === '"') {
      if (inQuotes && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (inQuotes) {
        inQuotes = false;
      } else if (field.trim().length === 0) {
        field = "";
        inQuotes = true;
      } else {
        field += char;
      }
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      record.push(field.trim());
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      field = "";
      if (char === "\r" && content[index + 1] === "\n") index += 1;
      continue;
    }

    field += char;
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field.trim());
    if (record.some((value) => value.length > 0)) records.push(record);
  }

  return { records, malformed: inQuotes };
}

function parseImportDate(value: string): string | null {
  const clean = value.trim();
  if (!clean) return getPhilippinesDate();

  const storedDate = getExpenseDateKey(clean);
  if (storedDate) return storedDate;
  if (/^\d{4}-\d{2}-\d{2}(?:$|[T ])/.test(clean)) return null;

  const timestamp = Date.parse(clean);
  if (!Number.isFinite(timestamp)) return null;

  const parsed = new Date(timestamp);
  const dateKey = `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(
    parsed.getUTCDate()
  ).padStart(2, "0")}`;
  return normalizeDate(dateKey) === dateKey ? dateKey : null;
}

export function parseExpenseCsv(
  csvContent: string,
  availableCategories: readonly string[] = CATEGORIES
): CsvImportResult {
  const { records, malformed } = parseCsvRecords(csvContent);
  if (malformed) {
    return {
      success: false,
      importedCount: 0,
      expenses: [],
      errors: ["The CSV contains a quoted field that was not closed."],
    };
  }

  if (records.length < 2) {
    return {
      success: false,
      importedCount: 0,
      expenses: [],
      errors: ["The CSV file must contain a header row and at least one transaction row."],
    };
  }

  const headers = records[0].map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const dateIndex = headers.findIndex((header) => header.includes("date"));
  const descriptionIndex = headers.findIndex((header) =>
    ["desc", "note", "title"].some((key) => header.includes(key))
  );
  const categoryIndex = headers.findIndex((header) => header.includes("cat"));
  const paymentIndex = headers.findIndex((header) => header.includes("pay") || header.includes("method"));
  const amountIndex = headers.findIndex((header) =>
    ["amount", "cost", "price", "total"].some((key) => header.includes(key))
  );

  if (amountIndex === -1) {
    return {
      success: false,
      importedCount: 0,
      expenses: [],
      errors: ["Missing required 'Amount' column header in CSV."],
    };
  }

  const categoriesByName = new Map(availableCategories.map((category) => [category.toLowerCase(), category]));
  const paymentsByName = new Map(PAYMENT_METHODS.map((payment) => [payment.toLowerCase(), payment]));
  const expenses: NewExpenseData[] = [];
  const errors: string[] = [];

  for (let index = 1; index < records.length; index += 1) {
    const fields = records[index];
    const rawAmount = fields[amountIndex] ?? "";
    const amount = Number(rawAmount.replace(/[^0-9.-]/g, ""));
    const roundedAmount = Math.round(amount * 100) / 100;

    if (!Number.isFinite(amount) || !Number.isFinite(roundedAmount) || roundedAmount <= 0) {
      errors.push(`Row ${index + 1}: Invalid or zero amount "${rawAmount}".`);
      continue;
    }

    const rawDate = dateIndex === -1 ? "" : fields[dateIndex] ?? "";
    const date = parseImportDate(rawDate);
    if (!date) {
      errors.push(`Row ${index + 1}: Invalid date "${rawDate}".`);
      continue;
    }

    const rawCategory = categoryIndex === -1 ? "" : fields[categoryIndex] ?? "";
    const category = categoriesByName.get(rawCategory.trim().toLowerCase()) ?? "Other";
    const rawPayment = paymentIndex === -1 ? "" : fields[paymentIndex] ?? "";
    const payment = paymentsByName.get(rawPayment.trim().toLowerCase()) ?? "Cash";
    const rawDescription = descriptionIndex === -1 ? "" : fields[descriptionIndex] ?? "";

    expenses.push({
      amount: roundedAmount,
      description: rawDescription.trim() || category,
      category: category as Category,
      payment: payment as Payment,
      date,
    });
  }

  return {
    success: expenses.length > 0,
    importedCount: expenses.length,
    expenses,
    errors,
  };
}
