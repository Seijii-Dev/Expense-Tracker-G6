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
import { Category, Expense, NewExpenseData, Payment } from "@/types/expense";
import {
  PAYMENT_ICON_COLORS,
  PAYMENT_ICON_NAMES,
  PAYMENT_METHODS,
  getCategoryStyle,
} from "@/constants/categories";
import { getPhilippinesDate, getYesterdayDate, normalizeDate } from "@/utils/date";
import { useTheme } from "@/lib/theme-store";
import { useExpenses } from "@/lib/expense-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SelectField } from "@/components/ui/select-field";
import { InlineOptionList } from "@/components/ui/inline-option-list";
import { SuccessOverlay } from "@/components/ui/success-overlay";
import { CustomCategoryModal } from "@/components/settings/custom-category-modal";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import { PressableScale } from "@/components/motion";
import { formatDate, formatMoney } from "@/utils/formatters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import { spacing } from "@/constants/design-tokens";

/** Gap between category tiles in the picker grid. */
const CATEGORY_GRID_GAP = 10;
/** Minimum comfortable width for a tile column before dropping a column. */
const CATEGORY_COLUMN_MIN = 56;
/** Cap on tile artwork size; columns stretch wider than this. */
const CATEGORY_TILE_MAX = 58;

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
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

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
      setShowPaymentOptions(false);
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
    setShowPaymentOptions(false);
  };

  const numericAmount = Number(amount) || 0;
  const originalAmount = initialExpense?.amount || 0;
  const netAddedAmount = isEditing ? numericAmount - originalAmount : numericAmount;
  const projectedMonthTotal = monthTotal + netAddedAmount;
  const isOverBudget = budget > 0 && numericAmount > 0 && projectedMonthTotal > budget;
  const overBudgetAmount = projectedMonthTotal - budget;

  const handleAddPreset = (preset: number) => {
    const current = Number(amount) || 0;
    const next = current + preset;
    setAmount(String(Math.round(next * 100) / 100));
    if (validationError) setValidationError(null);
  };

  const handleSave = () => {
    if (isSubmitting) return; // Prevent duplicate submissions caused by repeated taps
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setValidationError("Please enter a valid amount of at least ₱0.01.");
      return;
    }
    const roundedAmount = Math.round(numeric * 100) / 100;
    if (!Number.isFinite(roundedAmount) || roundedAmount <= 0) {
      setValidationError("Please enter a valid amount of at least ₱0.01.");
      return;
    }

    setIsSubmitting(true);
    setShowPaymentOptions(false);
    const submittedDate =
      initialExpense && date === normalizeDate(initialExpense.date) ? initialExpense.date : date;
    const finalDescription = description.trim() || category;

    // Save operation executed first
    onSubmit({
      amount: roundedAmount,
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
  const dateLabel =
    date === today ? "Today" : date === yesterday ? "Yesterday" : formatDate(date);

  // Keep the ₱ prefix hugging the amount. Web inputs have a fixed intrinsic
  // width (which pushed the prefix off screen), so size the input to its text.
  const amountText = amount || "0.00";
  const amountInputWidth = Math.min(
    Math.max(
      90,
      amountText.split("").reduce((w, ch) => w + (ch === "." || ch === "," ? 12 : 25), 20)
    ),
    Math.max(140, windowWidth - 150)
  );

  // Category grid: choose the column count that best fills the sheet width so
  // full rows run edge-to-edge with even gutters at every screen size.
  const sheetHorizontalPadding = windowWidth < 360 ? 14 : spacing.lg;
  const sheetContentWidth = Math.max(
    220,
    Math.min(windowWidth, 540) - 2 - sheetHorizontalPadding * 2
  );
  const categoryColumns = Math.max(
    3,
    Math.floor((sheetContentWidth + CATEGORY_GRID_GAP) / (CATEGORY_GRID_GAP + CATEGORY_COLUMN_MIN))
  );
  const categoryItemWidth = Math.floor(
    (sheetContentWidth - CATEGORY_GRID_GAP * (categoryColumns - 1)) / categoryColumns
  );
  const categoryTileSize = Math.min(CATEGORY_TILE_MAX, categoryItemWidth);

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
            <View style={styles.topTitleWrap}>
              <Text style={[styles.topTitle, { color: colors.foreground }]}>
                {isEditing ? "Edit Transaction" : "Add Transaction"}
              </Text>
              <Text style={[styles.topSubtitle, { color: colors.muted }]}>
                {isEditing ? "Update the details below" : "Log a new expense"}
              </Text>
            </View>

            <View style={styles.topActions}>
              <Pressable
                hitSlop={8}
                onPress={handleReset}
                accessibilityRole="button"
                accessibilityLabel="Reset form"
                style={[
                  styles.resetBtn,
                  { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                ]}
              >
                <Text style={[styles.resetBtnText, { color: colors.muted }]}>Reset</Text>
              </Pressable>

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
                <Ionicons name="close" size={19} color={colors.foreground} />
              </Pressable>
            </View>
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

            {/* Visual Centerpiece: Amount Display */}
            <View style={styles.amountHero}>
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
                  style={[
                    styles.amountInput,
                    {
                      width: amountInputWidth,
                      color: colors.foreground,
                      borderBottomColor:
                        validationError &&
                        (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0)
                          ? colors.primary
                          : "transparent",
                    },
                  ]}
                  autoFocus={!isEditing}
                />
              </View>

              <Text style={[styles.amountTypeLabel, { color: colors.muted }]}>Expense</Text>

              <View style={styles.presetsRow}>
                {[50, 100, 500, 1000].map((preset) => (
                  <PressableScale
                    key={preset}
                    onPress={() => handleAddPreset(preset)}
                    style={[
                      styles.amountPresetChip,
                      {
                        backgroundColor: dark ? "rgba(255, 255, 255, 0.06)" : colors.surfaceSubtle,
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

            <View style={styles.categoryGrid}>
              {allCategories.map((item) => {
                const meta = getCategoryStyle(item, customCategories);
                const active = category === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.categoryItem, { width: categoryItemWidth }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={item}
                  >
                    <View
                      style={[
                        styles.categoryTile,
                        {
                          width: categoryTileSize,
                          height: categoryTileSize,
                          backgroundColor: active
                            ? meta.color
                            : dark
                            ? `${meta.color}26`
                            : meta.soft,
                          borderColor: active ? meta.color : colors.border,
                          shadowColor: meta.color,
                          shadowOpacity: active ? 0.4 : 0,
                        },
                      ]}
                    >
                      <CategoryIcon
                        category={item}
                        size={22}
                        customCategories={customCategories}
                        color={active ? "#FFFFFF" : meta.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color: active ? colors.foreground : colors.muted,
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

              {/* Add Custom Category Tile */}
              <Pressable
                onPress={() => setShowAddCustomModal(true)}
                style={[styles.categoryItem, { width: categoryItemWidth }]}
                accessibilityRole="button"
                accessibilityLabel="Add custom category"
              >
                <View
                  style={[
                    styles.categoryTile,
                    styles.categoryTileAdd,
                    {
                      width: categoryTileSize,
                      height: categoryTileSize,
                      borderColor: `${colors.primary}60`,
                      backgroundColor: dark ? "rgba(255,255,255,0.02)" : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <Ionicons name="add" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.categoryLabel, { color: colors.primary, fontWeight: "700" }]}>
                  Add
                </Text>
              </Pressable>
            </View>

            {/* Payment Method & Date */}
            <View style={styles.fieldRow}>
              <SelectField
                label="PAYMENT METHOD"
                icon={PAYMENT_ICON_NAMES[payment]}
                value={payment}
                expanded={showPaymentOptions}
                onPress={() => setShowPaymentOptions((prev) => !prev)}
                accessibilityLabel={`Payment method: ${payment}. Change payment method`}
              />
              <SelectField
                label="DATE"
                icon="calendar-outline"
                iconColor={colors.primary}
                value={dateLabel}
                onPress={() => setShowDatePicker(true)}
                expandable={false}
                accessibilityLabel={`Date: ${formatDate(date)}. Choose date`}
              />
            </View>

            {showPaymentOptions && (
              <InlineOptionList
                style={styles.paymentOptions}
                options={PAYMENT_METHODS.map((method) => ({
                  value: method,
                  label: method,
                  icon: PAYMENT_ICON_NAMES[method],
                  color: PAYMENT_ICON_COLORS[method],
                }))}
                selected={payment}
                onSelect={(method) => {
                  setPayment(method);
                  setShowPaymentOptions(false);
                }}
              />
            )}

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

            {/* Note & Description Field */}
            <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>
              NOTE
            </Text>
            <View
              style={[
                styles.noteField,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={description}
                accessibilityLabel="Expense note and description"
                onChangeText={(val) => {
                  setDescription(val);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Starbucks, Groceries (optional)"
                placeholderTextColor={colors.subtle}
                style={[styles.fieldInput, { color: colors.foreground }]}
              />
            </View>

            {/* Primary Action Button */}
            <PressableScale
              style={[
                styles.saveBtnWrap,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                isSubmitting && { opacity: 0.6 },
              ]}
              disabled={isSubmitting}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? "Save expense changes" : "Save expense"}
            >
              <View style={styles.saveBtnInner}>
                <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {isEditing ? "Save Changes" : "Save Transaction"}
                </Text>
              </View>
            </PressableScale>
          </ScrollView>
        </View>

        {/* Lottie Vector Success Feedback Overlay */}
        <SuccessOverlay
          visible={showSuccessModal}
          title={isEditing ? "Changes Saved!" : "Record Logged!"}
          onDismiss={finishSuccess}
          onAnimationFinish={handleSuccessAnimationFinish}
        />
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
    gap: 12,
    marginBottom: 14,
  },
  topTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  topTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.45,
  },
  topSubtitle: {
    fontSize: 11.5,
    fontWeight: "500",
    marginTop: 2,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  resetBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
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
  amountHero: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 2,
    marginBottom: 18,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: "700",
  },
  amountInput: {
    fontFamily: "DMSans_700Bold",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.4,
    minWidth: 90,
    maxWidth: "100%",
    textAlign: "center",
    padding: 0,
    margin: 0,
    borderBottomWidth: 2,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  amountTypeLabel: {
    fontSize: 13.5,
    fontWeight: "500",
    marginTop: 8,
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
    gap: CATEGORY_GRID_GAP,
    paddingTop: 2,
  },
  categoryItem: {
    alignItems: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  categoryTile: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  categoryTileAdd: {
    borderStyle: "dashed",
  },
  categoryLabel: {
    fontSize: 10.5,
    letterSpacing: -0.2,
    textAlign: "center",
    marginTop: 7,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  paymentOptions: {
    marginTop: 10,
  },
  noteField: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  fieldInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    minHeight: 50,
    paddingVertical: 12,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
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
  saveBtnWrap: {
    width: "100%",
    minHeight: 54,
    marginTop: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  saveBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    minHeight: 54,
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
});
