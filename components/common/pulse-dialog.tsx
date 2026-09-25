import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

interface PulseDialogProps {
  visible: boolean;
  onClose: () => void;
  budgetPercent: number;
  monthTotal: number;
  budget: number;
  remaining: number;
  formatMoney: (amount: number) => string;
}

export function PulseDialog({
  visible,
  onClose,
  budgetPercent,
  monthTotal,
  budget,
  remaining,
  formatMoney,
}: PulseDialogProps) {
  const { colors, dark } = useTheme();

  const isOver = budgetPercent >= 100;
  const isWarning = budgetPercent >= 80 && !isOver;

  // Status configuration
  const statusColor = isOver
    ? colors.error
    : isWarning
    ? colors.warning
    : colors.success;

  const statusBg = isOver
    ? "rgba(239, 68, 68, 0.12)"
    : isWarning
    ? "rgba(245, 158, 11, 0.12)"
    : "rgba(90, 158, 126, 0.14)";

  const statusBadgeText = isOver
    ? "BUDGET EXCEEDED"
    : isWarning
    ? "APPROACHING LIMIT"
    : "OPTIMAL HEALTH";

  const statusIcon: keyof typeof Ionicons.glyphMap = isOver
    ? "alert-circle"
    : isWarning
    ? "warning"
    : "checkmark-circle";

  const adviceText = isOver
    ? "You have surpassed your planned spending ceiling for this cycle. Review your recent transactions to avoid further deficit."
    : isWarning
    ? "You have utilized the majority of your budget. Consider deferring discretionary purchases until the next cycle begins."
    : "Your daily spending pace is disciplined and well within limits. Keep tracking micro-expenses to maximize your savings goals.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <GlassSurface
          variant="sheet"
          radius={28}
          style={styles.cardWrap}
          contentStyle={[styles.card, { backgroundColor: dark ? "#14222A" : "#FFFFFF" }]}
        >
          {/* Pulse Header */}
          <View style={styles.topRow}>
            <View style={[styles.iconRing, { backgroundColor: statusBg }]}>
              <Ionicons name="pulse" size={24} color={statusColor} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor }]}>
              <Ionicons name={statusIcon} size={12} color={statusColor} />
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {statusBadgeText}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>Spending Pulse</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Real-time financial velocity and budget health assessment.
          </Text>

          {/* Gauge / Progress Bar */}
          <View style={[styles.gaugeContainer, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeLabel, { color: colors.muted }]}>Budget Consumption</Text>
              <Text style={[styles.gaugePercent, { color: statusColor }]}>{budgetPercent}%</Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: "rgba(150, 150, 150, 0.18)" }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: statusColor,
                    width: `${Math.min(budgetPercent, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Metric Grid */}
          <View style={styles.metricGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>SPENT</Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1}>
                {formatMoney(monthTotal)}
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>REMAINING</Text>
              <Text
                style={[styles.metricValue, { color: remaining < 0 ? colors.error : colors.success }]}
                numberOfLines={1}
              >
                {formatMoney(remaining)}
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>TOTAL BUDGET</Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1}>
                {formatMoney(budget)}
              </Text>
            </View>
          </View>

          {/* Financial Advice Callout */}
          <View
            style={[
              styles.adviceBox,
              { backgroundColor: statusBg, borderColor: statusColor },
            ]}
          >
            <Ionicons name="bulb-outline" size={16} color={statusColor} style={styles.adviceIcon} />
            <Text style={[styles.adviceCopy, { color: colors.foreground }]}>{adviceText}</Text>
          </View>

          {/* Primary Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.dismissBtn,
              { backgroundColor: colors.primary },
              pressed && styles.btnPressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onClose();
            }}
          >
            <Text style={styles.dismissBtnText}>Got it</Text>
          </Pressable>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 380,
  },
  card: {
    padding: 22,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconRing: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  gaugeContainer: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  gaugeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  gaugePercent: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "Fraunces_700Bold",
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  adviceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  adviceIcon: {
    marginTop: 1,
    flexShrink: 0,
  },
  adviceCopy: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16.5,
  },
  dismissBtn: {
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
