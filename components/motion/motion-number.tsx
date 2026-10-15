import React from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";

export interface MotionNumberProps extends Omit<TextProps, "children" | "style"> {
  value: number;
  formatter?: (val: number) => string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

/** Renders the current numeric value immediately while preserving formatting. */
export function MotionNumber({
  value,
  formatter,
  prefix = "",
  suffix = "",
  duration: _duration,
  style,
  ...textProps
}: MotionNumberProps) {
  void _duration;
  const formatted = formatter ? formatter(value) : Math.round(value).toLocaleString();

  return (
    <Text style={style} {...textProps}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
}
