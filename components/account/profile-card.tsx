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
  const { colors } = useTheme();

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
    if (syncing) return "Syncing your ledger…";
    if (syncError) return "Saved locally (offline mode)";
    return "Connected & Synced";
  };

  const getStatusColor = () => {
    if (syncing) return colors.warning;
    if (syncError) return colors.muted;
    return colors.success;
  };

  return (
    <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
      </View>
      <View style={styles.profileBody}>
        <Text style={[styles.name, { color: colors.foreground }]}>{account?.name || "Your account"}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>{account?.email || "Not signed in"}</Text>
        <View style={styles.status}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor() },
            ]}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>
      <Ionicons
        name={syncError ? "cloud-offline-outline" : "shield-checkmark"}
        size={20}
        color={getStatusColor()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
  },
  profileBody: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    fontSize: 11,
    marginTop: 3,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
