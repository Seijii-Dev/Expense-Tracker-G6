import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  icon = "alert-circle-outline",
  iconColor,
  iconBgColor,
  confirmText = "Confirm",
  cancelText,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const { colors, dark } = useTheme();

  const effectiveIconColor = iconColor || (destructive ? colors.primary : colors.foreground);
  const effectiveIconBg = iconBgColor || (destructive ? colors.primarySoft : colors.surfaceSubtle);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
          <GlassSurface
            variant="sheet"
            radius={26}
            style={styles.cardWrap}
            contentStyle={[styles.card, { backgroundColor: colors.card }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: effectiveIconBg }]}>
              <Ionicons name={icon} size={22} color={effectiveIconColor} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
            <View style={styles.actions}>
              {cancelText && onCancel && (
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle, borderColor: colors.border },
                    pressed && styles.pressed,
                  ]}
                  onPress={onCancel}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cancelText, { color: colors.foreground }]}>{cancelText}</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  { backgroundColor: colors.primary },
                  !cancelText && styles.fullWidthBtn,
                  pressed && styles.pressed,
                ]}
                onPress={onConfirm}
                accessibilityRole="button"
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </Pressable>
            </View>
          </GlassSurface>
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
      maxWidth: 360,
      width: "100%",
    },
    card: {
      padding: 24,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      fontFamily: "Fraunces_700Bold",
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.4,
    },
    message: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 8,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 24,
    },
    cancelBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: {
      fontSize: 13,
      fontWeight: "700",
    },
    confirmBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#FF6554",
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    fullWidthBtn: {
      flex: 1,
    },
    confirmText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
  });
