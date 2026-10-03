import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

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
}: ConfirmDialogProps) {
  const { colors, dark } = useTheme();

  // Smooth entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [visible]);

  // Derive visual theme based on variant / destructive
  const effectiveVariant: DialogVariant = destructive ? "danger" : variant;

  let defaultIcon: keyof typeof Ionicons.glyphMap = "alert-circle-outline";
  let variantAccent = colors.primary;
  let variantSoft = colors.primarySoft;

  switch (effectiveVariant) {
    case "danger":
      defaultIcon = "trash-outline";
      variantAccent = colors.error || "#EF4444";
      variantSoft = dark ? "rgba(239, 68, 68, 0.16)" : "#FEE2E2";
      break;
    case "warning":
      defaultIcon = "warning-outline";
      variantAccent = colors.warning || "#F59E0B";
      variantSoft = dark ? "rgba(245, 158, 11, 0.16)" : "#FEF3C7";
      break;
    case "success":
      defaultIcon = "checkmark-circle-outline";
      variantAccent = colors.success || "#10B981";
      variantSoft = dark ? "rgba(16, 185, 129, 0.16)" : "#D1FAE5";
      break;
    case "info":
      defaultIcon = "information-circle-outline";
      variantAccent = "#0EA5E9";
      variantSoft = dark ? "rgba(14, 165, 233, 0.16)" : "#E0F2FE";
      break;
    case "neutral":
    default:
      defaultIcon = "alert-circle-outline";
      variantAccent = colors.primary;
      variantSoft = colors.primarySoft;
      break;
  }

  const effectiveIcon = icon || defaultIcon;
  const effectiveIconColor = iconColor || variantAccent;
  const effectiveIconBg = iconBgColor || variantSoft;

  const handleConfirm = () => {
    if (loading) return;
    try {
      if (destructive) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.selectionAsync();
      }
    } catch {
      // Non-fatal
    }
    onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;
    try {
      Haptics.selectionAsync();
    } catch {
      // Non-fatal
    }
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <GlassSurface
            variant="sheet"
            radius={28}
            style={styles.cardContainer}
            contentStyle={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Icon Pill */}
            <View style={[styles.iconWrap, { backgroundColor: effectiveIconBg }]}>
              <Ionicons name={effectiveIcon} size={24} color={effectiveIconColor} />
            </View>

            {/* Title & Message */}
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>

            {/* Actions */}
            <View style={styles.actions}>
              {cancelText && onCancel && (
                <Pressable
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    {
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                      borderColor: colors.border,
                      opacity: loading ? 0.5 : pressed ? 0.8 : 1,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={handleCancel}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelText, { color: colors.foreground }]}>
                    {cancelText}
                  </Text>
                </Pressable>
              )}
              <Pressable
                disabled={loading}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  {
                    backgroundColor: variantAccent,
                    shadowColor: variantAccent,
                  },
                  !cancelText && styles.fullWidthBtn,
                  loading && styles.disabledBtn,
                  pressed && !loading && styles.pressed,
                ]}
                onPress={handleConfirm}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </Pressable>
            </View>
          </GlassSurface>
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
    padding: 24,
  },
  cardWrap: {
    maxWidth: 380,
    width: "100%",
  },
  cardContainer: {
    width: "100%",
  },
  card: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  message: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  fullWidthBtn: {
    flex: 1,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
