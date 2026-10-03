import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  const { colors, dark } = useTheme();
  const info = TAB_NAME_MAP[name] || { tab: "overview" as NavTabName, label: name };
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const activeAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: isFocused ? 1 : 0,
      damping: 18,
      stiffness: 240,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [isFocused, activeAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 16,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  const iconSize = isCompact ? 19 : 21;

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
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Active Pill Indicator */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activePill,
            {
              backgroundColor: dark ? "rgba(255, 117, 101, 0.18)" : colors.primarySoft,
              borderColor: dark ? "rgba(255, 117, 101, 0.38)" : "rgba(255, 101, 84, 0.28)",
              opacity: activeAnim,
              transform: [
                {
                  scale: activeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.82, 1],
                  }),
                },
              ],
            },
          ]}
        />

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
              fontSize: isCompact ? 9.5 : 11,
              fontWeight: isFocused ? "700" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {info.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { openAddExpenseModal } = useExpenses();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const fabScaleAnim = useRef(new Animated.Value(1)).current;

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
  const isSmallScreen = windowWidth < 360;
  const isTabletOrDesktop = windowWidth >= 600;
  const dockMaxWidth = 460;

  // Horizontal dock positioning
  const dockWidth = isTabletOrDesktop
    ? dockMaxWidth
    : Math.min(dockMaxWidth, windowWidth - (isSmallScreen ? 16 : 24));

  const bottomInset = Math.max(insets.bottom + 8, Platform.OS === "ios" ? 18 : 12);

  const handleFabPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Non-fatal
    }
    openAddExpenseModal();
  };

  const handleFabPressIn = () => {
    Animated.spring(fabScaleAnim, {
      toValue: 0.9,
      damping: 18,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
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
      try {
        Haptics.selectionAsync();
      } catch {
        // Non-fatal
      }

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
        radius={36}
        style={[
          styles.dockSurface,
          {
            width: dockWidth,
            borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.65)",
            shadowColor: dark ? "#000000" : "#102621",
            shadowOpacity: dark ? 0.6 : 0.14,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12,
          },
        ]}
        contentStyle={styles.dockContent}
      >
        {/* Left Tabs: Overview & Records */}
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
                backgroundColor: "#FF6554",
                transform: [{ scale: fabScaleAnim }],
              },
            ]}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </Animated.View>
        </Pressable>

        {/* Right Tabs: Reports & Settings */}
        {renderTab("reports")}
        {renderTab("settings")}
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
    height: 68,
    borderRadius: 36,
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
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    paddingVertical: 2,
  },
  activePill: {
    position: "absolute",
    top: -2,
    bottom: -2,
    left: "8%",
    right: "8%",
    borderRadius: 20,
    borderWidth: 1,
  },
  iconContainer: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    letterSpacing: -0.2,
    marginTop: 3,
    lineHeight: 13,
    textAlign: "center",
  },
  fabContainer: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  fabButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6554",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
