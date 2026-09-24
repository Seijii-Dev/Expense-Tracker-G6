import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
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
import { ScreenContainer } from "@/components/screen-container";
import { categoryMeta, useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";

const categories = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"] as const;

export default function SettingsScreen() {
  const { budget, setBudget, expenses, syncing, syncError } = useExpenses();
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
    setBudgetNudges(value);
    if (account) {
      const nudgeKey = `expense-tracker:${account.email}:budget-nudges`;
      AsyncStorage.setItem(nudgeKey, String(value)).catch(() => undefined);
    }
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

  const commitBudget = () => {
    const parsed = parseFloat(budgetText);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert("Invalid budget", "Please enter a valid monthly budget amount (0 or greater).");
      setBudgetText(String(budget));
      return;
    }
    const safe = Math.round(parsed);
    setBudgetText(String(safe));
    setBudget(safe);
  };

  const exportData = async () => {
    if (!expenses.length) {
      Alert.alert("Nothing to export", "Add an expense before creating a backup file.");
      return;
    }

    const escape = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      "Date,Description,Category,Payment,Amount",
      ...expenses.map((expense) =>
        [expense.date, expense.description, expense.category, expense.payment, expense.amount].map(escape).join(",")
      ),
    ].join("\n");

    const filename = `expense-tracker-${new Date().toISOString().slice(0, 10)}.csv`;

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
        await Share.share({ message: csv, title: "Expense Tracker CSV" });
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
        await Share.share({ message: csv, title: "Expense Tracker CSV" });
      }
    } catch {
      Alert.alert("Export failed", "The expense backup could not be created.");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>MAKE IT YOURS</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings<Text style={styles.dot}>.</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Shape the way you track everyday spending.</Text>

        {syncError && (
          <View style={styles.syncBanner}>
            <Ionicons name="cloud-offline-outline" size={15} color="#B5502E" />
            <Text style={styles.syncBannerText}>{syncError}</Text>
          </View>
        )}

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
            style={[styles.outlineButton, { borderColor: colors.border }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={15} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>Sign out</Text>
          </Pressable>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SectionHeading
            icon={<Ionicons name="cash-outline" size={17} color={colors.primary} />}
            title="Money preferences"
            copy="Set the defaults for your workspace."
          />
          <Text style={[styles.fieldLabel, { color: colors.subtle }]}>CURRENCY</Text>
          <View style={[styles.select, { borderColor: colors.border }]}>
            <Text style={[styles.selectText, { color: colors.foreground }]}>PHP — Philippine peso</Text>
            <Text style={[styles.chevron, { color: colors.subtle }]}>⌄</Text>
          </View>

          <Text style={[styles.fieldLabel, { color: colors.subtle }]}>MONTHLY BUDGET</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border }]}>
            <Text style={[styles.inputPrefix, { color: colors.muted }]}>₱</Text>
            <TextInput
              value={budgetText}
              onChangeText={setBudgetText}
              onEndEditing={commitBudget}
              onBlur={commitBudget}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SectionHeading
            icon={<Ionicons name="pricetag-outline" size={17} color={colors.primary} />}
            title="Categories"
            copy="These categories keep your reports tidy."
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
            style={[styles.outlineButton, { borderColor: colors.border }]}
            onPress={() =>
              Alert.alert(
                "Custom categories",
                "Custom categories are planned for an upcoming update. Your current 8 standard categories are fully active."
              )
            }
          >
            <Ionicons name="add" size={15} color={colors.primary} />
            <Text style={[styles.outlineText, { color: colors.primary }]}>Add custom category</Text>
          </Pressable>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Preference
            icon={<Ionicons name="moon-outline" size={17} color={colors.muted} />}
            title="Dark mode"
            copy="Use a darker palette at night"
            value={dark}
            onChange={setDark}
          />
          <Preference
            icon={<Ionicons name="notifications-outline" size={17} color={colors.muted} />}
            title="Budget nudges"
            copy="Get a note when you’re close to budget"
            value={budgetNudges}
            onChange={toggleBudgetNudges}
          />
        </View>

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
            Export your {expenses.length} transactions any time as a simple CSV file.
          </Text>
          <Pressable style={styles.exportButton} onPress={exportData}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportText}>Export your data</Text>
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
      <View>
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
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.preference, { borderBottomColor: colors.border }]}>
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
  syncBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginTop: 16, borderRadius: 10, backgroundColor: "#FFF3EE", borderWidth: 1, borderColor: "#F4CBB5" },
  syncBannerText: { flex: 1, color: "#B5502E", fontSize: 10, lineHeight: 14 },
  accountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  accountName: { fontSize: 13, fontWeight: "700" },
  syncingText: { fontSize: 10 },
  scroll: { paddingTop: 13, paddingBottom: 30 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 35, fontWeight: "700", letterSpacing: -1.4, marginTop: 8 },
  dot: { color: "#EB6F61" },
  subtitle: { fontFamily: "Fraunces_700Bold", fontSize: 12, marginTop: 6, marginBottom: 24 },
  panel: { padding: 18, marginBottom: 15, borderRadius: 15, borderWidth: 1 },
  heading: { flexDirection: "row", alignItems: "flex-start", gap: 11, marginBottom: 18 },
  headingIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  headingTitle: { fontSize: 18, fontWeight: "700" },
  headingCopy: { fontSize: 10, marginTop: 4 },
  fieldLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginTop: 8, marginBottom: 7 },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 40, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1 },
  selectText: { fontSize: 11 },
  chevron: { fontSize: 17 },
  inputWrap: { flexDirection: "row", alignItems: "center", height: 40, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1 },
  inputPrefix: { fontSize: 12 },
  input: { flex: 1, fontSize: 11, marginLeft: 7 },
  divider: { height: 1, marginVertical: 24 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 14 },
  pillDot: { width: 5, height: 5, borderRadius: 4 },
  pillText: { fontSize: 10, fontWeight: "700" },
  outlineButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, height: 35, paddingHorizontal: 11, marginTop: 17, borderRadius: 8, borderWidth: 1 },
  outlineText: { fontSize: 10, fontWeight: "700" },
  preference: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 14, borderBottomWidth: 1 },
  preferenceIcon: { width: 31, height: 31, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  preferenceBody: { flex: 1 },
  preferenceTitle: { fontSize: 11, fontWeight: "700" },
  preferenceCopy: { fontSize: 9, marginTop: 4 },
  backup: { padding: 20, marginBottom: 15, borderRadius: 15, borderWidth: 1 },
  backupIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", marginBottom: 16, borderRadius: 11 },
  backupTitle: { fontFamily: "Fraunces_700Bold", fontSize: 23, fontWeight: "700", marginTop: 8 },
  backupCopy: { fontSize: 11, lineHeight: 17, marginTop: 8, marginBottom: 18 },
  exportButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 42, borderRadius: 9, backgroundColor: "#EB6F61" },
  exportText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
});
