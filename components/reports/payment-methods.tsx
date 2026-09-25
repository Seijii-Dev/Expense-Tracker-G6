import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentIcon } from "@/components/ui/payment-icon";
import { PaymentTotal } from "@/hooks/useReportMetrics";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";

interface PaymentMethodsProps {
  paymentTotals: PaymentTotal[];
  monthTotal: number;
}

export function PaymentMethods({ paymentTotals, monthTotal }: PaymentMethodsProps) {
  const { colors } = useTheme();

  if (paymentTotals.length === 0) return null;

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={[styles.kicker, { color: colors.primary }]}>PAYMENT CHANNELS</Text>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>How you paid</Text>
        </View>
        <Ionicons name="wallet-outline" size={19} color={colors.subtle} />
      </View>

      <View style={styles.paymentGrid}>
        {paymentTotals.map(({ payment, total }) => (
          <View
            key={payment}
            style={[styles.paymentCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
          >
            <View style={styles.paymentCardHeader}>
              <PaymentIcon payment={payment} size={22} />
              <Text style={[styles.paymentMethod, { color: colors.foreground }]}>{payment}</Text>
            </View>
            <Text style={[styles.paymentAmount, { color: colors.primary }]}>{formatMoney(total)}</Text>
            <Text style={[styles.paymentPct, { color: colors.subtle }]}>
              {formatPercent(total, monthTotal)} of total
            </Text>
          </View>
        ))}
      </View>
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
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  paymentCard: {
    flex: 1,
    minWidth: "45%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 12,
    fontWeight: "700",
  },
  paymentAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  paymentPct: {
    fontSize: 9,
    marginTop: 2,
  },
});
