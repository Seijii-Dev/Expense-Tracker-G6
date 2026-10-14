import React, { useEffect, useState } from "react";
import { AccessibilityInfo, StyleProp, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
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
  const [reduceMotion, setReduceMotion] = useState(false);

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
      .stiffness(280)
      .mass(0.6)
      .delay(delay);
  } else if (direction === "up") {
    enteringAnimation = FadeInUp.springify()
      .damping(22)
      .stiffness(280)
      .mass(0.6)
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
