import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Expense } from "@/types/expense";
import { GlassSurface } from "@/components/ui/glass-surface";
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
  const { dark } = useTheme();
  const hasExpenses = expenses.length > 0;
  const topInfo = React.useMemo(() => getTopCategoryInfo(expenses), [expenses]);

  const gradientColors: [string, string, string] = dark
    ? ["#0F241F", "#0B1D19", "#081412"]
    : ["#144238", "#184F43", "#103930"];

  return (
    <GlassSurface radius={26} style={styles.wrap} contentStyle={styles.insight}>
      <LinearGradient
        pointerEvents="none"
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Aura Spot */}
      <View style={styles.auraBlob} />

      <View style={styles.headerRow}>
        <View style={styles.insightIcon}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FINANCIAL RADAR</Text>
        </View>
      </View>

      <Text style={styles.insightTitle}>Your wallet has a pattern.</Text>
      <Text style={styles.insightCopy}>
        {hasExpenses && topInfo
          ? `${topInfo.name} leads your budget this month at ${formatMoney(topInfo.total)}. Keeping track of small purchases here can unlock major monthly savings.`
          : "Add your everyday expenses to unlock automated spending velocity analysis and personalized category breakdowns."}
      </Text>

      <View style={styles.footerRow}>
        <Ionicons name="shield-checkmark" size={13} color="#6EE7B7" />
        <Text style={styles.footerText}>Updated continuously from your records</Text>
      </View>
    </GlassSurface>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  insight: {
    minHeight: 180,
    padding: 22,
    overflow: "hidden",
  },
  auraBlob: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FF6554",
    shadowColor: "#FF6554",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(110, 231, 183, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(110, 231, 183, 0.28)",
  },
  badgeText: {
    color: "#6EE7B7",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  insightTitle: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 23,
    letterSpacing: -0.6,
    marginTop: 4,
  },
  insightCopy: {
    color: "#D1E7DD",
    fontSize: 12.5,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 380,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  footerText: {
    color: "#A7D6C4",
    fontSize: 10,
    fontWeight: "600",
  },
});

