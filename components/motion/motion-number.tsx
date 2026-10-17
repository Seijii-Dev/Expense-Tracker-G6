import React, { useMemo } from "react";
import { StyleProp, TextProps, TextStyle } from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";
import { motionDuration, motionEasing } from "@/constants/motion";

export interface MotionNumberProps extends Omit<TextProps, "children" | "style"> {
  value: number;
  formatter?: (val: number) => string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

/** Reveals updated financial values without per-frame React state updates. */
export function MotionNumber({
  value,
  formatter,
  prefix = "",
  suffix = "",
  duration = motionDuration.number,
  style,
  ...textProps
}: MotionNumberProps) {
  const reduceMotion = useReducedMotion();

  const entering = useMemo(() => {
    if (reduceMotion) return undefined;

    return FadeInUp.duration(Math.max(120, Math.min(duration, 220)))
      .easing(motionEasing.enter)
      .withInitialValues({
        opacity: 0,
        transform: [{ translateY: 4 }],
      });
  }, [duration, reduceMotion]);

  const formatted = formatter ? formatter(value) : Math.round(value).toLocaleString();

  return (
    <Animated.Text key={value} entering={entering} style={style} {...textProps}>
      {prefix}
      {formatted}
      {suffix}
    </Animated.Text>
  );
}

