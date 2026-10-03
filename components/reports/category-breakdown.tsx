import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryStyle } from "@/constants/categories";
import { CategoryTotal } from "@/hooks/useReportMetrics";
import { CustomCategory } from "@/types/expense";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";

interface CategoryBreakdownProps {
  categoryTotals: CategoryTotal[];
  monthTotal: number;
  maxCategorySpend: number;
  activeCount: number;
  customCategories?: CustomCategory[];
}

export function CategoryBreakdown({
  categoryTotals,
  monthTotal,
  maxCategorySpend,
  activeCount,
  customCategories,
}: CategoryBreakdownProps) {
  const { colors, dark } = useTheme();

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: dark ? "#000000" : "#0A1F1C",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: dark ? 0.35 : 0.04,
          shadowRadius: 10,
          elevation: 2,
        },
      ]}
    >
      <View style={styles.panelHeader}>
        <View>
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.kicker, { color: colors.primary }]}>BREAKDOWN</Text>
          </View>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>By category</Text>
        </View>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="pie-chart-outline" size={18} color={colors.primary} />
        </View>
      </View>

      {activeCount === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          title="No spending this month"
          description="Log expenses to see your category breakdown and spending share."
        />
      ) : (
        <View style={styles.bars}>
          {categoryTotals.map(({ category, total }, index) => {
            const meta = getCategoryStyle(category, customCategories);
            const percentStr = formatPercent(total, monthTotal);
            const rank = index + 1;

            return (
              <View key={category} style={styles.barRow}>
                <View style={styles.barLabels}>
                  <View style={styles.labelLeft}>
                    <View
                      style={[
                        styles.rankBadge,
                        {
                          backgroundColor:
                            rank === 1
                              ? dark
                                ? "rgba(255,101,84,0.18)"
                                : "#FFF0ED"
                              : dark
                              ? "rgba(255,255,255,0.06)"
                              : colors.surfaceSubtle,
                          borderColor: rank === 1 ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          { color: rank === 1 ? colors.primary : colors.muted },
                        ]}
                      >
                        #{rank}
                      </Text>
                    </View>
                    <CategoryIcon category={category} size={18} customCategories={customCategories} />
                    <Text
                      style={[styles.categoryLabel, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {category}
                    </Text>
                  </View>
                  <View style={styles.labelRight}>
                    <View
                      style={[
                        styles.pctPill,
                        {
                          backgroundColor: dark ? `${meta.color}20` : meta.soft,
                        },
                      ]}
                    >
                      <Text style={[styles.pctText, { color: meta.color }]}>{percentStr}</Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: colors.foreground }]}>
                      {formatMoney(total)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.track,
                    {
                      backgroundColor: dark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.04)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.fill,
                      {
                        width: total > 0 ? `${Math.min(100, Math.max(3, (total / maxCategorySpend) * 100))}%` : "0%",
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
    padding: 20,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bars: {
    gap: 16,
    marginTop: 6,
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
    flex: 1,
    paddingRight: 6,
  },
  rankBadge: {
    width: 24,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 10,
    fontWeight: "800",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  labelRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pctPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pctText: {
    fontSize: 10,
    fontWeight: "800",
  },
  categoryAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 14,
  },
  track: {
    height: 8,
    overflow: "hidden",
    borderRadius: 4,
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});

