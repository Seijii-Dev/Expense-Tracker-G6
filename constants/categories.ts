import { Category, CategoryMeta, CategoryStyle, CustomCategory, Payment } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";

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
  Food: { color: "#FF6554", soft: "#FFF0ED" },
  Transport: { color: "#0EA5E9", soft: "#E0F2FE" },
  School: { color: "#6366F1", soft: "#EEF2FF" },
  Shopping: { color: "#F59E0B", soft: "#FEF3C7" },
  Bills: { color: "#10B981", soft: "#ECFDF5" },
  Fun: { color: "#EC4899", soft: "#FDF2F8" },
  Health: { color: "#14B8A6", soft: "#F0FDFA" },
  Other: { color: "#64748B", soft: "#F1F5F9" },
};

// Default fallback styling for categories
export const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  color: "#64748B",
  soft: "#F1F5F9",
};

export const CATEGORY_ICON_NAMES: Record<string, keyof typeof Ionicons.glyphMap> = {
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
  Cash: "#10B981",
  GCash: "#007DFE",
  Card: "#8B5CF6",
  Bank: "#3B82F6",
};

export const PRESET_CATEGORY_COLORS: readonly CategoryStyle[] = [
  { color: "#EB6F61", soft: "#FFF0ED" }, // Coral Red
  { color: "#4D8AF0", soft: "#EEF4FF" }, // Electric Blue
  { color: "#8A69DC", soft: "#F2EFFF" }, // Royal Violet
  { color: "#D18B38", soft: "#FFF5E6" }, // Warm Amber
  { color: "#5A9E7E", soft: "#EDF8F1" }, // Sage Green
  { color: "#C45BA7", soft: "#FFF0FA" }, // Rose Magenta
  { color: "#45A6AD", soft: "#EAF9FA" }, // Ocean Teal
  { color: "#E05353", soft: "#FEECEC" }, // Crimson
  { color: "#5352ED", soft: "#EEEDFD" }, // Iris Purple
  { color: "#2ED573", soft: "#EAFBF1" }, // Fresh Mint
  { color: "#A0522D", soft: "#F8F0EC" }, // Sienna
  { color: "#1E90FF", soft: "#E6F3FF" }, // Sky Blue
  { color: "#E67E22", soft: "#FDF2E9" }, // Sunset Orange
  { color: "#8E44AD", soft: "#F4ECF7" }, // Deep Amethyst
] as const;

export const PRESET_CATEGORY_ICONS: readonly (keyof typeof Ionicons.glyphMap)[] = [
  "pricetag-outline",
  "fitness-outline",
  "paw-outline",
  "gift-outline",
  "cafe-outline",
  "book-outline",
  "airplane-outline",
  "film-outline",
  "musical-notes-outline",
  "medkit-outline",
  "home-outline",
  "briefcase-outline",
  "shirt-outline",
  "car-sport-outline",
  "game-controller-outline",
  "beer-outline",
  "pizza-outline",
  "barbell-outline",
  "wallet-outline",
  "sparkles-outline",
  "leaf-outline",
  "bus-outline",
  "construct-outline",
  "football-outline",
] as const;

/**
 * Safely resolves category style including custom categories and fallback palette
 */
export function getCategoryStyle(category?: string | null, customCategories?: CustomCategory[]): CategoryStyle {
  if (!category) return DEFAULT_CATEGORY_STYLE;

  // 1. Check custom categories first
  if (customCategories && customCategories.length > 0) {
    const custom = customCategories.find((c) => c.name.toLowerCase() === category.toLowerCase());
    if (custom) {
      return { color: custom.color, soft: custom.soft || `${custom.color}20` };
    }
  }

  // 2. Check standard category metadata
  if (CATEGORY_META[category]) {
    return CATEGORY_META[category];
  }

  // 3. Deterministic fallback from preset colors based on category name hash
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % PRESET_CATEGORY_COLORS.length;
  return PRESET_CATEGORY_COLORS[colorIndex];
}

/**
 * Safely resolves category icon name including custom categories
 */
export function getCategoryIconName(
  category?: string | null,
  customCategories?: CustomCategory[]
): keyof typeof Ionicons.glyphMap {
  if (!category) return "pricetag-outline";

  // 1. Check custom categories
  if (customCategories && customCategories.length > 0) {
    const custom = customCategories.find((c) => c.name.toLowerCase() === category.toLowerCase());
    if (custom && custom.icon && custom.icon in Ionicons.glyphMap) {
      return custom.icon as keyof typeof Ionicons.glyphMap;
    }
  }

  // 2. Check standard icons
  if (CATEGORY_ICON_NAMES[category]) {
    return CATEGORY_ICON_NAMES[category];
  }

  return "pricetag-outline";
}

