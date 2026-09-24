import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-store";

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: object }>) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F8F5" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 10 : 5 },
});
