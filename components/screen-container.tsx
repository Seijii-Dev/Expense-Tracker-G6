import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: object }>) {
  const isWeb = Platform.OS === "web";
  const progress = useRef(new Animated.Value(isWeb ? 0.3 : 0)).current;

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

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <View style={styles.centerWrapper}>
          <Animated.View
            style={[
              styles.content,
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
    paddingHorizontal: Platform.OS === "web" ? 24 : 18,
    paddingTop: Platform.OS === "android" ? 6 : 2,
    paddingBottom: 92,
  },
});

