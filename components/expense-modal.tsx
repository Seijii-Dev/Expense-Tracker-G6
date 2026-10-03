import React, { useEffect, useState } from "react";
import {
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
import { Category, Expense, NewExpenseData, Payment } from "@/types/expense";
import { getCategoryStyle, PAYMENT_METHODS } from "@/constants/categories";
import { getPhilippinesDate, getYesterdayDate, normalizeDate } from "@/utils/date";
import { useTheme } from "@/lib/theme-store";
import { useExpenses } from "@/lib/expense-store";
import { GlassSurface } from "@/components/ui/glass-surface";
import { CategoryIcon } from "@/components/ui/category-icon";
import { PaymentIcon } from "@/components/ui/payment-icon";
import { CustomCategoryModal } from "@/components/settings/custom-category-modal";

interface ExpenseModalProps {
  visible: boolean;
  initialExpense?: Expense | null;
  onClose: () => void;
  onSubmit: (expenseData: NewExpenseData) => void;
}

export function ExpenseModal({ visible, initialExpense, onClose, onSubmit }: ExpenseModalProps) {
  const { colors, dark } = useTheme();
  const { allCategories, customCategories, addCustomCategory } = useExpenses();

  const isEditing = Boolean(initialExpense);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [payment, setPayment] = useState<Payment>("Cash");
  const [date, setDate] = useState(getPhilippinesDate());
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset or initialize values when modal opens
  useEffect(() => {
    if (visible) {
      setValidationError(null);
      if (initialExpense) {
        setAmount(String(initialExpense.amount));
        setDescription(initialExpense.description || "");
        setCategory(initialExpense.category || "Food");
        setPayment(initialExpense.payment || "Cash");
        setDate(normalizeDate(initialExpense.date));
      } else {
        setAmount("");
        setDescription("");
        setCategory("Food");
        setPayment("Cash");
        setDate(getPhilippinesDate());
      }
    }
  }, [visible, initialExpense]);

  const handleSave = () => {
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      setValidationError("Please enter an amount greater than ₱0.");
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Non-fatal
      }
      return;
    }
    if (!description.trim()) {
      setValidationError("Please add a description of what this was for.");
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Non-fatal
      }
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Non-fatal
    }
    onSubmit({
      amount: Math.round(numeric * 100) / 100,
      description: description.trim(),
      category,
      payment,
      date,
    });
    setValidationError(null);
    onClose();
  };

  const today = getPhilippinesDate();
  const yesterday = getYesterdayDate();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.dismissOverlay} onPress={onClose} />
        <GlassSurface
          variant="sheet"
          radius={28}
          contentStyle={[styles.card, { backgroundColor: colors.card }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.kicker, { color: colors.primary }]}>{isEditing ? "UPDATE RECORD" : "NEW RECORD"}</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {isEditing ? "Edit expense" : "Add an expense"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {isEditing ? "Adjust your recorded transaction details." : "Keep your spending ledger up to date."}
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close expense modal"
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Inline Branded Validation Warning */}
            {validationError && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: dark ? "rgba(239, 68, 68, 0.14)" : "#FEE2E2",
                    borderColor: colors.error,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorBannerText, { color: colors.error }]}>
                  {validationError}
                </Text>
              </View>
            )}

            {/* Amount input */}
            <Text style={[styles.label, { color: colors.subtle }]}>AMOUNT</Text>
            <View
              style={[
                styles.amountWrap,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                  borderColor: validationError && (!amount || parseFloat(amount) <= 0) ? colors.error : colors.border,
                },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>₱</Text>
              <TextInput
                value={amount}
                onChangeText={(val) => {
                  setAmount(val);
                  if (validationError) setValidationError(null);
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.subtle}
                style={[styles.amountInput, { color: colors.foreground }]}
                autoFocus={!isEditing}
              />
            </View>

            {/* Description input */}
            <Text style={[styles.label, { color: colors.subtle }]}>DESCRIPTION</Text>
            <TextInput
              value={description}
              onChangeText={(val) => {
                setDescription(val);
                if (validationError) setValidationError(null);
              }}
              placeholder="What was this expense for?"
              placeholderTextColor={colors.subtle}
              style={[
                styles.input,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                  borderColor: validationError && !description.trim() ? colors.error : colors.border,
                  color: colors.foreground,
                },
              ]}
            />

            {/* Date Preset Selector */}
            <Text style={[styles.label, { color: colors.subtle }]}>DATE</Text>
            <View style={styles.presetRow}>
              <Pressable
                onPress={() => setDate(today)}
                style={({ pressed }) => [
                  styles.presetChip,
                  {
                    borderColor: date === today ? colors.primary : colors.border,
                    backgroundColor:
                      date === today
                        ? dark
                          ? `${colors.primary}25`
                          : colors.primarySoft
                        : dark
                        ? "rgba(255,255,255,0.04)"
                        : colors.surfaceSubtle,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={date === today ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.presetText,
                    {
                      color: date === today ? colors.primary : colors.muted,
                      fontWeight: date === today ? "700" : "500",
                    },
                  ]}
                >
                  Today
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDate(yesterday)}
                style={({ pressed }) => [
                  styles.presetChip,
                  {
                    borderColor: date === yesterday ? colors.primary : colors.border,
                    backgroundColor:
                      date === yesterday
                        ? dark
                          ? `${colors.primary}25`
                          : colors.primarySoft
                        : dark
                        ? "rgba(255,255,255,0.04)"
                        : colors.surfaceSubtle,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={date === yesterday ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.presetText,
                    {
                      color: date === yesterday ? colors.primary : colors.muted,
                      fontWeight: date === yesterday ? "700" : "500",
                    },
                  ]}
                >
                  Yesterday
                </Text>
              </Pressable>
            </View>

            {/* Category selection */}
            <Text style={[styles.label, { color: colors.subtle }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {allCategories.map((item) => {
                const meta = getCategoryStyle(item, customCategories);
                const active = category === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {
                        // Non-fatal
                      }
                      setCategory(item);
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: active ? meta.color : colors.border,
                        backgroundColor: active
                          ? dark
                            ? `${meta.color}25`
                            : meta.soft
                          : dark
                          ? "rgba(255,255,255,0.04)"
                          : colors.surfaceSubtle,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <CategoryIcon category={item} size={16} customCategories={customCategories} />
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: active
                            ? dark
                              ? "#FFFFFF"
                              : meta.color
                            : colors.muted,
                          fontWeight: active ? "700" : "500",
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {
                    // Non-fatal
                  }
                  setShowAddCustomModal(true);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: `${colors.primary}50`,
                    borderStyle: "dashed",
                    backgroundColor: dark ? "rgba(255,255,255,0.02)" : colors.surfaceSubtle,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={[styles.chipText, { color: colors.primary, fontWeight: "700" }]}>Add</Text>
              </Pressable>
            </ScrollView>

            {/* Payment method selection */}
            <Text style={[styles.label, { color: colors.subtle }]}>PAYMENT METHOD</Text>
            <View style={styles.chipRow}>
              {PAYMENT_METHODS.map((item) => {
                const active = payment === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {
                        // Non-fatal
                      }
                      setPayment(item);
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active
                          ? dark
                            ? `${colors.primary}25`
                            : colors.primarySoft
                          : dark
                          ? "rgba(255,255,255,0.04)"
                          : colors.surfaceSubtle,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <PaymentIcon payment={item} size={16} color={active ? colors.primary : colors.muted} />
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: active ? colors.primary : colors.muted,
                          fontWeight: active ? "700" : "500",
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Submit button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.primary },
                pressed && styles.submitPressed,
              ]}
              onPress={handleSave}
              accessibilityRole="button"
            >
              <Text style={styles.submitBtnText}>{isEditing ? "Save changes" : "Save expense"}</Text>
              <Ionicons name={isEditing ? "checkmark" : "arrow-up"} size={18} color="#FFFFFF" />
            </Pressable>
          </ScrollView>
        </GlassSurface>
      </KeyboardAvoidingView>

      {/* Inline Custom Category Creator */}
      <CustomCategoryModal
        visible={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        onSave={async (cat) => {
          const success = await addCustomCategory(cat);
          if (success) {
            setCategory(cat.name);
          }
          return success;
        }}
        existingCategories={allCategories}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(7, 13, 12, 0.65)",
  },
  dismissOverlay: {
    flex: 1,
  },
  card: {
    maxHeight: "88%",
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
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
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 16,
    marginBottom: 8,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  currencySymbol: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 30,
    fontWeight: "700",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Fraunces_700Bold",
    fontSize: 30,
    fontWeight: "700",
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
    borderRadius: 14,
    borderWidth: 1,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  presetText: {
    fontSize: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  chipText: {
    fontSize: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    marginTop: 26,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  submitPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 12.5,
    fontWeight: "600",
    flex: 1,
  },
});
