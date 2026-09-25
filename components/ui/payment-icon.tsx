import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import { Payment } from "@/types/expense";
import { PAYMENT_ICONS } from "@/constants/categories";

interface PaymentIconProps {
  payment: Payment;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function PaymentIcon({ payment, size = 20, style }: PaymentIconProps) {
  const source = PAYMENT_ICONS[payment] || PAYMENT_ICONS.Cash;
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
}
