import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme-store";

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
  children,
}: SkeletonProps) {
  const { dark } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useSharedValue(0);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled)
    );

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.5;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      pulse.value,
      [0, 1],
      [dark ? 0.35 : 0.45, dark ? 0.85 : 0.9]
    ),
  }));

  const baseColor = dark ? "rgba(255, 255, 255, 0.08)" : "#E2E8E5";

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SkeletonCircle({
  size = 40,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

export function SkeletonText({
  width = "100%",
  height = 14,
  borderRadius = 6,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <Skeleton width={width} height={height} borderRadius={borderRadius} style={style} />;
}

export function SkeletonCard({
  height = 120,
  borderRadius = 18,
  style,
  children,
}: {
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const { colors, dark } = useTheme();
  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius,
        },
        style,
      ]}
    >
      {children || <Skeleton width="100%" height={height} borderRadius={borderRadius - 4} />}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  cardContainer: {
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
  },
});
