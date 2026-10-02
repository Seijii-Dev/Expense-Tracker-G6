import React from "react";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

type TabBarIconProps = {
  color: string;
  focused: boolean;
};

export default function TabsLayout() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  // Balanced floating pill navigation bar on all screen sizes
  const maxBarWidth = 420;
  const horizontalInset = Math.max(16, Math.floor((windowWidth - maxBarWidth) / 2));
  const bottomInset = Math.max(insets.bottom + 6, Platform.OS === "ios" ? 16 : 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.15,
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingTop: 5,
          paddingBottom: 6,
          height: 64,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarBackground: () => (
          <GlassSurface variant="nav" radius={28} style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          position: "absolute",
          left: horizontalInset,
          right: horizontalInset,
          bottom: bottomInset,
          height: 68,
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 8,
          borderRadius: 30,
          overflow: "hidden",
          shadowColor: dark ? "#000000" : "#2C3E50",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: dark ? 0.42 : 0.10,
          shadowRadius: 20,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View
              style={[
                styles.iconWrap,
                focused && [
                  styles.activeIconWrap,
                  { backgroundColor: dark ? `${colors.primary}25` : colors.primarySoft },
                ],
              ]}
            >
              <Ionicons name={focused ? "grid" : "grid-outline"} color={color} size={21} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Records",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View
              style={[
                styles.iconWrap,
                focused && [
                  styles.activeIconWrap,
                  { backgroundColor: dark ? `${colors.primary}25` : colors.primarySoft },
                ],
              ]}
            >
              <Ionicons name={focused ? "receipt" : "receipt-outline"} color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View
              style={[
                styles.iconWrap,
                focused && [
                  styles.activeIconWrap,
                  { backgroundColor: dark ? `${colors.primary}25` : colors.primarySoft },
                ],
              ]}
            >
              <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View
              style={[
                styles.iconWrap,
                focused && [
                  styles.activeIconWrap,
                  { backgroundColor: dark ? `${colors.primary}25` : colors.primarySoft },
                ],
              ]}
            >
              <Ionicons name={focused ? "settings" : "settings-outline"} color={color} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View
              style={[
                styles.iconWrap,
                focused && [
                  styles.activeIconWrap,
                  { backgroundColor: dark ? `${colors.primary}25` : colors.primarySoft },
                ],
              ]}
            >
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                color={color}
                size={23}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    height: 28,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  activeIconWrap: {
    paddingHorizontal: 12,
    transform: [{ scale: 1.05 }],
  },
});
