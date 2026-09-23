import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ExpenseProvider } from "@/lib/expense-store";
import { AuthProvider } from "@/lib/auth-store";

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><ExpenseProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></ExpenseProvider></AuthProvider></SafeAreaProvider>;
}
