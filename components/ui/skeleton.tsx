import React from "react";
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
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
  const baseColor = dark ? "rgba(255, 255, 255, 0.08)" : "#E2E8E5";

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      {children}
    </View>
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
