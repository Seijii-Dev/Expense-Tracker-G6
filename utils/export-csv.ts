import { Alert, Platform, Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Expense } from "@/types/expense";
import { requestStoragePermission } from "@/utils/storage-permission";

function escapeCsvField(value: string | number | undefined | null): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function generateExpenseCsv(expenses: Expense[]): string {
  const headers = ["Date", "Description", "Category", "Payment", "Amount"];
  const rows = expenses.map((expense) =>
    [
      expense.date,
      expense.description,
      expense.category,
      expense.payment,
      expense.amount,
    ]
      .map(escapeCsvField)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function exportExpensesToCsv(expenses: Expense[]): Promise<boolean> {
  if (!expenses.length) {
    Alert.alert("Nothing to export", "Add at least one expense before creating an export backup.");
    return false;
  }

  await requestStoragePermission();

  const csv = generateExpenseCsv(expenses);
  const filename = `ledgerly-export-${new Date().toISOString().slice(0, 10)}.csv`;

  if (Platform.OS === "web") {
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Alert.alert("Export completed", "Your expense records have been downloaded as CSV.");
      return true;
    } catch {
      Alert.alert("Export failed", "Unable to download CSV in browser.");
      return false;
    }
  }

  const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  if (!baseDir) {
    try {
      await Share.share({ message: csv, title: "Ledgerly Expense CSV" });
      return true;
    } catch {
      Alert.alert("Export failed", "The expense backup could not be shared.");
      return false;
    }
  }

  const uri = `${baseDir}${filename}`;
  try {
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Export your expenses" });
    } else {
      await Share.share({ message: csv, title: "Ledgerly Expense CSV" });
    }
    return true;
  } catch {
    Alert.alert("Export failed", "The expense backup could not be created.");
    return false;
  }
}
