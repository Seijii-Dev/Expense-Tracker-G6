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

import { Ionicons } from "@expo/vector-icons";

export const CATEGORY_ICON_NAMES: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Food: "restaurant-outline",
  Transport: "car-outline",
  School: "school-outline",
  Shopping: "cart-outline",
  Bills: "receipt-outline",
  Fun: "game-controller-outline",
  Health: "heart-outline",
  Other: "grid-outline",
};

export const PAYMENT_ICON_NAMES: Record<Payment, keyof typeof Ionicons.glyphMap> = {
  Cash: "cash-outline",
  GCash: "phone-portrait-outline",
  Card: "card-outline",
  Bank: "business-outline",
};

export const PAYMENT_ICON_COLORS: Record<Payment, string> = {
  Cash: "#3F8F74",
  GCash: "#007DFE",
  Card: "#EB6F61",
  Bank: "#4D8AF0",
};
