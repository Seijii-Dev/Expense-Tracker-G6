import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";

export interface ReanimatedEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "down" | "up" | "fade";
  enableLayoutTransition?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ReanimatedEntrance({
  children,
  delay = 0,
  duration = 320,
  direction = "down",
  enableLayoutTransition = false,
  style,
}: ReanimatedEntranceProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <Animated.View style={style}>
        {children}
      </Animated.View>
    );
  }

  let enteringAnimation;
  if (direction === "down") {
    enteringAnimation = FadeInDown.springify()
      .damping(22)
      .stiffness(260)
      .mass(0.65)
      .delay(delay);
  } else if (direction === "up") {
    enteringAnimation = FadeInUp.springify()
      .damping(22)
      .stiffness(260)
      .mass(0.65)
      .delay(delay);
  } else {
    enteringAnimation = FadeIn.duration(duration).delay(delay);
  }

  return (
    <Animated.View
      entering={enteringAnimation}
      layout={
        enableLayoutTransition
          ? LinearTransition.springify().damping(20).stiffness(220)
          : undefined
      }
      style={style}
    >
      {children}
    </Animated.View>
  );
}
