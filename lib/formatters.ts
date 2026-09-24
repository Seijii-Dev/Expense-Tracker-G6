import { Category, Payment } from "./expense-store";

/**
 * Currency formatter for Philippine Peso (PHP)
 */
export function formatMoney(amount: number, showDecimals = false): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `₱${safeAmount.toLocaleString("en-PH", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Pretty human-readable date format (e.g., "Sep 24, 2026")
 */
export function formatDate(dateString?: string, includeYear = true): string {
  if (!dateString) return "";
  try {
    const clean = dateString.slice(0, 10);
    const date = new Date(`${clean}T12:00:00`);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      ...(includeYear ? { year: "numeric" } : {}),
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

/**
 * Day name formatter (e.g., "Mon", "Tue")
 */
export function getWeekdayShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Manila" }).format(date);
}
