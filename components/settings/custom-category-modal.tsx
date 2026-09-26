import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GlassSurface } from "@/components/ui/glass-surface";
import { PRESET_CATEGORY_COLORS, PRESET_CATEGORY_ICONS } from "@/constants/categories";
import { useTheme } from "@/lib/theme-store";

interface CustomCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (cat: { name: string; color: string; soft: string; icon: string }) => Promise<boolean>;
  existingCategories: string[];
}

export function CustomCategoryModal({
  visible,
  onClose,
  onSave,
  existingCategories,
}: CustomCategoryModalProps) {
  const { colors, dark } = useTheme();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(PRESET_CATEGORY_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSelectedColor(PRESET_CATEGORY_COLORS[0]);
    setSelectedIcon(PRESET_CATEGORY_ICONS[0]);
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a category name.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (
      existingCategories.some(
        (cat) => cat.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setErrorMessage(`"${trimmed}" category already exists.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const success = await onSave({
        name: trimmed,
        color: selectedColor.color,
        soft: selectedColor.soft,
        icon: selectedIcon,
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        resetForm();
        onClose();
      } else {
        setErrorMessage("Failed to add category. Name might already be taken.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.overlay} onPress={handleClose} />
        <GlassSurface
          variant="sheet"
          radius={28}
          contentStyle={[styles.modalCard, { backgroundColor: colors.card }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.kicker, { color: colors.primary }]}>NEW CATEGORY</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>Add custom category</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                Personalize your tracking with custom categories and colors.
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Live Preview Pill */}
            <Text style={[styles.sectionLabel, { color: colors.subtle }]}>PREVIEW</Text>
            <View style={styles.previewContainer}>
              <View
                style={[
                  styles.previewPill,
                  {
                    backgroundColor: dark ? `${selectedColor.color}25` : selectedColor.soft,
                    borderColor: selectedColor.color,
                  },
                ]}
              >
                <Ionicons
                  name={selectedIcon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={selectedColor.color}
                />
                <Text style={[styles.previewPillText, { color: selectedColor.color }]}>
                  {name.trim() || "Category name"}
                </Text>
              </View>
            </View>

            {/* Category Name Input */}
            <Text style={[styles.sectionLabel, { color: colors.subtle }]}>CATEGORY NAME</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: errorMessage ? colors.error : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. Gym, Pets, Subscriptions"
                placeholderTextColor={colors.subtle}
                maxLength={24}
                style={[styles.input, { color: colors.foreground }]}
              />
              {name.length > 0 && (
                <Pressable onPress={() => setName("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              )}
            </View>
            {errorMessage && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
            )}

            {/* Color Palette Selection */}
            <Text style={[styles.sectionLabel, { color: colors.subtle }]}>CHOOSE COLOR</Text>
            <View style={styles.colorPalette}>
              {PRESET_CATEGORY_COLORS.map((preset) => {
                const isSelected = selectedColor.color === preset.color;
                return (
                  <Pressable
                    key={preset.color}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedColor(preset);
                    }}
                    style={[
                      styles.colorDot,
                      { backgroundColor: preset.color },
                      isSelected && styles.colorDotSelected,
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </Pressable>
                );
              })}
            </View>

            {/* Icon Selection */}
            <Text style={[styles.sectionLabel, { color: colors.subtle }]}>CHOOSE ICON</Text>
            <View style={styles.iconGrid}>
              {PRESET_CATEGORY_ICONS.map((iconName) => {
                const isSelected = selectedIcon === iconName;
                return (
                  <Pressable
                    key={iconName}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedIcon(iconName);
                    }}
                    style={[
                      styles.iconCell,
                      {
                        borderColor: isSelected ? selectedColor.color : colors.border,
                        backgroundColor: isSelected
                          ? dark
                            ? `${selectedColor.color}25`
                            : selectedColor.soft
                          : colors.surface,
                      },
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={20}
                      color={isSelected ? selectedColor.color : colors.muted}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Submit Action */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: selectedColor.color },
                pressed && styles.pressed,
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Creating…" : "Save category"}
              </Text>
            </Pressable>
          </ScrollView>
        </GlassSurface>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    padding: 22,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 14,
    marginBottom: 8,
  },
  previewContainer: {
    alignItems: "flex-start",
    marginBottom: 8,
  },
  previewPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  previewPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: {
    transform: [{ scale: 1.15 }],
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 20,
  },
  iconCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
