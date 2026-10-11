import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useReducedMotion,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";
import { useExpenses } from "@/lib/expense-store";
import { NavIcon, NavTabName } from "@/components/navigation/nav-icons";
import { GlassSurface } from "@/components/ui/glass-surface";

export interface FloatingTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: any }>;
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string, params?: any) => void;
  };
  insets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const TAB_NAME_MAP: Record<string, { tab: NavTabName; label: string }> = {
  index: { tab: "overview", label: "Overview" },
  transactions: { tab: "records", label: "Records" },
  reports: { tab: "reports", label: "Reports" },
  settings: { tab: "settings", label: "Settings" },
  account: { tab: "account", label: "Account" },
};

interface TabButtonProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  isCompact: boolean;
}

function TabButton({ name, isFocused, onPress, onLongPress, isCompact }: TabButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const info = TAB_NAME_MAP[name] || { tab: "overview" as NavTabName, label: name };
  const scale = useSharedValue(1);
  const active = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    active.value = reduceMotion
      ? isFocused ? 1 : 0
      : withSpring(isFocused ? 1 : 0, {
          damping: 18,
          stiffness: 240,
          mass: 0.8,
        });
  }, [active, isFocused, reduceMotion]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: active.value,
    transform: [{ scale: 0.4 + active.value * 0.6 }],
  }));

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.92, {
        damping: 20,
        stiffness: 320,
      });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, {
        damping: 16,
        stiffness: 240,
      });
    }
  };

  const iconSize = isCompact ? 18 : 21;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={info.label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tabBtn,
        Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as any) : {},
      ]}
    >
      <Animated.View style={[styles.tabContent, scaleStyle]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <NavIcon
            name={info.tab}
            focused={isFocused}
            color={isFocused ? colors.primary : colors.muted}
            size={iconSize}
          />
        </View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.muted,
              fontSize: isCompact ? 9 : 10,
              fontWeight: isFocused ? "700" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {info.label}
        </Text>

        {/* Active Coral Dot Indicator directly beneath label */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicatorDot,
            { backgroundColor: colors.primary },
            indicatorStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { openAddExpenseModal } = useExpenses();
  const reduceMotion = useReducedMotion();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const fabScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Auto-hide floating nav bar when virtual keyboard opens on mobile
  useEffect(() => {
    if (Platform.OS === "web") return;
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) {
    return null;
  }

  // Responsive dock sizing
  const isSmallScreen = windowWidth < 380;
  const isTabletOrDesktop = windowWidth >= 600;
  const dockMaxWidth = 500;

  // Horizontal dock positioning
  const dockWidth = isTabletOrDesktop
    ? dockMaxWidth
    : Math.min(dockMaxWidth, windowWidth - (isSmallScreen ? 16 : 24));

  const bottomInset = Math.max(insets.bottom + 10, Platform.OS === "ios" ? 20 : 14);

  const handleFabPress = () => {
    openAddExpenseModal();
  };

  const handleFabPressIn = () => {
    if (!reduceMotion) {
      fabScale.value = withSpring(0.92, {
        damping: 18,
        stiffness: 320,
      });
    }
  };

  const handleFabPressOut = () => {
    if (!reduceMotion) {
      fabScale.value = withSpring(1, {
        damping: 15,
        stiffness: 240,
      });
    }
  };

  const renderTab = (routeName: string) => {
    const routeIndex = state.routes.findIndex((r) => r.name === routeName);
    if (routeIndex === -1) return null;
    const route = state.routes[routeIndex];
    const isFocused = state.index === routeIndex;
    const { options } = descriptors[route.key] || {};

    if (options?.tabBarButton === (() => null)) {
      return null;
    }

    const handlePress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const handleLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    return (
      <TabButton
        key={route.key}
        name={route.name}
        isFocused={isFocused}
        onPress={handlePress}
        onLongPress={handleLongPress}
        isCompact={isSmallScreen}
      />
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerContainer,
        {
          bottom: bottomInset,
        },
      ]}
    >
      <GlassSurface
        variant="nav"
        radius={32}
        style={[
          styles.dockSurface,
          {
            width: dockWidth,
            borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(241, 243, 245, 0.95)",
            shadowColor: dark ? "#000000" : "#1A1D20",
            shadowOpacity: dark ? 0.5 : 0.08,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12,
          },
        ]}
        contentStyle={styles.dockContent}
      >
        {/* Keep the original tab order around the add action. */}
        {renderTab("index")}
        {renderTab("transactions")}

        {/* Center Floating Action Button (+) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add New Expense"
          onPress={handleFabPress}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          style={[
            styles.fabContainer,
            Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as any) : {},
          ]}
        >
          <Animated.View
            style={[
              styles.fabButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
              fabAnimatedStyle,
            ]}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Animated.View>
        </Pressable>

        {/* Remaining destinations, including Account. */}
        {renderTab("reports")}
        {renderTab("settings")}
        {renderTab("account")}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  dockSurface: {
    height: 64,
    borderRadius: 32,
  },
  dockContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    paddingHorizontal: 6,
  },
  tabBtn: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minWidth: 0,
    position: "relative",
    paddingVertical: 2,
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  iconContainer: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "DMSans_500Medium",
    letterSpacing: -0.1,
    marginTop: 2,
    lineHeight: 13,
    textAlign: "center",
  },
  fabContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  fabButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.38,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
