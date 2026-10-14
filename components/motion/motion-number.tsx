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

/**
 * MotionNumber: Motion.dev-inspired fluid numerical counter spring.
 * Seamlessly animates numbers when value updates, with full accessibility support.
 */
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

      // Motion fluid ease-out polynomial [1 - (1 - p)^4]
      const eased = 1 - Math.pow(1 - progress, 4);
      const nextVal = startVal + (endVal - startVal) * eased;
      currentValRef.current = nextVal;

      // Smooth frame updates synced to display refresh rate (16ms = 60/120fps)
      if (now - lastRender >= 16 || progress >= 1) {
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
