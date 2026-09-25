import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_META } from "@/constants/categories";
import { CategoryTotal } from "@/hooks/useReportMetrics";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";

interface CategoryBreakdownProps {
  categoryTotals: CategoryTotal[];
  monthTotal: number;
  maxCategorySpend: number;
  activeCount: number;
}

export function CategoryBreakdown({
  categoryTotals,
  monthTotal,
  maxCategorySpend,
  activeCount,
}: CategoryBreakdownProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={[styles.kicker, { color: colors.primary }]}>BREAKDOWN</Text>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>By category</Text>
        </View>
        <Ionicons name="pie-chart-outline" size={19} color={colors.subtle} />
      </View>

      {activeCount === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          title="No spending this month"
          description="Log expenses to see your category breakdown and spending share."
        />
      ) : (
        <View style={styles.bars}>
          {categoryTotals.map(({ category, total }) => {
            const meta = CATEGORY_META[category];
            return (
              <View key={category} style={styles.barRow}>
                <View style={styles.barLabels}>
                  <View style={styles.labelLeft}>
                    <View style={[styles.dotMark, { backgroundColor: meta.color }]} />
                    <Text style={[styles.categoryLabel, { color: colors.foreground }]}>{category}</Text>
                    <Text style={[styles.categoryPct, { color: colors.subtle }]}>
                      ({formatPercent(total, monthTotal)})
                    </Text>
                  </View>
                  <Text style={[styles.categoryAmount, { color: colors.foreground }]}>
                    {formatMoney(total)}
                  </Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: total > 0 ? `${(total / maxCategorySpend) * 100}%` : "0%",
                        backgroundColor: meta.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  bars: {
    gap: 16,
    marginTop: 10,
  },
  barRow: {},
  barLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dotMark: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryPct: {
    fontSize: 10,
  },
  categoryAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 13,
    fontWeight: "700",
  },
  track: {
    height: 8,
    overflow: "hidden",
    borderRadius: 8,
  },
  fill: {
    height: "100%",
    borderRadius: 8,
  },
});
