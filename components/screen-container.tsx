import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: object }>) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: 1,
      damping: 22,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [progress]);

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
                      outputRange: [12, 0],
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

