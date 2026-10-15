import React from "react";
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type GlassVariant = "card" | "pill" | "sheet" | "nav" | "subtle";

type GlassSurfaceProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: GlassVariant;
  noBorder?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function GlassSurface({
  children,
  style,
  contentStyle,
  radius = 20,
  variant = "card",
  noBorder = false,
  onLayout,
}: GlassSurfaceProps) {
  const { dark, colors } = useTheme();

  const glassBackground = dark
    ? variant === "subtle" ? colors.surfaceSubtle : colors.card
    : colors.surface;

  const glassBorderColor = colors.border;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: noBorder ? "transparent" : glassBorderColor,
          backgroundColor: glassBackground,
          shadowColor: dark ? "#000000" : "#1A2530",
          shadowOpacity: dark ? 0.12 : 0.025,
          shadowRadius: variant === "nav" ? 8 : 4,
          shadowOffset: { width: 0, height: variant === "nav" ? 3 : 1 },
          elevation: variant === "nav" ? 2 : 1,
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  content: {
    position: "relative",
  },
});


