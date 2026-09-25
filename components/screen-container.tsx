import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: object }>) {
  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <View style={[styles.content, style]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 5,
    paddingBottom: 96,
  },
});
