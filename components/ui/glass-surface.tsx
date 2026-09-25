import { BlurView, type BlurTint } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type GlassVariant = "card" | "pill" | "sheet" | "nav";

const INTENSITY: Record<GlassVariant, number> = {
  pill: 14,
  card: 20,
  sheet: 28,
  nav: 32,
};

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
  radius = 22,
  variant = "card",
  intensity,
}: GlassSurfaceProps) {
  const { dark, colors } = useTheme();
  const tint: BlurTint = dark ? "dark" : "light";
  const blurIntensity = intensity ?? INTENSITY[variant];

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.glassBorder,
          shadowColor: dark ? "#000814" : "#6A8494",
          shadowOpacity: dark ? 0.3 : 0.08,
          shadowRadius: variant === "pill" ? 8 : 16,
          shadowOffset: { width: 0, height: variant === "pill" ? 2 : 8 },
          elevation: variant === "pill" ? 2 : 4,
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]} />
      <LinearGradient
        pointerEvents="none"
        colors={
          dark
            ? ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.03)", "rgba(120,175,255,0.1)"]
            : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.16)", "rgba(165,210,255,0.18)"]
        }
        locations={[0, 0.45, 1]}
        start={{ x: 0.02, y: 0 }}
        end={{ x: 0.98, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[colors.glassRim, "rgba(255,255,255,0)", "rgba(160,210,255,0.35)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rim}
      />
      <View pointerEvents="none" style={[styles.innerHighlight, { borderColor: colors.glassRim }]} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  rim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 21,
    opacity: 0.35,
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
