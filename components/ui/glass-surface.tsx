import { BlurView, type BlurTint } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { LayoutChangeEvent, Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type GlassVariant = "card" | "pill" | "sheet" | "nav" | "subtle";

const BLUR_INTENSITY: Record<GlassVariant, number> = {
  card: 16,
  pill: 12,
  sheet: 24,
  nav: 26,
  subtle: 10,
};

type GlassSurfaceProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: GlassVariant;
  intensity?: number;
  noBorder?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function GlassSurface({
  children,
  style,
  contentStyle,
  radius = 20,
  variant = "card",
  intensity,
  noBorder = false,
  onLayout,
}: GlassSurfaceProps) {
  const { dark, colors } = useTheme();
  const tint: BlurTint = dark ? "dark" : "light";
  const isWeb = Platform.OS === "web";
  const blurVal = intensity ?? BLUR_INTENSITY[variant];

  // Dynamic frosted backgrounds for clean glass look
  const glassBackground = dark
    ? variant === "nav"
      ? "rgba(18, 22, 28, 0.86)"
      : variant === "sheet"
      ? "rgba(22, 27, 34, 0.92)"
      : "rgba(22, 27, 34, 0.72)"
    : variant === "nav"
    ? "rgba(255, 255, 255, 0.88)"
    : variant === "sheet"
    ? "rgba(255, 255, 255, 0.94)"
    : "rgba(255, 255, 255, 0.78)";

  const glassBorderColor = dark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(255, 255, 255, 0.55)";

  const webBlurStyle: ViewStyle | undefined = isWeb
    ? ({
        backdropFilter: `blur(${Math.round(blurVal * 0.75)}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${Math.round(blurVal * 0.75)}px) saturate(180%)`,
      } as ViewStyle)
    : undefined;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: noBorder ? "transparent" : glassBorderColor,
          backgroundColor: isWeb ? glassBackground : undefined,
          shadowColor: dark ? "#000000" : "#1A2530",
          shadowOpacity: dark ? 0.35 : 0.05,
          shadowRadius: variant === "pill" ? 6 : variant === "nav" ? 22 : 14,
          shadowOffset: {
            width: 0,
            height: variant === "pill" ? 2 : variant === "nav" ? 8 : 4,
          },
          elevation: variant === "pill" ? 1 : variant === "nav" ? 8 : 3,
        },
        style,
      ]}
    >
      {isWeb ? (
        // Web CSS backdrop-filter with GPU hardware acceleration
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: glassBackground }, webBlurStyle]}
        />
      ) : (
        // Native BlurView for iOS and Android
        <>
          <BlurView
            intensity={blurVal}
            tint={tint}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: glassBackground }]}
          />
        </>
      )}

      {/* Subtle specular top-edge reflection for depth */}
      <LinearGradient
        pointerEvents="none"
        colors={
          dark
            ? ["rgba(255, 255, 255, 0.12)", "rgba(255, 255, 255, 0.01)"]
            : ["rgba(255, 255, 255, 0.75)", "rgba(255, 255, 255, 0.05)"]
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
    position: "relative",
  },
  rim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 2,
  },
  content: {
    position: "relative",
    zIndex: 3,
  },
});


