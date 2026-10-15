import React, { useMemo } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Expense } from "@/types/expense";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryDisplayName, getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";

/** Placeholder bar widths shown while no category totals exist yet. */
const SKELETON_WIDTHS = ["58%", "88%", "42%"] as const;

interface CategoryLegendProps {
  expenses: Expense[];
  style?: StyleProp<ViewStyle>;
}

export const CategoryLegend = React.memo(function CategoryLegend({ expenses, style }: CategoryLegendProps) {
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
    const track = dark ? "rgba(255, 255, 255, 0.06)" : colors.surfaceSubtle;
    return (
      <View style={[styles.legendSkeleton, style]} accessibilityLabel="Waiting for category data">
        {SKELETON_WIDTHS.map((width, index) => (
          <View key={index} style={[styles.skeletonRow, { backgroundColor: track, width }]} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.legend, style]}>
      {totals.map(({ category, total }) => {
        const meta = getCategoryStyle(category, customCategories);
        const categoryLabel = getCategoryDisplayName(category);
        return (
          <View style={styles.legendRow} key={category}>
            <View style={styles.legendName}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: dark ? `${meta.color}25` : meta.soft,
                  },
                ]}
              >
                <CategoryIcon category={category} size={14} customCategories={customCategories} />
              </View>
              <Text style={[styles.legendText, { color: colors.foreground }]} numberOfLines={1}>
                {categoryLabel}
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
  legendSkeleton: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    paddingVertical: 10,
  },
  skeletonRow: {
    height: 10,
    borderRadius: 5,
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
    minWidth: 0,
    paddingRight: 6,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pctText: {
    fontSize: 10,
    fontWeight: "700",
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 54,
    flexShrink: 1,
    textAlign: "right",
  },
});
