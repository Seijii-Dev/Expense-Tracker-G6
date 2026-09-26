import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Expense } from "@/types/expense";
import { getCategoryStyle } from "@/constants/categories";
import { useTheme } from "@/lib/theme-store";
import { formatDate, formatMoney } from "@/utils/formatters";

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
  const meta = getCategoryStyle(expense.category);

  const handleDelete = React.useCallback(() => {
    Alert.alert("Delete Expense", `Remove "${expense.description}" from your ledger?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete?.();
        },
      },
    ]);
  }, [expense.description, onDelete]);

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: dark ? `${meta.color}22` : meta.soft,
          },
        ]}
      >
        <CategoryIcon category={expense.category} size={22} />
      </View>

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
          <Text style={[styles.categoryBadge, { color: meta.color }]}>{expense.category}</Text>
          <Text style={[styles.metaDot, { color: colors.subtle }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.subtle }]}>{expense.payment}</Text>
          <Text style={[styles.metaDot, { color: colors.subtle }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.subtle }]}>{formatDate(expense.date)}</Text>
        </View>
      </Pressable>

      <View style={styles.rightSide}>
        <Text style={[styles.amount, { color: colors.foreground }]}>−{formatMoney(expense.amount)}</Text>
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <Pressable
                hitSlop={8}
                onPress={() => {
                  Haptics.selectionAsync();
                  onEdit();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${expense.description}`}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <Ionicons name="create-outline" size={15} color={colors.muted} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                hitSlop={8}
                onPress={handleDelete}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${expense.description}`}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <Ionicons name="trash-outline" size={15} color={colors.subtle} />
              </Pressable>
            )}
          </View>
        )}
      </View>
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
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: "700",
  },
  metaDot: {
    fontSize: 10,
  },
  metaText: {
    fontSize: 10,
    fontWeight: "500",
  },
  rightSide: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    padding: 2,
  },
  actionPressed: {
    opacity: 0.6,
  },
});
