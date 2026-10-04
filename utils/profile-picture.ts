import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";

const MAX_PROFILE_IMAGE_BYTES = 15 * 1024 * 1024;
const WEB_PROFILE_DATA_URL_LIMIT = 5 * 1024 * 1024;

const extensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getSupportedProfileImageExtension(asset: ImagePickerAsset): string | null {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType && extensionsByMimeType[mimeType]) return extensionsByMimeType[mimeType];

  const fileExtension = asset.fileName?.split(".").pop()?.toLowerCase();
  if (fileExtension === "jpeg" || fileExtension === "jpg") return "jpg";
  if (fileExtension === "png") return "png";
  if (fileExtension === "webp") return "webp";
  return null;
}

export function validateProfileImage(asset: ImagePickerAsset): string | null {
  if (asset.type && asset.type !== "image") return "Choose an image file to use as your profile picture.";
  if (!getSupportedProfileImageExtension(asset)) {
    return "Choose a JPEG, PNG, or WebP image.";
  }
  if (asset.fileSize && asset.fileSize > MAX_PROFILE_IMAGE_BYTES) {
    return "Choose an image smaller than 15 MB.";
  }
  return null;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the selected image."));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(blob);
  });
}

export async function persistProfilePicture(asset: ImagePickerAsset, email: string): Promise<string> {
  const extension = getSupportedProfileImageExtension(asset);
  if (!extension) throw new Error("Choose a JPEG, PNG, or WebP image.");

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error("Could not open the selected image. Please choose it again.");
    const blob = await response.blob();
    if (blob.size > MAX_PROFILE_IMAGE_BYTES) throw new Error("Choose an image smaller than 15 MB.");

    const dataUrl = await readBlobAsDataUrl(blob);
    if (dataUrl.length > WEB_PROFILE_DATA_URL_LIMIT) {
      throw new Error("Choose a smaller image so it can be saved on this device.");
    }
    return dataUrl;
  }

  const safeEmail = email.replace(/[^a-zA-Z0-9._-]/g, "_");
  const destination = new File(Paths.document, `ledgerly-profile-${safeEmail}-${Date.now()}.${extension}`);
  new File(asset.uri).copy(destination);
  return destination.uri;
}

export function removeStoredProfilePicture(uri?: string | null): void {
  if (!uri || Platform.OS === "web" || !uri.startsWith(Paths.document.uri)) return;
  if (!uri.includes("ledgerly-profile-")) return;

  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Old profile files are safe to leave behind if cleanup is not available.
  }
}
