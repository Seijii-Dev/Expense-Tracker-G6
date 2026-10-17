import React, { useEffect, useMemo, useRef, useState } from "react";
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

/** Counts briefly to an updated value and respects reduced motion. */
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
  const [displayValue, setDisplayValue] = useState<number>(() => (reduceMotion ? value : 0));
  const currentValRef = useRef<number>(reduceMotion ? value : 0);
  const rafId = useRef<number | null>(null);
  const previousValue = useRef(value);
  const [popVersion, setPopVersion] = useState(0);

  // Replay the pop only when the source value changes, not on each counter frame.
  useEffect(() => {
    if (previousValue.current !== value) {
      previousValue.current = value;
      setPopVersion((version) => version + 1);
    }
  }, [value]);

  const popIn = useMemo(
    () =>
      reduceMotion
        ? undefined
        : FadeInUp.duration(motionDuration.standard)
            .easing(motionEasing.enter)
            .withInitialValues({
              opacity: 0,
              transform: [{ translateY: 8 }],
            }),
    [reduceMotion],
  );

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      currentValRef.current = value;
      return;
    }

    const startVal = currentValRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    const startTime = performance.now();
    let lastRender = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quickly, then settle at the final value.
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + (endVal - startVal) * eased;
      currentValRef.current = nextVal;

      // Keep React updates near 30fps so several counters can animate together
      // without flooding the JS thread on entry-level phones.
      if (now - lastRender >= 32 || progress >= 1) {
        setDisplayValue(nextVal);
        lastRender = now;
      }

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        currentValRef.current = endVal;
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [value, duration, reduceMotion]);

  const formatted = formatter
    ? formatter(displayValue)
    : Math.round(displayValue).toLocaleString();

  return (
    <Animated.Text key={popVersion} entering={popIn} style={style} {...textProps}>
      {prefix}
      {formatted}
      {suffix}
    </Animated.Text>
  );
}

