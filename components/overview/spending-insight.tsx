import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Expense } from "@/types/expense";
import { GlassSurface } from "@/components/ui/glass-surface";

interface SpendingInsightProps {
  expenses: Expense[];
}

function getTopCategoryName(expenses: Expense[]): string {
  const totals = expenses.reduce<Record<string, number>>(
    (map, expense) => ({ ...map, [expense.category]: (map[expense.category] || 0) + (expense.amount || 0) }),
    {}
  );
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : "No spending yet";
}

export function SpendingInsight({ expenses }: SpendingInsightProps) {
  const hasExpenses = expenses.length > 0;
  const topName = getTopCategoryName(expenses);

  return (
    <GlassSurface radius={24} style={styles.wrap} contentStyle={styles.insight}>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(39,69,63,0.55)", "rgba(235,111,97,0.28)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.insightIcon}>
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
      </View>
      <Text style={styles.kickerLight}>SPENDING INSIGHT</Text>
      <Text style={styles.insightTitle}>Your wallet has a pattern.</Text>
      <Text style={styles.insightCopy}>
        {hasExpenses
          ? `${topName} is currently your largest category this month.`
          : "Add your first expense to unlock spending insights and intelligent breakdowns."}
      </Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  insight: {
    minHeight: 190,
    padding: 20,
    overflow: "hidden",
  },
  insightIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#EB6F61",
  },
  kickerLight: {
    color: "#A4C8BA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  insightTitle: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginTop: 8,
  },
  insightCopy: {
    color: "#B8CEC5",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 290,
  },
});
