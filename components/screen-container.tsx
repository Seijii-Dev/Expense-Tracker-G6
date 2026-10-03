import { PropsWithChildren, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function ScreenContainer({
  children,
  style,
  noBottomPadding = false,
}: PropsWithChildren<{ style?: object; noBottomPadding?: boolean }>) {
  const isWeb = Platform.OS === "web";
  const progress = useRef(new Animated.Value(isWeb ? 0.3 : 0)).current;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    if (isWeb) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(progress, {
        toValue: 1,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [progress, isWeb]);

  // Ensure ample clearance for the floating navigation bar + device safe area
  const bottomClearance = noBottomPadding ? 0 : Math.max(insets.bottom + 84, 108);
  const horizontalPadding = windowWidth < 360 ? 12 : windowWidth < 480 ? 16 : 24;

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <View style={styles.centerWrapper}>
          <Animated.View
            style={[
              styles.content,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: bottomClearance,
              },
              style,
              {
                opacity: progress,
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [isWeb ? 6 : 12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {children}
          </Animated.View>
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


