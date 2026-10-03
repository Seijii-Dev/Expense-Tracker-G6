import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  copy: string;
}

export function SectionHeading({ icon, title, copy }: SectionHeadingProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.heading}>
      <View
        style={[
          styles.headingIcon,
          {
            backgroundColor: dark ? `${colors.primary}20` : colors.primarySoft,
            borderColor: `${colors.primary}30`,
          },
        ]}
      >
        {icon}
      </View>
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
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  headingTextWrap: {
    flex: 1,
  },
  headingTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 17,
    letterSpacing: -0.2,
  },
  headingCopy: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
});

