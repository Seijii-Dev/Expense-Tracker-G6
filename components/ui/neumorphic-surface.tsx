import React from "react";
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type NeumorphicVariant = "card" | "pill" | "sheet" | "nav" | "subtle";

type NeumorphicSurfaceProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: NeumorphicVariant;
  noBorder?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/** Raised and inset surfaces with solid fills and soft directional edges. */
export function NeumorphicSurface({
  children,
  style,
  contentStyle,
  radius = 20,
  variant = "card",
  noBorder = false,
  onLayout,
}: NeumorphicSurfaceProps) {
  const { dark, colors } = useTheme();
  const inset = variant === "subtle" || variant === "pill";
  const fill = inset ? colors.surfaceSubtle : colors.surface;
  const isElevated = variant === "sheet" || variant === "nav";

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.base,
        style,
        {
          borderRadius: radius,
          backgroundColor: fill,
          borderColor: noBorder ? "transparent" : inset ? colors.surfaceShade : colors.surfaceHighlight,
          shadowColor: colors.surfaceShade,
          shadowOpacity: inset ? (dark ? 0.12 : 0.18) : dark ? 0.58 : 0.72,
          shadowRadius: inset ? 2 : isElevated ? 14 : 9,
          shadowOffset: inset
            ? { width: 0, height: 1 }
            : { width: isElevated ? 7 : 5, height: isElevated ? 8 : 6 },
          elevation: inset ? 1 : isElevated ? 7 : 4,
          // Keep the raised shadow visible even when a screen needs its
          // content clipped to the rounded corners.
          overflow: "visible",
        },
      ]}
    >
      <View style={[styles.content, { borderRadius: Math.max(0, radius - 1) }, contentStyle]}>
        {children}
      </View>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.edge,
          {
            borderRadius: radius,
            borderTopColor: inset ? colors.surfaceShade : colors.surfaceHighlight,
            borderLeftColor: inset ? colors.surfaceShade : colors.surfaceHighlight,
            borderBottomColor: inset ? colors.surfaceHighlight : colors.surfaceShade,
            borderRightColor: inset ? colors.surfaceHighlight : colors.surfaceShade,
            opacity: noBorder ? 0 : dark ? 0.72 : 0.82,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "visible",
    borderWidth: 1,
    position: "relative",
  },
  content: {
    position: "relative",
    overflow: "hidden",
  },
  edge: {
    borderWidth: 1,
  },
});
