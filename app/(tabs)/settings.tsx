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
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryDisplayName, getCategoryStyle } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/utils/formatters";
import { exportExpensesToCsv } from "@/utils/export-csv";
import { parseExpenseCsv } from "@/utils/import-csv";
import { CustomCategoryModal } from "@/components/settings/custom-category-modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AboutDialog } from "@/components/common/about-dialog";
import { ProfileAvatar } from "@/components/account/profile-avatar";
import { AppLottieView } from "@/components/ui/app-lottie-view";
import { MotionEntrance, PressableScale } from "@/components/motion";
import { GlassSurface } from "@/components/ui/glass-surface";
import { DayNightSwitch } from "@/components/ui/day-night-switch";
import { radii, spacing, typography } from "@/constants/design-tokens";

const BUDGET_PRESETS = [3000, 5000, 10000, 15000, 20000] as const;

export default function SettingsScreen() {
  const {
    budget,
    setBudget,
    expenses,
    addExpenses,
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [budgetNotice, setBudgetNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [importNotice, setImportNotice] = useState<{
    title: string;
    message: string;
    variant?: "success" | "danger" | "warning";
  } | null>(null);

  useEffect(() => {
    setBudgetText(String(budget));
  }, [budget]);

  useEffect(() => {
    if (!account) return;
    let active = true;
    const nudgeKey = STORAGE_KEYS.budgetNudges(account.email);
    AsyncStorage.getItem(nudgeKey)
      .then((val) => {
        if (active && val !== null) setBudgetNudges(val === "true");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [account?.email]);

  const toggleBudgetNudges = (value: boolean) => {
    setBudgetNudges(value);
    if (account) {
      const nudgeKey = STORAGE_KEYS.budgetNudges(account.email);
      AsyncStorage.setItem(nudgeKey, String(value)).catch(() => undefined);
    }
  };

  const toggleDarkMode = (value: boolean) => {
    setDark(value);
  };

  const commitBudget = (amount?: number) => {
    const target = amount !== undefined ? amount : Number(budgetText);
    if (!Number.isFinite(target) || target < 0) {
      setBudgetNotice("Please enter a valid monthly budget amount (₱0 or greater).");
      setBudgetText(String(budget));
      return;
    }
    const safe = Math.round(target);
    setBudgetText(String(safe));
    setBudget(safe);
  };

  const handleExport = async () => {
    const res = await exportExpensesToCsv(expenses, false);
    setExportNotice({
      title: res.title,
      message: res.message,
    });
  };

  const handleExecuteImport = () => {
    if (!importCsvText.trim()) {
      setImportNotice({
        title: "No Data Provided",
        message: "Please paste your CSV text or upload a CSV file before importing.",
        variant: "danger",
      });
      return;
    }

    const result = parseExpenseCsv(importCsvText, allCategories);
    if (!result.success || result.expenses.length === 0) {
      setImportNotice({
        title: "Import Failed",
        message: result.errors[0] || "No valid expense records could be parsed from the provided CSV.",
        variant: "danger",
      });
      return;
    }

    addExpenses(result.expenses);

    setShowImportModal(false);
    setImportCsvText("");
    setImportNotice({
      title: "Import Completed",
      message: `Successfully imported ${result.importedCount} transaction ${
        result.importedCount === 1 ? "record" : "records"
      } into your ledger.${
        result.errors.length
          ? ` ${result.errors.length} row${result.errors.length === 1 ? " was" : "s were"} skipped. ${result.errors[0]}`
          : ""
      }`,
      variant: result.errors.length ? "warning" : "success",
    });
  };

  const handleWebFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportCsvText(text);
      }
    };
    reader.readAsText(file);
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
        {/* Header */}
        <MotionEntrance delay={0}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.muted }]}>PREFERENCES</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Customize your app experience
            </Text>
          </View>
        </MotionEntrance>

        {syncError && (
          <View
            style={[
              styles.syncBanner,
              { backgroundColor: dark ? "rgba(232, 74, 63, 0.16)" : "#FDF2EE" },
            ]}
          >
            <Ionicons name="cloud-offline-outline" size={16} color={colors.error} />
            <Text style={[styles.syncBannerText, { color: colors.error }]}>{syncError}</Text>
          </View>
        )}

        {/* Profile Shortcut Card */}
        <MotionEntrance delay={50}>
          <PressableScale
            onPress={() => router.push("/(tabs)/account")}
            accessibilityRole="button"
            accessibilityLabel="Open Account and Profile"
            style={{ marginBottom: 20 }}
          >
            <GlassSurface
              variant="card"
              radius={radii.panel}
              contentStyle={styles.profileHeroCard}
            >
              {/* Subtle warm glow circle */}
              <View style={styles.glowCircle} pointerEvents="none" />

              <View style={styles.profileHeroLeft}>
                <View style={styles.avatarWrap}>
                  <ProfileAvatar
                    account={account}
                    size={54}
                    backgroundColor="#E84A3F"
                    textColor="#FFFFFF"
                    fontSize={20}
                  />
                  <View style={styles.verifiedCheck}>
                    <Ionicons name="camera" size={9} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.profileHeroInfo}>
                  <Text style={[styles.profileHeroName, { color: colors.foreground }]} numberOfLines={1}>
                    {account?.name || "Alex Johnson"}
                  </Text>
                  <View style={styles.profileHeroEmailRow}>
                    <Text style={[styles.profileHeroEmail, { color: colors.muted }]} numberOfLines={1}>
                      {account?.email || "alex.johnson@example.com"}
                    </Text>
                    <AppLottieView
                      source={require("@/assets/lottie/verified-badge.json")}
                      style={styles.verifiedLottieIcon}
                      autoPlay
                      loop
                      fallback={<Ionicons name="checkmark-circle" size={13} color="#3D66F3" />}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.profileHeroRight}>
                <View
                  style={[
                    styles.viewProfilePill,
                    { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                  ]}
                >
                  <Text style={[styles.viewProfileText, { color: colors.foreground }]}>View</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </View>
            </GlassSurface>
          </PressableScale>
        </MotionEntrance>

        {/* SECTION 1: PREFERENCES & DISPLAY */}
        <MotionEntrance delay={100}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>PREFERENCES & DISPLAY</Text>
          </View>

          <GlassSurface
            variant="card"
            radius={radii.panel}
            style={styles.groupedCard}
          >
            {/* 1. Appearance */}
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => toggleDarkMode(!dark)}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.warningSoft },
                ]}
              >
                <Ionicons name={dark ? "moon" : "sunny"} size={19} color={colors.warning} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Appearance</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {dark ? "Dark mode active" : "Light mode active"}
                </Text>
              </View>
              <DayNightSwitch
                value={dark}
                onValueChange={toggleDarkMode}
              />
            </Pressable>

            {/* 2. Notifications */}
            <Pressable
              style={({ pressed }) => [styles.settingRow, styles.lastRow, pressed && styles.pressed]}
              onPress={() => toggleBudgetNudges(!budgetNudges)}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons name="notifications" size={19} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Notifications</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {budgetNudges ? "Budget alerts enabled" : "Manage spending notifications"}
                </Text>
              </View>
              <Switch
                value={budgetNudges}
                onValueChange={toggleBudgetNudges}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Budget reminders"
              />
            </Pressable>
          </GlassSurface>
        </MotionEntrance>

        {/* SECTION 2: BUDGET & FINANCIALS */}
        <MotionEntrance delay={140}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>BUDGET & FINANCIALS</Text>
          </View>

          <GlassSurface
            variant="card"
            radius={radii.panel}
            style={styles.groupedCard}
          >
            {/* 3. Budget Settings */}
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setShowBudgetModal(true);
              }}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: dark ? "rgba(16, 185, 129, 0.15)" : "#E6F4EA" },
                ]}
              >
                <Ionicons name="compass-outline" size={19} color="#10B981" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Budget Settings</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  Monthly limit: {formatMoney(budget)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 4. Currency Indicator */}
            <View
              style={[styles.settingRow, styles.lastRow]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: dark ? "rgba(16, 185, 129, 0.15)" : "#E6F4EA" },
                ]}
              >
                <Ionicons name="cash-outline" size={19} color="#10B981" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Currency</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  Philippine Peso (PHP) · ₱
                </Text>
              </View>
              <View style={styles.currencyPill}>
                <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                <Text style={styles.currencyPillText}>PHP</Text>
              </View>
            </View>
          </GlassSurface>
        </MotionEntrance>

        {/* SECTION 3: DATA & STORAGE */}
        <MotionEntrance delay={180}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>DATA & STORAGE</Text>
          </View>

          <GlassSurface
            variant="card"
            radius={radii.panel}
            style={styles.groupedCard}
          >
            {/* 5. Data & Backup */}
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setShowBackupModal(true);
              }}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: dark ? "rgba(14, 165, 233, 0.15)" : "#E0F2FE" },
                ]}
              >
                <Ionicons name="cloud-upload-outline" size={19} color="#0284C7" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Data & Backup</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {expenses.length} expenses saved on this device
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 6. Export as CSV */}
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                pressed && styles.pressed,
              ]}
              onPress={handleExport}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED" },
                ]}
              >
                <Ionicons name="download-outline" size={19} color="#E84A3F" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Export Records</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  Save a CSV copy of your expenses
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 7. Import CSV */}
            <Pressable
              style={({ pressed }) => [styles.settingRow, styles.lastRow, pressed && styles.pressed]}
              onPress={() => setShowImportModal(true)}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: dark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5" },
                ]}
              >
                <Ionicons name="document-text-outline" size={19} color="#10B981" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>Import Records</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  Add expenses from a CSV file
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </GlassSurface>
        </MotionEntrance>

        {/* SECTION 4: ABOUT */}
        <MotionEntrance delay={220}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>ABOUT LEDGERLY</Text>
          </View>

          <GlassSurface
            variant="card"
            radius={radii.panel}
            style={styles.groupedCard}
          >
            {/* 7. About Ledgerly */}
            <Pressable
              style={({ pressed }) => [styles.settingRow, styles.lastRow, pressed && styles.pressed]}
              onPress={() => {
                setShowAboutModal(true);
              }}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: dark ? "rgba(99, 102, 241, 0.15)" : "#EEF2FF" },
                ]}
              >
                <Ionicons name="information-circle-outline" size={19} color="#4F46E5" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>About Ledgerly</Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  Version 1.0.0
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </GlassSurface>
        </MotionEntrance>
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
              <View>
                <Text style={[styles.modalKicker, { color: colors.muted }]}>MONTHLY TARGET</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Budget Settings</Text>
              </View>
              <Pressable
                onPress={() => setShowBudgetModal(false)}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={[styles.modalSectionLabel, { color: colors.muted }]}>
                TARGET AMOUNT
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
                <Text style={styles.inputPrefix}>₱</Text>
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
                <Text
                  style={[
                    styles.budgetNoticeText,
                    { color: dark ? "#FDA29B" : "#B9382D" },
                  ]}
                >
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
                          borderColor: active ? "#E84A3F" : colors.border,
                          backgroundColor: active
                            ? dark
                              ? "rgba(232, 74, 63, 0.2)"
                              : "#FFF0ED"
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
                            color: active ? "#E84A3F" : colors.muted,
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
              <View style={[styles.divider, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.border }]} />
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
                  <Ionicons name="add" size={14} color="#E84A3F" />
                  <Text style={styles.addCatLinkText}>Add custom</Text>
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
                      <Text style={[styles.pillText, { color: catStyle.color }]}>{getCategoryDisplayName(category)}</Text>
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
                styles.saveButton,
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
              ]}
              onPress={() => {
                commitBudget();
                setShowBudgetModal(false);
              }}
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGradient}
              >
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </LinearGradient>
            </Pressable>
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
              <View>
                <Text style={[styles.modalKicker, { color: colors.muted }]}>OFFLINE & CLOUD</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Data & Backup</Text>
              </View>
              <Pressable
                onPress={() => setShowBackupModal(false)}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <View
              style={[
                styles.backupCard,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.backupIconCircle}>
                <Ionicons name="cloud-done-outline" size={26} color="#0284C7" />
              </View>
              <Text style={[styles.backupCardTitle, { color: colors.foreground }]}>
                {expenses.length} Records Safe
              </Text>
              <Text style={[styles.backupCardSubtitle, { color: colors.muted }]}>
                Your expenses are saved on this device and can sync with your account.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                { marginTop: 14 },
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
              ]}
              onPress={handleExport}
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.saveGradient, { flexDirection: "row", gap: 6 }]}
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Export as CSV</Text>
              </LinearGradient>
            </Pressable>

            <Text style={[styles.modalHint, { color: colors.muted }]}>
              CSV files are created in the app’s private storage, then opened in your device’s share sheet.
            </Text>
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

      <AboutDialog visible={showAboutModal} onClose={() => setShowAboutModal(false)} />

      <ConfirmDialog
        visible={Boolean(categoryToDelete)}
        title={`Delete "${getCategoryDisplayName(categoryToDelete)}"?`}
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

      {/* CSV Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowImportModal(false)} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalKicker, { color: colors.muted }]}>DATA RESTORE</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Import CSV Records</Text>
              </View>
              <Pressable
                onPress={() => setShowImportModal(false)}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.importGuideText, { color: colors.muted }]}>
              Paste CSV text or choose a file. Include these columns: Date, Description, Category, Payment, Amount.
            </Text>

            {Platform.OS === "web" && (
              <View style={styles.webUploadWrap}>
                <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={handleWebFileUpload}
                  />
                  <View style={[styles.fileUploadBtn, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
                    <Ionicons name="cloud-upload-outline" size={16} color={colors.primary} />
                    <Text style={[styles.fileUploadBtnText, { color: colors.primary }]}>Select CSV File</Text>
                  </View>
                </label>
              </View>
            )}

            <TextInput
              value={importCsvText}
              onChangeText={setImportCsvText}
              placeholder={'Date,Description,Category,Payment,Amount\n2026-10-14,"Lunch","Food","Cash",150'}
              placeholderTextColor={colors.subtle}
              multiline
              numberOfLines={6}
              style={[
                styles.csvTextInput,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                { marginTop: 14 },
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
              ]}
              onPress={handleExecuteImport}
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGradient}
              >
                <Text style={styles.saveButtonText}>Parse & Import Records</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {exportNotice && (
        <ConfirmDialog
          visible={Boolean(exportNotice)}
          title={exportNotice.title}
          message={exportNotice.message}
          confirmText="Done"
          onConfirm={() => setExportNotice(null)}
        />
      )}

      {importNotice && (
        <ConfirmDialog
          visible={Boolean(importNotice)}
          title={importNotice.title}
          message={importNotice.message}
          variant={importNotice.variant || "success"}
          confirmText="Done"
          onConfirm={() => setImportNotice(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.md,
    paddingBottom: 104,
  },
  header: {
    marginBottom: spacing.lg,
  },
  kicker: {
    fontFamily: "DMSans_700Bold",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  syncBannerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  profileHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    position: "relative",
    overflow: "hidden",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  glowCircle: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(232, 74, 63, 0.08)",
  },
  profileHeroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  avatarWrap: {
    position: "relative",
  },
  verifiedCheck: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E84A3F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  profileHeroInfo: {
    flex: 1,
  },
  profileHeroName: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  profileHeroEmailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  profileHeroEmail: {
    fontSize: 12,
    fontWeight: "500",
  },
  verifiedLottieIcon: {
    width: 17,
    height: 17,
  },
  profileHeroRight: {
    marginLeft: 10,
  },
  viewProfilePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  viewProfileText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  groupedCard: {
    overflow: "hidden",
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    minHeight: 64,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  pressed: {
    opacity: 0.75,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.control,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  rowSubtitle: {
    fontSize: 11.5,
    marginTop: 1.5,
    fontWeight: "400",
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  currencyPillText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    padding: 22,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalKicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSectionLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputPrefix: {
    color: "#E84A3F",
    fontSize: 22,
    fontWeight: "800",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    height: "100%",
  },
  budgetNoticeText: {
    color: "#B9382D",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontWeight: "500",
    flexShrink: 1,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  catHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addCatLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  addCatLinkText: {
    color: "#E84A3F",
    fontSize: 12,
    fontWeight: "700",
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  saveButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#E84A3F",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveGradient: {
    width: "100%",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  backupCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  backupIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  backupCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  backupCardSubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  modalHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
    textAlign: "center",
  },
  importGuideText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  webUploadWrap: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  fileUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  fileUploadBtnText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    fontWeight: "700",
  },
  csvTextInput: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 11.5,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    minHeight: 110,
    maxHeight: 180,
    textAlignVertical: "top",
  },
});
