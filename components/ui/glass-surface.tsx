import { BlurView, type BlurTint } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type GlassVariant = "card" | "pill" | "sheet" | "nav";
const INTENSITY: Record<GlassVariant, number> = { pill: 18, card: 24, sheet: 34, nav: 38 };

type GlassSurfaceProps = { children?: React.ReactNode; style?: StyleProp<ViewStyle>; contentStyle?: StyleProp<ViewStyle>; radius?: number; variant?: GlassVariant; intensity?: number };

export function GlassSurface({ children, style, contentStyle, radius = 22, variant = "card", intensity }: GlassSurfaceProps) {
  const { dark, colors } = useTheme();
  const tint: BlurTint = dark ? "dark" : "light";
  return (
    <View style={[styles.base, { borderRadius: radius, borderColor: colors.glassBorder, backgroundColor: colors.glassFill, shadowColor: dark ? "#000" : "#27453E", shadowOpacity: dark ? 0.28 : 0.07, shadowRadius: variant === "pill" ? 8 : 18, shadowOffset: { width: 0, height: variant === "pill" ? 3 : 8 }, elevation: variant === "pill" ? 3 : 5 }, style]}>
      <BlurView intensity={intensity ?? INTENSITY[variant]} tint={tint} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]} />
      <LinearGradient pointerEvents="none" colors={[colors.glassRim, "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rim} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: "hidden", borderWidth: 1 },
  rim: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  content: { position: "relative", zIndex: 1 },
});
