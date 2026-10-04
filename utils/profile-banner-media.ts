import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import type { ProfileBannerMedia } from "@/types/auth";

export const MAX_PROFILE_BANNER_VIDEO_MS = 10_000;
const MAX_PROFILE_BANNER_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PROFILE_BANNER_INPUT_VIDEO_BYTES = 250 * 1024 * 1024;
const MAX_WEB_VIDEO_BYTES_BEFORE_TRANSCODE = 15 * 1024 * 1024;
const WEB_SAFE_CLIP_MS = 9_500;
const BANNER_IDB_PREFIX = "ledgerly-banner://";

export type ProfileBannerKind = "image" | "video";

export type ResolvedBannerSource = {
  uri: string;
  dispose?: () => void;
};

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const videoExtensions: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "video/webm": "webm",
  "video/3gpp": "3gp",
  "video/3gpp2": "3g2",
};

function safeAccountKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "_") || "account";
}

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extensionFromAsset(asset: ImagePickerAsset, kind: ProfileBannerKind): string | null {
  const mime = asset.mimeType?.toLowerCase();
  const mapped = mime && (kind === "image" ? imageExtensions[mime] : videoExtensions[mime]);
  if (mapped) return mapped;
  const nameExtension = asset.fileName?.split(".").pop()?.toLowerCase();
  if (!nameExtension) return null;
  if (kind === "image" && ["jpg", "jpeg", "png", "webp"].includes(nameExtension)) {
    return nameExtension === "jpeg" ? "jpg" : nameExtension;
  }
  if (kind === "video" && ["mp4", "mov", "m4v", "webm", "3gp", "3g2"].includes(nameExtension)) {
    return nameExtension;
  }
  return null;
}

function validateAsset(asset: ImagePickerAsset, kind: ProfileBannerKind): string | null {
  if (asset.type && asset.type !== kind) {
    return kind === "image" ? "Choose an image for your profile banner." : "Choose a video for your profile banner.";
  }
  if (!extensionFromAsset(asset, kind)) {
    return kind === "image"
      ? "Choose a JPEG, PNG, or WebP image."
      : "Choose an MP4, MOV, M4V, WebM, or 3GP video.";
  }
  const limit = kind === "image" ? MAX_PROFILE_BANNER_IMAGE_BYTES : MAX_PROFILE_BANNER_INPUT_VIDEO_BYTES;
  if (asset.fileSize && asset.fileSize > limit) {
    return kind === "image"
      ? "Choose a banner image smaller than 15 MB."
      : "Choose a video smaller than 250 MB.";
  }
  return null;
}

type BannerRecord = {
  id: string;
  blob: Blob;
  kind: ProfileBannerKind;
  mimeType: string;
};

const BANNER_DATABASE = "ledgerly-profile-media";
const BANNER_STORE = "banners";
let bannerDatabasePromise: Promise<IDBDatabase> | null = null;

function openBannerDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("This browser does not support local banner storage."));
  }
  if (!bannerDatabasePromise) {
    bannerDatabasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(BANNER_DATABASE, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(BANNER_STORE)) {
          database.createObjectStore(BANNER_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open local banner storage."));
      request.onblocked = () => reject(new Error("Local banner storage is busy. Close other Ledgerly tabs and try again."));
    }).catch((error) => {
      bannerDatabasePromise = null;
      throw error;
    });
  }
  return bannerDatabasePromise!;
}

async function putBannerBlob(id: string, blob: Blob, kind: ProfileBannerKind): Promise<void> {
  const database = await openBannerDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(BANNER_STORE, "readwrite");
    transaction.objectStore(BANNER_STORE).put({ id, blob, kind, mimeType: blob.type } satisfies BannerRecord);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not save the banner on this device."));
    transaction.onabort = () => reject(transaction.error || new Error("Banner storage was interrupted."));
  });
}

async function readBannerBlob(id: string): Promise<BannerRecord | null> {
  const database = await openBannerDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BANNER_STORE, "readonly");
    const request = transaction.objectStore(BANNER_STORE).get(id);
    request.onsuccess = () => resolve((request.result as BannerRecord | undefined) ?? null);
    request.onerror = () => reject(request.error || new Error("Could not read the saved banner."));
  });
}

async function deleteBannerBlob(id: string): Promise<void> {
  const database = await openBannerDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(BANNER_STORE, "readwrite");
    transaction.objectStore(BANNER_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not remove the saved banner."));
    transaction.onabort = () => reject(transaction.error || new Error("Banner cleanup was interrupted."));
  });
}

async function readAssetBlob(asset: ImagePickerAsset): Promise<Blob> {
  if (asset.file instanceof Blob) return asset.file;
  const response = await fetch(asset.uri);
  if (!response.ok) throw new Error("Could not open the selected media. Please choose it again.");
  return response.blob();
}

type LoadedVideo = { element: HTMLVideoElement; objectUrl: string; durationMs: number };

function loadWebVideo(blob: Blob): Promise<LoadedVideo> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };
    video.onloadedmetadata = () => {
      if (Number.isNaN(video.duration) || video.duration <= 0) {
        cleanup();
        reject(new Error("Could not read this video's duration. Choose another video."));
        return;
      }
      resolve({ element: video, objectUrl, durationMs: Number.isFinite(video.duration) ? video.duration * 1000 : Infinity });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("This video format cannot be opened in this browser."));
    };
    video.src = objectUrl;
    video.load();
  });
}

function measureUnknownVideoDuration(video: HTMLVideoElement): Promise<number> {
  return new Promise((resolve, reject) => {
    let startedAt = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    video.onended = () => {
      if (timeout) clearTimeout(timeout);
      video.pause();
      resolve(startedAt ? performance.now() - startedAt : 0);
    };
    video.play().then(() => {
      startedAt = performance.now();
      timeout = setTimeout(() => {
        video.pause();
        resolve(MAX_PROFILE_BANNER_VIDEO_MS + 500);
      }, MAX_PROFILE_BANNER_VIDEO_MS + 500);
    }).catch(() => {
      reject(new Error("The prepared video could not be checked."));
    });
  });
}

function recordWebClip(
  video: HTMLVideoElement,
  durationMs: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === "undefined" || typeof document.createElement("canvas").captureStream !== "function") {
      reject(new Error("This browser cannot trim videos. Choose a clip of 10 seconds or less."));
      return;
    }

    const supportedTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
    const mimeType = supportedTypes.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) {
      reject(new Error("This browser does not have a supported video encoder. Choose a clip of 10 seconds or less."));
      return;
    }

    const sourceWidth = video.videoWidth || 640;
    const sourceHeight = video.videoHeight || 360;
    const scale = Math.min(1, 720 / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(2, Math.round(sourceWidth * scale));
    canvas.height = Math.max(2, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("This browser could not prepare the video preview."));
      return;
    }

    const stream = canvas.captureStream(24);
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_400_000 });
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      reject(new Error("This browser could not start video trimming."));
      return;
    }

    const clipMs = Math.min(durationMs, WEB_SAFE_CLIP_MS);
    const chunks: BlobPart[] = [];
    let animationFrame = 0;
    let progressTimer: ReturnType<typeof setInterval> | undefined;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const clean = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (progressTimer) clearInterval(progressTimer);
      if (stopTimer) clearTimeout(stopTimer);
      stream.getTracks().forEach((track) => track.stop());
      video.pause();
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      clean();
      reject(error);
    };

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => fail(new Error("Video trimming failed. The original video was not saved."));
    recorder.onstop = () => {
      if (settled) return;
      settled = true;
      clean();
      const result = new Blob(chunks, { type: recorder.mimeType || mimeType });
      if (!result.size) {
        reject(new Error("Video trimming produced an empty clip. The original video was not saved."));
      } else {
        resolve(result);
      }
    };

    let startedAt = 0;
    const stopRecording = () => {
      video.pause();
      if (recorder.state === "recording") recorder.stop();
    };
    const draw = () => {
      if (recorder.state !== "recording") return;
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch {
        fail(new Error("The selected video could not be decoded. The original video was not saved."));
        if (recorder.state === "recording") recorder.stop();
        return;
      }
      const elapsed = performance.now() - startedAt;
      onProgress?.(Math.min(0.95, 0.12 + (elapsed / clipMs) * 0.78));
      if (elapsed < clipMs && recorder.state === "recording") animationFrame = requestAnimationFrame(draw);
      else stopRecording();
    };

    try {
      video.currentTime = 0;
      video.play().then(() => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        recorder.start(200);
        startedAt = performance.now();
        video.onended = stopRecording;
        animationFrame = requestAnimationFrame(draw);
        progressTimer = setInterval(() => {
          const elapsed = performance.now() - startedAt;
          onProgress?.(Math.min(0.95, 0.12 + (elapsed / clipMs) * 0.78));
        }, 250);
        stopTimer = setTimeout(stopRecording, clipMs);
      }).catch(() => fail(new Error("The selected video could not be played for trimming.")));
    } catch {
      fail(new Error("The selected video could not be prepared for trimming."));
    }
  });
}

async function prepareWebMedia(
  asset: ImagePickerAsset,
  email: string,
  kind: ProfileBannerKind,
  onProgress?: (progress: number) => void
): Promise<ProfileBannerMedia> {
  const validationError = validateAsset(asset, kind);
  if (validationError) throw new Error(validationError);

  let blob = await readAssetBlob(asset);
  if (kind === "image") {
    const mime = blob.type.toLowerCase() || asset.mimeType?.toLowerCase() || "";
    if (!imageExtensions[mime]) throw new Error("Choose a JPEG, PNG, or WebP image.");
    if (blob.size > MAX_PROFILE_BANNER_IMAGE_BYTES) throw new Error("Choose a banner image smaller than 15 MB.");
    onProgress?.(0.75);
  } else {
    if (!blob.type.toLowerCase().startsWith("video/") && !asset.mimeType?.toLowerCase().startsWith("video/")) {
      throw new Error("This file does not contain a supported video.");
    }
    if (blob.size > MAX_PROFILE_BANNER_INPUT_VIDEO_BYTES) throw new Error("Choose a video smaller than 250 MB.");

    const loaded = await loadWebVideo(blob);
    const durationMs = loaded.durationMs;
    const needsTrim = durationMs > MAX_PROFILE_BANNER_VIDEO_MS;
    const shouldCompress = needsTrim || blob.size > MAX_WEB_VIDEO_BYTES_BEFORE_TRANSCODE;
    if (shouldCompress) {
      onProgress?.(0.1);
      try {
        blob = await recordWebClip(loaded.element, durationMs, onProgress);
      } finally {
        loaded.element.removeAttribute("src");
        loaded.element.load();
        URL.revokeObjectURL(loaded.objectUrl);
      }
      const checked = await loadWebVideo(blob);
      let actualDurationMs = checked.durationMs;
      try {
        if (!Number.isFinite(actualDurationMs)) {
          actualDurationMs = await measureUnknownVideoDuration(checked.element);
        }
      } finally {
        checked.element.removeAttribute("src");
        checked.element.load();
        URL.revokeObjectURL(checked.objectUrl);
      }
      if (actualDurationMs > MAX_PROFILE_BANNER_VIDEO_MS + 25) {
        throw new Error("The trimmed clip is longer than 10 seconds. The original video was not saved.");
      }
      if (actualDurationMs <= 0) throw new Error("Video trimming produced an invalid clip.");
      onProgress?.(0.98);
      return saveWebBlob(blob, email, kind, Math.min(actualDurationMs, MAX_PROFILE_BANNER_VIDEO_MS));
    }

    loaded.element.removeAttribute("src");
    loaded.element.load();
    URL.revokeObjectURL(loaded.objectUrl);
    onProgress?.(0.75);
    return saveWebBlob(blob, email, kind, Math.min(durationMs, MAX_PROFILE_BANNER_VIDEO_MS));
  }

  return saveWebBlob(blob, email, kind);
}

async function saveWebBlob(
  blob: Blob,
  email: string,
  kind: ProfileBannerKind,
  durationMs?: number
): Promise<ProfileBannerMedia> {
  const id = `${safeAccountKey(email)}-${uniqueSuffix()}`;
  try {
    await putBannerBlob(id, blob, kind);
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "QuotaExceededError") {
      throw new Error("There is not enough device storage for this banner. Remove old media or choose a smaller file.");
    }
    throw error instanceof Error ? error : new Error("Could not save the banner on this device.");
  }
  return {
    uri: `${BANNER_IDB_PREFIX}${encodeURIComponent(id)}`,
    type: kind,
    ...(kind === "video" && durationMs !== undefined ? { durationMs } : {}),
  };
}

function fileUri(path: string): string {
  if (path.startsWith("file://")) return path;
  return `file://${path.startsWith("/") ? "" : "/"}${path}`;
}

function copyNativeAsset(sourceUri: string, email: string, extension: string): File {
  const destination = new File(Paths.document, `ledgerly-banner-${safeAccountKey(email)}-${uniqueSuffix()}.${extension}`);
  new File(sourceUri).copy(destination);
  if (!destination.exists || !destination.size) {
    throw new Error("The selected media could not be saved to app storage.");
  }
  return destination;
}

async function prepareNativeMedia(
  asset: ImagePickerAsset,
  email: string,
  kind: ProfileBannerKind,
  onProgress?: (progress: number) => void
): Promise<ProfileBannerMedia> {
  const validationError = validateAsset(asset, kind);
  if (validationError) throw new Error(validationError);
  const extension = extensionFromAsset(asset, kind);
  if (!extension) throw new Error("The selected media format is not supported.");

  if (kind === "image") {
    onProgress?.(0.65);
    const destination = copyNativeAsset(asset.uri, email, extension);
    onProgress?.(1);
    return { uri: destination.uri, type: "image" };
  }

  onProgress?.(0.1);
  const videoTools = await import("react-native-video-trim");
  const sourceInfo = await videoTools.isValidFile(asset.uri);
  if (!sourceInfo.isValid || sourceInfo.fileType.toLowerCase() !== "video" || sourceInfo.duration <= 0) {
    throw new Error("This video could not be inspected. Choose a supported video file.");
  }
  const sourceDurationMs = sourceInfo.duration;
  const needsTrim = sourceDurationMs > MAX_PROFILE_BANNER_VIDEO_MS;
  let trimPath: string | null = null;
  let compressedPath: string | null = null;
  let storedFile: File | null = null;

  try {
    let sourceUri = asset.uri;
    let currentDuration = sourceDurationMs;
    let preferredExtension = extension;

    if (needsTrim) {
      onProgress?.(0.2);
      const result = await videoTools.trim(asset.uri, {
        startTime: 0,
        endTime: MAX_PROFILE_BANNER_VIDEO_MS,
        outputExt: "mp4",
        removeAudio: true,
        enablePreciseTrimming: true,
      });
      trimPath = result.outputPath;
      if (!result.success || !trimPath || result.duration <= 0 || result.duration > MAX_PROFILE_BANNER_VIDEO_MS) {
        throw new Error("This video could not be trimmed to 10 seconds. The original video was not saved.");
      }
      const trimmedInfo = await videoTools.isValidFile(trimPath);
      if (!trimmedInfo.isValid || trimmedInfo.duration <= 0 || trimmedInfo.duration > MAX_PROFILE_BANNER_VIDEO_MS) {
        throw new Error("The trimmed video failed its duration check. The original video was not saved.");
      }
      sourceUri = fileUri(trimPath);
      currentDuration = trimmedInfo.duration;
      preferredExtension = "mp4";
    }

    const inputBytes = asset.fileSize ?? 0;
    if (needsTrim || inputBytes > 15 * 1024 * 1024) {
      onProgress?.(0.65);
      try {
        const compressed = await videoTools.compress(sourceUri, {
          width: 720,
          height: 720,
          bitrate: 1_400_000,
          frameRate: 24,
          outputExt: "mp4",
          removeAudio: true,
        });
        compressedPath = compressed.outputPath;
        const compressedInfo = await videoTools.isValidFile(compressed.outputPath);
        if (
          !compressedInfo.isValid ||
          compressedInfo.duration <= 0 ||
          compressedInfo.duration > MAX_PROFILE_BANNER_VIDEO_MS
        ) {
          throw new Error("The prepared clip failed its duration check.");
        }
        sourceUri = fileUri(compressed.outputPath);
        currentDuration = compressedInfo.duration;
        preferredExtension = "mp4";
      } catch (compressionError) {
        const fallbackInfo = await videoTools.isValidFile(sourceUri).catch(() => null);
        const fallbackFile = new File(fileUri(sourceUri));
        const fallbackSize = fallbackFile.exists ? fallbackFile.size : 0;
        if (
          !fallbackInfo?.isValid ||
          fallbackInfo.duration <= 0 ||
          fallbackInfo.duration > MAX_PROFILE_BANNER_VIDEO_MS ||
          fallbackSize > 25 * 1024 * 1024
        ) {
          throw compressionError;
        }
        currentDuration = fallbackInfo.duration;
      }
    }

    if (currentDuration > MAX_PROFILE_BANNER_VIDEO_MS) {
      throw new Error("This video is longer than 10 seconds after processing, so it was not saved.");
    }

    onProgress?.(0.9);
    storedFile = copyNativeAsset(sourceUri, email, preferredExtension);
    const savedInfo = await videoTools.isValidFile(storedFile.uri);
    if (!savedInfo.isValid || savedInfo.duration <= 0 || savedInfo.duration > MAX_PROFILE_BANNER_VIDEO_MS) {
      throw new Error("The saved banner failed its 10-second duration check.");
    }
    onProgress?.(1);
    return { uri: storedFile.uri, type: "video", durationMs: savedInfo.duration };
  } catch (error) {
    if (storedFile?.exists) storedFile.delete();
    if (error instanceof Error && /could not be trimmed|duration check|longer than 10 seconds/i.test(error.message)) {
      throw error;
    }
    throw new Error("The video could not be prepared safely, so the original was not saved.");
  } finally {
    if (compressedPath) await videoTools.deleteFile(compressedPath).catch(() => undefined);
    if (trimPath) await videoTools.deleteFile(trimPath).catch(() => undefined);
  }
}

export async function persistProfileBannerMedia(
  asset: ImagePickerAsset,
  email: string,
  kind: ProfileBannerKind,
  onProgress?: (progress: number) => void
): Promise<ProfileBannerMedia> {
  return Platform.OS === "web"
    ? prepareWebMedia(asset, email, kind, onProgress)
    : prepareNativeMedia(asset, email, kind, onProgress);
}

export async function resolveProfileBannerSource(uri: string): Promise<ResolvedBannerSource | null> {
  if (Platform.OS !== "web") {
    try {
      const file = new File(uri);
      return file.exists ? { uri: file.uri } : null;
    } catch {
      return null;
    }
  }

  if (!uri.startsWith(BANNER_IDB_PREFIX)) return { uri };
  try {
    const id = decodeURIComponent(uri.slice(BANNER_IDB_PREFIX.length));
    const record = await readBannerBlob(id);
    if (!record?.blob?.size) return null;
    const objectUrl = URL.createObjectURL(record.blob);
    return { uri: objectUrl, dispose: () => URL.revokeObjectURL(objectUrl) };
  } catch {
    return null;
  }
}

export async function removeStoredProfileBanner(uri?: string | null): Promise<void> {
  if (!uri) return;
  if (Platform.OS === "web") {
    if (!uri.startsWith(BANNER_IDB_PREFIX)) return;
    try {
      await deleteBannerBlob(decodeURIComponent(uri.slice(BANNER_IDB_PREFIX.length)));
    } catch {
      // The media may already have been cleared by the browser.
    }
    return;
  }

  if (!uri.startsWith(Paths.document.uri) || !uri.includes("ledgerly-banner-")) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A missing or locked file should not prevent the account reference from being updated.
  }
}
