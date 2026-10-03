import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentIcon } from "@/components/ui/payment-icon";
import { PaymentTotal } from "@/hooks/useReportMetrics";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";
import { PAYMENT_ICON_COLORS } from "@/constants/categories";

interface PaymentMethodsProps {
  paymentTotals: PaymentTotal[];
  monthTotal: number;
}

export function PaymentMethods({ paymentTotals, monthTotal }: PaymentMethodsProps) {
  const { colors, dark } = useTheme();

  if (paymentTotals.length === 0) return null;

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
            <View style={[styles.kickerDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.kicker, { color: colors.accent }]}>PAYMENT CHANNELS</Text>
          </View>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>How you paid</Text>
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
          <Ionicons name="wallet-outline" size={18} color={colors.accent} />
        </View>
      </View>

      <View style={styles.paymentGrid}>
        {paymentTotals.map(({ payment, total }) => {
          const brandColor = PAYMENT_ICON_COLORS[payment] || colors.primary;
          const pct = monthTotal > 0 ? (total / monthTotal) * 100 : 0;

          return (
            <View
              key={payment}
              style={[
                styles.paymentCard,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.paymentCardHeader}>
                <PaymentIcon payment={payment} size={22} />
                <View style={styles.paymentTitleWrap}>
                  <Text style={[styles.paymentMethod, { color: colors.foreground }]}>
                    {payment}
                  </Text>
                  <Text style={[styles.paymentPct, { color: colors.muted }]}>
                    {formatPercent(total, monthTotal)}
                  </Text>
                </View>
              </View>

              <Text style={[styles.paymentAmount, { color: colors.foreground }]}>
                {formatMoney(total)}
              </Text>

              {/* Progress bar track */}
              <View
                style={[
                  styles.miniTrack,
                  {
                    backgroundColor: dark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.04)",
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
    fontWeight: "700",
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
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  paymentCard: {
    flex: 1,
    minWidth: "46%",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  paymentTitleWrap: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 13,
    fontWeight: "700",
  },
  paymentPct: {
    fontSize: 11,
    marginTop: 1,
  },
  paymentAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  miniTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: 3,
  },
});

