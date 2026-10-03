import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Expense } from "@/types/expense";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";

interface CategoryLegendProps {
  expenses: Expense[];
}

export const CategoryLegend = React.memo(function CategoryLegend({ expenses }: CategoryLegendProps) {
  const { colors, dark } = useTheme();
  const { customCategories } = useExpenses();

  const { totals, grandTotal } = useMemo(() => {
    const map = new Map<string, number>();
    let sum = 0;
    for (const exp of expenses) {
      if (exp.category) {
        const val = exp.amount || 0;
        map.set(exp.category, (map.get(exp.category) || 0) + val);
        sum += val;
      }
    }

    const items = Array.from(map.entries())
      .map(([category, total]) => ({
        category,
        total,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { totals: items, grandTotal: sum };
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
      {totals.map(({ category, total }) => {
        const meta = getCategoryStyle(category, customCategories);
        return (
          <View style={styles.legendRow} key={category}>
            <View style={styles.legendName}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: dark ? `${meta.color}25` : meta.soft,
                    borderColor: dark ? `${meta.color}40` : `${meta.color}30`,
                  },
                ]}
              >
                <CategoryIcon category={category} size={14} customCategories={customCategories} />
              </View>
              <Text style={[styles.legendText, { color: colors.foreground }]} numberOfLines={1}>
                {category}
              </Text>
            </View>

            <View style={styles.rightCluster}>
              <View
                style={[
                  styles.pctBadge,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                  },
                ]}
              >
                <Text style={[styles.pctText, { color: colors.muted }]}>
                  {formatPercent(total, grandTotal)}
                </Text>
              </View>
              <Text style={[styles.legendAmount, { color: colors.foreground }]}>
                {formatMoney(total)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  legend: {
    flex: 1,
    gap: 9,
    justifyContent: "center",
  },
  legendEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
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
    flex: 1,
    paddingRight: 6,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  legendText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  pctText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  legendAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 11.5,
    fontWeight: "700",
    minWidth: 54,
    textAlign: "right",
  },
});

