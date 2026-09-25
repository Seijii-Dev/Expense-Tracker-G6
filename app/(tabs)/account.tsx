import React, { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/common/screen-header";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ProfileCard } from "@/components/account/profile-card";
import { StatCard } from "@/components/account/stat-card";
import { AccountRow } from "@/components/account/account-row";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";

export default function AccountScreen() {
  const { account, logout } = useAuth();
  const { expenses, budget, syncing, refreshExpenses } = useExpenses();
  const { colors } = useTheme();
  const [showSignOut, setShowSignOut] = useState(false);

  const totalTracked = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const confirmSignOut = async () => {
    setShowSignOut(false);
    await logout();
    router.replace("/auth");
  };

  const showAbout = () => {
    Haptics.selectionAsync();
    Alert.alert(
      "About Ledgerly",
      "Ledgerly — Smart Spending and Savings Tracker v1.0.0\n\nBuilt for calm, deliberate money management with seamless cloud sync and instant offline access.\n\nDeveloped by Group 6."
    );
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={refreshExpenses}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <ScreenHeader
          kicker="YOUR LEDGER"
          title="Account"
          subtitle="Your profile, preferences, and spending."
        />

        {/* Profile Card */}
        <ProfileCard account={account} syncing={syncing} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Records" value={String(expenses.length)} icon="receipt-outline" />
          <StatCard label="Tracked" value={formatMoney(totalTracked)} icon="trending-up-outline" />
          <StatCard label="Budget" value={formatMoney(budget)} icon="wallet-outline" />
        </View>

        {/* Account Actions Panel */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionKicker, { color: colors.muted }]}>ACCOUNT SETTINGS</Text>
          <AccountRow
            icon="settings-outline"
            title="Preferences"
            copy="Currency, budget, and categories"
            onPress={() => router.push("/(tabs)/settings")}
          />
          <AccountRow
            icon="download-outline"
            title="Export your data"
            copy="Create a CSV backup from Settings"
            onPress={() => router.push("/(tabs)/settings")}
          />
          <AccountRow
            icon="help-circle-outline"
            title="About Ledgerly"
            copy="Simple spending, clearer decisions"
            onPress={showAbout}
            last
          />
        </View>

        {/* Sign out button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            { borderColor: colors.border, backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowSignOut(true);
          }}
        >
          <Ionicons name="log-out-outline" size={17} color={colors.primary} />
          <Text style={[styles.signOutText, { color: colors.primary }]}>Sign out</Text>
        </Pressable>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <ConfirmDialog
        visible={showSignOut}
        title="Sign out of Ledgerly?"
        message="You can sign back in anytime. Your saved expenses will remain safely in your account."
        icon="log-out-outline"
        iconColor={colors.primary}
        iconBgColor={colors.primarySoft}
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOut(false)}
        destructive
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 36,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  panel: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionKicker: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  signOutButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
