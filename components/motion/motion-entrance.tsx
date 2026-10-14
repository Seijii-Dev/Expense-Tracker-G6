import React, { useMemo } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";

export interface MotionEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
  enableLayoutTransition?: boolean;
  direction?: "down" | "up" | "fade";
  style?: StyleProp<ViewStyle>;
}

/**
 * MotionEntrance: Ultra-smooth, hardware-accelerated entering animation.
 * Runs on the GPU compositor / UI thread at 60/120fps with zero JavaScript bottlenecks.
 */
export function MotionEntrance({
  children,
  delay = 0,
  duration = 220,
  translateY = 8,
  direction = "down",
  enableLayoutTransition = false,
  style,
}: MotionEntranceProps) {
  const reduceMotion = useReducedMotion();
  const isWeb = Platform.OS === "web";

  const enteringAnimation = useMemo(() => {
    if (reduceMotion) return undefined;

    // Compact delay so elements appear instantly during tab switching
    const safeDelay = Math.min(Math.max(0, delay), 80);
    const safeDistance = Math.min(Math.max(4, translateY), 10);

    if (direction === "down") {
      return FadeInDown.duration(duration)
        .springify()
        .damping(24)
        .stiffness(300)
        .mass(0.5)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: safeDistance }],
        })
        .delay(safeDelay);
    }

    if (direction === "up") {
      return FadeInUp.duration(duration)
        .springify()
        .damping(24)
        .stiffness(300)
        .mass(0.5)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: -safeDistance }],
        })
        .delay(safeDelay);
    }

    return FadeIn.duration(duration).delay(safeDelay);
  }, [direction, delay, duration, translateY, reduceMotion]);

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View
      entering={enteringAnimation}
      layout={
        enableLayoutTransition
          ? LinearTransition.springify().damping(22).stiffness(280)
          : undefined
      }
      style={[
        style,
        isWeb ? ({ willChange: "opacity, transform" } as any) : undefined,
      ]}
    >
      {children}
    </Animated.View>
  );
}


