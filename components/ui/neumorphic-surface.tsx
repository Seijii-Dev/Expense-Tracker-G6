import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type NeumorphicVariant = "card" | "pill" | "sheet" | "nav" | "subtle";

type NeumorphicSurfaceProps = Omit<ViewProps, "children" | "style"> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: NeumorphicVariant;
  noBorder?: boolean;
};

/** Raised and inset surfaces with solid fills and soft directional edges. */
export function NeumorphicSurface({
  children,
  style,
  contentStyle,
  radius = 20,
  variant = "card",
  noBorder = false,
  ...viewProps
}: NeumorphicSurfaceProps) {
  const { dark, colors } = useTheme();
  const inset = variant === "subtle" || variant === "pill";
  const fill = inset ? colors.surfaceSubtle : colors.surface;
  const isElevated = variant === "sheet" || variant === "nav";
  const supportsInsetShadows =
    Platform.OS === "web" ||
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Number(Platform.Version) >= 29);
  const shadows = supportsInsetShadows
    ? {
        boxShadow: inset
          ? [
              { inset: true, offsetX: 2, offsetY: 2, blurRadius: 4, color: colors.surfaceShade },
              { inset: true, offsetX: -2, offsetY: -2, blurRadius: 4, color: colors.surfaceHighlight },
            ]
          : [
              {
                offsetX: isElevated ? 8 : 5,
                offsetY: isElevated ? 8 : 5,
                blurRadius: isElevated ? 14 : 9,
                color: colors.surfaceShade,
              },
              {
                offsetX: isElevated ? -8 : -5,
                offsetY: isElevated ? -8 : -5,
                blurRadius: isElevated ? 14 : 9,
                color: colors.surfaceHighlight,
              },
            ],
      }
    : {
        shadowColor: colors.surfaceShade,
        shadowOpacity: inset ? (dark ? 0.12 : 0.18) : dark ? 0.58 : 0.72,
        shadowRadius: inset ? 2 : isElevated ? 14 : 9,
        shadowOffset: inset
          ? { width: 0, height: 1 }
          : { width: isElevated ? 7 : 5, height: isElevated ? 8 : 6 },
        elevation: inset ? 1 : isElevated ? 7 : 4,
      };

  return (
    <View
      {...viewProps}
      style={[
        styles.base,
        style,
        {
          borderRadius: radius,
          backgroundColor: fill,
          borderColor: noBorder
            ? "transparent"
            : inset
              ? colors.surfaceShade
              : colors.surfaceHighlight,
          ...shadows,
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
