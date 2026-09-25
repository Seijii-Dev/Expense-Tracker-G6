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
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <Text style={[styles.kicker, { color: colors.primary }]}>{kicker}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
          <Text style={[styles.dot, { color: colors.primary }]}>.</Text>
        </Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>}
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 16,
  },
  titleArea: {
    flex: 1,
    paddingRight: 10,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginTop: 6,
  },
  dot: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
  },
});
