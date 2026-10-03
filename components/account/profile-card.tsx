import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Account } from "@/types/auth";
import { useTheme } from "@/lib/theme-store";

interface ProfileCardProps {
  account: Account | null;
  syncing: boolean;
  syncError?: string | null;
}

export function ProfileCard({ account, syncing, syncError }: ProfileCardProps) {
  const { colors, dark } = useTheme();

  const initials =
    (account?.name || "User")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const getStatusText = () => {
    if (syncing) return "Syncing ledger…";
    if (syncError) return "Local offline";
    return "Cloud Synced";
  };

  const getStatusColor = () => {
    if (syncing) return colors.warning;
    if (syncError) return colors.muted;
    return colors.success;
  };

  const statusColor = getStatusColor();

  return (
    <View
      style={[
        styles.profileCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: dark ? "#000000" : "#0A1F1C",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: dark ? 0.35 : 0.05,
          shadowRadius: 12,
          elevation: 2,
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: dark ? `${colors.primary}25` : colors.primarySoft,
            borderColor: `${colors.primary}40`,
          },
        ]}
      >
        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
      </View>

      <View style={styles.profileBody}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {account?.name || "Your account"}
          </Text>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.email, { color: colors.muted }]} numberOfLines={1}>
          {account?.email || "Not signed in"}
        </Text>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: dark ? `${statusColor}18` : `${statusColor}12`,
              borderColor: `${statusColor}30`,
            },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{getStatusText()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
  },
  profileBody: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 17,
    letterSpacing: -0.2,
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

