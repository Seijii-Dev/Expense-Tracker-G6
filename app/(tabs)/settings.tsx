import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
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
import { CATEGORIES, CATEGORY_META, getCategoryStyle } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/utils/formatters";
import { exportExpensesToCsv } from "@/utils/export-csv";
import { StoragePermissionDialog } from "@/components/common/storage-permission-dialog";
import { CustomCategoryModal } from "@/components/settings/custom-category-modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const BUDGET_PRESETS = [3000, 5000, 10000, 15000, 20000] as const;

export default function SettingsScreen() {
  const {
    budget,
    setBudget,
    expenses,
    syncing,
    syncError,
    refreshExpenses,
    customCategories,
    allCategories,
    addCustomCategory,
    deleteCustomCategory,
  } = useExpenses();
  const { dark, setDark, colors } = useTheme();
  const { account, logout } = useAuth();

  const [budgetText, setBudgetText] = useState(String(budget));
  const [budgetNudges, setBudgetNudges] = useState(true);
  const [showStorageDialog, setShowStorageDialog] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [budgetNotice, setBudgetNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<{
    title: string;
    message: string;
    variant: "success" | "danger" | "warning";
  } | null>(null);

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
    try {
      Haptics.selectionAsync();
    } catch {
      // Non-fatal
    }
    setBudgetNudges(value);
    if (account) {
      const nudgeKey = STORAGE_KEYS.budgetNudges(account.email);
      AsyncStorage.setItem(nudgeKey, String(value)).catch(() => undefined);
    }
  };

  const toggleDarkMode = (value: boolean) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Non-fatal
    }
    setDark(value);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const commitBudget = (amount?: number) => {
    const target = amount !== undefined ? amount : parseFloat(budgetText);
    if (isNaN(target) || target < 0) {
      setBudgetNotice("Please enter a valid monthly budget amount (₱0 or greater).");
      setBudgetText(String(budget));
      return;
    }
    const safe = Math.round(target);
    setBudgetText(String(safe));
    setBudget(safe);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Non-fatal
    }
  };

  const handleExport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Non-fatal
    }
    const res = await exportExpensesToCsv(expenses, false);
    setExportNotice({
      title: res.title,
      message: res.message,
      variant: res.success ? "success" : "danger",
    });
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
          <SectionHeading
            icon={<Ionicons name="person-outline" size={18} color={colors.primary} />}
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
              {
                borderColor: `${colors.primary}40`,
                backgroundColor: dark ? `${colors.primary}12` : colors.primarySoft,
              },
              pressed && styles.pressed,
            ]}
            onPress={handleLogout}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={15} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>Sign out</Text>
          </Pressable>
        </View>

        {/* Budget Preferences Group */}
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
          <SectionHeading
            icon={<Ionicons name="cash-outline" size={18} color={colors.primary} />}
            title="Money preferences"
            copy="Set your default currency and monthly spending targets."
          />

          <Text style={[styles.fieldLabel, { color: colors.subtle }]}>CURRENCY</Text>
          <View style={[styles.select, { borderColor: colors.border, backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle }]}>
            <Text style={[styles.selectText, { color: colors.foreground }]}>PHP — Philippine peso (₱)</Text>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.subtle }]}>MONTHLY BUDGET TARGET</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle }]}>
            <Text style={[styles.inputPrefix, { color: colors.primary }]}>₱</Text>
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
                  style={({ pressed }) => [
                    styles.presetBtn,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? dark
                          ? `${colors.primary}25`
                          : colors.primarySoft
                        : dark
                        ? "rgba(255,255,255,0.04)"
                        : colors.surfaceSubtle,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      {
                        color: active ? colors.primary : colors.muted,
                        fontWeight: active ? "700" : "500",
                      },
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
            icon={<Ionicons name="pricetag-outline" size={18} color={colors.primary} />}
            title="Active Categories"
            copy={`${allCategories.length} categories active across your records.`}
          />
          <View style={styles.pills}>
            {allCategories.map((category) => {
              const catStyle = getCategoryStyle(category, customCategories);
              const isCustom = customCategories.some(
                (c) => c.name.toLowerCase() === category.toLowerCase()
              );
              return (
                <Pressable
                  key={category}
                  onPress={() => {
                    if (isCustom) {
                      setCategoryToDelete(category);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      backgroundColor: dark ? `${catStyle.color}25` : catStyle.soft,
                      borderColor: `${catStyle.color}40`,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <CategoryIcon category={category} size={15} customCategories={customCategories} />
                  <Text style={[styles.pillText, { color: catStyle.color }]}>{category}</Text>
                  {isCustom && (
                    <Ionicons
                      name="close-circle"
                      size={14}
                      color={catStyle.color}
                      style={{ opacity: 0.75, marginLeft: 2 }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.outlineButton,
              {
                borderColor: `${colors.primary}40`,
                backgroundColor: dark ? `${colors.primary}12` : colors.primarySoft,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {
                // Non-fatal
              }
              setShowCategoryModal(true);
            }}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>Add custom category</Text>
          </Pressable>
        </View>

        {/* Display & Notifications Group */}
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
          <PreferenceRow
            icon={<Ionicons name="moon-outline" size={18} color={colors.primary} />}
            title="Dark mode"
            copy="Use a darker, high-contrast palette for late hours"
            value={dark}
            onChange={toggleDarkMode}
          />
          <PreferenceRow
            icon={<Ionicons name="notifications-outline" size={18} color={colors.primary} />}
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
            {
              backgroundColor: dark ? "rgba(255,255,255,0.03)" : "#FFF9F7",
              borderColor: colors.border,
              shadowColor: dark ? "#000000" : "#0A1F1C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: dark ? 0.35 : 0.04,
              shadowRadius: 10,
              elevation: 2,
            },
          ]}
        >
          <View
            style={[
              styles.backupIcon,
              {
                backgroundColor: dark ? `${colors.primary}20` : colors.primarySoft,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
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
            accessibilityRole="button"
          >
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportText}>Export as CSV</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.outlineButton,
              {
                borderColor: colors.border,
                marginTop: 12,
                alignSelf: "stretch",
                justifyContent: "center",
                backgroundColor: colors.surface,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {
                // Non-fatal
              }
              setShowStorageDialog(true);
            }}
            accessibilityRole="button"
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

      {/* Custom Category Modal */}
      <CustomCategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={addCustomCategory}
        existingCategories={allCategories}
      />

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Sign out of Ledgerly?"
        message="You can sign back in any time. Your saved transactions remain safely synced in your account."
        variant="danger"
        icon="log-out-outline"
        confirmText="Sign out"
        cancelText="Cancel"
        destructive
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
          router.replace("/auth");
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Delete Custom Category Dialog */}
      <ConfirmDialog
        visible={Boolean(categoryToDelete)}
        title="Delete Custom Category"
        message={`Are you sure you want to remove "${categoryToDelete}"? Past transactions categorized under it will remain in your records.`}
        variant="danger"
        icon="trash-outline"
        confirmText="Delete category"
        cancelText="Cancel"
        destructive
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCustomCategory(categoryToDelete);
            setCategoryToDelete(null);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
      />

      {/* Invalid Budget Notice Dialog */}
      <ConfirmDialog
        visible={Boolean(budgetNotice)}
        title="Invalid Budget"
        message={budgetNotice || ""}
        variant="warning"
        icon="alert-circle-outline"
        confirmText="Understood"
        onConfirm={() => setBudgetNotice(null)}
      />

      {/* Export Status Dialog */}
      <ConfirmDialog
        visible={Boolean(exportNotice)}
        title={exportNotice?.title || "Export Status"}
        message={exportNotice?.message || ""}
        variant={exportNotice?.variant || "neutral"}
        confirmText="Done"
        onConfirm={() => setExportNotice(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "#FFF3EE",
    borderWidth: 1,
    borderColor: "#F4CBB5",
  },
  syncBannerText: {
    flex: 1,
    color: "#B5502E",
    fontSize: 12,
    lineHeight: 17,
  },
  panel: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  accountName: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  syncingText: {
    fontSize: 11,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 10,
    marginBottom: 8,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  inputPrefix: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    fontFamily: "Fraunces_700Bold",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "700",
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetBtn: {
    flexGrow: 1,
    minWidth: "28%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  presetBtnText: {
    fontSize: 12.5,
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
    paddingHorizontal: 12,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  outlineText: {
    fontSize: 12,
    fontWeight: "700",
  },
  backup: {
    padding: 22,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  backupIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  backupTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  backupCopy: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  exportText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
