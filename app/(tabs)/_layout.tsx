import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ScreenContainer } from "@/components/screen-container";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

type TabBarIconProps = {
  focused: boolean;
  color: string;
  name: keyof typeof Ionicons.glyphMap;
  activeName: keyof typeof Ionicons.glyphMap;
  label: string;
};

function CustomTabItem({ focused, name, activeName, label }: TabBarIconProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.itemWrap}>
      <View
        style={[
          styles.iconPill,
          focused && [
            styles.activeIconPill,
            {
              backgroundColor: dark ? "rgba(255, 117, 101, 0.16)" : colors.primarySoft,
              borderColor: dark ? "rgba(255, 117, 101, 0.35)" : "rgba(255, 101, 84, 0.2)",
            },
          ],
        ]}
      >
        <Ionicons
          name={focused ? activeName : name}
          color={focused ? colors.primary : colors.muted}
          size={20}
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: focused ? colors.primary : colors.muted },
          focused && styles.activeLabel,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View
        style={[
          styles.activeDot,
          {
            backgroundColor: focused ? colors.primary : "transparent",
            opacity: focused ? 1 : 0,
          },
        ]}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { account, loading } = useAuth();
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  if (loading) {
    return (
      <ScreenContainer>
        <DashboardSkeleton />
      </ScreenContainer>
    );
  }

  if (!account) {
    return <Redirect href="/auth" />;
  }

  // Balanced floating pill navigation bar on all screen sizes
  const maxBarWidth = 460;
  const horizontalInset = Math.max(16, Math.floor((windowWidth - maxBarWidth) / 2));
  const bottomInset = Math.max(insets.bottom + 6, Platform.OS === "ios" ? 18 : 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: 64,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
          ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
        },
        tabBarBackground: () => (
          <GlassSurface variant="nav" radius={32} style={StyleSheet.absoluteFill} />
        ),
        tabBarStyle: {
          position: "absolute",
          left: horizontalInset,
          right: horizontalInset,
          bottom: bottomInset,
          height: 66,
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 10,
          borderRadius: 32,
          overflow: "hidden",
          shadowColor: dark ? "#000000" : "#172E27",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: dark ? 0.5 : 0.12,
          shadowRadius: 24,
        },
        tabBarHideOnKeyboard: true,
      }}
      screenListeners={{
        tabPress: () => {
          try {
            Haptics.selectionAsync();
          } catch {
            // Non-fatal
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ focused, color }) => (
            <CustomTabItem
              focused={focused}
              color={color}
              name="grid-outline"
              activeName="grid"
              label="Overview"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Records",
          tabBarIcon: ({ focused, color }) => (
            <CustomTabItem
              focused={focused}
              color={color}
              name="receipt-outline"
              activeName="receipt"
              label="Records"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ focused, color }) => (
            <CustomTabItem
              focused={focused}
              color={color}
              name="stats-chart-outline"
              activeName="stats-chart"
              label="Reports"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <CustomTabItem
              focused={focused}
              color={color}
              name="settings-outline"
              activeName="settings"
              label="Settings"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused, color }) => (
            <CustomTabItem
              focused={focused}
              color={color}
              name="person-circle-outline"
              activeName="person-circle"
              label="Account"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  itemWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 2,
  },
  iconPill: {
    height: 30,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeIconPill: {
    transform: [{ scale: 1.04 }],
  },
  label: {
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  activeLabel: {
    fontWeight: "800",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

