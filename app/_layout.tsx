import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, View, StyleSheet } from "react-native";
import { ExpenseProvider } from "@/lib/expense-store";
import { AuthProvider } from "@/lib/auth-store";
import { ThemeProvider, useTheme } from "@/lib/theme-store";
import { SplashScreen } from "@/components/common/splash-screen";

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? "light" : "dark"} />;
}

function BrandedSplashScreen({ isReady }: { isReady: boolean }) {
  const { dark } = useTheme();
  return <SplashScreen isReady={isReady} dark={dark} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Load Ionicons under both casing keys so Font.isLoaded('ionicons') resolves on web
    ...Ionicons.font,
    Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
  });

  const fontsReady = Boolean(fontsLoaded || fontError);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ExpenseProvider>
            <ThemedStatusBar />
            <View style={styles.rootWrap}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  // Use none on web to avoid the JS-animated fade which is laggy
                  animation: Platform.OS === "web" ? "none" : "default",
                }}
              />
              {/* Branded Application Launch Screen with Theme Awareness */}
              <BrandedSplashScreen isReady={fontsReady} />
            </View>
          </ExpenseProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootWrap: {
    flex: 1,
  },
});

