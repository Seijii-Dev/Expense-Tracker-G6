import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AboutDialog } from "@/components/common/about-dialog";
import { AccountSkeleton } from "@/components/ui/account-skeleton";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { ProfileAvatar } from "@/components/account/profile-avatar";
import { ProfileBannerLayer } from "@/components/account/profile-banner-layer";
import {
  persistProfilePicture,
  removeStoredProfilePicture,
  validateProfileImage,
} from "@/utils/profile-picture";
import {
  MAX_PROFILE_BANNER_VIDEO_MS,
  persistProfileBannerMedia,
  removeStoredProfileBanner,
} from "@/utils/profile-banner-media";
import type { ProfileBannerMedia } from "@/types/auth";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { account, logout, updateProfilePicture, updateProfileBanner } = useAuth();
  const { expenses, budget, syncing, syncError, refreshExpenses, hydrated, isBalanceHidden } =
    useExpenses();
  const { colors, dark } = useTheme();

  const [showSignOut, setShowSignOut] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState<string | null>(null);
  const [infoModalBody, setInfoModalBody] = useState<string | null>(null);
  const [showPhotoActions, setShowPhotoActions] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<ImagePickerAsset | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [showBannerActions, setShowBannerActions] = useState(false);
  const [showBannerPreview, setShowBannerPreview] = useState(false);
  const [showBannerProcessing, setShowBannerProcessing] = useState(false);
  const [pendingBanner, setPendingBanner] = useState<ProfileBannerMedia | null>(null);
  const [pendingBannerEmail, setPendingBannerEmail] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [bannerProgress, setBannerProgress] = useState(0);
  const [processingBannerKind, setProcessingBannerKind] = useState<"image" | "video" | null>(null);
  const [isPickingBanner, setIsPickingBanner] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  useEffect(() => {
    if (!bannerNotice) return;
    const timeout = setTimeout(() => setBannerNotice(null), 3200);
    return () => clearTimeout(timeout);
  }, [bannerNotice]);

  const totalTracked = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalBalance = Math.max(0, budget - totalTracked);

  const confirmSignOut = async () => {
    setShowSignOut(false);
    await logout();
    router.replace("/auth");
  };

  const handleOpenInfo = (title: string, body: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setInfoModalTitle(title);
    setInfoModalBody(body);
  };

  const choosePhoto = async () => {
    setPhotoError(null);
    setShowPhotoActions(false);
    setIsPickingPhoto(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const validationError = validateProfileImage(asset);
      if (validationError) {
        setPhotoError(validationError);
        setShowPhotoActions(true);
        return;
      }

      setPendingPhoto(asset);
      setShowPhotoPreview(true);
    } catch {
      setPhotoError("The photo picker could not open. Please try again.");
      setShowPhotoActions(true);
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const confirmPhotoChange = async () => {
    if (!pendingPhoto || !account) return;
    setIsSavingPhoto(true);
    setPhotoError(null);

    let savedUri: string | null = null;
    try {
      savedUri = await persistProfilePicture(pendingPhoto, account.email);
      await updateProfilePicture(savedUri);
      removeStoredProfilePicture(account.profilePictureUri);
      setShowPhotoPreview(false);
      setPendingPhoto(null);
    } catch (error) {
      if (savedUri) removeStoredProfilePicture(savedUri);
      setPhotoError(error instanceof Error ? error.message : "Could not save this photo. Please try again.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const removePhoto = async () => {
    if (!account?.profilePictureUri) return;
    setIsSavingPhoto(true);
    setPhotoError(null);

    try {
      await updateProfilePicture(null);
      removeStoredProfilePicture(account.profilePictureUri);
      setShowPhotoActions(false);
    } catch {
      setPhotoError("Could not remove this photo. Please try again.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const chooseBannerMedia = async (kind: "image" | "video") => {
    if (!account) {
      setBannerError("Sign in to customize your profile banner.");
      return;
    }
    setBannerError(null);
    setBannerNotice(null);
    setProcessingBannerKind(kind);
    setShowBannerActions(false);
    setIsPickingBanner(true);

    try {
      if (kind === "video" && Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          throw new Error("Allow photo library access to choose a banner video.");
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === "image" ? ["images"] : ["videos"],
        allowsEditing: false,
        quality: 0.9,
        videoMaxDuration: 0,
      });
      if (result.canceled || !result.assets?.[0]) {
        setShowBannerActions(true);
        return;
      }

      setShowBannerProcessing(true);
      setBannerProgress(0.08);
      const media = await persistProfileBannerMedia(result.assets[0], account.email, kind, setBannerProgress);
      setPendingBanner(media);
      setPendingBannerEmail(account.email);
      setShowBannerPreview(true);
    } catch (error) {
      setBannerError(error instanceof Error ? error.message : "The selected banner could not be prepared.");
      setShowBannerActions(true);
    } finally {
      setIsPickingBanner(false);
      setShowBannerProcessing(false);
      setBannerProgress(0);
      setProcessingBannerKind(null);
    }
  };

  const cancelBannerPreview = async () => {
    if (isSavingBanner) return;
    await removeStoredProfileBanner(pendingBanner?.uri);
    setShowBannerPreview(false);
    setPendingBanner(null);
    setPendingBannerEmail(null);
    setBannerError(null);
  };

  const confirmBannerChange = async () => {
    if (!pendingBanner || !account) return;
    if (pendingBannerEmail !== account.email) {
      setBannerError("Your account changed. Cancel this preview and choose a banner again.");
      return;
    }
    setIsSavingBanner(true);
    setBannerError(null);
    try {
      await updateProfileBanner(pendingBanner);
      await removeStoredProfileBanner(account.profileBanner?.uri);
      setShowBannerPreview(false);
      setPendingBanner(null);
      setPendingBannerEmail(null);
      setBannerNotice("Profile banner updated.");
    } catch (error) {
      setBannerError(error instanceof Error ? error.message : "Could not save the profile banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const removeBanner = async () => {
    if (!account?.profileBanner) return;
    setIsSavingBanner(true);
    setBannerError(null);
    try {
      await updateProfileBanner(null);
      await removeStoredProfileBanner(account.profileBanner.uri);
      setShowBannerActions(false);
      setBannerNotice("Profile banner removed.");
    } catch (error) {
      setBannerError(error instanceof Error ? error.message : "Could not remove the profile banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AccountSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={refreshExpenses}
            tintColor="#FFFFFF"
            colors={["#16382B"]}
          />
        }
      >
        {/* Top Curved Emerald Banner matching Mockup Screen 5 */}
        <View style={[styles.emeraldBanner, { paddingTop: Math.max(insets.top + 10, 24) }]}>
          <ProfileBannerLayer
            banner={account?.profileBanner}
            visible={!showBannerActions && !showBannerPreview && !showBannerProcessing}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(8, 31, 24, 0.54)", "rgba(8, 31, 24, 0.72)", "rgba(8, 31, 24, 0.86)"]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bannerForeground}>
            <View style={styles.bannerTopBar}>
              <Pressable
                style={({ pressed }) => [styles.bannerEditTopButton, pressed && styles.pressed]}
                onPress={() => {
                  setBannerError(null);
                  setShowBannerActions(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Edit profile banner. Choose a photo or video, or remove the banner."
              >
                <Ionicons name="image-outline" size={16} color="#FFFFFF" />
                <Text style={styles.bannerEditTopText}>Edit Banner</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.gearBtn, pressed && styles.pressed]}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  router.push("/(tabs)/settings");
                }}
                accessibilityRole="button"
                accessibilityLabel="Open Settings"
              >
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.profileSection}>
              <View style={styles.avatarEditWrap}>
                <View style={styles.avatarBorder}>
                  <ProfileAvatar
                    account={account}
                    size={70}
                    backgroundColor="#245844"
                    textColor="#FFFFFF"
                    fontSize={24}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.photoEditButton, pressed && styles.pressed]}
                  onPress={() => {
                    setPhotoError(null);
                    setShowPhotoActions(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Change profile picture"
                >
                  <Ionicons name="camera" size={15} color="#16382B" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => {
                  setPhotoError(null);
                  setShowPhotoActions(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Edit profile picture"
              >
                <Text style={styles.photoEditLabel}>Edit photo</Text>
              </Pressable>
              <Text style={styles.userName}>{account?.name || "Alex Johnson"}</Text>
              <Text style={styles.userEmail}>{account?.email || "alex.johnson@example.com"}</Text>
              {bannerNotice ? <Text style={styles.bannerNotice}>{bannerNotice}</Text> : null}
            </View>
          </View>
        </View>

        {/* Content Body Container */}
        <View style={styles.bodyContent}>
          {/* Financial Overview Card */}
          <View
            style={[
              styles.overviewCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: dark ? "#000000" : "#0A1F1C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.3 : 0.04,
                shadowRadius: 10,
                elevation: 2,
              },
            ]}
          >
            <Text style={[styles.overviewHeaderTitle, { color: colors.foreground }]}>
              Financial Overview
            </Text>
            <View style={styles.overviewGrid}>
              <View
                style={[
                  styles.overviewCol,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>Total Balance</Text>
                <Text
                  style={[styles.overviewAmount, { color: dark ? "#34D399" : "#16382B" }]}
                  numberOfLines={1}
                >
                  {isBalanceHidden ? "••••••" : formatMoney(totalBalance)}
                </Text>
              </View>

              <View
                style={[
                  styles.overviewCol,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.overviewLabel, { color: colors.muted }]}>
                  Monthly Spending
                </Text>
                <Text
                  style={[styles.overviewAmount, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {formatMoney(totalTracked)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action List Card matching Mockup */}
          <View
            style={[
              styles.actionsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: dark ? "#000000" : "#0A1F1C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.3 : 0.04,
                shadowRadius: 10,
                elevation: 2,
              },
            ]}
          >
            {/* 1. Personal Information */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                handleOpenInfo(
                  "Personal Information",
                  `Name: ${account?.name || "Alex Johnson"}\nEmail: ${
                    account?.email || "alex.johnson@example.com"
                  }\nStatus: Active Account`
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="person-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Personal Information
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 2. Linked Accounts */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                handleOpenInfo(
                  "Linked Accounts",
                  "Local Ledger: Synchronized\nCloud Backup: Enabled\nNo external bank accounts currently linked."
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="link-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Linked Accounts
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 3. Security & Privacy */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                handleOpenInfo(
                  "Security & Privacy",
                  "All financial entries are encrypted locally on your device using AES-256 standards. Your privacy is fully preserved."
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Security & Privacy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 4. Help & Support */}
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => setShowAboutModal(true)}
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="help-circle-outline" size={20} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>
                  Help & Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>

            {/* 5. Log Out */}
            <Pressable
              style={({ pressed }) => [styles.actionRow, styles.lastActionRow, pressed && styles.pressed]}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setShowSignOut(true);
              }}
              accessibilityRole="button"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="log-out-outline" size={20} color="#FF6554" />
                <Text style={[styles.actionText, { color: "#FF6554", fontWeight: "700" }]}>
                  Log Out
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FF6554" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPhotoActions}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPhotoActions(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowPhotoActions(false)} />
          <View style={[styles.photoModalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoModalHeader}>
              <Text style={[styles.infoModalTitle, { color: colors.foreground }]}>Profile photo</Text>
              <Pressable
                onPress={() => setShowPhotoActions(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Close profile photo options"
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            {photoError ? <Text style={styles.photoErrorText}>{photoError}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.photoActionButton, { backgroundColor: "#16382B" }, pressed && styles.pressed]}
              onPress={choosePhoto}
              disabled={isPickingPhoto || isSavingPhoto}
              accessibilityRole="button"
            >
              {isPickingPhoto ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.photoPrimaryActionText}>Choose Photo</Text>
                </>
              )}
            </Pressable>

            {account?.profilePictureUri ? (
              <Pressable
                style={({ pressed }) => [styles.photoActionButton, styles.photoRemoveButton, pressed && styles.pressed]}
                onPress={removePhoto}
                disabled={isSavingPhoto}
                accessibilityRole="button"
              >
                {isSavingPhoto ? (
                  <ActivityIndicator color="#FF6554" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#FF6554" />
                    <Text style={styles.photoRemoveText}>Remove Photo</Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.photoCancelButton, pressed && styles.pressed]}
              onPress={() => setShowPhotoActions(false)}
              accessibilityRole="button"
            >
              <Text style={[styles.photoCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPhotoPreview}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (!isSavingPhoto) {
            setShowPhotoPreview(false);
            setPendingPhoto(null);
            setPhotoError(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              if (!isSavingPhoto) {
                setShowPhotoPreview(false);
                setPendingPhoto(null);
                setPhotoError(null);
              }
            }}
          />
          <View style={[styles.photoPreviewSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoModalTitle, { color: colors.foreground, textAlign: "center" }]}>Preview photo</Text>
            {pendingPhoto ? (
              <Image source={{ uri: pendingPhoto.uri }} style={styles.photoPreviewImage} resizeMode="cover" />
            ) : null}
            {photoError ? <Text style={styles.photoErrorText}>{photoError}</Text> : null}
            <Pressable
              style={({ pressed }) => [styles.photoActionButton, { backgroundColor: "#16382B" }, pressed && styles.pressed]}
              onPress={confirmPhotoChange}
              disabled={isSavingPhoto || !pendingPhoto}
              accessibilityRole="button"
            >
              {isSavingPhoto ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.photoPrimaryActionText}>Use Photo</Text>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.photoCancelButton, pressed && styles.pressed]}
              onPress={() => {
                if (isSavingPhoto) return;
                setShowPhotoPreview(false);
                setPendingPhoto(null);
                setPhotoError(null);
              }}
              disabled={isSavingPhoto}
              accessibilityRole="button"
            >
              <Text style={[styles.photoCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBannerActions}
        animationType="fade"
        transparent
        onRequestClose={() => setShowBannerActions(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBannerActions(false)} />
          <View style={[styles.photoModalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoModalHeader}>
              <Text style={[styles.infoModalTitle, { color: colors.foreground }]}>Profile banner</Text>
              <Pressable
                onPress={() => setShowBannerActions(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Close banner options"
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={[styles.bannerActionDescription, { color: colors.muted }]}>Choose media stored only on this device.</Text>
            {bannerError ? <Text style={styles.photoErrorText}>{bannerError}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.photoActionButton, { backgroundColor: "#16382B" }, pressed && styles.pressed]}
              onPress={() => chooseBannerMedia("image")}
              disabled={isPickingBanner || isSavingBanner}
              accessibilityRole="button"
              accessibilityLabel="Choose a photo for your profile banner"
            >
              {isPickingBanner ? <ActivityIndicator color="#FFFFFF" /> : <>
                <Ionicons name="image-outline" size={19} color="#FFFFFF" />
                <Text style={styles.photoPrimaryActionText}>Choose Photo</Text>
              </>}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.photoActionButton, { backgroundColor: "#16382B" }, pressed && styles.pressed]}
              onPress={() => chooseBannerMedia("video")}
              disabled={isPickingBanner || isSavingBanner}
              accessibilityRole="button"
              accessibilityLabel={`Choose a video up to ${MAX_PROFILE_BANNER_VIDEO_MS / 1000} seconds for your profile banner`}
            >
              <Ionicons name="videocam-outline" size={19} color="#FFFFFF" />
              <Text style={styles.photoPrimaryActionText}>Choose Video</Text>
            </Pressable>

            {account?.profileBanner ? (
              <Pressable
                style={({ pressed }) => [styles.photoActionButton, styles.photoRemoveButton, pressed && styles.pressed]}
                onPress={removeBanner}
                disabled={isSavingBanner}
                accessibilityRole="button"
                accessibilityLabel="Remove profile banner"
              >
                {isSavingBanner ? <ActivityIndicator color="#FF6554" /> : <>
                  <Ionicons name="trash-outline" size={18} color="#FF6554" />
                  <Text style={styles.photoRemoveText}>Remove Banner</Text>
                </>}
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.photoCancelButton, pressed && styles.pressed]}
              onPress={() => setShowBannerActions(false)}
              accessibilityRole="button"
            >
              <Text style={[styles.photoCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showBannerProcessing} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalOverlay}>
          <View style={[styles.bannerProcessingSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoModalTitle, { color: colors.foreground, marginTop: 16 }]}>Preparing banner</Text>
            <Text style={[styles.bannerActionDescription, { color: colors.muted, textAlign: "center" }]}>
              {processingBannerKind === "video"
                ? `Preparing a muted clip up to ${MAX_PROFILE_BANNER_VIDEO_MS / 1000} seconds…`
                : "Saving your image on this device…"}
            </Text>
            <View style={[styles.bannerProgressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.bannerProgressFill, { backgroundColor: colors.primary, width: `${Math.max(8, Math.round(bannerProgress * 100))}%` }]} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBannerPreview}
        animationType="fade"
        transparent
        onRequestClose={cancelBannerPreview}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={cancelBannerPreview} disabled={isSavingBanner} />
          <View style={[styles.bannerPreviewSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoModalHeader}>
              <Text style={[styles.infoModalTitle, { color: colors.foreground }]}>Preview banner</Text>
              <Pressable
                onPress={cancelBannerPreview}
                disabled={isSavingBanner}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Cancel banner preview"
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.bannerPreviewFrame}>
              {pendingBanner ? <ProfileBannerLayer banner={pendingBanner} visible /> : null}
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(8,31,24,0.16)", "rgba(8,31,24,0.78)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.bannerPreviewCopy}>
                <Text style={styles.bannerPreviewName}>{account?.name || "Your profile"}</Text>
                <Text style={styles.bannerPreviewEmail}>{account?.email || ""}</Text>
              </View>
            </View>
            <Text style={[styles.bannerActionDescription, { color: colors.muted }]}>
              {pendingBanner?.type === "video"
                ? `Muted, looping video · ${Math.min(Math.ceil((pendingBanner.durationMs || 0) / 1000), MAX_PROFILE_BANNER_VIDEO_MS / 1000)} seconds maximum`
                : "Your image will fill the banner without being stretched."}
            </Text>
            {bannerError ? <Text style={styles.photoErrorText}>{bannerError}</Text> : null}
            <Pressable
              style={({ pressed }) => [styles.photoActionButton, { backgroundColor: "#16382B" }, pressed && styles.pressed]}
              onPress={confirmBannerChange}
              disabled={isSavingBanner || !pendingBanner}
              accessibilityRole="button"
            >
              {isSavingBanner ? <ActivityIndicator color="#FFFFFF" /> : <>
                <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                <Text style={styles.photoPrimaryActionText}>Use Banner</Text>
              </>}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.photoCancelButton, pressed && styles.pressed]}
              onPress={cancelBannerPreview}
              disabled={isSavingBanner}
              accessibilityRole="button"
            >
              <Text style={[styles.photoCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Info Dialog Modal */}
      <Modal
        visible={Boolean(infoModalTitle)}
        animationType="fade"
        transparent
        onRequestClose={() => setInfoModalTitle(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setInfoModalTitle(null)} />
          <View
            style={[
              styles.infoModalSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoModalHeader}>
              <Text style={[styles.infoModalTitle, { color: colors.foreground }]}>
                {infoModalTitle}
              </Text>
              <Pressable
                onPress={() => setInfoModalTitle(null)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.infoModalBody, { color: colors.muted }]}>
              {infoModalBody}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryModalBtn,
                { backgroundColor: "#16382B", marginTop: 20 },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setInfoModalTitle(null)}
            >
              <Text style={styles.primaryModalBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <ConfirmDialog
        visible={showSignOut}
        title="Sign out of Ledgerly?"
        message="You can sign back in anytime. Your saved expenses will remain safely in your account."
        icon="log-out-outline"
        iconColor="#FF6554"
        iconBgColor="rgba(255, 101, 84, 0.15)"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOut(false)}
        destructive
      />

      {/* About Ledgerly Modal */}
      <AboutDialog visible={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 96,
  },
  emeraldBanner: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#16382B",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  bannerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bannerForeground: {
    position: "relative",
    zIndex: 1,
  },
  bannerEditTopButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  bannerEditTopText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  topBarSpacer: {
    width: 36,
  },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  profileSection: {
    alignItems: "center",
    marginTop: 4,
  },
  avatarEditWrap: {
    position: "relative",
    marginBottom: 8,
  },
  avatarBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  photoEditButton: {
    position: "absolute",
    right: -2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  photoEditLabel: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 7,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.34)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 12.5,
    color: "#A7F3D0",
    marginTop: 2,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerNotice: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  overviewCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  overviewHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: "row",
    gap: 12,
  },
  overviewCol: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  overviewLabel: {
    fontSize: 11.5,
    fontWeight: "500",
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  actionsCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  lastActionRow: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  infoModalSheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  photoModalSheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  photoPreviewSheet: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  photoPreviewImage: {
    width: 208,
    height: 208,
    borderRadius: 104,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#245844",
  },
  photoErrorText: {
    color: "#FF6554",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  photoActionButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 14,
    marginTop: 8,
    paddingHorizontal: 14,
  },
  photoPrimaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  photoRemoveButton: {
    borderWidth: 1,
    borderColor: "rgba(255,101,84,0.35)",
    backgroundColor: "rgba(255,101,84,0.07)",
  },
  photoRemoveText: {
    color: "#FF6554",
    fontSize: 14,
    fontWeight: "700",
  },
  photoCancelButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  photoCancelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bannerActionDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  bannerProcessingSheet: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  bannerProgressTrack: {
    width: "100%",
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    marginTop: 12,
  },
  bannerProgressFill: { height: "100%", borderRadius: 3 },
  bannerPreviewSheet: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  bannerPreviewFrame: {
    height: 180,
    width: "100%",
    overflow: "hidden",
    position: "relative",
    borderRadius: 16,
    backgroundColor: "#16382B",
    marginTop: 4,
  },
  bannerPreviewCopy: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  bannerPreviewName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
  bannerPreviewEmail: {
    color: "#D1FAE5",
    fontSize: 11,
    marginTop: 3,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  infoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: 18,
    fontFamily: "Fraunces_700Bold",
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoModalBody: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  primaryModalBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryModalBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
});
