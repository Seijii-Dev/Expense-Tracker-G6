import { PermissionsAndroid, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants/storage";

/**
 * Checks if storage permissions are granted on the current platform.
 */
export async function checkStoragePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      // In Android 13+ (SDK 33+), scoped storage is standard.
      // Older versions require READ/WRITE_EXTERNAL_STORAGE.
      const readCheck = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      const writeCheck = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return readCheck || writeCheck;
    } catch {
      return false;
    }
  }
  // On iOS and web, storage is sandboxed / handled automatically
  return true;
}

/**
 * Requests storage permissions from the operating system.
 */
export async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const readGranted =
        results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const writeGranted =
        results[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return readGranted || writeGranted;
    } catch (error) {
      console.warn("Storage permission request error:", error);
      return false;
    }
  }
  return true;
}

/**
 * Checks if the user has already seen the storage permission prompt on first open.
 */
export async function hasPromptedStoragePermission(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.storagePermissionPrompted);
    return value === "true";
  } catch {
    return false;
  }
}

/**
 * Marks that the storage permission prompt has been displayed to the user.
 */
export async function setPromptedStoragePermission(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.storagePermissionPrompted, "true");
  } catch {
    // Ignore storage write error
  }
}

/**
 * Resets the prompt flag (useful for testing or re-verifying permissions).
 */
export async function resetStoragePermissionPrompt(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.storagePermissionPrompted);
  } catch {
    // Ignore storage write error
  }
}
