import React, { useMemo } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
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

// Apple iOS & Motion.dev signature fluid deceleration curve [0.16, 1, 0.3, 1]
const fluidEase = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * MotionEntrance: Buttery-smooth, hardware-accelerated entering animation.
 * Features an organic fluid ease curve [0.16, 1, 0.3, 1] with zero jitter.
 */
export function MotionEntrance({
  children,
  delay = 0,
  duration = 280,
  translateY = 8,
  direction = "down",
  enableLayoutTransition = false,
  style,
}: MotionEntranceProps) {
  const reduceMotion = useReducedMotion();
  const isWeb = Platform.OS === "web";

  const enteringAnimation = useMemo(() => {
    if (reduceMotion) return undefined;

    // Gentle micro-stagger so elements glide in seamlessly without lag
    const safeDelay = Math.min(Math.max(0, delay), 60);

    if (direction === "down") {
      return FadeInDown.duration(duration)
        .easing(fluidEase)
        .delay(safeDelay);
    }

    if (direction === "up") {
      return FadeInUp.duration(duration)
        .easing(fluidEase)
        .delay(safeDelay);
    }

    return FadeIn.duration(duration).easing(fluidEase).delay(safeDelay);
  }, [direction, delay, duration, reduceMotion]);

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


