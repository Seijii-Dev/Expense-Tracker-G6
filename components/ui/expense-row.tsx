import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Expense } from "@/types/expense";
import { getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatDate, formatMoney } from "@/utils/formatters";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

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
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      {/* Category Avatar */}
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: dark ? `${meta.color}25` : meta.soft,
            borderColor: dark ? `${meta.color}40` : `${meta.color}30`,
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
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: dark ? `${meta.color}1E` : meta.soft,
              },
            ]}
          >
            <Text style={[styles.categoryBadge, { color: meta.color }]}>{expense.category}</Text>
          </View>
          <Text style={[styles.metaDot, { color: colors.subtle }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>{expense.payment}</Text>
          <Text style={[styles.metaDot, { color: colors.subtle }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.subtle }]}>{formatDate(expense.date)}</Text>
        </View>
      </Pressable>

      {/* Amount & Actions */}
      <View style={styles.rightSide}>
        <Text style={[styles.amount, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
          −{formatMoney(expense.amount)}
        </Text>
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <Pressable
                hitSlop={8}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {
                    // Non-fatal
                  }
                  onEdit();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${expense.description}`}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.surfaceSubtle },
                  pressed && styles.actionPressed,
                ]}
              >
                <Ionicons name="create-outline" size={15} color={colors.muted} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                hitSlop={8}
                onPress={handleDeletePress}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${expense.description}`}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: dark ? "rgba(248, 113, 113, 0.12)" : "#FEE2E2" },
                  pressed && styles.actionPressed,
                ]}
              >
                <Ionicons name="trash-outline" size={15} color={colors.error} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Branded Delete Confirmation Dialog (rendered conditionally for optimal performance) */}
      {showDeleteConfirm && (
        <ConfirmDialog
          visible={showDeleteConfirm}
          title="Delete Expense"
          message={`Remove "${expense.description}" (${formatMoney(expense.amount)}) from your ledger? This action cannot be reversed.`}
          variant="danger"
          icon="trash-outline"
          confirmText="Delete"
          cancelText="Cancel"
          destructive
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
  body: {
    flex: 1,
    minWidth: 0,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadge: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  metaDot: {
    fontSize: 9,
  },
  metaText: {
    fontSize: 10.5,
    fontWeight: "500",
  },
  rightSide: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  amount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 15,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  actionPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});

