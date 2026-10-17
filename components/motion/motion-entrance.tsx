import React, { useMemo } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";
import { motionDuration, motionEasing } from "@/constants/motion";

export interface MotionEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  enableLayoutTransition?: boolean;
  direction?: "down" | "up" | "fade";
  style?: StyleProp<ViewStyle>;
}
/** Adds a short entrance transition to a screen section. */
export function MotionEntrance({
  children,
  delay = 0,
  duration = motionDuration.section,
  translateY = 6,
  direction = "down",
  enableLayoutTransition = false,
  style,
}: MotionEntranceProps) {
  const reduceMotion = useReducedMotion();
  const isWeb = Platform.OS === "web";

  const enteringAnimation = useMemo(() => {
    if (reduceMotion) return undefined;

    const safeDelay = Math.min(Math.max(0, delay), 120);
    const distance = Math.max(0, translateY);

    if (direction === "down") {
      return FadeInDown.duration(duration)
        .easing(motionEasing.enter)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: -distance }],
        })
        .delay(safeDelay);
    }

    if (direction === "up") {
      return FadeInUp.duration(duration)
        .easing(motionEasing.enter)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: distance }],
        })
        .delay(safeDelay);
    }

    return FadeIn.duration(duration).easing(motionEasing.enter).delay(safeDelay);
  }, [direction, delay, duration, translateY, reduceMotion]);

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View
      entering={enteringAnimation}
      layout={
        enableLayoutTransition
          ? LinearTransition.duration(motionDuration.layout).easing(motionEasing.standard)
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

