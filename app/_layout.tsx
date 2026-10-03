import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, View, StyleSheet } from "react-native";
import { ExpenseProvider } from "@/lib/expense-store";
import { AuthProvider } from "@/lib/auth-store";
import { ThemeProvider, useTheme } from "@/lib/theme-store";
import { FontsLoadedProvider } from "@/lib/fonts-loaded-store";
import { StoragePermissionPrompt } from "@/components/common/storage-permission-dialog";
import { SplashScreen } from "@/components/common/splash-screen";

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
    // Load Ionicons under both casing keys so Font.isLoaded('ionicons') resolves on web
    ...Ionicons.font,
    Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      // Belt-and-suspenders: ensure ionicons @font-face is always declared in DOM
      const styleId = "expo-vector-icons-ionicons";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          @font-face {
            font-family: 'ionicons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
            font-display: block;
          }
          @font-face {
            font-family: 'Ionicons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
            font-display: block;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ExpenseProvider>
            <FontsLoadedProvider loaded={Boolean(fontsLoaded)}>
              <ThemedStatusBar />
              <View style={styles.rootWrap}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    // Use none on web to avoid the JS-animated fade which is laggy
                    animation: Platform.OS === "web" ? "none" : "default",
                  }}
                />
                <StoragePermissionPrompt />
                {/* Branded Application Launch Screen */}
                <SplashScreen isReady={Boolean(fontsLoaded)} />
              </View>
            </FontsLoadedProvider>
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

