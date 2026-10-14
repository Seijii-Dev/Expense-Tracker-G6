import { Category, NewExpenseData, Payment } from "@/types/expense";
import { CATEGORIES, PAYMENT_METHODS } from "@/constants/categories";
import { getPhilippinesDate, normalizeDate } from "@/utils/date";

export interface CsvImportResult {
  success: boolean;
  importedCount: number;
  expenses: NewExpenseData[];
  errors: string[];
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseExpenseCsv(csvContent: string): CsvImportResult {
  const errors: string[] = [];
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      importedCount: 0,
      expenses: [],
      errors: ["The CSV file must contain a header row and at least one transaction row."],
    };
  }

  const rawHeaders = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  
  // Find column indices
  const dateIdx = rawHeaders.findIndex((h) => h.includes("date"));
  const descIdx = rawHeaders.findIndex((h) => h.includes("desc") || h.includes("note") || h.includes("title"));
  const catIdx = rawHeaders.findIndex((h) => h.includes("cat"));
  const payIdx = rawHeaders.findIndex((h) => h.includes("pay") || h.includes("method"));
  const amtIdx = rawHeaders.findIndex((h) => h.includes("amount") || h.includes("cost") || h.includes("price") || h.includes("total"));

  if (amtIdx === -1) {
    return {
      success: false,
      importedCount: 0,
      expenses: [],
      errors: ["Missing required 'Amount' column header in CSV."],
    };
  }

  const validCategories = new Set<string>(CATEGORIES);
  const validPayments = new Set<string>(PAYMENT_METHODS);
  const parsedExpenses: NewExpenseData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length <= 1) continue;

    const rawAmt = fields[amtIdx]?.replace(/[^0-9.-]/g, "");
    const amount = parseFloat(rawAmt || "0");
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: Invalid or zero amount "${fields[amtIdx]}".`);
      continue;
    }

    const rawDate = dateIdx !== -1 ? fields[dateIdx] : "";
    const parsedDate = rawDate && !isNaN(Date.parse(rawDate)) ? normalizeDate(rawDate) : getPhilippinesDate();

    const rawCat = catIdx !== -1 ? fields[catIdx] : "";
    const category: Category = validCategories.has(rawCat) ? (rawCat as Category) : "Other";

    const rawPay = payIdx !== -1 ? fields[payIdx] : "";
    const payment: Payment = validPayments.has(rawPay) ? (rawPay as Payment) : "Cash";

    const rawDesc = descIdx !== -1 ? fields[descIdx] : "";
    const description = rawDesc.trim() || category;

    parsedExpenses.push({
      amount: Math.round(amount * 100) / 100,
      description,
      category,
      payment,
      date: parsedDate,
    });
  }

  return {
    success: parsedExpenses.length > 0,
    importedCount: parsedExpenses.length,
    expenses: parsedExpenses,
    errors,
  };
}
