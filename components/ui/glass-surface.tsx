import { BlurView, type BlurTint } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type GlassVariant = "card" | "pill" | "sheet" | "nav";
const INTENSITY: Record<GlassVariant, number> = { pill: 20, card: 28, sheet: 40, nav: 44 };

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

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: colors.glassBorder,
          backgroundColor: colors.glassFill,
          shadowColor: dark ? "#000000" : "#1A332C",
          shadowOpacity: dark ? 0.38 : 0.08,
          shadowRadius: variant === "pill" ? 10 : variant === "nav" ? 24 : 20,
          shadowOffset: {
            width: 0,
            height: variant === "pill" ? 3 : variant === "nav" ? 8 : 6,
          },
          elevation: variant === "pill" ? 3 : variant === "nav" ? 8 : 5,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity ?? INTENSITY[variant]}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]}
      />
      {/* Specular high-light rim at top */}
      <LinearGradient
        pointerEvents="none"
        colors={
          dark
            ? ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.02)"]
            : ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.0)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rim}
      />
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

