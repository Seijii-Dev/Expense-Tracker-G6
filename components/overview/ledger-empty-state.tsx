import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassSurface } from "@/components/ui/glass-surface";
import { PressableScale } from "@/components/motion";
import { useTheme } from "@/lib/theme-store";
import { radii } from "@/constants/design-tokens";

interface LedgerEmptyStateProps {
  onLogExpense: () => void;
  onSetBudget: () => void;
}

/**
 * Hero empty state shown while the ledger has no records: explains the product
 * promise and routes the user straight into logging an expense or setting a
 * monthly budget.
 */
export function LedgerEmptyState({ onLogExpense, onSetBudget }: LedgerEmptyStateProps) {
  const { colors } = useTheme();

  return (
    <GlassSurface
      variant="card"
      radius={radii.panel}
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      <View style={styles.iconCluster}>
        <View style={[styles.glow, { backgroundColor: `${colors.primary}14` }]} />
        <View
          style={[
            styles.iconTile,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}33`,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Ionicons name="receipt" size={26} color={colors.primary} />
        </View>
        <View
          style={[
            styles.plusBadge,
            { backgroundColor: colors.primary, borderColor: colors.card },
          ]}
        >
          <Ionicons name="add" size={12} color="#FFFFFF" />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Your ledger is empty</Text>
      <Text style={[styles.copy, { color: colors.muted }]}>
        Ready to take control of your finances? Start by logging your first expense or setting a
        monthly budget.
      </Text>

      <PressableScale
        onPress={onLogExpense}
        accessibilityRole="button"
        accessibilityLabel="Log your first expense"
        style={[
          styles.primaryBtn,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
          Platform.OS === "web" ? ({ cursor: "pointer" } as any) : null,
        ]}
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        <Text style={styles.primaryBtnText}>Log your first expense</Text>
      </PressableScale>

      <PressableScale
        onPress={onSetBudget}
        accessibilityRole="button"
        accessibilityLabel="Set a monthly budget"
        style={styles.secondaryBtn}
      >
        <Text style={[styles.secondaryBtnText, { color: colors.muted }]}>
          Set a monthly budget
        </Text>
      </PressableScale>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardContent: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 22,
  },
  iconCluster: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  glow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  iconTile: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  plusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.35,
    textAlign: "center",
    marginTop: 6,
  },
  copy: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 270,
    marginTop: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    minHeight: 52,
    marginTop: 20,
    borderRadius: 16,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  primaryBtnText: {
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 32,
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
