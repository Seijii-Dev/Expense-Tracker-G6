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
  duration = 240,
  style,
  ...textProps
}: MotionNumberProps) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const currentValRef = useRef<number>(value);
  const isInitialMount = useRef(true);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // If it's the very first mount, display value instantly with zero RAF overhead
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setDisplayValue(value);
      currentValRef.current = value;
      return;
    }

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

      // Motion.dev custom spring ease-out polynomial
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + (endVal - startVal) * eased;
      currentValRef.current = nextVal;

      // Throttle text node state updates to ~30fps (every 32ms) to eliminate React reconciliation jank
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
