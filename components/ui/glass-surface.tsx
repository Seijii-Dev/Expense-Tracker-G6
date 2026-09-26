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
          backgroundColor: dark ? "rgba(18, 28, 36, 0.92)" : "rgba(255, 255, 255, 0.94)",
          shadowColor: dark ? "#000000" : "#4A6272",
          shadowOpacity: dark ? 0.35 : 0.08,
          shadowRadius: variant === "pill" ? 6 : 14,
          shadowOffset: { width: 0, height: variant === "pill" ? 2 : 6 },
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
      {/* Clean high-contrast glass fill */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]} />
      {/* Delicate specular glass rim highlight along top edge */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.95)",
          "rgba(255,255,255,0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rim}
      />
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
  content: {
    position: "relative",
    zIndex: 1,
  },
});
