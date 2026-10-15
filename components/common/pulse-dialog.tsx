import React, { useEffect } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

import { formatMoney as defaultFormatMoney } from "@/utils/formatters";

interface PulseDialogProps {
  visible: boolean;
  onClose: () => void;
  budgetPercent: number;
  monthTotal: number;
  budget: number;
  remaining: number;
  formatMoney?: (amount: number) => string;
}

export function PulseDialog({
  visible,
  onClose,
  budgetPercent,
  monthTotal,
  budget,
  remaining,
  formatMoney = defaultFormatMoney,
}: PulseDialogProps) {
  const { colors, dark } = useTheme();
  const reduceMotion = useReducedMotion();

  const fade = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      fade.value = reduceMotion ? 1 : withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      scale.value = reduceMotion ? 1 : withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
    } else {
      fade.value = 0;
      scale.value = 0.92;
    }
  }, [visible, fade, scale, reduceMotion]);

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }));

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
    ? "OVER BUDGET"
    : isWarning
    ? "NEAR YOUR LIMIT"
    : "ON TRACK";

  const statusIcon: keyof typeof Ionicons.glyphMap = isOver
    ? "alert-circle"
    : isWarning
    ? "warning"
    : "checkmark-circle";

  const adviceText = isOver
    ? "You’re over your budget. Check recent expenses to see where you can adjust."
    : isWarning
    ? "You’re close to your budget. Review recent expenses before spending more."
    : "You’re within your budget. Keep recording expenses to stay up to date.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Dismiss dialog"
          accessibilityRole="button"
        />
        <Animated.View style={[styles.cardWrap, dialogAnimatedStyle]}>
          <GlassSurface
            variant="sheet"
            radius={28}
            style={styles.cardContainer}
            contentStyle={[styles.card, { backgroundColor: colors.card }]}
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
            How this month’s spending compares with your budget.
          </Text>

          {/* Gauge / Progress Bar */}
          <View style={[styles.gaugeContainer, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeLabel, { color: colors.muted }]}>Budget used</Text>
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
              onClose();
            }}
          >
            <Text style={styles.dismissBtnText}>Got it</Text>
          </Pressable>
          </GlassSurface>
        </Animated.View>
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
  cardContainer: {
    width: "100%",
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
    fontFamily: "DMSans_700Bold",
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
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
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
    width: "100%",
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
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
