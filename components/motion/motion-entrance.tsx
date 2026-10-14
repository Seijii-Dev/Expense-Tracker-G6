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
  duration = 300,
  translateY = 10,
  direction = "down",
  enableLayoutTransition = false,
  style,
}: MotionEntranceProps) {
  const reduceMotion = useReducedMotion();
  const isWeb = Platform.OS === "web";

  const enteringAnimation = useMemo(() => {
    if (reduceMotion) return undefined;

    // Organic micro-stagger: maintains natural sequencing without excessive lag
    const safeDelay = Math.min(Math.max(0, delay), 320);
    const distance = Math.max(0, translateY);

    if (direction === "down") {
      return FadeInDown.duration(duration)
        .easing(fluidEase)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: -distance }],
        })
        .delay(safeDelay);
    }

    if (direction === "up") {
      return FadeInUp.duration(duration)
        .easing(fluidEase)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: distance }],
        })
        .delay(safeDelay);
    }

    return FadeIn.duration(duration).easing(fluidEase).delay(safeDelay);
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


