import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ScreenContainer } from "@/components/screen-container";
import { GlassSurface } from "@/components/ui/glass-surface";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SelectField } from "@/components/ui/select-field";
import { InlineOptionList } from "@/components/ui/inline-option-list";
import { SuccessOverlay } from "@/components/ui/success-overlay";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import { MotionEntrance, PressableScale } from "@/components/motion";
import { useExpenses } from "@/lib/expense-store";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";
import {
  PAYMENT_ICON_COLORS,
  PAYMENT_ICON_NAMES,
  PAYMENT_METHODS,
  getCategoryDisplayName,
  getCategoryStyle,
} from "@/constants/categories";
import { formatDate, formatMoney } from "@/utils/formatters";
import { getPhilippinesDate, normalizeDate } from "@/utils/date";
import { Payment } from "@/types/expense";
import {
  clearReceipt,
  loadReceipts,
  persistReceiptImage,
  removeStoredReceiptImage,
  saveReceipt,
  validateReceiptImage,
} from "@/utils/receipts";
import { radii, typography } from "@/constants/design-tokens";

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, allCategories, customCategories, updateExpense, removeExpense } = useExpenses();
  const { account } = useAuth();
  const { colors, dark } = useTheme();

  const expense = useMemo(() => expenses.find((item) => item.id === id) ?? null, [expenses, id]);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState<Payment>("Cash");
  const [date, setDate] = useState(getPhilippinesDate());
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isPickingReceipt, setIsPickingReceipt] = useState(false);

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const accountEmail = account?.email ?? null;
  const today = getPhilippinesDate();
  const expenseId = expense?.id ?? null;
  const seededIdRef = React.useRef<string | null>(null);

  // Seed the draft once per record so background syncs never overwrite edits in progress.
  useEffect(() => {
    if (!expense || seededIdRef.current === expense.id) return;
    seededIdRef.current = expense.id;
    setDescription(expense.description);
    setCategory(expense.category);
    setPayment(expense.payment);
    setDate(normalizeDate(expense.date));
  }, [expense]);

  // Load a locally stored receipt for this transaction.
  useEffect(() => {
    let active = true;
    if (!expenseId) return;
    loadReceipts(accountEmail).then((map) => {
      if (active) setReceiptUri(map[expenseId] ?? null);
    });
    return () => {
      active = false;
    };
  }, [accountEmail, expenseId]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/transactions");
  }, []);

  const handleSave = useCallback(() => {
    if (!expense) return;
    const trimmed = description.trim();
    updateExpense(expense.id, {
      amount: expense.amount,
      description: trimmed || category,
      category,
      payment,
      date,
    });
    setShowSuccess(true);
  }, [category, date, description, expense, payment, updateExpense]);

  const handleConfirmDelete = useCallback(() => {
    if (!expense) return;
    const receipt = receiptUri;
    removeExpense(expense.id);
    clearReceipt(accountEmail, expense.id);
    if (receipt) removeStoredReceiptImage(receipt);
    setShowDeleteConfirm(false);
    goBack();
  }, [accountEmail, expense, goBack, receiptUri, removeExpense]);

  const chooseReceipt = useCallback(async () => {
    if (!expense || isPickingReceipt) return;
    setReceiptError(null);
    setIsPickingReceipt(true);
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          throw new Error("Allow photo library access to attach a receipt.");
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const validationError = validateReceiptImage(asset);
      if (validationError) {
        setReceiptError(validationError);
        return;
      }

      const previousUri = receiptUri;
      const uri = await persistReceiptImage(asset, accountEmail ?? "device");
      await saveReceipt(accountEmail, expense.id, uri);
      if (previousUri) removeStoredReceiptImage(previousUri);
      setReceiptUri(uri);
    } catch (error) {
      setReceiptError(
        error instanceof Error ? error.message : "The receipt could not be attached. Please try again."
      );
    } finally {
      setIsPickingReceipt(false);
    }
  }, [accountEmail, expense, isPickingReceipt, receiptUri]);

  const removeReceipt = useCallback(async () => {
    if (!expense) return;
    const uri = receiptUri;
    setReceiptUri(null);
    setReceiptError(null);
    await clearReceipt(accountEmail, expense.id);
    if (uri) removeStoredReceiptImage(uri);
  }, [accountEmail, expense, receiptUri]);

  if (!expense) {
    return (
      <ScreenContainer>
        <View style={styles.missingWrap}>
          <Ionicons name="receipt-outline" size={40} color={colors.subtle} />
          <Text style={[styles.missingTitle, { color: colors.foreground }]}>
            Transaction not found
          </Text>
          <Text style={[styles.missingCopy, { color: colors.muted }]}>
            This record may have been deleted on another device.
          </Text>
          <PressableScale
            onPress={goBack}
            style={[styles.missingBtn, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Go back to records"
          >
            <Text style={styles.missingBtnText}>Back to records</Text>
          </PressableScale>
        </View>
      </ScreenContainer>
    );
  }

  const meta = getCategoryStyle(category, customCategories);
  const dateLabel = formatDate(date);

  return (
    <ScreenContainer>
      {/* Screen Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={goBack}
          style={[
            styles.headerBtn,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </PressableScale>

        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          Transaction Details
        </Text>

        <PressableScale
          onPress={() => setShowDeleteConfirm(true)}
          style={[
            styles.headerBtn,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Delete transaction"
        >
          <Ionicons name="trash-outline" size={19} color={colors.primary} />
        </PressableScale>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Hero */}
        <MotionEntrance delay={0}>
          <View style={styles.heroWrap}>
            <View
              style={[
                styles.heroTile,
                {
                  backgroundColor: dark ? `${meta.color}26` : meta.soft,
                  borderColor: dark ? `${meta.color}35` : "transparent",
                },
              ]}
            >
              <CategoryIcon category={category} size={24} customCategories={customCategories} />
            </View>

            <Text style={[styles.heroLabel, { color: colors.muted }]}>TOTAL AMOUNT</Text>
            <View style={styles.heroAmountRow}>
              <Text style={[styles.heroCurrency, { color: colors.primary }]}>₱</Text>
              <Text style={[styles.heroAmount, { color: colors.foreground }]} numberOfLines={1}>
                {formatMoney(expense.amount).replace("₱", "")}
              </Text>
            </View>
          </View>
        </MotionEntrance>

        {/* Title & Category */}
        <MotionEntrance delay={60}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>TITLE & CATEGORY</Text>
          <View
            style={[
              styles.titleField,
              {
                backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add a title"
              placeholderTextColor={colors.subtle}
              accessibilityLabel="Transaction title"
              style={[styles.titleInput, { color: colors.foreground }]}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {allCategories.map((item) => {
              const itemMeta = getCategoryStyle(item, customCategories);
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Category ${getCategoryDisplayName(item)}`}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? dark
                          ? `${itemMeta.color}26`
                          : itemMeta.soft
                        : dark
                        ? "rgba(255,255,255,0.05)"
                        : colors.surfaceSubtle,
                      borderColor: active ? itemMeta.color : colors.border,
                    },
                  ]}
                >
                  <CategoryIcon
                    category={item}
                    size={14}
                    customCategories={customCategories}
                    color={active ? itemMeta.color : colors.muted}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: active ? itemMeta.color : colors.muted,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {getCategoryDisplayName(item)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </MotionEntrance>

        {/* Transaction Details */}
        <MotionEntrance delay={120}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>TRANSACTION DETAILS</Text>
          <GlassSurface
            variant="card"
            radius={radii.panel}
            style={styles.detailsCard}
            contentStyle={styles.detailsCardContent}
          >
            <Pressable
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel={`Date: ${dateLabel}. Choose a different date`}
              style={({ pressed }) => [
                styles.detailRow,
                { borderBottomColor: colors.borderSubtle },
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.detailIcon, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="calendar-outline" size={15} color={colors.primary} />
              </View>
              <Text style={[styles.detailLabel, { color: colors.foreground }]}>Date</Text>
              <Text style={[styles.detailValue, { color: colors.muted }]} numberOfLines={1}>
                {dateLabel}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.subtle} />
            </Pressable>

            <Pressable
              onPress={() => setShowPaymentOptions((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={`Payment method: ${payment}. Change payment method`}
              style={({ pressed }) => [
                styles.detailRow,
                { borderBottomColor: colors.borderSubtle },
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.detailIcon, { backgroundColor: colors.inputBg }]}>
                <Ionicons name={PAYMENT_ICON_NAMES[payment]} size={15} color={colors.primary} />
              </View>
              <Text style={[styles.detailLabel, { color: colors.foreground }]}>Payment Method</Text>
              <Text style={[styles.detailValue, { color: colors.muted }]} numberOfLines={1}>
                {payment}
              </Text>
              <Ionicons
                name={showPaymentOptions ? "chevron-up" : "chevron-forward"}
                size={14}
                color={colors.subtle}
              />
            </Pressable>

            <View style={[styles.detailRow, styles.detailRowStatic]}>
              <View style={[styles.detailIcon, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="pricetag-outline" size={15} color={colors.primary} />
              </View>
              <Text style={[styles.detailLabel, { color: colors.foreground }]}>Type</Text>
              <Text style={[styles.detailValue, { color: colors.muted }]}>Expense</Text>
            </View>
          </GlassSurface>

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
        </MotionEntrance>

        {/* Receipt Attachment */}
        <MotionEntrance delay={180}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>RECEIPT ATTACHMENT</Text>
          {receiptUri ? (
            <View style={styles.receiptWrap}>
              <Image
                source={{ uri: receiptUri }}
                style={styles.receiptImage}
                resizeMode="cover"
                accessibilityLabel="Receipt attached to this transaction"
              />
              <PressableScale
                onPress={chooseReceipt}
                style={styles.receiptAction}
                accessibilityRole="button"
                accessibilityLabel="Replace receipt image"
              >
                <Ionicons name="pencil" size={15} color="#FFFFFF" />
              </PressableScale>
              <PressableScale
                onPress={removeReceipt}
                style={styles.receiptRemoveAction}
                accessibilityRole="button"
                accessibilityLabel="Remove receipt image"
              >
                <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
              </PressableScale>
            </View>
          ) : (
            <PressableScale
              onPress={chooseReceipt}
              disabled={isPickingReceipt}
              style={[
                styles.receiptEmpty,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                  opacity: isPickingReceipt ? 0.6 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tap to add a receipt image"
            >
              <Ionicons name="image-outline" size={26} color={colors.subtle} />
              <Text style={[styles.receiptEmptyText, { color: colors.muted }]}>
                {isPickingReceipt ? "Opening your library…" : "Tap to add receipt"}
              </Text>
              <Text style={[styles.receiptEmptyHint, { color: colors.subtle }]}>
                Saved on this device only
              </Text>
            </PressableScale>
          )}

          {receiptError ? (
            <Text style={[styles.receiptError, { color: colors.primary }]}>{receiptError}</Text>
          ) : null}
        </MotionEntrance>

        {/* Save Action */}
        <PressableScale
          onPress={handleSave}
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save transaction changes"
        >
          <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </PressableScale>
      </ScrollView>

      <SuccessOverlay
        visible={showSuccess}
        title="Changes Saved!"
        onDismiss={() => {
          setShowSuccess(false);
          goBack();
        }}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${expense.description} - ${formatMoney(
          expense.amount
        )}"? This action cannot be undone and will update your reports.`}
        variant="danger"
        icon="trash"
        confirmText="Delete Record"
        cancelText="Cancel"
        destructive
        snippet={{
          title: expense.description,
          subtitle: `${getCategoryDisplayName(expense.category)} • ${formatDate(expense.date)}`,
          amount: `−${formatMoney(expense.amount)}`,
          badge: expense.payment,
        }}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={date}
        maxDate={today}
        title="Choose transaction date"
        onClose={() => setShowDatePicker(false)}
        onSelect={(nextDate) => {
          setDate(nextDate);
          setShowDatePicker(false);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    marginBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  headerTitle: {
    flex: 1,
    fontFamily: "DMSans_700Bold",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  heroWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  heroTile: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  heroAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 8,
  },
  heroCurrency: {
    fontFamily: "DMSans_700Bold",
    fontSize: 24,
    fontWeight: "700",
  },
  heroAmount: {
    ...typography.moneyLarge,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 20,
    marginBottom: 9,
  },
  titleField: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
  },
  titleInput: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    fontWeight: "700",
    minHeight: 50,
    paddingVertical: 12,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  chipText: {
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  detailsCard: {
    marginTop: 2,
  },
  detailsCardContent: {
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 60,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  detailRowStatic: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    opacity: 0.7,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: "DMSans_500Medium",
    fontSize: 13.5,
    fontWeight: "600",
  },
  detailValue: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12.5,
    fontWeight: "700",
    maxWidth: "46%",
    textAlign: "right",
  },
  paymentOptions: {
    marginTop: 10,
  },
  receiptWrap: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  receiptImage: {
    width: "100%",
    height: 170,
    borderRadius: 16,
  },
  receiptAction: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  receiptRemoveAction: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(232, 74, 63, 0.85)",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  receiptEmpty: {
    height: 132,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  receiptEmptyText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  receiptEmptyHint: {
    fontSize: 10.5,
    fontWeight: "500",
  },
  receiptError: {
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 54,
    marginTop: 28,
    borderRadius: 16,
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  saveBtnText: {
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  missingTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 6,
  },
  missingCopy: {
    fontSize: 12.5,
    textAlign: "center",
    maxWidth: 260,
  },
  missingBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  missingBtnText: {
    fontFamily: "DMSans_700Bold",
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
