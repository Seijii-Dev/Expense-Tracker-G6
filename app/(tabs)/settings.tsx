import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { categoryMeta, useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { formatMoney } from "@/lib/formatters";

const categories = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"] as const;
const budgetPresets = [3000, 5000, 10000, 15000, 20000];

export default function SettingsScreen() {
  const { budget, setBudget, expenses, syncing, syncError, refreshExpenses } = useExpenses();
  const { dark, setDark, colors } = useTheme();
  const { account, logout } = useAuth();

  const [budgetText, setBudgetText] = useState(String(budget));
  const [budgetNudges, setBudgetNudges] = useState(true);

  useEffect(() => {
    setBudgetText(String(budget));
  }, [budget]);

  useEffect(() => {
    if (!account) return;
    const nudgeKey = `expense-tracker:${account.email}:budget-nudges`;
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
      const nudgeKey = `expense-tracker:${account.email}:budget-nudges`;
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

  const exportData = async () => {
    if (!expenses.length) {
      Alert.alert("Nothing to export", "Add at least one expense before creating an export backup.");
      return;
    }

    const escape = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      "Date,Description,Category,Payment,Amount",
      ...expenses.map((expense) =>
        [expense.date, expense.description, expense.category, expense.payment, expense.amount].map(escape).join(",")
      ),
    ].join("\n");

    const filename = `ledgerly-export-${new Date().toISOString().slice(0, 10)}.csv`;

    if (Platform.OS === "web") {
      try {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert("Export completed", "Your expense records have been downloaded as CSV.");
        return;
      } catch {
        Alert.alert("Export failed", "Unable to download CSV in browser.");
        return;
      }
    }

    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
    if (!baseDir) {
      try {
        await Share.share({ message: csv, title: "Ledgerly Expense CSV" });
      } catch {
        Alert.alert("Export failed", "The expense backup could not be shared.");
      }
      return;
    }

    const uri = `${baseDir}${filename}`;
    try {
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Export your expenses" });
      } else {
        await Share.share({ message: csv, title: "Ledgerly Expense CSV" });
      }
    } catch {
      Alert.alert("Export failed", "The expense backup could not be created.");
    }
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
        <Text style={styles.kicker}>MAKE IT YOURS</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings<Text style={styles.dot}>.</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Shape the way you track, manage, and back up everyday spending.
        </Text>

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
            {budgetPresets.map((preset) => {
              const active = budget === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => commitBudget(preset)}
                  style={[
                    styles.presetBtn,
                    { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
                    active && styles.presetBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      { color: colors.muted },
                      active && styles.presetBtnTextActive,
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
            copy={`${categories.length} standardized categories keep your records tidy.`}
          />
          <View style={styles.pills}>
            {categories.map((category) => (
              <View key={category} style={[styles.pill, { backgroundColor: categoryMeta[category].soft }]}>
                <View style={[styles.pillDot, { backgroundColor: categoryMeta[category].color }]} />
                <Text style={[styles.pillText, { color: categoryMeta[category].color }]}>{category}</Text>
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
          <Preference
            icon={<Ionicons name="moon-outline" size={17} color={colors.muted} />}
            title="Dark mode"
            copy="Use a darker, high-contrast palette for late hours"
            value={dark}
            onChange={toggleDarkMode}
          />
          <Preference
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
          <Text style={styles.kicker}>YOUR DATA, YOUR SAY</Text>
          <Text style={[styles.backupTitle, { color: colors.foreground }]}>Keep a copy close.</Text>
          <Text style={[styles.backupCopy, { color: colors.muted }]}>
            Export your {expenses.length} transactions anytime as a portable CSV backup file.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}
            onPress={exportData}
          >
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportText}>Export as CSV</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SectionHeading({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.heading}>
      <View style={[styles.headingIcon, { backgroundColor: colors.primarySoft }]}>{icon}</View>
      <View style={styles.headingTextWrap}>
        <Text style={[styles.headingTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.headingCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
    </View>
  );
}

function Preference({
  icon,
  title,
  copy,
  value,
  onChange,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.preference, !last && [styles.preferenceBorder, { borderBottomColor: colors.border }]]}>
      <View style={[styles.preferenceIcon, { backgroundColor: colors.surfaceSubtle }]}>{icon}</View>
      <View style={styles.preferenceBody}>
        <Text style={[styles.preferenceTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.preferenceCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  syncBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, marginBottom: 16, borderRadius: 12, backgroundColor: "#FFF3EE", borderWidth: 1, borderColor: "#F4CBB5" },
  syncBannerText: { flex: 1, color: "#B5502E", fontSize: 11, lineHeight: 16 },
  accountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  accountName: { fontSize: 14, fontWeight: "700" },
  syncingText: { fontSize: 11 },
  scroll: { paddingTop: 12, paddingBottom: 36 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 32, fontWeight: "700", letterSpacing: -1.2, marginTop: 6 },
  dot: { color: "#EB6F61" },
  subtitle: { fontSize: 12, marginTop: 4, marginBottom: 20 },
  panel: { padding: 18, marginBottom: 16, borderRadius: 16, borderWidth: 1 },
  heading: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  headingIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  headingTextWrap: { flex: 1 },
  headingTitle: { fontSize: 16, fontWeight: "700" },
  headingCopy: { fontSize: 11, marginTop: 3 },
  fieldLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginTop: 8, marginBottom: 7 },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  selectText: { fontSize: 12, fontWeight: "600" },
  inputWrap: { flexDirection: "row", alignItems: "center", height: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  inputPrefix: { fontSize: 14, fontWeight: "700" },
  input: { flex: 1, fontSize: 13, marginLeft: 8, fontWeight: "600" },
  presetLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 12, marginBottom: 8 },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetBtn: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  presetBtnActive: { borderColor: "#F2B8B0", backgroundColor: "#FFF0ED" },
  presetBtnText: { fontSize: 10, fontWeight: "600" },
  presetBtnTextActive: { color: "#EB6F61", fontWeight: "700" },
  divider: { height: 1, marginVertical: 20 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "700" },
  outlineButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, height: 36, paddingHorizontal: 13, marginTop: 16, borderRadius: 9, borderWidth: 1 },
  outlineText: { fontSize: 11, fontWeight: "700" },
  preference: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  preferenceBorder: { borderBottomWidth: 1 },
  preferenceIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  preferenceBody: { flex: 1 },
  preferenceTitle: { fontSize: 13, fontWeight: "700" },
  preferenceCopy: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  backup: { padding: 20, marginBottom: 16, borderRadius: 16, borderWidth: 1 },
  backupIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 14, borderRadius: 12 },
  backupTitle: { fontFamily: "Fraunces_700Bold", fontSize: 22, fontWeight: "700", marginTop: 6 },
  backupCopy: { fontSize: 11, lineHeight: 17, marginTop: 6, marginBottom: 18 },
  exportButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: 10, backgroundColor: "#EB6F61" },
  exportText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
