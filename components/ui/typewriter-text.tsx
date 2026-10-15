import React, { useEffect, useRef } from "react";
import { StyleProp, Text, TextStyle } from "react-native";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  onComplete?: () => void;
}

/** Renders the full text immediately while preserving one-time completion behavior. */
export const TypewriterText = React.memo(function TypewriterText({
  text,
  style,
  accessibilityLabel,
  onComplete,
}: TypewriterTextProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    onCompleteRef.current?.();
  }, []);

  return (
    <Text
      style={style}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || text}
    >
      {text}
    </Text>
  );
});
