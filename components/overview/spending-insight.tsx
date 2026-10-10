import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Expense } from "@/types/expense";
import { formatMoney } from "@/utils/formatters";
import { useTheme } from "@/lib/theme-store";

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

export const SpendingInsight = React.memo(function SpendingInsight({ expenses }: SpendingInsightProps) {
  const { colors, dark } = useTheme();
  const hasExpenses = expenses.length > 0;
  const topInfo = React.useMemo(() => getTopCategoryInfo(expenses), [expenses]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : colors.surfaceSubtle,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: dark ? "rgba(16, 185, 129, 0.18)" : "#ECFDF5" }]}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Pacing beautifully!</Text>
        <Text style={[styles.copy, { color: colors.muted }]}>
          {hasExpenses && topInfo
            ? `${topInfo.name} leads your budget this month (${formatMoney(topInfo.total)}). Your spending pace is well tracked.`
            : "Your spending records remain encrypted offline and update smoothly in real time."}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
