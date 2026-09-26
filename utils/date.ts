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
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return getPhilippinesDate(yesterday);
}

/**
 * Normalizes input date string to 10-character YYYY-MM-DD or defaults to today's Manila date
 */
export function normalizeDate(date?: string): string {
  if (!date || typeof date !== "string") return getPhilippinesDate();
  return date.slice(0, 10);
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
