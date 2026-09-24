import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ExpenseProvider } from "@/lib/expense-store";
import { AuthProvider } from "@/lib/auth-store";
import { ThemeProvider, useTheme } from "@/lib/theme-store";

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? "light" : "dark"} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ExpenseProvider>
            <ThemedStatusBar />
            <Stack screenOptions={{ headerShown: false }} />
          </ExpenseProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

