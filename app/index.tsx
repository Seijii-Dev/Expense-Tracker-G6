import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth-store";
import { ScreenContainer } from "@/components/screen-container";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

export default function EntryScreen() {
  const { account, loading } = useAuth();

  if (loading) {
    return (
      <ScreenContainer>
        <DashboardSkeleton />
      </ScreenContainer>
    );
  }

  return account ? <Redirect href="/(tabs)" /> : <Redirect href="/auth" />;
}

