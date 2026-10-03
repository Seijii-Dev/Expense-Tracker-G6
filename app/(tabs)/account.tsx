import React, { useState } from "react";
import {
  Modal,
  Platform,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AboutDialog } from "@/components/common/about-dialog";
import { AccountSkeleton } from "@/components/ui/account-skeleton";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { account, logout } = useAuth();
  const { expenses, budget, syncing, syncError, refreshExpenses, hydrated, isBalanceHidden } =
    useExpenses();
  const { colors, dark } = useTheme();

  const [showSignOut, setShowSignOut] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState<string | null>(null);
  const [infoModalBody, setInfoModalBody] = useState<string | null>(null);

  const totalTracked = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalBalance = Math.max(0, budget - totalTracked);

  const confirmSignOut = async () => {
    setShowSignOut(false);
    await logout();
    router.replace("/auth");
  };

  const handleOpenInfo = (title: string, body: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setInfoModalTitle(title);
    setInfoModalBody(body);
  };

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AccountSkeleton />
      </View>
    );
  }

  const initials =
    (account?.name || "Alex Johnson")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AJ";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={refreshExpenses}
            tintColor="#FFFFFF"
            colors={["#16382B"]}
          />
        }
      >
        {/* Top Curved Emerald Banner matching Mockup Screen 5 */}
        <View style={[styles.emeraldBanner, { paddingTop: Math.max(insets.top + 10, 24) }]}>
          {/* Top Bar with Gear Icon at right */}
          <View style={styles.bannerTopBar}>
            <View style={styles.topBarSpacer} />
            <Pressable
              style={({ pressed }) => [styles.gearBtn, pressed && styles.pressed]}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                router.push("/(tabs)/settings");
              }}
              accessibilityRole="button"
              accessibilityLabel="Open Settings"
            >
              <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* User Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarBorder}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{account?.name || "Alex Johnson"}</Text>
            <Text style={styles.userEmail}>{account?.email || "alex.johnson@example.com"}</Text>
          </View>
        </View>

        {/* Content Body Container */}
        <View style={styles.bodyContent}>
          {/* Financial Overview Card */}
          <View
            style={[
              styles.overviewCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: dark ? "#000000" : "#0A1F1C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.3 : 0.04,
                shadowRadius: 10,
                elevation: 2,
              },
            ]}
          >
            <Text style={[styles.overviewHeaderTitle, { color: colors.foreground }]}>
              Financial Overview
            </Text>
            <View style={styles.overviewGrid}>
              <View
                style={[
                  styles.overviewCol,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>Total Balance</Text>
                <Text
                  style={[styles.overviewAmount, { color: dark ? "#34D399" : "#16382B" }]}
                  numberOfLines={1}
                >
                  {isBalanceHidden ? "••••••" : formatMoney(totalBalance)}
                </Text>
              </View>

              <View
                style={[
                  styles.overviewCol,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>
                  Monthly Spending
                </Text>
                <Text
                  style={[styles.overviewAmount, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {formatMoney(totalTracked)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action List Card matching Mockup */}
          <View
            style={[
              styles.actionsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: dark ? "#000000" : "#0A1F1C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.3 : 0.04,
                shadowRadius: 10,
                elevation: 2,
              },
            ]}
          >
            {/* 1. Personal Information */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                handleOpenInfo(
                  "Personal Information",
                  `Name: ${account?.name || "Alex Johnson"}\nEmail: ${
                    account?.email || "alex.johnson@example.com"
                  }\nStatus: Active Account`
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="person-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Personal Information
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 2. Linked Accounts */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                handleOpenInfo(
                  "Linked Accounts",
                  "Local Ledger: Synchronized\nCloud Backup: Enabled\nNo external bank accounts currently linked."
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="link-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Linked Accounts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 3. Security & Privacy */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                handleOpenInfo(
                  "Security & Privacy",
                  "All financial entries are encrypted locally on your device using AES-256 standards. Your privacy is fully preserved."
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Security & Privacy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 4. Help & Support */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => setShowAboutModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="help-circle-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Help & Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 5. Log Out */}
            <Pressable
              style={({ pressed }) => [styles.actionRow, styles.lastActionRow, pressed && styles.pressed]}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setShowSignOut(true);
              }}
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="log-out-outline" size={20} color="#FF6554" />
                <Text style={[styles.actionText, { color: "#FF6554", fontWeight: "700" }]}>
                  Log Out
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FF6554" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Info Dialog Modal */}
      <Modal
        visible={Boolean(infoModalTitle)}
        animationType="fade"
        transparent
        onRequestClose={() => setInfoModalTitle(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setInfoModalTitle(null)} />
          <View
            style={[
              styles.infoModalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoModalHeader}>
              <Text style={[styles.infoModalTitle, { color: colors.foreground }]}>
                {infoModalTitle}
              </Text>
              <Pressable
                onPress={() => setInfoModalTitle(null)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.infoModalBody, { color: colors.muted }]}>
              {infoModalBody}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryModalBtn,
                { backgroundColor: "#16382B", marginTop: 20 },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setInfoModalTitle(null)}
            >
              <Text style={styles.primaryModalBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <ConfirmDialog
        visible={showSignOut}
        title="Sign out of Ledgerly?"
        message="You can sign back in anytime. Your saved expenses will remain safely in your account."
        icon="log-out-outline"
        iconColor="#FF6554"
        iconBgColor="rgba(255, 101, 84, 0.15)"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOut(false)}
        destructive
      />

      {/* About Ledgerly Modal */}
      <AboutDialog visible={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 96,
  },
  emeraldBanner: {
    backgroundColor: "#16382B",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  bannerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topBarSpacer: {
    width: 36,
  },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  profileSection: {
    alignItems: "center",
    marginTop: 4,
  },
  avatarBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#245844",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Fraunces_700Bold",
  },
  userName: {
    fontSize: 20,
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12.5,
    color: "#A7F3D0",
    marginTop: 2,
    fontWeight: "500",
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  overviewCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  overviewHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: "row",
    gap: 12,
  },
  overviewCol: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  overviewLabel: {
    fontSize: 11.5,
    fontWeight: "500",
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  actionsCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  lastActionRow: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  infoModalSheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  infoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: 18,
    fontFamily: "Fraunces_700Bold",
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoModalBody: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  primaryModalBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryModalBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
});
