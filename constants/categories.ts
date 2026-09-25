import { Category, CategoryMeta, Payment } from "@/types/expense";

export const CATEGORIES: readonly Category[] = [
  "Food",
  "Transport",
  "School",
  "Shopping",
  "Bills",
  "Fun",
  "Health",
  "Other",
] as const;

export const PAYMENT_METHODS: readonly Payment[] = [
  "Cash",
  "GCash",
  "Card",
  "Bank",
] as const;

export const CATEGORY_META: CategoryMeta = {
  Food: { color: "#EB6F61", soft: "#FFF0ED" },
  Transport: { color: "#4D8AF0", soft: "#EEF4FF" },
  School: { color: "#8A69DC", soft: "#F2EFFF" },
  Shopping: { color: "#D18B38", soft: "#FFF5E6" },
  Bills: { color: "#5A9E7E", soft: "#EDF8F1" },
  Fun: { color: "#C45BA7", soft: "#FFF0FA" },
  Health: { color: "#45A6AD", soft: "#EAF9FA" },
  Other: { color: "#82908D", soft: "#F1F4F3" },
};

// Default fallback styling for categories
export const DEFAULT_CATEGORY_STYLE = CATEGORY_META.Other;

export const CATEGORY_ICONS: Record<Category, any> = {
  Food: require("@/assets/icons/categories/food.png"),
  Transport: require("@/assets/icons/categories/transport.png"),
  School: require("@/assets/icons/categories/school.png"),
  Shopping: require("@/assets/icons/categories/shopping.png"),
  Bills: require("@/assets/icons/categories/bills.png"),
  Fun: require("@/assets/icons/categories/fun.png"),
  Health: require("@/assets/icons/categories/health.png"),
  Other: require("@/assets/icons/categories/other.png"),
};

export const PAYMENT_ICONS: Record<Payment, any> = {
  Cash: require("@/assets/icons/payments/cash.png"),
  GCash: require("@/assets/icons/payments/gcash.png"),
  Card: require("@/assets/icons/payments/card.png"),
  Bank: require("@/assets/icons/payments/bank.png"),
};
