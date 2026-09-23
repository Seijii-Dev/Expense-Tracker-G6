import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth-store";

export default function EntryScreen() {
  const { account, loading } = useAuth();
  if (loading) return <View style={styles.loading}><ActivityIndicator color="#EB6F61" /></View>;
  return account ? <Redirect href="/(tabs)" /> : <Redirect href="/auth" />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F8F5" } });
