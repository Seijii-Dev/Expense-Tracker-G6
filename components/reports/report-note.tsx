import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

interface ReportNoteProps {
  number: string;
  title: string;
  copy: string;
  last?: boolean;
}

export function ReportNote({ number, title, copy, last = false }: ReportNoteProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.note, { borderBottomColor: colors.border }, last && styles.lastNote]}>
      <View
        style={[
          styles.badgeWrap,
          {
            backgroundColor: dark ? `${colors.primary}20` : colors.primarySoft,
            borderColor: `${colors.primary}40`,
          },
        ]}
      >
        <Text style={[styles.noteNumber, { color: colors.primary }]}>{number}</Text>
      </View>
      <View style={styles.noteBody}>
        <Text style={[styles.noteTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.noteCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  badgeWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  noteBody: {
    flex: 1,
  },
  lastNote: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  noteNumber: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 13,
    fontWeight: "700",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  noteCopy: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});

