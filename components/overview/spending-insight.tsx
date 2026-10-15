import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Expense } from "@/types/expense";
import { formatMoney } from "@/utils/formatters";
import { useTheme } from "@/lib/theme-store";
import { getCategoryDisplayName } from "@/constants/categories";

interface SpendingInsightProps {
  expenses: Expense[];
}

interface TopCategoryInfo {
  name: string;
  total: number;
}

function getTopCategoryInfo(expenses: Expense[]): TopCategoryInfo | null {
  const totals = expenses.reduce<Record<string, number>>(
    (map, expense) => ({ ...map, [expense.category]: (map[expense.category] || 0) + (expense.amount || 0) }),
    {}
  );
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return top ? { name: top[0], total: top[1] } : null;
}

import { GlassSurface } from "@/components/ui/glass-surface";

export const SpendingInsight = React.memo(function SpendingInsight({ expenses }: SpendingInsightProps) {
  const { colors, dark } = useTheme();
  const hasExpenses = expenses.length > 0;
  const topInfo = React.useMemo(() => getTopCategoryInfo(expenses), [expenses]);

  return (
    <GlassSurface
      radius={20}
      variant="card"
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: dark ? "rgba(255, 255, 255, 0.05)" : colors.surfaceSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="sparkles" size={18} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Smart Insights</Text>
        <Text style={[styles.copy, { color: colors.muted }]}>
          {hasExpenses && topInfo
            ? `Your highest expenditure this month is ${getCategoryDisplayName(topInfo.name)} at ${formatMoney(topInfo.total)}.`
            : "Once you start logging, we'll provide personalized tips to help you save more every month."}
        </Text>
      </View>
    </GlassSurface>
  );
});


const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  copy: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: "500",
  },
});
