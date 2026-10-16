import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NeumorphicSurface } from "@/components/ui/neumorphic-surface";
import { MotionNumber, PressableScale } from "@/components/motion";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { radii, typography } from "@/constants/design-tokens";

type HealthTone = "neutral" | "healthy" | "warning" | "danger";

interface HealthState {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  chip: string;
  tone: HealthTone;
}

interface BalanceCardProps {
  amount: number;
  isHidden: boolean;
  onToggleHidden: () => void;
  budget: number;
  monthTotal: number;
  remaining: number;
  budgetPercent: number;
  onPressBudgetHealth: () => void;
}

/**
 * Available balance summary card: balance, currency badge, and a budget-health
 * strip that explains what the user still needs to set up before health can
 * be computed.
 */
export function BalanceCard({
  amount,
  isHidden,
  onToggleHidden,
  budget,
  monthTotal,
  remaining,
  budgetPercent,
  onPressBudgetHealth,
}: BalanceCardProps) {
  const { colors } = useTheme();

  const health = useMemo<HealthState>(() => {
    if (budget <= 0) {
      return {
        icon: "information-circle-outline",
        message: "Set a budget to see health",
        chip: "NO DATA",
        tone: "neutral",
      };
    }
    if (monthTotal <= 0) {
      return {
        icon: "information-circle-outline",
        message: `Log an expense to track your ${formatMoney(budget)} budget`,
        chip: "NO DATA",
        tone: "neutral",
      };
    }
    if (budgetPercent >= 100) {
      return {
        icon: "alert-circle",
        message: `Over budget by ${formatMoney(Math.max(0, monthTotal - budget))}`,
        chip: "OVER",
        tone: "danger",
      };
    }
    if (budgetPercent >= 80) {
      return {
        icon: "warning-outline",
        message: `${budgetPercent}% of budget used — ${formatMoney(remaining)} left`,
        chip: "WATCH",
        tone: "warning",
      };
    }
    return {
      icon: "shield-checkmark-outline",
      message: `${budgetPercent}% of budget used — ${formatMoney(remaining)} left`,
      chip: "HEALTHY",
      tone: "healthy",
    };
  }, [budget, budgetPercent, monthTotal, remaining]);

  const toneStyles = useMemo(() => {
    switch (health.tone) {
      case "healthy":
        return { bg: colors.successSoft, fg: colors.success };
      case "warning":
        return { bg: colors.warningSoft, fg: colors.warning };
      case "danger":
        return { bg: colors.errorSoft, fg: colors.error };
      default:
        return { bg: colors.inputBg, fg: colors.muted };
    }
  }, [colors, health.tone]);

  const amountColor = amount > 0 ? colors.foreground : colors.muted;

  return (
    <NeumorphicSurface
      variant="card"
      radius={radii.panel}
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      {/* Label + currency badge */}
      <View style={styles.topRow}>
        <PressableScale
          onPress={onToggleHidden}
          style={styles.labelRow}
          accessibilityRole="button"
          accessibilityState={{ selected: isHidden }}
          accessibilityLabel={isHidden ? "Show available balance" : "Hide available balance"}
        >
          <Text style={[styles.label, { color: colors.muted }]}>AVAILABLE BALANCE</Text>
          <Ionicons
            name={isHidden ? "eye-off-outline" : "eye-outline"}
            size={14}
            color={colors.muted}
          />
        </PressableScale>

        <View
          style={[
            styles.currencyChip,
            { backgroundColor: colors.inputBg, borderColor: colors.borderSubtle },
          ]}
          accessible
          accessibilityLabel="Currency: Philippine Peso (PHP)"
        >
          <View style={[styles.currencyDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.currencyText, { color: colors.foreground }]}>PHP (₱)</Text>
        </View>
      </View>

      {/* Balance amount */}
      <View style={styles.amountRow}>
        {isHidden ? (
          <Text style={[styles.amount, { color: colors.muted }]} numberOfLines={1}>
            ••••••••
          </Text>
        ) : (
          <MotionNumber
            value={amount}
            prefix="₱ "
            formatter={formatBalance}
            style={[styles.amount, { color: amountColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          />
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

      {/* Budget health strip */}
      <PressableScale
        onPress={onPressBudgetHealth}
        style={styles.healthRow}
        accessibilityRole="button"
        accessibilityLabel={`Monthly budget health: ${health.message}. Open budget settings.`}
      >
        <View style={[styles.healthIcon, { backgroundColor: toneStyles.bg }]}>
          <Ionicons name={health.icon} size={15} color={toneStyles.fg} />
        </View>
        <Text style={[styles.healthText, { color: colors.foreground }]} numberOfLines={2}>
          {health.message}
        </Text>
        <View style={[styles.healthChip, { backgroundColor: toneStyles.bg }]}>
          <Text style={[styles.healthChipText, { color: toneStyles.fg }]}>{health.chip}</Text>
        </View>
      </PressableScale>
    </NeumorphicSurface>
  );
}

/** Formats the MotionNumber output so the peso sign keeps its own spacing. */
function formatBalance(value: number): string {
  return formatMoney(value).replace("₱", "");
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  currencyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  currencyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  amountRow: {
    marginTop: 10,
    marginBottom: 16,
  },
  amount: {
    ...typography.moneyLarge,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  divider: {
    height: 1,
    marginHorizontal: -18,
  },
  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  healthIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  healthText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  healthChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  healthChipText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
});
