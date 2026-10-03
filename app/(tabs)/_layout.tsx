import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import { NavIcon, NavTabName } from "@/components/navigation/nav-icons";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ScreenContainer } from "@/components/screen-container";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

type TabBarItemProps = {
  focused: boolean;
  color: string;
  tab: NavTabName;
  label: string;
};

function CustomTabItem({ focused, tab, label }: TabBarItemProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.itemWrap}>
      <View
        style={[
          styles.iconPill,
          {
            backgroundColor: focused
              ? dark
                ? "rgba(255, 117, 101, 0.18)"
                : colors.primarySoft
              : "transparent",
            borderColor: focused
              ? dark
                ? "rgba(255, 117, 101, 0.35)"
                : "rgba(255, 101, 84, 0.22)"
              : "transparent",
          },
          focused && styles.activeIconPill,
        ]}
      >
        <NavIcon
          name={tab}
          focused={focused}
          color={focused ? colors.primary : colors.muted}
          size={21}
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
  const maxBarWidth = 480;
  const horizontalInset = Math.max(12, Math.floor((windowWidth - maxBarWidth) / 2));
  const bottomInset = Math.max(insets.bottom + 6, Platform.OS === "ios" ? 18 : 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: 64,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
          paddingHorizontal: 0,
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
              tab="overview"
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
              tab="records"
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
              tab="reports"
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
              tab="settings"
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
              tab="account"
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
    paddingHorizontal: 0,
  },
  iconPill: {
    height: 30,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  activeIconPill: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginTop: 2,
    lineHeight: 13,
    textAlign: "center",
  },
  activeLabel: {
    fontWeight: "700",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

