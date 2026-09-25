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
import { CATEGORIES, CATEGORY_META, PAYMENT_METHODS } from "@/constants/categories";
import { getPhilippinesDate, getYesterdayDate, normalizeDate } from "@/utils/date";
import { useTheme } from "@/lib/theme-store";

interface ExpenseModalProps {
  visible: boolean;
  initialExpense?: Expense | null;
  onClose: () => void;
  onSubmit: (expenseData: NewExpenseData) => void;
}

export function ExpenseModal({ visible, initialExpense, onClose, onSubmit }: ExpenseModalProps) {
  const { colors, dark } = useTheme();

  const isEditing = Boolean(initialExpense);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [payment, setPayment] = useState<Payment>("Cash");
  const [date, setDate] = useState(getPhilippinesDate());

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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
                  backgroundColor: dark ? colors.surfaceSubtle : "#FFFAF9",
                  borderColor: dark ? colors.border : "#F2B8B0",
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
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
              ]}
            />

            {/* Date Preset Selector */}
            <Text style={[styles.label, { color: colors.subtle }]}>DATE</Text>
            <View style={styles.presetRow}>
              <Pressable
                onPress={() => setDate(today)}
                style={[
                  styles.presetChip,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  date === today && styles.presetActive,
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
                    date === today && styles.presetTextActive,
                  ]}
                >
                  Today
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDate(yesterday)}
                style={[
                  styles.presetChip,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  date === yesterday && styles.presetActive,
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
                    date === yesterday && styles.presetTextActive,
                  ]}
                >
                  Yesterday
                </Text>
              </Pressable>
            </View>

            {/* Category selection */}
            <Text style={[styles.label, { color: colors.subtle }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CATEGORIES.map((item) => {
                const meta = CATEGORY_META[item];
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
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      active && {
                        backgroundColor: dark ? `${meta.color}25` : meta.soft,
                        borderColor: meta.color,
                      },
                    ]}
                  >
                    <View style={[styles.dot, { backgroundColor: meta.color }]} />
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
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      active && styles.paymentActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.muted },
                        active && styles.paymentTextActive,
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
        </View>
      </KeyboardAvoidingView>
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
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
  presetActive: {
    borderColor: "#F2B8B0",
    backgroundColor: "#FFF0ED",
  },
  presetText: {
    fontSize: 11,
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#EB6F61",
    fontWeight: "700",
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  paymentActive: {
    borderColor: "#F2B8B0",
    backgroundColor: "#FFF0ED",
  },
  paymentTextActive: {
    color: "#EB6F61",
    fontWeight: "700",
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
