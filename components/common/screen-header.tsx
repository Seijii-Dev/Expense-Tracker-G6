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
        <View
          style={[
            styles.kickerPill,
            {
              backgroundColor: dark ? "rgba(255, 117, 101, 0.14)" : colors.primarySoft,
              borderColor: dark ? "rgba(255, 117, 101, 0.28)" : "rgba(255, 101, 84, 0.22)",
            },
          ]}
        >
          <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.kicker, { color: colors.primary }]}>{kicker}</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
          <Text style={{ color: colors.primary }}>.</Text>
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
    paddingTop: 8,
    marginBottom: 20,
  },
  titleArea: {
    flex: 1,
    paddingRight: 12,
  },
  kickerPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginTop: 10,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 420,
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
});

