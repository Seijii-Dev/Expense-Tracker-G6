import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

interface ScreenHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ kicker, title, subtitle, rightAction }: ScreenHeaderProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <Text style={[styles.kicker, { color: colors.muted }]}>
          {kicker.toUpperCase()}
        </Text>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
        ) : null}
      </View>

      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 4,
    marginBottom: 16,
  },
  titleArea: {
    flex: 1,
    paddingRight: 12,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 420,
    fontWeight: "500",
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
});
