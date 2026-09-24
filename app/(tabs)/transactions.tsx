import { useMemo, useState } from "react";
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
import { ScreenContainer } from "@/components/screen-container";
import {
  Category,
  Expense,
  Payment,
  categoryMeta,
  getPhilippinesDate,
  normalizeDate,
  useExpenses,
} from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";

const categories: ("All" | Category)[] = [
  "All",
  "Food",
  "Transport",
  "School",
  "Shopping",
  "Bills",
  "Fun",
  "Health",
  "Other",
];
const expenseCategories: Category[] = categories.slice(1) as Category[];
const payments: Payment[] = ["Cash", "GCash", "Card", "Bank"];
const money = (value: number) => `₱${(value || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
const dateLabel = (value: string) => {
  try {
    const clean = normalizeDate(value);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(`${clean}T12:00:00`)
    );
  } catch {
    return value || "";
  }
};

export default function TransactionsScreen() {
  const { sortedExpenses, removeExpense, updateExpense } = useExpenses();
  const { colors, dark } = useTheme();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("Food");
  const [payment, setPayment] = useState<Payment>("Cash");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedExpenses.filter((expense) => {
      const matchSearch =
        !q ||
        `${expense.description || ""} ${expense.category || ""} ${expense.payment || ""} ${expense.amount || ""}`
          .toLowerCase()
          .includes(q);
      const matchCategory = category === "All" || expense.category === category;
      return matchSearch && matchCategory;
    });
  }, [sortedExpenses, query, category]);

  const total = filtered.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setAmount(String(expense.amount));
    setDescription(expense.description || "");
    setEditCategory(expense.category || "Food");
    setPayment(expense.payment || "Cash");
  };

  const saveEdit = () => {
    const numeric = parseFloat(amount);
    if (!editing || isNaN(numeric) || numeric <= 0) {
      Alert.alert("Invalid amount", "Please enter an amount greater than 0.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter what this expense was for.");
      return;
    }
    updateExpense(editing.id, {
      amount: Math.round(numeric * 100) / 100,
      description: description.trim(),
      category: editCategory,
      payment,
      date: normalizeDate(editing.date),
    });
    setEditing(null);
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>YOUR MONEY TRAIL</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Transactions<Text style={styles.dot}>.</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Every peso has a place. Keep the record clear.
        </Text>

        <View style={styles.summary}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>SHOWING</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{filtered.length} records</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>FILTERED TOTAL</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{money(total)}</Text>
          </View>
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={17} color={colors.subtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by note, category, payment, or amount"
            placeholderTextColor={colors.subtle}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={16} color={colors.subtle} />
            </Pressable>
          )}
        </View>

        <View style={styles.filterHeader}>
          <Ionicons name="funnel-outline" size={15} color={colors.muted} />
          <Text style={[styles.filterLabel, { color: colors.muted }]}>FILTER BY CATEGORY</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                category === item && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.muted },
                  category === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {filtered.map((expense) => {
            const meta = categoryMeta[expense.category] || categoryMeta.Other;
            return (
              <View style={[styles.row, { borderBottomColor: colors.border }]} key={expense.id}>
                <View style={[styles.icon, { backgroundColor: meta.soft }]}>
                  <Ionicons name="card-outline" size={16} color={meta.color} />
                </View>
                <Pressable style={styles.body} onPress={() => openEdit(expense)}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{expense.description}</Text>
                  <Text style={[styles.meta, { color: colors.subtle }]}>
                    {expense.category} · {expense.payment}
                  </Text>
                  <Text style={[styles.date, { color: colors.subtle }]}>{dateLabel(expense.date)}</Text>
                </Pressable>
                <View style={styles.amountColumn}>
                  <Text style={[styles.amount, { color: colors.foreground }]}>−{money(expense.amount)}</Text>
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => openEdit(expense)}>
                      <Ionicons name="create-outline" size={16} color={colors.muted} />
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        Alert.alert("Delete expense?", `Remove "${expense.description}" from your records?`, [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => removeExpense(expense.id) },
                        ])
                      }
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.subtle} />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search" size={24} color={colors.subtle} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No transactions found</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Try another search term or category filter.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.kicker}>UPDATE RECORD</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit expense</Text>
              </View>
              <Pressable onPress={() => setEditing(null)}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>AMOUNT</Text>
            <View style={[styles.amountInput, { backgroundColor: dark ? colors.surfaceSubtle : "#FFFAF9" }]}>
              <Text style={styles.currency}>₱</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={[styles.amountTextInput, { color: colors.foreground }]}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>DESCRIPTION</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
              ]}
              placeholder="What was this for?"
              placeholderTextColor={colors.subtle}
            />

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {expenseCategories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setEditCategory(item)}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    editCategory === item && {
                      backgroundColor: categoryMeta[item].soft,
                      borderColor: categoryMeta[item].color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.muted },
                      editCategory === item && { color: categoryMeta[item].color, fontWeight: "700" },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>PAYMENT</Text>
            <View style={styles.chipRow}>
              {payments.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPayment(item)}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    payment === item && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.muted },
                      payment === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.saveButton} onPress={saveEdit}>
              <Text style={styles.saveButtonText}>Save changes</Text>
              <Ionicons name="checkmark" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 13, paddingBottom: 28 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 35, fontWeight: "700", letterSpacing: -1.4, marginTop: 8 },
  dot: { color: "#EB6F61" },
  subtitle: { fontFamily: "Fraunces_700Bold", fontSize: 12, marginTop: 6 },
  summary: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 25, marginBottom: 20 },
  summaryLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 5 },
  divider: { width: 1, height: 32 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 43, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 11 },
  filterHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 21, marginBottom: 9 },
  filterLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  chips: { gap: 7, paddingBottom: 3 },
  chip: { height: 32, paddingHorizontal: 11, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1 },
  chipActive: { borderColor: "#F2B8B0", backgroundColor: "#FFF0ED" },
  chipText: { fontSize: 10 },
  chipTextActive: { color: "#EB6F61", fontWeight: "700" },
  list: { marginTop: 16, paddingHorizontal: 15, borderRadius: 14, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 72, borderBottomWidth: 1 },
  icon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  body: { flex: 1 },
  name: { fontSize: 11, fontWeight: "700" },
  meta: { fontSize: 9, marginTop: 4 },
  date: { fontSize: 9, marginTop: 5 },
  amountColumn: { alignItems: "flex-end", justifyContent: "space-between", gap: 9 },
  amount: { fontSize: 12, fontWeight: "700" },
  rowActions: { flexDirection: "row", gap: 12 },
  empty: { alignItems: "center", gap: 7, paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 11 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24,31,28,.45)" },
  modalCard: { padding: 22, paddingBottom: 35, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontFamily: "Fraunces_700Bold", fontSize: 27, marginTop: 7 },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: 14, marginBottom: 7 },
  amountInput: { flexDirection: "row", alignItems: "center", height: 62, paddingHorizontal: 15, borderRadius: 11, borderWidth: 1, borderColor: "#F2B8B0" },
  currency: { color: "#EB6F61", fontSize: 26, fontWeight: "700" },
  amountTextInput: { flex: 1, fontSize: 27, fontWeight: "700", paddingLeft: 5 },
  input: { height: 42, paddingHorizontal: 12, fontSize: 11, borderRadius: 9, borderWidth: 1 },
  chipRow: { flexDirection: "row", gap: 7 },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 46, marginTop: 23, borderRadius: 10, backgroundColor: "#EB6F61" },
  saveButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
