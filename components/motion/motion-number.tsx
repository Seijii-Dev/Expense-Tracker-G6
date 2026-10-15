import React, { useEffect, useRef, useState } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

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
  duration = 320,
  style,
  ...textProps
}: MotionNumberProps) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(() => (reduceMotion ? value : 0));
  const currentValRef = useRef<number>(reduceMotion ? value : 0);
  const rafId = useRef<number | null>(null);

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
      const eased = 1 - Math.pow(1 - progress, 4);
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
    <Text style={style} {...textProps}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
}
