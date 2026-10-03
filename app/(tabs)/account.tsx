import React, { useState } from "react";
import {
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
import { AboutDialog } from "@/components/common/about-dialog";
import { ProfileCard } from "@/components/account/profile-card";
import { StatCard } from "@/components/account/stat-card";
import { AccountRow } from "@/components/account/account-row";
import { AccountSkeleton } from "@/components/ui/account-skeleton";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";

export default function AccountScreen() {
  const { account, logout } = useAuth();
  const { expenses, budget, syncing, syncError, refreshExpenses, hydrated } = useExpenses();
  const { colors, dark } = useTheme();
  const [showSignOut, setShowSignOut] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const totalTracked = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const confirmSignOut = async () => {
    setShowSignOut(false);
    await logout();
    router.replace("/auth");
  };

  const showAbout = () => {
    Haptics.selectionAsync();
    setShowAboutModal(true);
  };

  if (!hydrated) {
    return (
      <ScreenContainer>
        <AccountSkeleton />
      </ScreenContainer>
    );
  }

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
        <ProfileCard account={account} syncing={syncing} syncError={syncError} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Records" value={String(expenses.length)} icon="receipt-outline" />
          <StatCard label="Tracked" value={formatMoney(totalTracked)} icon="trending-up-outline" />
          <StatCard label="Budget" value={formatMoney(budget)} icon="wallet-outline" />
        </View>

        {/* Account Actions Panel */}
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: dark ? "#000000" : "#0A1F1C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: dark ? 0.35 : 0.04,
              shadowRadius: 10,
              elevation: 2,
            },
          ]}
        >
          <View style={styles.panelHeaderRow}>
            <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionKicker, { color: colors.muted }]}>ACCOUNT SETTINGS</Text>
          </View>
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
            {
              borderColor: `${colors.primary}40`,
              backgroundColor: dark ? `${colors.primary}12` : colors.primarySoft,
            },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setShowSignOut(true);
          }}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={[styles.signOutText, { color: colors.primary }]}>Sign out of account</Text>
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

      {/* About Ledgerly Modal */}
      <AboutDialog
        visible={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  panel: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionKicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  signOutButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
