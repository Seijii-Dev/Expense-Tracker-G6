import React from "react";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/lib/auth-store";
import { ScreenContainer } from "@/components/screen-container";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { FloatingTabBar } from "@/components/navigation/floating-nav-bar";

export default function TabsLayout() {
  const { account, loading } = useAuth();

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

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Records",
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
        }}
      />
    </Tabs>
  );
}


