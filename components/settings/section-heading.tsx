import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  copy: string;
}

export function SectionHeading({ icon, title, copy }: SectionHeadingProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.heading}>
      <View style={[styles.headingIcon, { backgroundColor: colors.primarySoft }]}>{icon}</View>
      <View style={styles.headingTextWrap}>
        <Text style={[styles.headingTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.headingCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  headingIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  headingTextWrap: {
    flex: 1,
  },
  headingTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headingCopy: {
    fontSize: 11,
    marginTop: 3,
  },
});
