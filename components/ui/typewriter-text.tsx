import React, { useEffect, useRef, useState } from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

interface TypewriterTextProps {
  text: string;
  speed?: number; // Milliseconds per character
  delay?: number; // Initial delay in ms before typing starts
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  onComplete?: () => void;
}

/**
 * TypewriterText: A lightweight, accessible, one-time typing animation.
 *
 * - Respects system reduced motion (reveals immediately if enabled).
 * - Executes strictly once per mount (guarded by ref) to prevent annoying re-runs.
 * - Non-blocking: screen readers receive the full text immediately via accessibilityLabel.
 * - Properly cleans up timeouts on unmount.
 */
export const TypewriterText = React.memo(function TypewriterText({
  text,
  speed = 28,
  delay = 120,
  style,
  accessibilityLabel,
  onComplete,
}: TypewriterTextProps) {
  const reduceMotion = useReducedMotion();
  const [displayedLength, setDisplayedLength] = useState(() => (reduceMotion ? text.length : 0));
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayedLength(text.length);
      onComplete?.();
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let currentIndex = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    const delayTimer = setTimeout(() => {
      timer = setInterval(() => {
        currentIndex += 1;
        setDisplayedLength(currentIndex);
        if (currentIndex >= text.length) {
          if (timer) clearInterval(timer);
          onComplete?.();
        }
      }, Math.max(16, speed));
    }, Math.max(0, delay));

    return () => {
      clearTimeout(delayTimer);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, delay, reduceMotion, onComplete]);

  return (
    <Text
      style={style}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || text}
    >
      {text.slice(0, displayedLength)}
    </Text>
  );
});
