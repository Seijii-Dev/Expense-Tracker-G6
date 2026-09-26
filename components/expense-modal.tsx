import React, { useEffect, useState } from "react";
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

  // Reset or initialize values when modal opens
  useEffect(() => {
    if (visible) {
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
      Alert.alert("Invalid Amount", "Please enter an amount greater than 0.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing Description", "Please add a description of what this was for.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      amount: Math.round(numeric * 100) / 100,
      description: description.trim(),
      category,
      payment,
      date,
    });
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
            {/* Amount input */}
            <Text style={[styles.label, { color: colors.subtle }]}>AMOUNT</Text>
            <View
              style={[
                styles.amountWrap,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#FFF9F8",
                  borderColor: dark ? colors.border : "#F4CCC5",
                },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>₱</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
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
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              placeholderTextColor={colors.subtle}
              style={[
                styles.input,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F6FAFC",
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />

            {/* Date Preset Selector */}
            <Text style={[styles.label, { color: colors.subtle }]}>DATE</Text>
            <View style={styles.presetRow}>
              <Pressable
                onPress={() => setDate(today)}
                style={[
                  styles.presetChip,
                  { borderColor: colors.border, backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F6FAFC" },
                  date === today && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={date === today ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.presetText,
                    { color: colors.muted },
                    date === today && { color: colors.primary, fontWeight: "700" },
                  ]}
                >
                  Today
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDate(yesterday)}
                style={[
                  styles.presetChip,
                  { borderColor: colors.border, backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F6FAFC" },
                  date === yesterday && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={date === yesterday ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.presetText,
                    { color: colors.muted },
                    date === yesterday && { color: colors.primary, fontWeight: "700" },
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
                      Haptics.selectionAsync();
                      setCategory(item);
                    }}
                    style={[
                      styles.chip,
                      { borderColor: colors.border, backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F6FAFC" },
                      active && {
                        backgroundColor: dark ? `${meta.color}25` : meta.soft,
                        borderColor: meta.color,
                      },
                    ]}
                  >
                    <CategoryIcon category={item} size={16} customCategories={customCategories} />
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.muted },
                        active && { color: meta.color, fontWeight: "700" },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowAddCustomModal(true);
                }}
                style={[
                  styles.chip,
                  {
                    borderColor: colors.border,
                    borderStyle: "dashed",
                    backgroundColor: dark ? "rgba(255,255,255,0.04)" : "#FAFCFB",
                  },
                ]}
              >
                <Ionicons name="add" size={15} color={colors.primary} />
                <Text style={[styles.chipText, { color: colors.primary, fontWeight: "600" }]}>Add</Text>
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
                      Haptics.selectionAsync();
                      setPayment(item);
                    }}
                    style={[
                      styles.chip,
                      { borderColor: colors.border, backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F6FAFC" },
                      active && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primarySoft,
                      },
                    ]}
                  >
                    <PaymentIcon payment={item} size={16} color={active ? colors.primary : colors.muted} />
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.muted },
                        active && { color: colors.primary, fontWeight: "700" },
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
              style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary }, pressed && styles.submitPressed]}
              onPress={handleSave}
            >
              <Text style={styles.submitBtnText}>{isEditing ? "Save changes" : "Save expense"}</Text>
              <Ionicons name={isEditing ? "checkmark" : "arrow-up"} size={17} color="#FFFFFF" />
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
    backgroundColor: "rgba(18, 27, 24, 0.55)",
  },
  dismissOverlay: {
    flex: 1,
  },
  card: {
    maxHeight: "88%",
    padding: 22,
    paddingBottom: Platform.OS === "ios" ? 38 : 28,
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
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 14,
    marginBottom: 7,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: "700",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Fraunces_700Bold",
    fontSize: 26,
    fontWeight: "700",
  },
  input: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    gap: 7,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    marginTop: 24,
    marginBottom: 6,
    borderRadius: 12,
    shadowColor: "#EB6F61",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
