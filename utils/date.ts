export const MANILA_TIMEZONE = "Asia/Manila";

// Cached DateTimeFormat singletons to avoid costly ICU table re-parsing
const PH_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: MANILA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const PH_HOUR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIMEZONE,
  hour: "numeric",
  hour12: false,
});

const PH_TODAY_HEADER_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIMEZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

const PH_MONTH_HEADER_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: MANILA_TIMEZONE,
  month: "long",
  year: "numeric",
});

const PH_WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: MANILA_TIMEZONE,
});

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Returns the Manila calendar day represented by a stored date. Date-only values
 * stay date-only; timestamps with an explicit timezone are interpreted as instants.
 */
export function getExpenseDateKey(value?: string): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  const dayPart = trimmed.slice(0, 10);
  if (!isValidDateKey(dayPart)) return "";

  const timePart = trimmed.slice(10);
  const hasExplicitTimezone =
    timePart.length > 0 && (/[z]$/i.test(timePart) || /[+-]\d{2}:?\d{2}$/.test(timePart));
  if (hasExplicitTimezone) {
    const instant = new Date(trimmed);
    if (!Number.isNaN(instant.getTime())) return getPhilippinesDate(instant);
  }

  return dayPart;
}

/** Adds calendar days without relying on the device's local timezone. */
export function addCalendarDays(day: string, amount: number): string {
  if (!isValidDateKey(day)) return day;
  const [year, month, date] = day.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, date + amount));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(
    shifted.getUTCDate()
  ).padStart(2, "0")}`;
}

/** Shifts a YYYY-MM calendar month without local-timezone or DST effects. */
export function shiftCalendarMonth(month: string, amount: number): string {
  if (!/^\d{4}-\d{2}$/.test(month)) return getPhilippinesDate().slice(0, 7);
  const [year, monthNumber] = month.split("-").map(Number);
  if (monthNumber < 1 || monthNumber > 12) return getPhilippinesDate().slice(0, 7);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Returns ISO date format YYYY-MM-DD in Asia/Manila timezone
 */
export function getPhilippinesDate(date = new Date()): string {
  return PH_DATE_FORMATTER.format(date);
}

/**
 * Returns ISO month format YYYY-MM in Asia/Manila timezone
 */
export function getPhilippinesMonth(date = new Date()): string {
  return getPhilippinesDate(date).slice(0, 7);
}

/**
 * Returns yesterday's date in YYYY-MM-DD in Asia/Manila timezone
 */
export function getYesterdayDate(referenceDate = new Date()): string {
  return addCalendarDays(getPhilippinesDate(referenceDate), -1);
}

/**
 * Normalizes input date string to 10-character YYYY-MM-DD or defaults to today's Manila date
 */
export function normalizeDate(date?: string): string {
  return getExpenseDateKey(date) || getPhilippinesDate();
}

/**
 * Gets the current hour in Asia/Manila (0-23)
 */
export function getPhilippinesHour(date = new Date()): number {
  return Number(PH_HOUR_FORMATTER.format(date));
}

/**
 * Returns appropriate time greeting based on Manila hour
 */
export function getTimeGreeting(date = new Date()): string {
  const hour = getPhilippinesHour(date);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Header date format (e.g., "FRIDAY, SEPTEMBER 25")
 */
export function getFormattedTodayHeader(date = new Date()): string {
  return PH_TODAY_HEADER_FORMATTER.format(date).toUpperCase();
}

/**
 * Month header format (e.g., "September 2026")
 */
export function getFormattedMonthHeader(date = new Date()): string {
  return PH_MONTH_HEADER_FORMATTER.format(date);
}

/**
 * Returns 3-letter weekday name in Asia/Manila
 */
export function getWeekdayShort(date: Date): string {
  return PH_WEEKDAY_SHORT_FORMATTER.format(date);
}
