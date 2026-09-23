import { Stack } from "expo-router";
import { Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ExpenseProvider } from "@/lib/expense-store";
import { AuthProvider } from "@/lib/auth-store";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Fraunces_600SemiBold, Fraunces_700Bold });
  if (!fontsLoaded) return null;
  const TextWithDefaults = Text as typeof Text & { defaultProps?: { style?: unknown } };
  TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
  TextWithDefaults.defaultProps.style = [{ fontFamily: "DMSans_400Regular" }];
  return <SafeAreaProvider><AuthProvider><ExpenseProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></ExpenseProvider></AuthProvider></SafeAreaProvider>;
}
