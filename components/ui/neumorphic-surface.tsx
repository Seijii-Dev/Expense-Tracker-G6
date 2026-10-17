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

/** Shared surface primitive for quiet, readable cards and inset controls. */
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
  const shadows = inset
    ? {}
    : Platform.OS === "web"
      ? ({ boxShadow: dark
          ? `0 ${isElevated ? 12 : 5}px ${isElevated ? 30 : 18}px rgba(0, 0, 0, ${isElevated ? 0.24 : 0.12})`
          : `0 ${isElevated ? 12 : 4}px ${isElevated ? 28 : 14}px rgba(27, 43, 65, ${isElevated ? 0.12 : 0.07})`,
        } as any)
      : {
          shadowColor: "#17212F",
          shadowOpacity: dark ? (isElevated ? 0.22 : 0.14) : (isElevated ? 0.1 : 0.055),
          shadowRadius: isElevated ? 18 : 12,
          shadowOffset: { width: 0, height: isElevated ? 8 : 4 },
          elevation: isElevated ? 6 : 2,
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
          borderColor: noBorder ? "transparent" : colors.border,
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
});

