import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";

const coral = "#EB6F61";
const ink = "#26312E";
const muted = "#899590";

export default function AccountScreen() {
  const { account, logout } = useAuth();
  const { expenses, budget, syncing } = useExpenses();
  const [showSignOut, setShowSignOut] = useState(false);
  const initials = (account?.name || "U").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const confirmSignOut = async () => {
    setShowSignOut(false);
    await logout();
    router.replace("/auth");
  };

  return <ScreenContainer><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
    <Text style={styles.kicker}>YOUR LEDGER</Text>
    <Text style={styles.title}>Account<Text style={styles.dot}>.</Text></Text>
    <Text style={styles.subtitle}>Your profile, preferences, and spending snapshot.</Text>

    <View style={styles.profileCard}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
      <View style={styles.profileBody}><Text style={styles.name}>{account?.name || "Your account"}</Text><Text style={styles.email}>{account?.email || "Not signed in"}</Text><View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>{syncing ? "Syncing your ledger" : "Connected to your ledger"}</Text></View></View>
      <Ionicons name="shield-checkmark" size={20} color="#5A9E7E" />
    </View>

    <View style={styles.statsRow}><Stat label="Records" value={String(expenses.length)} icon="receipt-outline" /><Stat label="Tracked" value={`₱${total.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`} icon="trending-up-outline" /><Stat label="Budget" value={`₱${budget.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`} icon="wallet-outline" /></View>

    <View style={styles.panel}><Text style={styles.sectionKicker}>ACCOUNT SETTINGS</Text><AccountRow icon="settings-outline" title="Preferences" copy="Currency, budget, and categories" onPress={() => router.push("/(tabs)/settings")} /><AccountRow icon="download-outline" title="Export your data" copy="Create a CSV backup from Settings" onPress={() => router.push("/(tabs)/settings")} /><AccountRow icon="help-circle-outline" title="About Ledgerly" copy="Simple spending, clearer decisions" onPress={() => undefined} last /></View>

    <Pressable style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]} onPress={() => setShowSignOut(true)}><Ionicons name="log-out-outline" size={17} color={coral} /><Text style={styles.signOutText}>Sign out</Text></Pressable>
    <Text style={styles.footer}>Your account is protected with secure sign-in.</Text>
  </ScrollView>
  <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}><View style={styles.backdrop}><View style={styles.dialog}><View style={styles.dialogIcon}><Ionicons name="log-out-outline" size={21} color={coral} /></View><Text style={styles.dialogTitle}>Sign out of Ledgerly?</Text><Text style={styles.dialogCopy}>You can sign back in anytime. Your saved records will remain in your account.</Text><View style={styles.dialogActions}><Pressable style={styles.cancelButton} onPress={() => setShowSignOut(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable style={styles.confirmButton} onPress={confirmSignOut}><Text style={styles.confirmText}>Sign out</Text></Pressable></View></View></View></Modal>
  </ScreenContainer>;
}

function Stat({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) { return <View style={styles.stat}><Ionicons name={icon} size={16} color={coral} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function AccountRow({ icon, title, copy, onPress, last }: { icon: keyof typeof Ionicons.glyphMap; title: string; copy: string; onPress: () => void; last?: boolean }) { return <Pressable style={[styles.row, !last && styles.rowBorder]} onPress={onPress}><View style={styles.rowIcon}><Ionicons name={icon} size={17} color={coral} /></View><View style={styles.rowBody}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowCopy}>{copy}</Text></View><Ionicons name="chevron-forward" size={17} color="#AAB4AF" /></Pressable>; }

const styles = StyleSheet.create({ scroll: { paddingTop: 13, paddingBottom: 35 }, kicker: { color: coral, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }, title: { fontFamily: "Fraunces_700Bold", color: ink, fontSize: 35, fontWeight: "700", letterSpacing: -1.4, marginTop: 8 }, dot: { color: coral }, subtitle: { color: muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 22 }, profileCard: { flexDirection: "row", alignItems: "center", padding: 17, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5EBE7", marginBottom: 12 }, avatar: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF0ED", marginRight: 13 }, avatarText: { color: coral, fontSize: 19, fontWeight: "800" }, profileBody: { flex: 1 }, name: { color: ink, fontSize: 17, fontWeight: "800" }, email: { color: muted, fontSize: 11, marginTop: 4 }, status: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }, statusDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: "#5A9E7E" }, statusText: { color: "#5A9E7E", fontSize: 9, fontWeight: "700" }, statsRow: { flexDirection: "row", gap: 8, marginBottom: 15 }, stat: { flex: 1, padding: 12, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5EBE7" }, statValue: { color: ink, fontSize: 17, fontWeight: "800", marginTop: 8 }, statLabel: { color: muted, fontSize: 9, marginTop: 3 }, panel: { padding: 17, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5EBE7", marginBottom: 15 }, sectionKicker: { color: muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginBottom: 4 }, row: { flexDirection: "row", alignItems: "center", paddingVertical: 15, gap: 11 }, rowBorder: { borderBottomWidth: 1, borderBottomColor: "#EEF2EF" }, rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF0ED" }, rowBody: { flex: 1 }, rowTitle: { color: ink, fontSize: 12, fontWeight: "800" }, rowCopy: { color: muted, fontSize: 9, marginTop: 4 }, signOutButton: { height: 46, borderRadius: 11, borderWidth: 1, borderColor: "#F1B4AC", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 }, signOutText: { color: coral, fontSize: 12, fontWeight: "800" }, footer: { textAlign: "center", color: "#AAB4AF", fontSize: 9, marginTop: 18 }, pressed: { opacity: .75, transform: [{ scale: .98 }] }, backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(38,49,46,.48)" }, dialog: { padding: 22, borderRadius: 22, backgroundColor: "#FFFFFF" }, dialogIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: "#FFF0ED", alignItems: "center", justifyContent: "center", marginBottom: 14 }, dialogTitle: { color: ink, fontSize: 20, fontWeight: "800" }, dialogCopy: { color: muted, fontSize: 12, lineHeight: 18, marginTop: 8 }, dialogActions: { flexDirection: "row", gap: 9, marginTop: 22 }, cancelButton: { flex: 1, height: 43, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F6F3" }, cancelText: { color: muted, fontSize: 12, fontWeight: "800" }, confirmButton: { flex: 1, height: 43, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: coral }, confirmText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" } });
