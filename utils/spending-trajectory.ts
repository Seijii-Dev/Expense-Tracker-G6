import type { Expense } from "@/types/expense";
import { getExpenseDateKey, getPhilippinesDate } from "@/utils/date";

export type TrajectoryInterval = "Day" | "Weekly" | "Monthly" | "Yearly";

export type SpendingPoint = {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
};

export type SpendingTimeline = {
  interval: TrajectoryInterval;
  intervalLabel: string;
  startDate: string;
  endDate: string;
  rangeLabel: string;
  expenses: Expense[];
  points: SpendingPoint[];
  total: number;
};

function parseDay(value: string): Date | null {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [year, month, date] = day.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, date));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== date
  ) {
    return null;
  }
  return parsed;
}

function toDayString(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function addDays(day: string, count: number): string {
  const date = parseDay(day);
  if (!date) return day;
  date.setUTCDate(date.getUTCDate() + count);
  return toDayString(date);
}

function addMonths(day: string, count: number): string {
  const date = parseDay(day);
  if (!date) return day;
  const originalDate = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + count);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(originalDate, lastDay));
  return toDayString(date);
}

function monthStart(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

function yearStart(day: string): string {
  return `${day.slice(0, 4)}-01-01`;
}

function mondayStart(day: string): string {
  const date = parseDay(day);
  if (!date) return day;
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return toDayString(date);
}

function formatDay(day: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseDay(day);
  return date
    ? new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date)
    : day;
}

function formatRange(startDate: string, endDate: string): string {
  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);
  const endLabel = formatDay(endDate, { month: "short", day: "numeric", year: "numeric" });
  const startLabel = formatDay(startDate, {
    month: "short",
    day: "numeric",
    ...(startYear !== endYear ? { year: "numeric" } : {}),
  });
  return startDate === endDate ? endLabel : `${startLabel} – ${endLabel}`;
}

export function buildSpendingTimeline(
  expenses: Expense[],
  interval: TrajectoryInterval,
  selectedDate: string
): SpendingTimeline {
  const anchor = parseDay(selectedDate) ? selectedDate.slice(0, 10) : getPhilippinesDate();
  let points: SpendingPoint[];
  let startDate: string;
  let chartStartDate: string;

  if (interval === "Day") {
    chartStartDate = addDays(anchor, -6);
    startDate = anchor;
    points = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(chartStartDate, index);
      return {
        key: date,
        label: formatDay(date, { month: "numeric", day: "numeric" }),
        startDate: date,
        endDate: date,
        amount: 0,
      };
    });
  } else if (interval === "Weekly") {
    const currentWeekStart = mondayStart(anchor);
    startDate = addDays(currentWeekStart, -35);
    chartStartDate = startDate;
    points = Array.from({ length: 6 }, (_, index) => {
      const date = addDays(startDate, index * 7);
      return {
        key: date,
        label: formatDay(date, { month: "numeric", day: "numeric" }),
        startDate: date,
        endDate: addDays(date, 6),
        amount: 0,
      };
    });
  } else if (interval === "Monthly") {
    const firstMonth = addMonths(monthStart(anchor), -11);
    startDate = firstMonth;
    chartStartDate = startDate;
    points = Array.from({ length: 12 }, (_, index) => {
      const month = addMonths(firstMonth, index);
      return {
        key: month.slice(0, 7),
        label: formatDay(month, { month: "short" }),
        startDate: month,
        endDate: addDays(addMonths(month, 1), -1),
        amount: 0,
      };
    });
  } else {
    const firstYear = `${Number(anchor.slice(0, 4)) - 4}-01-01`;
    startDate = firstYear;
    chartStartDate = startDate;
    points = Array.from({ length: 5 }, (_, index) => {
      const year = Number(firstYear.slice(0, 4)) + index;
      const date = `${year}-01-01`;
      return {
        key: String(year),
        label: String(year),
        startDate: date,
        endDate: `${year}-12-31`,
        amount: 0,
      };
    });
  }

  const periodStartDate = interval === "Day" ? anchor : startDate;
  const periodExpenses = expenses.filter((expense) => {
    const date = getExpenseDateKey(expense.date);
    return Boolean(parseDay(date)) && date >= periodStartDate && date <= anchor;
  });

  const chartExpenses = expenses.filter((expense) => {
    const date = getExpenseDateKey(expense.date);
    return Boolean(parseDay(date)) && date >= chartStartDate && date <= anchor;
  });

  for (const expense of chartExpenses) {
    const date = getExpenseDateKey(expense.date);
    const point = points.find((item) => date >= item.startDate && date <= item.endDate);
    const amount = Number(expense.amount);
    if (point && Number.isFinite(amount)) point.amount += amount;
  }

  const intervalLabel = interval === "Day" ? "Daily" : interval;

  return {
    interval,
    intervalLabel,
    startDate,
    endDate: anchor,
    rangeLabel: formatRange(startDate, anchor),
    expenses: periodExpenses,
    points,
    total: periodExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
  };
}

export function shiftTrajectoryAnchorDate(
  interval: TrajectoryInterval,
  selectedDate: string,
  direction: -1 | 1
): string {
  if (interval === "Day") return addDays(selectedDate, direction);
  if (interval === "Weekly") return addDays(selectedDate, direction * 42);
  if (interval === "Monthly") return addMonths(selectedDate, direction * 12);
  return addMonths(selectedDate, direction * 60);
}
