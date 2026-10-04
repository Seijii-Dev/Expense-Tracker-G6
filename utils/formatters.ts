import { getExpenseDateKey, getWeekdayShort } from "./date";

/**
 * Currency formatter for Philippine Peso (PHP)
 */
export function formatMoney(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `₱${safeAmount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Pretty human-readable date format (e.g., "Sep 24, 2026")
 */
export function formatDate(dateString?: string, includeYear = true): string {
  if (!dateString) return "";
  try {
    const clean = getExpenseDateKey(dateString);
    if (!clean) return dateString;
    const [year, month, day] = clean.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      ...(includeYear ? { year: "numeric" } : {}),
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Short date format (e.g., "Sep 24")
 */
export function formatShortDate(dateString?: string): string {
  return formatDate(dateString, false);
}

/**
 * Percentage formatter (e.g., "42%")
 */
export function formatPercent(value: number, total: number): string {
  if (!total || total <= 0) return "0%";
  const pct = Math.round((value / total) * 100);
  return `${pct}%`;
}

export { getWeekdayShort };
