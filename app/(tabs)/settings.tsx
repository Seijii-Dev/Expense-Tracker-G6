import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { CategoryIcon } from "@/components/ui/category-icon";
import { CATEGORIES, getCategoryStyle } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/utils/formatters";
import { exportExpensesToCsv } from "@/utils/export-csv";
import { StoragePermissionDialog } from "@/components/common/storage-permission-dialog";
import { CustomCategoryModal } from "@/components/settings/custom-category-modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AboutDialog } from "@/components/common/about-dialog";

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
  const { account } = useAuth();

  const [budgetText, setBudgetText] = useState(String(budget));
  const [budgetNudges, setBudgetNudges] = useState(true);
  const [showStorageDialog, setShowStorageDialog] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
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
        {/* Header matching Mockup Screen 4 */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Customize your app experience
          </Text>
        </View>

        {syncError && (
          <View style={styles.syncBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#B5502E" />
            <Text style={styles.syncBannerText}>{syncError}</Text>
          </View>
        )}

        {/* Grouped Settings Card matching Mockup */}
        <View
          style={[
            styles.settingsCard,
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
          {/* 1. Appearance */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => toggleDarkMode(!dark)}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: dark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7" },
              ]}
            >
              <Ionicons name="sunny" size={20} color="#F59E0B" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>Appearance</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                {dark ? "Dark Mode" : "Light, Dark or System"}
              </Text>
            </View>
            <Switch
              value={dark}
              onValueChange={toggleDarkMode}
              trackColor={{
                false: dark ? "rgba(255,255,255,0.12)" : colors.border,
                true: "#16382B",
              }}
              thumbColor="#FFFFFF"
            />
          </Pressable>

          {/* 2. Notifications */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => toggleBudgetNudges(!budgetNudges)}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: dark ? "rgba(255, 101, 84, 0.2)" : "#FEE2E2" },
              ]}
            >
              <Ionicons name="notifications" size={20} color="#FF6554" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>Notifications</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                {budgetNudges ? "Budget alerts enabled" : "Manage your notifications"}
              </Text>
            </View>
            <Switch
              value={budgetNudges}
              onValueChange={toggleBudgetNudges}
              trackColor={{
                false: dark ? "rgba(255,255,255,0.12)" : colors.border,
                true: "#16382B",
              }}
              thumbColor="#FFFFFF"
            />
          </Pressable>

          {/* 3. Budget Settings */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setShowBudgetModal(true);
            }}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: dark ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5" },
              ]}
            >
              <Ionicons name="compass-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>Budget Settings</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                Set your monthly budget
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* 4. Currency */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setShowCurrencyModal(true);
            }}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: dark ? "rgba(22, 163, 74, 0.2)" : "#DCFCE7" },
              ]}
            >
              <Ionicons name="cash-outline" size={20} color="#16A34A" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>Currency</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                USD - US Dollar / PHP
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* 5. Data & Backup */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setShowBackupModal(true);
            }}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: dark ? "rgba(14, 165, 233, 0.2)" : "#E0F2FE" },
              ]}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>Data & Backup</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                Sync your data securely
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          {/* 6. About Ledgerly */}
          <Pressable
            style={({ pressed }) => [styles.settingRow, styles.lastRow, pressed && styles.pressed]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setShowAboutModal(true);
            }}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: dark ? "rgba(99, 102, 241, 0.2)" : "#E0E7FF" },
              ]}
            >
              <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>About Ledgerly</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Version 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Budget Settings Modal */}
      <Modal
        visible={showBudgetModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBudgetModal(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Budget Settings</Text>
              <Pressable
                onPress={() => setShowBudgetModal(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={[styles.modalSectionLabel, { color: colors.muted }]}>
                MONTHLY BUDGET TARGET
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: colors.border,
                    backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                  },
                ]}
              >
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

              {budgetNotice && (
                <Text style={{ color: "#FF6554", fontSize: 12, marginTop: 4 }}>
                  {budgetNotice}
                </Text>
              )}

              {/* Quick Presets */}
              <Text style={[styles.modalSectionLabel, { color: colors.muted, marginTop: 16 }]}>
                QUICK PRESETS
              </Text>
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

              {/* Categories */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.catHeaderRow}>
                <Text style={[styles.modalSectionLabel, { color: colors.muted }]}>
                  ACTIVE CATEGORIES ({allCategories.length})
                </Text>
                <Pressable
                  onPress={() => {
                    setShowBudgetModal(false);
                    setShowCategoryModal(true);
                  }}
                  style={styles.addCatLink}
                >
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <Text style={[styles.addCatLinkText, { color: colors.primary }]}>Add custom</Text>
                </Pressable>
              </View>

              <View style={styles.pillsWrap}>
                {allCategories.map((category) => {
                  const catStyle = getCategoryStyle(category, customCategories);
                  const isCustom = customCategories.some(
                    (c) => c.name.toLowerCase() === category.toLowerCase()
                  );
                  return (
                    <Pressable
                      key={category}
                      onPress={() => {
                        if (isCustom) setCategoryToDelete(category);
                      }}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: dark ? `${catStyle.color}25` : catStyle.soft,
                          borderColor: `${catStyle.color}40`,
                        },
                      ]}
                    >
                      <CategoryIcon
                        category={category}
                        size={14}
                        customCategories={customCategories}
                      />
                      <Text style={[styles.pillText, { color: catStyle.color }]}>{category}</Text>
                      {isCustom && (
                        <Ionicons
                          name="close-circle"
                          size={13}
                          color={catStyle.color}
                          style={{ opacity: 0.75, marginLeft: 2 }}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Pressable
              style={({ pressed }) => [
                styles.primaryModalBtn,
                { backgroundColor: "#16382B" },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                commitBudget();
                setShowBudgetModal(false);
              }}
            >
              <Text style={styles.primaryModalBtnText}>Save Budget</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCurrencyModal(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Currency</Text>
              <Pressable
                onPress={() => setShowCurrencyModal(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.currencyList}>
              <View
                style={[
                  styles.currencyItem,
                  {
                    backgroundColor: dark ? "rgba(22, 56, 43, 0.2)" : "#EAFBF1",
                    borderColor: "#16382B",
                  },
                ]}
              >
                <View>
                  <Text style={[styles.currencyName, { color: colors.foreground }]}>
                    Philippine Peso (PHP)
                  </Text>
                  <Text style={[styles.currencySymbol, { color: colors.muted }]}>₱ — Primary</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#16382B" />
              </View>

              <View
                style={[
                  styles.currencyItem,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                    opacity: 0.7,
                  },
                ]}
              >
                <View>
                  <Text style={[styles.currencyName, { color: colors.foreground }]}>
                    US Dollar (USD)
                  </Text>
                  <Text style={[styles.currencySymbol, { color: colors.muted }]}>$ — Supported</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Data & Backup Modal */}
      <Modal
        visible={showBackupModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBackupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBackupModal(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Data & Backup</Text>
              <Pressable
                onPress={() => setShowBackupModal(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <View style={styles.backupCard}>
              <View style={styles.backupIconCircle}>
                <Ionicons name="cloud-done-outline" size={28} color="#0284C7" />
              </View>
              <Text style={[styles.backupCardTitle, { color: colors.foreground }]}>
                {expenses.length} Records Safe
              </Text>
              <Text style={[styles.backupCardSubtitle, { color: colors.muted }]}>
                Your transactions are stored securely offline and synced when connected.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryModalBtn,
                { backgroundColor: "#16382B", marginTop: 12 },
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleExport}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryModalBtnText}>Export as CSV</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryModalBtn,
                { borderColor: colors.border, marginTop: 10 },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                setShowBackupModal(false);
                setShowStorageDialog(true);
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={colors.foreground}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.secondaryModalBtnText, { color: colors.foreground }]}>
                Storage Permissions
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modals & Dialogs */}
      <CustomCategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={addCustomCategory}
        existingCategories={allCategories}
      />

      <StoragePermissionDialog
        visible={showStorageDialog}
        onClose={() => setShowStorageDialog(false)}
      />

      <AboutDialog visible={showAboutModal} onClose={() => setShowAboutModal(false)} />

      <ConfirmDialog
        visible={Boolean(categoryToDelete)}
        title={`Delete "${categoryToDelete}"?`}
        message="This category will be permanently removed. Existing expenses in this category will keep their label."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCustomCategory(categoryToDelete);
            setCategoryToDelete(null);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
        destructive
      />

      {exportNotice && (
        <ConfirmDialog
          visible={Boolean(exportNotice)}
          title={exportNotice.title}
          message={exportNotice.message}
          confirmText="Done"
          onConfirm={() => setExportNotice(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 16,
    paddingBottom: 96,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Fraunces_700Bold",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13.5,
    marginTop: 4,
    fontWeight: "500",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FDF2EE",
    marginBottom: 16,
  },
  syncBannerText: {
    fontSize: 12,
    color: "#B5502E",
    fontWeight: "500",
    flex: 1,
  },
  settingsCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 22,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Fraunces_700Bold",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  catHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  addCatLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addCatLinkText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  primaryModalBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
  },
  primaryModalBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryModalBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
  },
  secondaryModalBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  currencyList: {
    gap: 10,
    marginBottom: 10,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  currencyName: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  currencySymbol: {
    fontSize: 12,
    marginTop: 2,
  },
  backupCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  backupIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  backupCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  backupCardSubtitle: {
    fontSize: 12.5,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
