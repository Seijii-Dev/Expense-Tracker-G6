import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

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
  const { colors } = useTheme();

  const effectiveIconColor = iconColor || (destructive ? colors.primary : colors.foreground);
  const effectiveIconBg = iconBgColor || (destructive ? colors.primarySoft : colors.surfaceSubtle);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: effectiveIconBg }]}>
            <Ionicons name={icon} size={22} color={effectiveIconColor} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
          <View style={styles.actions}>
            {cancelText && onCancel && (
              <Pressable
                style={[styles.cancelBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={onCancel}
              >
                <Text style={[styles.cancelText, { color: colors.foreground }]}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.confirmBtn,
                { backgroundColor: destructive ? colors.primary : colors.primary },
                !cancelText && styles.fullWidthBtn,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
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
  card: {
    padding: 24,
    borderRadius: 22,
    maxWidth: 360,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidthBtn: {
    flex: 1,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
