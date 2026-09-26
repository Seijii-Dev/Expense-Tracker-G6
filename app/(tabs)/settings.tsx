import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/common/screen-header";
import { SectionHeading } from "@/components/settings/section-heading";
import { PreferenceRow } from "@/components/settings/preference-row";
import { CategoryIcon } from "@/components/ui/category-icon";
import { CATEGORIES, CATEGORY_META } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/utils/formatters";
import { exportExpensesToCsv } from "@/utils/export-csv";
import { StoragePermissionDialog } from "@/components/common/storage-permission-dialog";

const BUDGET_PRESETS = [3000, 5000, 10000, 15000, 20000] as const;

export default function SettingsScreen() {
  const { budget, setBudget, expenses, syncing, syncError, refreshExpenses } = useExpenses();
  const { dark, setDark, colors } = useTheme();
  const { account, logout } = useAuth();

  const [budgetText, setBudgetText] = useState(String(budget));
  const [budgetNudges, setBudgetNudges] = useState(true);
  const [showStorageDialog, setShowStorageDialog] = useState(false);

  useEffect(() => {
    setBudgetText(String(budget));
  }, [budget]);

  useEffect(() => {
    if (!account) return;
    const nudgeKey = STORAGE_KEYS.budgetNudges(account.email);
    AsyncStorage.getItem(nudgeKey)
      .then((val) => {
        if (val !== null) setBudgetNudges(val === "true");
      })
      .catch(() => undefined);
  }, [account?.email]);

  const toggleBudgetNudges = (value: boolean) => {
    Haptics.selectionAsync();
    setBudgetNudges(value);
    if (account) {
      const nudgeKey = STORAGE_KEYS.budgetNudges(account.email);
      AsyncStorage.setItem(nudgeKey, String(value)).catch(() => undefined);
    }
  };

  const toggleDarkMode = (value: boolean) => {
    Haptics.selectionAsync();
    setDark(value);
  };

  const handleLogout = () => {
    Alert.alert("Sign out?", "You can sign back in any time to pick up where you left off.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const commitBudget = (amount?: number) => {
    const target = amount !== undefined ? amount : parseFloat(budgetText);
    if (isNaN(target) || target < 0) {
      Alert.alert("Invalid Budget", "Please enter a valid monthly budget amount (0 or greater).");
      setBudgetText(String(budget));
      return;
    }
    const safe = Math.round(target);
    setBudgetText(String(safe));
    setBudget(safe);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleExport = async () => {
    await exportExpensesToCsv(expenses);
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
          kicker="MAKE IT YOURS"
          title="Settings"
          subtitle="Shape the way you track, manage, and back up everyday spending."
        />

        {syncError && (
          <View style={styles.syncBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#B5502E" />
            <Text style={styles.syncBannerText}>{syncError}</Text>
          </View>
        )}

        {/* Account Group */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SectionHeading
            icon={<Ionicons name="person-outline" size={17} color={colors.primary} />}
            title="Account"
            copy={account ? account.email : "Not signed in"}
          />
          <View style={styles.accountRow}>
            <Text style={[styles.accountName, { color: colors.foreground }]}>{account?.name}</Text>
            {syncing && <Text style={[styles.syncingText, { color: colors.muted }]}>Syncing…</Text>}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.outlineButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={15} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>Sign out</Text>
          </Pressable>
        </View>

        {/* Budget Preferences Group */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SectionHeading
            icon={<Ionicons name="cash-outline" size={17} color={colors.primary} />}
            title="Money preferences"
            copy="Set your default currency and monthly spending targets."
          />

          <Text style={[styles.fieldLabel, { color: colors.subtle }]}>CURRENCY</Text>
          <View style={[styles.select, { borderColor: colors.border }]}>
            <Text style={[styles.selectText, { color: colors.foreground }]}>PHP — Philippine peso (₱)</Text>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.subtle }]}>MONTHLY BUDGET TARGET</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border }]}>
            <Text style={[styles.inputPrefix, { color: colors.muted }]}>₱</Text>
            <TextInput
              value={budgetText}
              onChangeText={setBudgetText}
              onEndEditing={() => commitBudget()}
              onBlur={() => commitBudget()}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>

          {/* Budget Presets */}
          <Text style={[styles.presetLabel, { color: colors.subtle }]}>QUICK PRESETS</Text>
          <View style={styles.presetRow}>
            {BUDGET_PRESETS.map((preset) => {
              const active = budget === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => commitBudget(preset)}
                  style={[
                    styles.presetBtn,
                    { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
                    active && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primarySoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      { color: colors.muted },
                      active && { color: colors.primary, fontWeight: "700" },
                    ]}
                  >
                    {formatMoney(preset)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SectionHeading
            icon={<Ionicons name="pricetag-outline" size={17} color={colors.primary} />}
            title="Active Categories"
            copy={`${CATEGORIES.length} standardized categories keep your records tidy.`}
          />
          <View style={styles.pills}>
            {CATEGORIES.map((category) => (
              <View
                key={category}
                style={[
                  styles.pill,
                  { backgroundColor: dark ? `${CATEGORY_META[category].color}25` : CATEGORY_META[category].soft },
                ]}
              >
                <CategoryIcon category={category} size={15} />
                <Text style={[styles.pillText, { color: CATEGORY_META[category].color }]}>{category}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.outlineButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() =>
              Alert.alert(
                "Custom Categories",
                "Custom categories are in development. Your standard categories are currently active and synced."
              )
            }
          >
            <Ionicons name="add" size={15} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>Add custom category</Text>
          </Pressable>
        </View>

        {/* Display & Notifications Group */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PreferenceRow
            icon={<Ionicons name="moon-outline" size={17} color={colors.muted} />}
            title="Dark mode"
            copy="Use a darker, high-contrast palette for late hours"
            value={dark}
            onChange={toggleDarkMode}
          />
          <PreferenceRow
            icon={<Ionicons name="notifications-outline" size={17} color={colors.muted} />}
            title="Budget nudges"
            copy="Receive visual warnings when reaching 80% and 100% of budget"
            value={budgetNudges}
            onChange={toggleBudgetNudges}
            last
          />
        </View>

        {/* Data Backup & Export Group */}
        <View
          style={[
            styles.backup,
            { backgroundColor: dark ? colors.surfaceSubtle : "#FFF9F7", borderColor: colors.border },
          ]}
        >
          <View style={[styles.backupIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="download-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.kicker, { color: colors.primary }]}>YOUR DATA, YOUR SAY</Text>
          <Text style={[styles.backupTitle, { color: colors.foreground }]}>Keep a copy close.</Text>
          <Text style={[styles.backupCopy, { color: colors.muted }]}>
            Export your {expenses.length} transactions anytime as a portable CSV backup file.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.exportButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            onPress={handleExport}
          >
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportText}>Export as CSV</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.outlineButton,
              { borderColor: colors.border, marginTop: 12, alignSelf: "stretch", justifyContent: "center" },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setShowStorageDialog(true);
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>
              Storage Permission Details
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Storage Permission Dialog */}
      <StoragePermissionDialog
        visible={showStorageDialog}
        onClose={() => setShowStorageDialog(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 36,
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFF3EE",
    borderWidth: 1,
    borderColor: "#F4CBB5",
  },
  syncBannerText: {
    flex: 1,
    color: "#B5502E",
    fontSize: 11,
    lineHeight: 16,
  },
  panel: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "700",
  },
  syncingText: {
    fontSize: 11,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 8,
    marginBottom: 7,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "600",
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    height: 36,
    paddingHorizontal: 13,
    marginTop: 16,
    borderRadius: 9,
    borderWidth: 1,
  },
  outlineText: {
    fontSize: 11,
    fontWeight: "700",
  },
  backup: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  backupIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderRadius: 12,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  backupTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  backupCopy: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 18,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 10,
  },
  exportText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
