import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";
import { spacing, typography } from "@/constants/design-tokens";

interface ScreenHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ kicker, title, subtitle, rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();

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
    paddingTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  titleArea: {
    flex: 1,
    paddingRight: 12,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.bodyMedium,
    marginTop: spacing.xs,
    maxWidth: 420,
    fontWeight: "500",
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
});

