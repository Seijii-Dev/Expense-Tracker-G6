import { BlurView, type BlurTint } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type GlassVariant = "card" | "pill" | "sheet" | "nav";
const INTENSITY: Record<GlassVariant, number> = { pill: 0, card: 0, sheet: 0, nav: 24 };

type GlassSurfaceProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: GlassVariant;
  intensity?: number;
};

export function GlassSurface({
  children,
  style,
  contentStyle,
  radius = 24,
  variant = "card",
  intensity,
}: GlassSurfaceProps) {
  const { dark, colors } = useTheme();
  const tint: BlurTint = dark ? "dark" : "light";
  const isWeb = Platform.OS === "web";
  const usesGlass = variant === "nav";

  // On web, BlurView causes severe rendering lag because it triggers
  // expensive compositing. Instead we use CSS backdrop-filter (GPU-accelerated).
  const webBlurStyle: ViewStyle | undefined = isWeb && usesGlass
    ? ({
        backdropFilter: `blur(${(intensity ?? INTENSITY[variant]) * 0.4}px) saturate(1.6)`,
        WebkitBackdropFilter: `blur(${(intensity ?? INTENSITY[variant]) * 0.4}px) saturate(1.6)`,
      } as ViewStyle)
    : undefined;

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: usesGlass ? colors.glassBorder : colors.border,
          backgroundColor: usesGlass ? colors.glassFill : colors.card,
          shadowColor: dark ? "#000000" : "#1A332C",
          shadowOpacity: usesGlass ? (dark ? 0.34 : 0.07) : dark ? 0.16 : 0.035,
          shadowRadius: variant === "pill" ? 8 : usesGlass ? 18 : 12,
          shadowOffset: {
            width: 0,
            height: variant === "pill" ? 2 : usesGlass ? 7 : 3,
          },
          elevation: variant === "pill" ? 1 : usesGlass ? 6 : 2,
        },
        style,
      ]}
    >
      {usesGlass && isWeb ? (
        // CSS backdrop-filter: smooth, GPU-accelerated blur on web
        <View style={[StyleSheet.absoluteFill, webBlurStyle]} />
      ) : usesGlass ? (
        // Native BlurView (iOS / Android)
        <BlurView
          intensity={intensity ?? INTENSITY[variant]}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {usesGlass ? (
        <>
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]}
          />
          <LinearGradient
            pointerEvents="none"
            colors={
              dark
                ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.01)"]
                : ["rgba(255,255,255,0.55)", "rgba(255,255,255,0.0)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rim}
          />
        </>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
  },
  rim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});

