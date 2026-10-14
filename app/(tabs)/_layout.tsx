import React from "react";
import { Easing } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { ScreenContainer } from "@/components/screen-container";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { FloatingTabBar } from "@/components/navigation/floating-nav-bar";
import { ExpenseModal } from "@/components/expense-modal";

// Apple fluid deceleration curve [0.16, 1, 0.3, 1] for buttery-smooth tab transitions
const fluidEase = Easing.bezier(0.16, 1, 0.3, 1);

const fluidTabTransitionSpec = {
  animation: "timing" as const,
  config: {
    duration: 260,
    easing: fluidEase,
  },
};

const fluidTabSceneInterpolator = ({
  current,
}: {
  current: { progress: any };
}) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 1, 0],
    }),
  },
});

export default function TabsLayout() {
  const { account, loading } = useAuth();
  const { addExpenseModalOpen, closeAddExpenseModal, addExpense } = useExpenses();

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
    <>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: false,
          animation: "fade",
          transitionSpec: fluidTabTransitionSpec,
          sceneStyleInterpolator: fluidTabSceneInterpolator,
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
            href: null,
          }}
        />
      </Tabs>

      {/* Global Add Expense Modal triggered from Center FAB */}
      <ExpenseModal
        visible={addExpenseModalOpen}
        onClose={closeAddExpenseModal}
        onSubmit={addExpense}
      />
    </>
  );
}


