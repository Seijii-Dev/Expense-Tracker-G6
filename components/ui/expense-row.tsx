import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CategoryIcon } from "@/components/ui/category-icon";
import { Expense } from "@/types/expense";
import { getCategoryDisplayName, getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatDate, formatMoney } from "@/utils/formatters";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PressableScale } from "@/components/motion";
import { radii, spacing } from "@/constants/design-tokens";

interface ExpenseRowProps {
  expense: Expense;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const ExpenseRow = React.memo(function ExpenseRow({
  expense,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
}: ExpenseRowProps) {
  const { colors, dark } = useTheme();
  const { customCategories } = useExpenses();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const meta = getCategoryStyle(expense.category, customCategories);
  const categoryLabel = getCategoryDisplayName(expense.category);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeletePress = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleBodyPress = isSelectable ? onToggleSelect : (onPress || onEdit);

  return (
    <View style={[styles.row, compact && styles.rowCompact, { borderBottomColor: colors.borderSubtle }]}>
      {/* Optional Multi-Select Checkbox */}
      {isSelectable && (
        <Pressable
          onPress={onToggleSelect}
          hitSlop={8}
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? colors.primary : "transparent",
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={`Select ${expense.description}`}
        >
          {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
        </Pressable>
      )}

      {/* Category Avatar (44px, 12px radius, contextual pastel tint) */}
      <View
        style={[
          styles.iconWrap,
          compact && styles.iconWrapCompact,
          {
            backgroundColor: dark ? `${meta.color}25` : meta.soft,
            borderColor: dark ? `${meta.color}35` : "transparent",
          },
        ]}
      >
        <CategoryIcon category={expense.category} size={20} customCategories={customCategories} />
      </View>

      {/* Main Content */}
      <Pressable
        style={[styles.body, compact && styles.bodyCompact]}
        onPress={handleBodyPress}
        accessibilityRole="button"
        accessibilityLabel={`${expense.description}, ${formatMoney(expense.amount)}, ${categoryLabel}, ${formatDate(expense.date)}`}
      >
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {expense.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaCategory, { color: colors.muted }]}>
            {categoryLabel}
          </Text>
          <Text style={[styles.metaDot, { color: colors.subtle }]}>•</Text>
          <View
            style={[
              styles.paymentBadge,
              { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
            ]}
          >
            <Text style={[styles.paymentText, { color: colors.muted }]}>{expense.payment}</Text>
          </View>
          <Text style={[styles.metaDot, { color: colors.subtle }]}>•</Text>
          <Text style={[styles.metaDate, { color: colors.subtle }]}>{formatDate(expense.date)}</Text>
        </View>
      </Pressable>

      {/* Amount & Actions */}
      <View style={[styles.rightSide, compact && styles.rightSideCompact]}>
        <Text style={[styles.amount, compact && styles.amountCompact, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>
          −{formatMoney(expense.amount)}
        </Text>
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <PressableScale
                hitSlop={8}
                onPress={onEdit}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${expense.description}`}
                style={[
                  styles.actionButton,
                  compact && styles.actionButtonCompact,
                  { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                ]}
              >
                <Ionicons name="create-outline" size={14} color={colors.muted} />
              </PressableScale>
            )}
            {onDelete && (
              <PressableScale
                hitSlop={8}
                onPress={handleDeletePress}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${expense.description}`}
                style={[
                  styles.actionButton,
                  compact && styles.actionButtonCompact,
                  { backgroundColor: dark ? "rgba(232, 74, 63, 0.16)" : colors.primarySoft },
                ]}
              >
                <Ionicons name="trash-outline" size={14} color={colors.primary} />
              </PressableScale>
            )}
          </View>
        )}
      </View>

      {/* Branded Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          visible={showDeleteConfirm}
          title="Delete Transaction?"
          message={`Are you sure you want to delete the record "${expense.description} - ${formatMoney(expense.amount)}"? This action cannot be undone and will update your reports.`}
          variant="danger"
          icon="trash"
          confirmText="Delete Record"
          cancelText="Cancel"
          destructive
          snippet={{
            title: expense.description,
            subtitle: `${categoryLabel} • ${formatDate(expense.date)}`,
            amount: `−${formatMoney(expense.amount)}`,
            badge: expense.payment,
          }}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete?.();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 66,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  rowCompact: {
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.control,
  },
  iconWrapCompact: {
    width: 36,
    height: 36,
  },
  body: {
    flex: 1,
    minWidth: 0,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  bodyCompact: {
    minWidth: 0,
  },
  title: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
    marginTop: 3,
  },
  metaCategory: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11.5,
    fontWeight: "500",
  },
  paymentBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  paymentText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    fontWeight: "600",
  },
  metaDot: {
    fontSize: 8,
  },
  metaDate: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    fontWeight: "500",
  },
  rightSide: {
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  rightSideCompact: {
    maxWidth: "36%",
  },
  amount: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  amountCompact: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  actionButtonCompact: {
    width: 32,
    height: 32,
  },
  actionPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});
