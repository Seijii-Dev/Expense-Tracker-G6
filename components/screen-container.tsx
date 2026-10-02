import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: object }>) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [progress]);

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            style,
            { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
          ]}
        >
          {children}
        </Animated.View>
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
    paddingHorizontal: Platform.OS === "web" ? 28 : 20,
    paddingTop: Platform.OS === "android" ? 10 : 5,
    paddingBottom: 96,
  },
});
