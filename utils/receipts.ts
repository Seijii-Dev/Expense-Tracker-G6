import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import { STORAGE_KEYS } from "@/constants/storage";

/**
 * Receipt attachments are stored on this device only (image files in the app
 * document directory, keyed per account + transaction id). They intentionally do
 * not travel through the expenses API, so a receipt stays local to the device
 * that captured it.
 */

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;
const WEB_RECEIPT_DATA_URL_LIMIT = 3 * 1024 * 1024;
const RECEIPT_FILE_PREFIX = "ledgerly-receipt-";

export type ReceiptMap = Record<string, string>;

const extensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getSupportedExtension(asset: ImagePickerAsset): string | null {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType && extensionsByMimeType[mimeType]) return extensionsByMimeType[mimeType];

  const fileExtension = asset.fileName?.split(".").pop()?.toLowerCase();
  if (fileExtension === "jpeg" || fileExtension === "jpg") return "jpg";
  if (fileExtension === "png") return "png";
  if (fileExtension === "webp") return "webp";
  return null;
}

export function validateReceiptImage(asset: ImagePickerAsset): string | null {
  if (asset.type && asset.type !== "image") return "Choose an image file for the receipt.";
  if (!getSupportedExtension(asset)) return "Choose a JPEG, PNG, or WebP image.";
  if (asset.fileSize && asset.fileSize > MAX_RECEIPT_BYTES) {
    return "Choose a receipt image smaller than 8 MB.";
  }
  return null;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not read the selected receipt."));
    reader.onerror = () => reject(new Error("Could not read the selected receipt."));
    reader.readAsDataURL(blob);
  });
}

export async function persistReceiptImage(
  asset: ImagePickerAsset,
  email: string
): Promise<string> {
  const extension = getSupportedExtension(asset);
  if (!extension) throw new Error("Choose a JPEG, PNG, or WebP image.");

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error("Could not open the selected receipt. Please choose it again.");
    const blob = await response.blob();
    if (blob.size > MAX_RECEIPT_BYTES) throw new Error("Choose a receipt image smaller than 8 MB.");

    const dataUrl = await readBlobAsDataUrl(blob);
    if (dataUrl.length > WEB_RECEIPT_DATA_URL_LIMIT) {
      throw new Error("Choose a smaller receipt image so it can be saved on this device.");
    }
    return dataUrl;
  }

  const safeEmail = email.replace(/[^a-zA-Z0-9._-]/g, "_");
  const destination = new File(
    Paths.document,
    `${RECEIPT_FILE_PREFIX}${safeEmail}-${Date.now()}.${extension}`
  );
  new File(asset.uri).copy(destination);
  return destination.uri;
}

export function removeStoredReceiptImage(uri?: string | null): void {
  if (!uri || Platform.OS === "web" || !uri.startsWith(Paths.document.uri)) return;
  if (!uri.includes(RECEIPT_FILE_PREFIX)) return;

  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Leaving an orphaned receipt file behind is safe; do not block the user.
  }
}

async function readReceiptMap(email: string): Promise<ReceiptMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.userReceipts(email));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const entries = Object.entries(parsed as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0
    );
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

async function writeReceiptMap(email: string, map: ReceiptMap): Promise<void> {
  try {
    if (Object.keys(map).length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEYS.userReceipts(email));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.userReceipts(email), JSON.stringify(map));
    }
  } catch {
    // Storage failures must not break the details screen.
  }
}

export async function loadReceipts(email: string | null | undefined): Promise<ReceiptMap> {
  if (!email) return {};
  return readReceiptMap(email);
}

export async function saveReceipt(
  email: string | null | undefined,
  expenseId: string,
  uri: string
): Promise<void> {
  if (!email) return;
  const map = await readReceiptMap(email);
  map[expenseId] = uri;
  await writeReceiptMap(email, map);
}

export async function clearReceipt(
  email: string | null | undefined,
  expenseId: string
): Promise<void> {
  if (!email) return;
  const map = await readReceiptMap(email);
  const existing = map[expenseId];
  if (!existing) return;
  delete map[expenseId];
  await writeReceiptMap(email, map);
  removeStoredReceiptImage(existing);
}

/**
 * Keeps an attached receipt reachable after a locally created expense is
 * replaced by its server record (local-… id -> server id).
 */
export async function migrateReceipt(
  email: string | null | undefined,
  fromId: string,
  toId: string
): Promise<void> {
  if (!email || fromId === toId) return;
  const map = await readReceiptMap(email);
  const uri = map[fromId];
  if (!uri) return;
  delete map[fromId];
  map[toId] = uri;
  await writeReceiptMap(email, map);
}
