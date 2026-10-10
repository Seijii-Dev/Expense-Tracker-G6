import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentIcon } from "@/components/ui/payment-icon";
import { PaymentTotal } from "@/hooks/useReportMetrics";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";
import { PAYMENT_ICON_COLORS } from "@/constants/categories";

interface PaymentMethodsProps {
  paymentTotals: PaymentTotal[];
  periodTotal: number;
}

export function PaymentMethods({ paymentTotals, periodTotal }: PaymentMethodsProps) {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < 380;

  if (paymentTotals.length === 0) return null;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: dark ? "#000000" : "#1A1D20",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: dark ? 0.35 : 0.04,
          shadowRadius: 12,
          elevation: 2,
        },
      ]}
    >
      <View style={styles.panelHeader}>
        <View>
          <Text style={[styles.kicker, { color: colors.muted }]}>PAYMENT CHANNELS</Text>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>How you paid</Text>
        </View>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED",
              borderColor: dark ? "rgba(232, 74, 63, 0.3)" : "#FED7D2",
            },
          ]}
        >
          <Text style={styles.countBadgeText}>
            {paymentTotals.length} {paymentTotals.length === 1 ? "Method" : "Methods"}
          </Text>
        </View>
      </View>

      <View style={styles.paymentGrid}>
        {paymentTotals.map(({ payment, total }) => {
          const brandColor = PAYMENT_ICON_COLORS[payment] || colors.primary;
          const pct = periodTotal > 0 ? (total / periodTotal) * 100 : 0;

          return (
            <View
              key={payment}
              style={[
                styles.paymentCard,
                {
                  width: isNarrow ? "100%" : "48%",
                  backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.paymentCardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: dark ? `${brandColor}20` : `${brandColor}15`,
                    },
                  ]}
                >
                  <PaymentIcon payment={payment} size={20} />
                </View>
                <View style={styles.paymentTitleWrap}>
                  <Text
                    style={[styles.paymentMethod, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {payment}
                  </Text>
                  <Text style={[styles.paymentPct, { color: colors.muted }]}>
                    {formatPercent(total, periodTotal)}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.paymentAmount, { color: colors.foreground }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(total)}
              </Text>

              {/* Progress bar track */}
              <View
                style={[
                  styles.miniTrack,
                  {
                    backgroundColor: dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.miniFill,
                    {
                      width: `${Math.min(100, Math.max(4, pct))}%`,
                      backgroundColor: brandColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 20,
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
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  countBadgeText: {
    color: "#E84A3F",
    fontSize: 10.5,
    fontWeight: "700",
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  paymentCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTitleWrap: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  paymentPct: {
    fontSize: 10.5,
    fontWeight: "500",
    marginTop: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  miniTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: 2.5,
  },
});
