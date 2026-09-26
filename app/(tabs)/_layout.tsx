import { Tabs } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

type TabBarIconProps = {
  color: string;
  size?: number;
  focused: boolean;
};

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  // Compress width and center floating pill navigation bar on wider screens
  const maxBarWidth = 380;
  const horizontalInset = Math.max(28, Math.floor((windowWidth - maxBarWidth) / 2));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 9.5, fontWeight: "700", marginTop: 1, marginBottom: 2 },
        tabBarItemStyle: { paddingTop: 3, paddingBottom: 2 },
        tabBarBackground: () => (
          <GlassSurface variant="nav" radius={24} style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          position: "absolute",
          left: horizontalInset,
          right: horizontalInset,
          bottom: Math.max(insets.bottom, 10),
          height: 58,
          paddingTop: 2,
          paddingBottom: 2,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
          borderRadius: 24,
          overflow: "hidden",
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "grid" : "grid-outline"} color={color} size={20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Records",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "list" : "list-outline"} color={color} size={20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "settings" : "settings-outline"} color={color} size={20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }: TabBarIconProps) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Ionicons name={focused ? "person-circle" : "person-circle-outline"} color={color} size={20} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    transform: [{ scale: 1.05 }],
  },
});
