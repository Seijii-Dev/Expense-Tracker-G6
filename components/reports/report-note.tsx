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
    <View style={[styles.note, { borderBottomColor: dark ? "rgba(255,255,255,0.06)" : colors.border }, last && styles.lastNote]}>
      <View
        style={[
          styles.badgeWrap,
          {
            backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED",
            borderColor: dark ? "rgba(232, 74, 63, 0.3)" : "#FED7D2",
          },
        ]}
      >
        <Text style={styles.noteNumber}>{number}</Text>
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
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  badgeWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  noteNumber: {
    color: "#E84A3F",
    fontSize: 11,
    fontWeight: "800",
  },
  noteBody: {
    flex: 1,
  },
  lastNote: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  noteTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  noteCopy: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  },
});
