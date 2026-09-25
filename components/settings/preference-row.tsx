import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

interface PreferenceRowProps {
  icon: React.ReactNode;
  title: string;
  copy: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}

export function PreferenceRow({
  icon,
  title,
  copy,
  value,
  onChange,
  last = false,
}: PreferenceRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.preference, !last && [styles.preferenceBorder, { borderBottomColor: colors.border }]]}>
      <View style={[styles.preferenceIcon, { backgroundColor: colors.surfaceSubtle }]}>{icon}</View>
      <View style={styles.preferenceBody}>
        <Text style={[styles.preferenceTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.preferenceCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  preference: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  preferenceBorder: {
    borderBottomWidth: 1,
  },
  preferenceIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  preferenceBody: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  preferenceCopy: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
});
