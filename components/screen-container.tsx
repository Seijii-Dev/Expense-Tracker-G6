import { PropsWithChildren } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function ScreenContainer({
  children,
  style,
  noBottomPadding = true,
}: PropsWithChildren<{ style?: object; noBottomPadding?: boolean }>) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  // ScreenContainer lets scrollable children fill full height so content scrolls under the floating dock.
  // bottomClearance is only applied when noBottomPadding is explicitly passed as false.
  const bottomClearance = noBottomPadding ? 0 : Math.max(insets.bottom + 84, 108);
  const horizontalPadding = windowWidth < 360 ? 12 : windowWidth < 480 ? 16 : 24;

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <View style={styles.centerWrapper}>
          <View
            style={[
              styles.content,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: bottomClearance,
              },
              style,
            ]}
          >
            {children}
          </View>
        </View>
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
  centerWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720, // Clean max-width for web/tablet viewing
    paddingTop: Platform.OS === "android" ? 6 : 2,
  },
});


