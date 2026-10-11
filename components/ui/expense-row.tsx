import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CategoryIcon } from "@/components/ui/category-icon";
import { Expense } from "@/types/expense";
import { getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatDate, formatMoney } from "@/utils/formatters";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PressableScale } from "@/components/motion";

interface ExpenseRowProps {
  expense: Expense;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const ExpenseRow = React.memo(function ExpenseRow({
  expense,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}: ExpenseRowProps) {
  const { colors, dark } = useTheme();
  const { customCategories } = useExpenses();
  const meta = getCategoryStyle(expense.category, customCategories);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeletePress = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  return (
    <View style={[styles.row, { borderBottomColor: dark ? "rgba(255,255,255,0.06)" : "#F1F3F5" }]}>
      {/* Category Avatar (44px, 12px radius, contextual pastel tint) */}
      <View
        style={[
          styles.iconWrap,
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
        style={styles.body}
        onPress={onPress || onEdit}
        accessibilityRole="button"
        accessibilityLabel={`${expense.description}, ${formatMoney(expense.amount)}, ${expense.category}, ${formatDate(expense.date)}`}
      >
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {expense.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaCategory, { color: colors.muted }]}>
            {expense.category}
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
      <View style={styles.rightSide}>
        <Text style={[styles.amount, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>
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
            subtitle: `${expense.category} • ${formatDate(expense.date)}`,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  body: {
    flex: 1,
    minWidth: 0,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  metaCategory: {
    fontSize: 11.5,
    fontWeight: "500",
  },
  paymentBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 10,
    fontWeight: "600",
  },
  metaDot: {
    fontSize: 8,
  },
  metaDate: {
    fontSize: 11,
    fontWeight: "500",
  },
  rightSide: {
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  actionPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});
