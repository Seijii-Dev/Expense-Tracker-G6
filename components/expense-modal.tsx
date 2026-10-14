import React, { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Category, Expense, NewExpenseData, Payment } from "@/types/expense";
import { getCategoryStyle, PAYMENT_METHODS } from "@/constants/categories";
import { getPhilippinesDate, getYesterdayDate, normalizeDate } from "@/utils/date";
import { useTheme } from "@/lib/theme-store";
import { useExpenses } from "@/lib/expense-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { PaymentIcon } from "@/components/ui/payment-icon";
import { CustomCategoryModal } from "@/components/settings/custom-category-modal";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import { PressableScale } from "@/components/motion";
import { formatDate, formatMoney } from "@/utils/formatters";
import { AppLottieView } from "@/components/ui/app-lottie-view";
import { GlassSurface } from "@/components/ui/glass-surface";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import { radii, spacing } from "@/constants/design-tokens";

interface ExpenseModalProps {
  visible: boolean;
  initialExpense?: Expense | null;
  onClose: () => void;
  onSubmit: (expenseData: NewExpenseData) => void;
}

export function ExpenseModal({ visible, initialExpense, onClose, onSubmit }: ExpenseModalProps) {
  const { colors, dark } = useTheme();
  const { allCategories, customCategories, addCustomCategory, monthTotal, budget } = useExpenses();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const isEditing = Boolean(initialExpense);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [payment, setPayment] = useState<Payment>("Cash");
  const [date, setDate] = useState(getPhilippinesDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleRequestClose = useCallback(() => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    onClose();
  }, [isKeyboardVisible, onClose]);

  const finishSuccess = useCallback(() => {
    setShowSuccessModal(false);
    setIsSubmitting(false);
    setValidationError(null);
    onClose();
  }, [onClose]);

  const handleSuccessAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (!isCancelled) finishSuccess();
    },
    [finishSuccess]
  );

  useEffect(() => {
    if (!showSuccessModal) return;
    // Safety fallback for reduced-motion devices or a Lottie rendering failure.
    const timer = setTimeout(finishSuccess, 2500);
    return () => clearTimeout(timer);
  }, [finishSuccess, showSuccessModal]);

  // Reset or initialize values when modal opens
  useEffect(() => {
    if (visible) {
      setValidationError(null);
      setIsSubmitting(false);
      setShowSuccessModal(false);
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

  const handleReset = () => {
    setAmount("");
    setDescription("");
    setCategory("Food");
    setPayment("Cash");
    setDate(getPhilippinesDate());
    setValidationError(null);
    setIsSubmitting(false);
    setShowSuccessModal(false);
  };

  const numericAmount = parseFloat(amount) || 0;
  const originalAmount = initialExpense?.amount || 0;
  const netAddedAmount = isEditing ? numericAmount - originalAmount : numericAmount;
  const projectedMonthTotal = monthTotal + netAddedAmount;
  const isOverBudget = budget > 0 && numericAmount > 0 && projectedMonthTotal > budget;
  const overBudgetAmount = projectedMonthTotal - budget;

  const handleAddPreset = (preset: number) => {
    const current = parseFloat(amount) || 0;
    const next = current + preset;
    setAmount(String(Math.round(next * 100) / 100));
    if (validationError) setValidationError(null);
  };

  const handleSave = () => {
    if (isSubmitting) return; // Prevent duplicate submissions caused by repeated taps
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      setValidationError("Please enter an amount greater than ₱0.");
      return;
    }

    setIsSubmitting(true);
    const submittedDate =
      initialExpense && date === normalizeDate(initialExpense.date) ? initialExpense.date : date;
    const finalDescription = description.trim() || category;

    // Save operation executed first
    onSubmit({
      amount: Math.round(numeric * 100) / 100,
      description: finalDescription,
      category,
      payment,
      date: submittedDate,
    });

    // Show Lottie success vector animation feedback
    setShowSuccessModal(true);
  };

  const today = getPhilippinesDate();
  const yesterday = getYesterdayDate();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? "none" : "slide"}
      onRequestClose={handleRequestClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        {/* Full-screen backdrop overlay for dismissing */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Dismiss modal"
        />

        {/* Upper transparent dismiss tap area above sheet */}
        <Pressable
          style={styles.dismissAreaTop}
          onPress={onClose}
          accessibilityLabel="Dismiss modal"
        />

        {/* Tactile Bottom Sheet Card */}
        <View
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => {
            if (Platform.OS === "web") {
              (e as any).stopPropagation?.();
            }
          }}
          style={[
            styles.card,
            {
              maxHeight: Platform.OS === "android" ? "92%" : Math.min(windowHeight * 0.9, 820),
              paddingBottom: Math.max(insets.bottom + 16, 20),
              paddingHorizontal: windowWidth < 360 ? 14 : spacing.lg,
            },
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Subtle Top Handle */}
          <View style={styles.dragHandleWrap}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)" },
              ]}
            />
          </View>

          {/* Top Header Row */}
          <View style={styles.topBar}>
            <Pressable
              hitSlop={10}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close form"
              style={[
                styles.iconButton,
                { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.foreground} />
            </Pressable>

            <View style={styles.topTitleWrap}>
              <Text style={[styles.kicker, { color: colors.muted }]}>
                {isEditing ? "EDIT TRANSACTION" : "NEW TRANSACTION"}
              </Text>
              <Text style={[styles.topTitle, { color: colors.foreground }]}>
                {isEditing ? "Edit Record" : "Add Expense"}
              </Text>
            </View>

            <Pressable
              hitSlop={10}
              onPress={handleReset}
              accessibilityRole="button"
              accessibilityLabel="Reset form"
              style={[
                styles.resetBtn,
                { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
              ]}
            >
              <Text style={[styles.resetBtnText, { color: colors.primary }]}>Reset</Text>
            </Pressable>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Inline Validation Warning */}
            {validationError && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: dark ? "rgba(232, 74, 63, 0.16)" : "#FEECEB",
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={17} color={colors.primary} />
                <Text style={[styles.errorBannerText, { color: colors.primary }]}>
                  {validationError}
                </Text>
              </View>
            )}

            {/* Visual Centerpiece: Amount Display Card */}
            <View
              style={[
                styles.amountHeroCard,
                {
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.03)" : colors.surfaceSubtle,
                  borderColor:
                    validationError && (!amount || parseFloat(amount) <= 0)
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Text style={[styles.amountOverline, { color: colors.muted }]}>ENTER AMOUNT</Text>

              <View style={styles.amountInputRow}>
                <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₱</Text>
                <TextInput
                  value={amount}
                  accessibilityLabel="Expense amount in Philippine pesos"
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

              <View style={styles.presetsRow}>
                {[50, 100, 500, 1000].map((preset) => (
                  <PressableScale
                    key={preset}
                    onPress={() => handleAddPreset(preset)}
                    style={[
                      styles.amountPresetChip,
                      {
                        backgroundColor: dark ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF",
                        borderColor: colors.border,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${preset} pesos`}
                  >
                    <Text style={[styles.amountPresetChipText, { color: colors.foreground }]}>
                      +₱{preset}
                    </Text>
                  </PressableScale>
                ))}
              </View>

              {isOverBudget && (
                <View
                  style={[
                    styles.overBudgetPill,
                    {
                      backgroundColor: dark ? "rgba(232, 74, 63, 0.16)" : "#FEECEB",
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Ionicons name="warning-outline" size={13} color={colors.primary} />
                  <Text style={[styles.overBudgetText, { color: colors.primary }]} numberOfLines={1}>
                    Exceeds monthly budget by {formatMoney(overBudgetAmount)}
                  </Text>
                </View>
              )}
            </View>

            {/* Category Selection Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: colors.muted }]}>CATEGORY</Text>
              <Text style={[styles.selectedCategoryBadge, { color: colors.primary }]}>
                {category}
              </Text>
            </View>

            {/* Category Grid (4 Columns) */}
            <View style={styles.categoryGrid}>
              {allCategories.map((item) => {
                const meta = getCategoryStyle(item, customCategories);
                const active = category === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setCategory(item);
                    }}
                    style={({ pressed }) => [
                      styles.categoryCard,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : dark
                          ? "rgba(255, 255, 255, 0.04)"
                          : "#FFFFFF",
                        borderColor: active
                          ? colors.primary
                          : dark
                          ? "rgba(255, 255, 255, 0.08)"
                          : colors.border,
                        shadowColor: active ? colors.primary : "#1A1D20",
                        shadowOpacity: active ? 0.28 : 0.03,
                        shadowRadius: active ? 8 : 3,
                        elevation: active ? 3 : 1,
                      },
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <View
                      style={[
                        styles.categoryIconCircle,
                        {
                          backgroundColor: active
                            ? "rgba(255, 255, 255, 0.22)"
                            : dark
                            ? `${meta.color}20`
                            : meta.soft,
                        },
                      ]}
                    >
                      <CategoryIcon
                        category={item}
                        size={17}
                        customCategories={customCategories}
                        color={active ? "#FFFFFF" : meta.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryCardText,
                        {
                          color: active ? "#FFFFFF" : colors.foreground,
                          fontWeight: active ? "700" : "500",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Add Custom Category Button */}
              <Pressable
                onPress={() => {
                  setShowAddCustomModal(true);
                }}
                style={({ pressed }) => [
                  styles.categoryCard,
                  styles.addCategoryCard,
                  {
                    borderColor: `${colors.primary}60`,
                    backgroundColor: dark ? "rgba(255, 255, 255, 0.02)" : colors.surfaceSubtle,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Ionicons name="add" size={17} color={colors.primary} />
                </View>
                <Text style={[styles.categoryCardText, { color: colors.primary, fontWeight: "700" }]}>
                  Add
                </Text>
              </Pressable>
            </View>

            {/* Note & Description Field */}
            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 16 }]}>
              NOTE & DESCRIPTION
            </Text>
            <View
              style={[
                styles.fieldContainer,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                  borderColor:
                    validationError && !description.trim() ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIconBox,
                  { backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF" },
                ]}
              >
                <Ionicons name="create-outline" size={16} color={colors.muted} />
              </View>
              <TextInput
                value={description}
                accessibilityLabel="Expense note and description"
                onChangeText={(val) => {
                  setDescription(val);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Starbucks, Groceries (Optional, defaults to category)"
                placeholderTextColor={colors.subtle}
                style={[styles.fieldInput, { color: colors.foreground }]}
              />
            </View>

            {/* Date Field & Presets */}
            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 16 }]}>
              DATE & TIMESTAMP
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel={`Choose expense date. Currently ${formatDate(date)}`}
              style={({ pressed }) => [
                styles.fieldContainer,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.fieldIconBox,
                  { backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF" },
                ]}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.fieldTextWrap}>
                <Text style={[styles.fieldValueText, { color: colors.foreground }]}>
                  {formatDate(date)}
                </Text>
                <Text style={[styles.fieldHintText, { color: colors.muted }]}>
                  {date === today ? "Today" : date === yesterday ? "Yesterday" : "Historical date"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={colors.muted} />
            </Pressable>

            {/* Date Quick Presets */}
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
                          ? "rgba(232, 74, 63, 0.20)"
                          : colors.primarySoft
                        : dark
                        ? "rgba(255,255,255,0.04)"
                        : colors.surfaceSubtle,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <Ionicons
                  name="today-outline"
                  size={13}
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
                          ? "rgba(232, 74, 63, 0.20)"
                          : colors.primarySoft
                        : dark
                        ? "rgba(255,255,255,0.04)"
                        : colors.surfaceSubtle,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <Ionicons
                  name="time-outline"
                  size={13}
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

            {/* Payment Method Selection */}
            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 16 }]}>
              PAYMENT METHOD
            </Text>
            <View style={styles.paymentMethodRow}>
              {PAYMENT_METHODS.map((item) => {
                const active = payment === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setPayment(item);
                    }}
                    style={({ pressed }) => [
                      styles.paymentMethodChip,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active
                          ? dark
                            ? "rgba(232, 74, 63, 0.20)"
                            : colors.primarySoft
                          : dark
                          ? "rgba(255,255,255,0.04)"
                          : colors.surfaceSubtle,
                      },
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <PaymentIcon
                      payment={item}
                      size={14}
                      color={active ? colors.primary : colors.muted}
                    />
                    <Text
                      style={[
                        styles.paymentChipText,
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

            {/* Primary Action Button: Save Record */}
            <PressableScale
              style={[styles.saveBtnWrap, isSubmitting && { opacity: 0.6 }]}
              disabled={isSubmitting}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? "Save expense changes" : "Save expense"}
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F", "#D43C32"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {isEditing ? "Save Changes" : "Save Record"}
                </Text>
              </LinearGradient>
            </PressableScale>
          </ScrollView>
        </View>

        {/* Lottie Vector Success Feedback Overlay */}
        {showSuccessModal && (
          <Pressable
            style={styles.successOverlay}
            onPress={finishSuccess}
            accessibilityRole="button"
            accessibilityLabel="Dismiss success notification"
          >
            <GlassSurface
              variant="sheet"
              radius={24}
              style={styles.successCard}
              contentStyle={[
                styles.successContent,
                { backgroundColor: dark ? "#1E293B" : "#FFFFFF", borderColor: colors.border },
              ]}
            >
              <AppLottieView
                source={require("@/assets/lottie/success-check.json")}
                style={{ width: 100, height: 100 }}
                loop={false}
                autoPlay
                onAnimationFinish={handleSuccessAnimationFinish}
                fallback={<Ionicons name="checkmark-circle" size={78} color={colors.primary} />}
              />
              <Text style={[styles.successTitle, { color: colors.foreground }]}>
                {isEditing ? "Changes Saved!" : "Record Logged!"}
              </Text>
              <Text style={[styles.successSubtitle, { color: colors.muted }]}>
                Tap anywhere to continue
              </Text>
            </GlassSurface>
          </Pressable>
        )}
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

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={date}
        maxDate={today}
        title="Choose expense date"
        onClose={() => setShowDatePicker(false)}
        onSelect={(nextDate) => {
          setDate(nextDate);
          setShowDatePicker(false);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  dismissAreaTop: {
    flex: 1,
    width: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    maxHeight: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  dragHandleWrap: {
    alignItems: "center",
    paddingVertical: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  topTitleWrap: {
    alignItems: "center",
  },
  kicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  topTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginTop: 1,
  },
  resetBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  amountHeroCard: {
    borderRadius: radii.panel,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    marginBottom: 14,
  },
  amountOverline: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  currencyPrefix: {
    fontSize: 30,
    fontWeight: "700",
  },
  amountInput: {
    fontFamily: "DMSans_700Bold",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    minWidth: 120,
    textAlign: "center",
    padding: 0,
    margin: 0,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  presetsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    width: "100%",
  },
  amountPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  amountPresetChipText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  overBudgetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    maxWidth: "100%",
  },
  overBudgetText: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  selectedCategoryBadge: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  categoryCard: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  addCategoryCard: {
    borderStyle: "dashed",
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  categoryCardText: {
    fontSize: 10,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  fieldIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    height: "100%",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  fieldTextWrap: {
    flex: 1,
  },
  fieldValueText: {
    fontSize: 13,
    fontWeight: "700",
  },
  fieldHintText: {
    fontSize: 10,
    marginTop: 1,
    fontWeight: "500",
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  presetText: {
    fontSize: 11,
  },
  paymentMethodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 6,
  },
  paymentMethodChip: {
    flex: 1,
    minWidth: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  paymentChipText: {
    fontSize: 11.5,
  },
  saveBtnWrap: {
    width: "100%",
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#E84A3F",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  saveBtnGradient: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 20,
  },
  saveBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  saveBtnText: {
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  successCard: {
    width: 220,
    borderRadius: 24,
  },
  successContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
});
