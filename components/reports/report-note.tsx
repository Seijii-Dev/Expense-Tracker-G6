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
  const { colors } = useTheme();

  return (
    <View style={[styles.note, { borderBottomColor: colors.border }, last && styles.lastNote]}>
      <Text style={[styles.noteNumber, { color: colors.primary }]}>{number}</Text>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  noteBody: {
    flex: 1,
  },
  lastNote: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  noteNumber: {
    fontSize: 15,
    fontWeight: "800",
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  noteCopy: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
});
