import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

interface BrandWordmarkProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
}

/**
 * Compact "LEDGERLY" brand lockup: accent spark + tracked-out wordmark.
 * Used by screen headers to keep the product identity consistent.
 */
export function BrandWordmark({ style, size = 11.5 }: BrandWordmarkProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, style]} accessible accessibilityLabel="Ledgerly">
      <Ionicons name="sparkles" size={Math.round(size + 2)} color={colors.primary} />
      <Text
        style={[
          styles.text,
          { color: colors.foreground, fontSize: size, lineHeight: size + 4 },
        ]}
      >
        LEDGERLY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontFamily: "DMSans_700Bold",
    fontWeight: "800",
    letterSpacing: 1.7,
  },
});
