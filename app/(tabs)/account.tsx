import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";

export default function AccountScreen() {
  const { account, logout } = useAuth();
  const { expenses, budget, syncing } = useExpenses();
  const { colors } = useTheme();
  const [showSignOut, setShowSignOut] = useState(false);

  const initials =
    (account?.name || "User")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const confirmSignOut = async () => {
    setShowSignOut(false);
    await logout();
    router.replace("/auth");
  };

  const showAbout = () => {
    Alert.alert(
      "About Ledgerly",
      "Ledgerly — Smart Spending and Savings Tracker v1.0.0\n\nBuilt for calm, deliberate money management with seamless cloud sync and instant offline access.\n\nDeveloped by Group 6."
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>YOUR LEDGER</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Account<Text style={styles.dot}>.</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Your profile, preferences, and spending snapshot.
        </Text>

        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <View style={styles.profileBody}>
            <Text style={[styles.name, { color: colors.foreground }]}>{account?.name || "Your account"}</Text>
            <Text style={[styles.email, { color: colors.muted }]}>{account?.email || "Not signed in"}</Text>
            <View style={styles.status}>
              <View style={[styles.statusDot, { backgroundColor: syncing ? colors.warning : colors.success }]} />
              <Text
                style={[
                  styles.statusText,
                  { color: syncing ? colors.warning : colors.success },
                ]}
              >
                {syncing ? "Syncing your ledger" : "Connected to your ledger"}
              </Text>
            </View>
          </View>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
        </View>

        <View style={styles.statsRow}>
          <Stat label="Records" value={String(expenses.length)} icon="receipt-outline" />
          <Stat
            label="Tracked"
            value={`₱${total.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`}
            icon="trending-up-outline"
          />
          <Stat
            label="Budget"
            value={`₱${budget.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`}
            icon="wallet-outline"
          />
        </View>

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

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            { borderColor: colors.border, backgroundColor: colors.surface },
            pressed && styles.pressed,
          ]}
          onPress={() => setShowSignOut(true)}
        >
          <Ionicons name="log-out-outline" size={17} color={colors.primary} />
          <Text style={[styles.signOutText, { color: colors.primary }]}>Sign out</Text>
        </Pressable>
        <Text style={[styles.footer, { color: colors.subtle }]}>Your account is protected with secure sign-in.</Text>
      </ScrollView>

      <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}>
        <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <View style={[styles.dialogIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="log-out-outline" size={21} color={colors.primary} />
            </View>
            <Text style={[styles.dialogTitle, { color: colors.foreground }]}>Sign out of Ledgerly?</Text>
            <Text style={[styles.dialogCopy, { color: colors.muted }]}>
              You can sign back in anytime. Your saved records will remain in your account.
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setShowSignOut(false)}
              >
                <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={confirmSignOut}
              >
                <Text style={styles.confirmText}>Sign out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function AccountRow({
  icon,
  title,
  copy,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
  onPress: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.row, !last && [styles.rowBorder, { borderBottomColor: colors.border }]]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.rowCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.subtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 13, paddingBottom: 35 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 35, fontWeight: "700", letterSpacing: -1.4, marginTop: 8 },
  dot: { color: "#EB6F61" },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 22 },
  profileCard: { flexDirection: "row", alignItems: "center", padding: 17, borderRadius: 17, borderWidth: 1, marginBottom: 12 },
  avatar: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", marginRight: 13 },
  avatarText: { fontSize: 19, fontWeight: "800" },
  profileBody: { flex: 1 },
  name: { fontSize: 17, fontWeight: "800" },
  email: { fontSize: 11, marginTop: 4 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  stat: { flex: 1, padding: 12, borderRadius: 13, borderWidth: 1 },
  statValue: { fontSize: 17, fontWeight: "800", marginTop: 8 },
  statLabel: { fontSize: 9, marginTop: 3 },
  panel: { padding: 17, borderRadius: 16, borderWidth: 1, marginBottom: 15 },
  sectionKicker: { fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 15, gap: 11 },
  rowBorder: { borderBottomWidth: 1 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 12, fontWeight: "800" },
  rowCopy: { fontSize: 9, marginTop: 4 },
  signOutButton: { height: 46, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  signOutText: { fontSize: 12, fontWeight: "800" },
  footer: { textAlign: "center", fontSize: 9, marginTop: 18 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  backdrop: { flex: 1, justifyContent: "center", padding: 24 },
  dialog: { padding: 22, borderRadius: 22 },
  dialogIcon: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  dialogTitle: { fontSize: 20, fontWeight: "800" },
  dialogCopy: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  dialogActions: { flexDirection: "row", gap: 9, marginTop: 22 },
  cancelButton: { flex: 1, height: 43, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 12, fontWeight: "800" },
  confirmButton: { flex: 1, height: 43, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
