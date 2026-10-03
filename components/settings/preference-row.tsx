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
  const { colors, dark } = useTheme();

  return (
    <View
      style={[
        styles.preference,
        !last && [styles.preferenceBorder, { borderBottomColor: colors.border }],
      ]}
    >
      <View
        style={[
          styles.preferenceIcon,
          {
            backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        {icon}
      </View>
      <View style={styles.preferenceBody}>
        <Text style={[styles.preferenceTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.preferenceCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: dark ? "rgba(255,255,255,0.12)" : colors.border,
          true: colors.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  preference: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  preferenceBorder: {
    borderBottomWidth: 1,
  },
  preferenceIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  preferenceBody: {
    flex: 1,
    paddingRight: 8,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  preferenceCopy: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});

