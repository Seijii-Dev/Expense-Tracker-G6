import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";
import { NeumorphicSurface } from "@/components/ui/neumorphic-surface";
import { PressableScale } from "@/components/motion";

export type DialogVariant = "danger" | "warning" | "success" | "info" | "neutral";

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: DialogVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
  loading?: boolean;
  snippet?: {
    title: string;
    subtitle?: string;
    amount?: string | number;
    badge?: string;
    icon?: keyof typeof Ionicons.glyphMap;
  };
}

export function ConfirmDialog({
  visible,
  title,
  message,
  variant = "neutral",
  icon,
  iconColor,
  iconBgColor,
  confirmText = "Confirm",
  cancelText,
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
  snippet,
}: ConfirmDialogProps) {
  const { colors, dark } = useTheme();
  const reduceMotion = useReducedMotion();

  const fade = useSharedValue(0);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    if (visible) {
      fade.value = reduceMotion
        ? 1
        : withTiming(1, {
            duration: 180,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
      scale.value = reduceMotion
        ? 1
        : withSpring(1, {
            damping: 22,
            stiffness: 260,
            mass: 0.7,
          });
    } else {
      fade.value = 0;
      scale.value = 0.94;
    }
  }, [visible, fade, scale, reduceMotion]);

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }));

  const effectiveVariant: DialogVariant = destructive ? "danger" : variant;

  let defaultIcon: keyof typeof Ionicons.glyphMap = "alert-circle-outline";
  let variantAccent = colors.primary;
  let variantSoft = colors.primarySoft;

  switch (effectiveVariant) {
    case "danger":
      defaultIcon = "trash";
      variantAccent = colors.primary;
      variantSoft = dark ? "rgba(232, 74, 63, 0.22)" : "#FEECEB";
      break;
    case "warning":
      defaultIcon = "warning";
      variantAccent = colors.warning || "#F59E0B";
      variantSoft = dark ? "rgba(245, 158, 11, 0.20)" : "#FEF3C7";
      break;
    case "success":
      defaultIcon = "checkmark-circle";
      variantAccent = colors.success || "#10B981";
      variantSoft = dark ? "rgba(16, 185, 129, 0.20)" : "#ECFDF5";
      break;
    case "info":
      defaultIcon = "information-circle";
      variantAccent = "#0EA5E9";
      variantSoft = dark ? "rgba(14, 165, 233, 0.20)" : "#E0F2FE";
      break;
    case "neutral":
    default:
      defaultIcon = "alert-circle";
      variantAccent = colors.primary;
      variantSoft = colors.primarySoft;
      break;
  }

  const effectiveIcon = icon || defaultIcon;
  const effectiveIconColor = iconColor || variantAccent;
  const effectiveIconBg = iconBgColor || variantSoft;

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;

    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleCancel}
          accessibilityLabel="Dismiss dialog"
          accessibilityRole="button"
        />
        <Animated.View style={[styles.cardWrap, dialogAnimatedStyle]}>
          <NeumorphicSurface
            variant="sheet"
            radius={26}
            style={styles.cardContainer}
            contentStyle={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Soft Warm Floating Warning Badge */}
            <View style={[styles.iconWrapOuter, { backgroundColor: effectiveIconBg }]}>
              <View style={[styles.iconWrapInner, { backgroundColor: effectiveIconBg }]}>
                <Ionicons name={effectiveIcon} size={24} color={effectiveIconColor} />
              </View>
            </View>

            {/* Title & Message */}
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.foreground }]}>{message}</Text>

            {/* In-Dialog Snippet Preview if provided */}
            {snippet && (
              <View
                style={[
                  styles.snippetCard,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.snippetLeft}>
                  <View
                    style={[
                      styles.snippetIconBox,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <Ionicons
                      name={snippet.icon || "receipt-outline"}
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.snippetTextWrap}>
                    <Text
                      style={[styles.snippetTitle, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {snippet.title}
                    </Text>
                    {snippet.subtitle && (
                      <Text style={[styles.snippetSubtitle, { color: colors.muted }]}>
                        {snippet.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                {snippet.amount !== undefined && (
                  <Text style={[styles.snippetAmount, { color: colors.foreground }]}>
                    {snippet.amount}
                  </Text>
                )}
              </View>
            )}

            {/* High-Contrast Action Buttons */}
            <View style={styles.actions}>
              <PressableScale
                disabled={loading}
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: variantAccent,
                    shadowColor: variantAccent,
                  },
                  loading && styles.disabledBtn,
                ]}
                onPress={handleConfirm}
                accessibilityRole="button"

              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </PressableScale>

              {cancelText && onCancel && (
                <PressableScale
                  disabled={loading}
                  style={[
                    styles.cancelBtn,
                    {
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                      borderColor: colors.border,
                      opacity: loading ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleCancel}
                  accessibilityRole="button"

                >
                  <Text style={[styles.cancelText, { color: colors.foreground }]}>
                    {cancelText}
                  </Text>
                </PressableScale>
              )}
            </View>

          </NeumorphicSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardWrap: {
    maxWidth: 360,
    width: "100%",
  },
  cardContainer: {
    width: "100%",
  },
  card: {
    padding: 24,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    textAlign: "center",
    shadowColor: "#1A1D20",
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  iconWrapOuter: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconWrapInner: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  message: {
    width: "100%",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
    flexShrink: 1,
  },
  snippetCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  snippetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  snippetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  snippetTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  snippetTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  snippetSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  snippetAmount: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  actions: {
    flexDirection: "column",
    gap: 8,
    marginTop: 20,
    width: "100%",
  },
  confirmBtn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  cancelBtn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
