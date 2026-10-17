import React, { useEffect } from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";
import { NeumorphicSurface } from "@/components/ui/neumorphic-surface";

interface AboutDialogProps {
  visible: boolean;
  onClose: () => void;
}

const WEBSITE_URL = "https://ledgerly-web-g6.netlify.app/";

export function AboutDialog({ visible, onClose }: AboutDialogProps) {
  const { colors, dark } = useTheme();
  const reduceMotion = useReducedMotion();

  const fade = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      fade.value = reduceMotion ? 1 : withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
      scale.value = reduceMotion ? 1 : withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
    } else {
      fade.value = 0;
      scale.value = 0.92;
    }
  }, [visible, fade, scale, reduceMotion]);

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: scale.value }],
  }));

  const handleVisitWebsite = async () => {
    try {
      await Linking.openURL(WEBSITE_URL);
    } catch {
      // Keep the dialog open if the device cannot open the site.
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Dismiss dialog"
          accessibilityRole="button"
        />
        <Animated.View style={[styles.cardWrap, dialogAnimatedStyle]}>
          <NeumorphicSurface
            variant="sheet"
            radius={28}
            style={styles.surfaceWrap}
            contentStyle={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Header with App Logo and Badges */}
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.logoWrap,
                  {
                    backgroundColor: dark ? "#142621" : "#FFFFFF",
                    borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(23, 49, 41, 0.08)",
                  },
                ]}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.appName, { color: colors.foreground }]}>Ledgerly</Text>
                <Text style={[styles.kicker, { color: colors.primary }]}>
                  EXPENSE TRACKER
                </Text>
                <View style={[styles.versionPill, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.versionText, { color: colors.muted }]}>v1.0.0</Text>
                </View>
              </View>
            </View>

            {/* Description Scrollable Body */}
            <ScrollView
              style={styles.scrollBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={[styles.description, { color: colors.foreground }]}>
                Ledgerly helps you record expenses, keep an eye on your budget, and review your spending over time.
              </Text>

              {/* Website Prompt Card */}
              <View
                style={[
                  styles.websitePromptBox,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}
              >
                <View style={styles.promptHeader}>
                  <Ionicons name="globe-outline" size={17} color={colors.primary} />
                  <Text style={[styles.promptTitle, { color: colors.foreground }]}>
                    Ledgerly on the web
                  </Text>
                </View>
                <Text style={[styles.promptCopy, { color: colors.muted }]}>
                  Open Ledgerly in your browser.
                </Text>

                {/* Visit Website Primary Action */}
                <Pressable
                  style={({ pressed }) => [
                    styles.visitBtn,
                    { backgroundColor: colors.primary },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleVisitWebsite}
                  accessibilityRole="link"
                  accessibilityLabel="Visit Ledgerly official website"
                >
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.visitBtnText}>Visit Website</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            </ScrollView>

            {/* Dismiss / Close Button */}
            <Pressable
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                pressed && styles.btnPressed,
              ]}
              onPress={() => {
                onClose();
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.closeBtnText, { color: colors.foreground }]}>Close</Text>
            </Pressable>
          </NeumorphicSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "84%",
  },
  surfaceWrap: {
    width: "100%",
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  headerInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  kicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  versionPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  versionText: {
    fontSize: 10,
    fontWeight: "600",
  },
  scrollBody: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  websitePromptBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  promptTitle: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  promptCopy: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  visitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 42,
    borderRadius: 14,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  visitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: "100%",
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
