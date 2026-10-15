import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

export const AmbientBackground = React.memo(function AmbientBackground() {
  const { colors } = useTheme();
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />;
});
