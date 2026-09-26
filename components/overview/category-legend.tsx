import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Expense } from "@/types/expense";
import { CATEGORIES } from "@/constants/categories";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";

interface CategoryLegendProps {
  expenses: Expense[];
}

export const CategoryLegend = React.memo(function CategoryLegend({ expenses }: CategoryLegendProps) {
  const { colors } = useTheme();

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      if (exp.category) {
        map.set(exp.category, (map.get(exp.category) || 0) + (exp.amount || 0));
      }
    }

    return CATEGORIES.map((category) => ({
      category,
      total: map.get(category) || 0,
    }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [expenses]);

  if (totals.length === 0) {
    return (
      <View style={styles.legendEmpty}>
        <Text style={[styles.legendEmptyText, { color: colors.muted }]}>No category spending yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.legend}>
      {totals.map(({ category, total }) => (
        <View style={styles.legendRow} key={category}>
          <View style={styles.legendName}>
            <CategoryIcon category={category} size={16} />
            <Text style={[styles.legendText, { color: colors.muted }]}>{category}</Text>
          </View>
          <Text style={[styles.legendAmount, { color: colors.foreground }]}>{formatMoney(total)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flex: 1,
    gap: 10,
  },
  legendEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  legendEmptyText: {
    fontSize: 11,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "500",
  },
  legendAmount: {
    fontSize: 11,
    fontWeight: "700",
  },
});
