import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Payment } from "@/types/expense";
import { PAYMENT_ICON_COLORS, PAYMENT_ICON_NAMES } from "@/constants/categories";

interface PaymentIconProps {
  payment: Payment;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function PaymentIcon({ payment, size = 18, color, style }: PaymentIconProps) {
  const iconName = PAYMENT_ICON_NAMES[payment] || "wallet-outline";
  const iconColor = color || PAYMENT_ICON_COLORS[payment] || "#5A7180";

  return <Ionicons name={iconName} size={size} color={iconColor} style={style} />;
}
