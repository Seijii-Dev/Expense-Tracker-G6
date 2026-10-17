Warning: truncated output (original token count: 12589)
Total output lines: 1530

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
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AccountSkeleton } from "@/components/ui/account-skeleton";
import { NeumorphicSurface } from "@/components/ui/neumorphic-surface";
import { useAuth } from "@/lib/auth-store";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { ProfileAvatar } from "@/components/account/profile-avatar";
import { ProfileBannerLayer } from "@/components/account/profile-banner-layer";
import { AppLottieView } from "@/components/ui/app-lottie-view";
import { radii, spacing, typography } from "@/constants/design-tokens";
import { MotionEntrance, MotionNumber, PressableScale } from "@/components/motion";
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
import { useReducedMotion } from "react-native-reanimated";

export default function AccountScreen() {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { account, logout, updateProfilePicture, updateProfileBanner } = useAuth();
  const { expenses, budget, syncing, refreshExpenses, hydrated, isBalanceHidden } =
    useExpenses();
  const { colors, dark } = useTheme();

  const isSmallScreen = windowWidth < 360;
  const bannerBaseHeight = isSmallScreen ? 140 : Math.min(Math.round(windowWidth * 0.44), 180);
  const bannerHeight = bannerBaseHeight + Math.max(insets.top, Platform.OS === "android" ? 10 : 0);
  const bottomClearance = Math.max(insets.bottom + 92, 116);

  const [showSignOut, setShowSignOut] = useState(false);
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
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomClearance }]}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={refreshExpenses}
            tintColor="#FFFFFF"
            colors={["#E84A3F"]}
          />
        }
      >
        {/* Top Contextual Bar */}
        <MotionEntrance delay={0}>
          <View style={[styles.topSubBar, { paddingTop: Math.max(insets.top + 6, 12) }]}>
            <PressableScale
              style={[
                styles.backBtn,
                { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surface },
              ]}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/settings");
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={18} color={colors.foreground} />
            </PressableScale>

            <Text style={[styles.topSubBarTitle, { color: colors.foreground }]}>Profile</Text>

            <View style={styles.topActionsRow}>
              <PressableScale
                style={[
                  styles.editBannerBtn,
                  { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surface },
                ]}
                onPress={() => {
                  setBannerError(null);
                  setShowBannerActions(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Edit profile banner"
              >
                <Ionicons name="image-outline" size={14} color={colors.foreground} />
                <Text style={[styles.editBannerText, { color: colors.foreground }]}>Edit Banner</Text>
              </PressableScale>
            </View>
          </View>
        </MotionEntrance>

        {/* Hero Profile Banner */}
        <MotionEntrance delay={60}>
          <View style={styles.bannerContainer}>
            <View style={[styles.bannerCard, { height: bannerHeight }]}>
              {/* Fallback Brand Gradient Backdrop */}
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F", "#C83226"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Geometric SVG Underlay Pattern */}
              <Svg
                style={StyleSheet.absoluteFillObject}
                preserveAspectRatio="none"
                viewBox="0 0 400 150"
              >
                <Path
                  d="M-20,120 C80,40 180,140 280,60 C340,10 400,80 430,40 L430,160 L-20,160 Z"
                  fill="#ffffff"
                  opacity={0.16}
                />
                <Circle cx="340" cy="30" r="60" fill="#ffffff" opacity={0.12} />
              </Svg>

              {/* Custom media if uploaded - Layered ON TOP of fallback gradient */}
              <ProfileBannerLayer
                banner={account?.profileBanner}
                visible={!showBannerActions && !showBannerPreview && !showBannerProcessing}
              />

              {/* Subtle contrast gradient vignette if custom banner is active */}
              {account?.profileBanner ? (
                <LinearGradient
                  pointerEvents="none"
                  colors={["rgba(0,0,0,0.32)", "transparent", "rgba(0,0,0,0.48)"]}
                  locations={[0, 0.45, 1]}
                  style={StyleSheet.absoluteFillObject}
                />
              ) : null}
            </View>

            {/* Floating Avatar */}
            <View style={styles.avatarOverlapSection}>
              <View style={styles.avatarRingWrap}>
                <ProfileAvatar
                  account={account}
                  size={84}
                  backgroundColor={colors.primary}
                  textColor="#FFFFFF"
                  fontSize={28}
                />

                {/* Camera edit button on avatar (replaces check icon) */}
                <Pressable
                  style={({ pressed }) => [
                    styles.avatarEditBtn,
                    {
                      backgroundColor: dark ? "#1E293B" : "#FFFFFF",
                      borderColor: dark ? "#334155" : "#FED7D2",
                    },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
                  ]}
                  onPress={() => {
                    setPhotoError(null);
                    setShowPhotoActions(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile picture"
                >
                  <Ionicons name="camera" size={14} color={colors.primary} />
                </Pressable>
              </View>

              {/* Identity Details */}
              <View style={styles.identityDetails}>
                <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                  {account?.name || "Alex Johnson"}
                </Text>
                <View style={styles.userHandleRow}>
                  <Text style={[styles.userHandle, { color: colors.muted }]} numberOfLines={1}>
                    {account?.email || "alex.johnson@example.com"}
                  </Text>
                  <AppLottieView
                    source={require("@/assets/lottie/verified-badge.json")}
                    style={styles.verifiedLottieHandle}
                    autoPlay
                    loop
                    fallback={<Ionicons name="checkmark-circle" size={16} color="#3D66F3" />}
                  />
                </View>

                {bannerNotice ? (
                  <Text
                    style={[
                      styles.bannerNoticeText,
                      {
                        color: dark ? "#6EE7B7" : "#047857",
                        backgroundColor: dark ? "rgba(16, 185, 129, 0.18)" : "#ECFDF5",
                      },
                    ]}
                  >
                    {bannerNotice}
                  </Text>
                ) : null}

              </View>
            </View>
          </View>
        </MotionEntrance>

        {/* Financial Snapshot Overview */}
        <MotionEntrance delay={120}>
          <View style={[styles.snapshotGrid, windowWidth < 380 && styles.snapshotGridNarrow]}>
            {/* 1. Total Tracked */}
            <NeumorphicSurface
              variant="card"
              radius={16}
              style={[
                styles.snapshotCard,
                windowWidth < 380 && styles.snapshotCardNarrow,
              ]}
            >
              <View style={[styles.snapshotIconBox, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="wallet-outline" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.snapshotLabel, { color: colors.muted }]}>TOTAL TRACKED</Text>
                <MotionNumber
                  value={totalTracked}
                  formatter={formatMoney}
                  style={[styles.snapshotAmount, { color: colors.foreground }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                />
              </View>
            </NeumorphicSurface>

            {/* 2. Active Budget */}
            <NeumorphicSurface
              variant="card"
              radius={16}
              style={[
                styles.snapshotCard,
                windowWidth < 380 && styles.snapshotCardNarrow,
              ]}
            >
              <View style={[styles.snapshotIconBox, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="pie-chart-outline" size={16} color={colors.success} />
              </View>
              <View>
                <Text style={[styles.snapshotLabel, { color: colors.muted }]}>BUDGET</Text>
                <MotionNumber
                  value={budget}
                  formatter={formatMoney}
                  style={[styles.snapshotAmount, { color: colors.foreground }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                />
              </View>
            </NeumorphicSurface>

            {/* 3. Remaining Balance */}
            <NeumorphicSurface
              variant="card"
              radius={16}
              style={[
                styles.snapshotCard,
                windowWidth < 380 && styles.snapshotCardWide,
              ]}
            >
              <View style={[styles.snapshotIconBox, { backgroundColor: dark ? "rgba(255,255,255,0.08)" : colors.surfaceSubtle }]}>
                <Ionicons name="sparkles-outline" size={16} color={colors.foreground} />
              </View>
              <View>
                <Text style={[styles.snapshotLabel, { color: colors.muted }]}>REMAINING</Text>
                {isBalanceHidden ? (
                  <Text
                    style={[
                      styles.snapshotAmount,
                      { color: totalBalance > 0 ? colors.success : colors.foreground },
                    ]}
                    numberOfLines={1}
                  >
                    ••••••
                  </Text>
                ) : (
                  <MotionNumber
                    value={totalBalance}
                    formatter={formatMoney}
                    style={[
                      styles.snapshotAmount,
                      { color: totalBalance > 0 ? colors.success : colors.foreground },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  />
                )}
              </View>
            </NeumorphicSurface>
          </View>
        </MotionEntrance>

        {/* Personal Details */}
        <MotionEntrance delay={180}>
          <View style={styles.sectionWrap}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>PERSONAL DETAILS</Text>
            </View>

            <NeumorphicSurface
              variant="card"
              radius={20}
              style={styles.groupedCard}
            >
              {/* Full Name */}
              <Pressable
                style={({ pressed }) => [
                  styles.detailsRow,
                  { borderBottomColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  handleOpenInfo(
                    "Account Name",
                    `Registered Name: ${account?.name || "Alex Johnson"}`
                  )
                }
                accessibilityRole="button"
              >
                <View style={styles.detailsLeft}>
                  <Text style={[styles.detailsLabel, { color: colors.muted }]}>Full Name</Text>
                  <Text style={[styles.detailsValue, { color: colors.foreground }]}>
                    {account?.name || "Alex Johnson"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>

              {/* Email Address */}
              <Pressable
                style={({ pressed }) => [
                  styles.detailsRow,
                  { borderBottomColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  handleOpenInfo(
                    "Email Address",
                    `Email: ${account?.email || "alex.johnson@example.com"}`
                  )
                }
                accessibilityRole="button"
              >
                <View style={styles.detailsLeft}>
                  <View style={styles.labelWithBadge}>
                    <Text style={[styles.detailsLabel, { color: colors.muted }]}>Email Address</Text>
                    <AppLottieView
                      source={require("@/assets/lottie/verified-badge.json")}
                      style={styles.verifiedLottieIcon}
                      autoPlay
                      loop
                      fallback={<Ionicons name="checkmark-circle" size={14} color="#3D66F3" />}
                    />
                  </View>
                  <Text style={[styles.detailsValue, { color: colors.foreground }]}>
                    {account?.email || "alex.johnson@example.com"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>

              {/* Monthly Budget Target */}
              <Pressable
                style={({ pressed }) => [
                  styles.detailsRow,
                  styles.lastRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push("/(tabs)/settings")}
                accessibilityRole="button"
              >
                <View style={styles.detailsLeft}>
                  <Text style={[styles.detailsLabel, { color: colors.muted }]}>Monthly Budget Limit</Text>
                  <Text style={[styles.detailsValue, { color: colors.success }]}>
                    {formatMoney(budget)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>
            </NeumorphicSurface>
          </View>
        </MotionEntrance>

        {/* Sign Out Action */}
        <MotionEntrance delay={240}>
          <View style={styles.logoutSection}>
            <PressableScale
              style={[
                styles.logoutButton,
                {
                  backgroundColor: dark ? "rgba(232, 74, 63, 0.12)" : "#FFF0ED",…589 tokens truncated…{styles.modalBtnText}>Choose Photo</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {account?.profilePictureUri ? (
              <Pressable
                style={({ pressed }) => [styles.modalDestructiveBtn, pressed && { opacity: 0.8 }]}
                onPress={removePhoto}
                disabled={isSavingPhoto}
                accessibilityRole="button"
              >
                {isSavingPhoto ? (
                  <ActivityIndicator color="#E84A3F" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={17} color="#E84A3F" />
                    <Text style={styles.modalDestructiveText}>Remove Photo</Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setShowPhotoActions(false)}
              accessibilityRole="button"
            >
              <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Photo Preview Modal */}
      <Modal
        visible={showPhotoPreview}
        animationType={reduceMotion ? "none" : "fade"}
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
          <View style={[styles.modalSheetCard, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: "center" }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, textAlign: "center" }]}>Preview Photo</Text>
            {pendingPhoto ? (
              <Image source={{ uri: pendingPhoto.uri }} style={styles.photoPreviewImage} resizeMode="cover" />
            ) : null}
            {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, { width: "100%" }, pressed && { opacity: 0.88 }]}
              onPress={confirmPhotoChange}
              disabled={isSavingPhoto || !pendingPhoto}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalBtnGradient}
              >
                {isSavingPhoto ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnText}>Use Photo</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                if (isSavingPhoto) return;
                setShowPhotoPreview(false);
                setPendingPhoto(null);
                setPhotoError(null);
              }}
              disabled={isSavingPhoto}
              accessibilityRole="button"
            >
              <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Banner Actions Modal */}
      <Modal
        visible={showBannerActions}
        animationType={reduceMotion ? "none" : "fade"}
        transparent
        onRequestClose={() => setShowBannerActions(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBannerActions(false)} />
          <View style={[styles.modalSheetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Profile Banner</Text>
              <Pressable
                onPress={() => setShowBannerActions(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={[styles.modalSubDesc, { color: colors.muted }]}>Choose custom media stored on your device.</Text>
            {bannerError ? <Text style={styles.errorText}>{bannerError}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.88 }]}
              onPress={() => chooseBannerMedia("image")}
              disabled={isPickingBanner || isSavingBanner}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalBtnGradient}
              >
                {isPickingBanner ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.modalBtnText}>Choose Photo</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.modalSecondaryBtn,
                { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => chooseBannerMedia("video")}
              disabled={isPickingBanner || isSavingBanner}
              accessibilityRole="button"
            >
              <Ionicons name="videocam-outline" size={18} color={colors.foreground} />
              <Text style={[styles.modalSecondaryText, { color: colors.foreground }]}>Choose Video</Text>
            </Pressable>

            {account?.profileBanner ? (
              <Pressable
                style={({ pressed }) => [styles.modalDestructiveBtn, pressed && { opacity: 0.8 }]}
                onPress={removeBanner}
                disabled={isSavingBanner}
                accessibilityRole="button"
              >
                {isSavingBanner ? (
                  <ActivityIndicator color="#E84A3F" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={17} color="#E84A3F" />
                    <Text style={styles.modalDestructiveText}>Remove Banner</Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setShowBannerActions(false)}
              accessibilityRole="button"
            >
              <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Banner Processing Modal */}
      <Modal visible={showBannerProcessing} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={() => undefined}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheetCard, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: "center" }]}>
            <ActivityIndicator size="large" color="#E84A3F" />
            <Text style={[styles.modalTitle, { color: colors.foreground, marginTop: 16 }]}>Preparing Banner</Text>
            <Text style={[styles.modalSubDesc, { color: colors.muted, textAlign: "center" }]}>
              {processingBannerKind === "video"
                ? `Preparing a muted clip up to ${MAX_PROFILE_BANNER_VIDEO_MS / 1000} seconds…`
                : "Saving image on your device…"}
            </Text>
            <View style={[styles.bannerProgressTrack, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.border }]}>
              <View style={[styles.bannerProgressFill, { width: `${Math.max(8, Math.round(bannerProgress * 100))}%` }]} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Banner Preview Modal */}
      <Modal
        visible={showBannerPreview}
        animationType={reduceMotion ? "none" : "fade"}
        transparent
        onRequestClose={cancelBannerPreview}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={cancelBannerPreview} disabled={isSavingBanner} />
          <View style={[styles.modalSheetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Preview Banner</Text>
              <Pressable
                onPress={cancelBannerPreview}
                disabled={isSavingBanner}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>
            <View style={styles.bannerPreviewFrame}>
              {pendingBanner ? <ProfileBannerLayer banner={pendingBanner} visible /> : null}
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.bannerPreviewCopy}>
                <Text style={styles.bannerPreviewName} numberOfLines={1}>
                  {account?.name || "Your profile"}
                </Text>
                <Text style={styles.bannerPreviewEmail} numberOfLines={1}>
                  {account?.email || ""}
                </Text>
              </View>
            </View>
            {bannerError ? <Text style={styles.errorText}>{bannerError}</Text> : null}
            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.88 }]}
              onPress={confirmBannerChange}
              disabled={isSavingBanner || !pendingBanner}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalBtnGradient}
              >
                {isSavingBanner ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.modalBtnText}>Use Banner</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.7 }]}
              onPress={cancelBannerPreview}
              disabled={isSavingBanner}
              accessibilityRole="button"
            >
              <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Info Dialog Modal */}
      <Modal
        visible={Boolean(infoModalTitle)}
        animationType={reduceMotion ? "none" : "fade"}
        transparent
        onRequestClose={() => setInfoModalTitle(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setInfoModalTitle(null)} />
          <View
            style={[
              styles.modalSheetCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {infoModalTitle}
              </Text>
              <Pressable
                onPress={() => setInfoModalTitle(null)}
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.infoModalBody, { color: colors.muted }]}>
              {infoModalBody}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, { marginTop: 18 }, pressed && { opacity: 0.88 }]}
              onPress={() => setInfoModalTitle(null)}
            >
              <LinearGradient
                colors={["#FF5A4E", "#E84A3F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalBtnGradient}
              >
                <Text style={styles.modalBtnText}>Got it</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <ConfirmDialog
        visible={showSignOut}
        title="Sign out of Ledgerly?"
        message="You can sign back in anytime. Your saved expenses will remain safely in your offline ledger."
        icon="log-out-outline"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOut(false)}
        destructive
      />

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
  topSubBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
  },
  cloudSyncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  cloudSyncText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  topActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  editBannerText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  topSubBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  bannerContainer: {
    position: "relative",
    paddingHorizontal: spacing.lg,
    marginBottom: 16,
  },
  bannerCard: {
    width: "100%",
    borderRadius: radii.panel,
    overflow: "hidden",
    position: "relative",
  },
  bannerBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  bannerBadgeText: {
    color: "#0F172A",
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  avatarOverlapSection: {
    alignItems: "center",
    marginTop: -46,
    zIndex: 10,
  },
  avatarRingWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#1A1D20",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
    zIndex: 10,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  identityDetails: {
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 20,
    width: "100%",
  },
  userName: {
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  userHandleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 3,
  },
  userHandle: {
    fontSize: 13,
    fontWeight: "500",
  },
  verifiedLottieHandle: {
    width: 20,
    height: 20,
  },
  bannerNoticeText: {
    maxWidth: 300,
    alignSelf: "center",
    color: "#047857",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  statusChipPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    backgroundColor: "#FFF0ED",
  },
  statusChipPrimaryText: {
    color: "#E84A3F",
    fontSize: 10.5,
    fontWeight: "700",
  },
  statusChipNeutral: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  statusChipNeutralText: {
    fontSize: 10.5,
    fontWeight: "500",
  },
  snapshotGrid: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  snapshotGridNarrow: {
    flexWrap: "wrap",
  },
  snapshotCard: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  snapshotCardNarrow: {
    flexBasis: "48%",
  },
  snapshotCardWide: {
    flexBasis: "100%",
  },
  snapshotIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  snapshotLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  snapshotAmount: {
    fontVariant: ["tabular-nums"],
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginTop: 1,
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  groupedCard: {
    overflow: "hidden",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    minHeight: 56,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  pressed: {
    opacity: 0.7,
  },
  detailsLeft: {
    flex: 1,
    paddingRight: 10,
  },
  labelWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  detailsLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  verifiedLottieIcon: {
    width: 20,
    height: 20,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  logoutButton: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  logoutButtonText: {
    color: "#E84A3F",
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheetCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  errorText: {
    color: "#E84A3F",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalPrimaryBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  modalBtnGradient: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalSecondaryBtn: {
    width: "100%",
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 8,
  },
  modalSecondaryText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  modalDestructiveBtn: {
    width: "100%",
    height: 44,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#FFF0ED",
    borderWidth: 1,
    borderColor: "#FED7D2",
  },
  modalDestructiveText: {
    color: "#E84A3F",
    fontSize: 13.5,
    fontWeight: "700",
  },
  modalCancelBtn: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  photoPreviewImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginVertical: 14,
    backgroundColor: "#E84A3F",
  },
  bannerProgressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 14,
  },
  bannerProgressFill: {
    height: "100%",
    backgroundColor: "#E84A3F",
    borderRadius: 3,
  },
  bannerPreviewFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    maxHeight: 160,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E84A3F",
    marginVertical: 10,
  },
  bannerPreviewCopy: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 12,
  },
  bannerPreviewName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  bannerPreviewEmail: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10.5,
    marginTop: 1,
  },
  infoModalBody: {
    fontSize: 13.5,
    lineHeight: 20,
  },
});

