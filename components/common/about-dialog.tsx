import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

interface AboutDialogProps {
  visible: boolean;
  onClose: () => void;
}

const WEBSITE_URL = "https://ledgerly-web-g6.netlify.app/";

export function AboutDialog({ visible, onClose }: AboutDialogProps) {
  const { colors, dark } = useTheme();

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [visible]);

  const handleVisitWebsite = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Non-fatal
    }
    try {
      const supported = await Linking.canOpenURL(WEBSITE_URL);
      if (supported) {
        await Linking.openURL(WEBSITE_URL);
      } else {
        await Linking.openURL(WEBSITE_URL);
      }
    } catch {
      Linking.openURL(WEBSITE_URL);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <GlassSurface
            variant="sheet"
            radius={28}
            style={styles.glassWrap}
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
                  SMART SPENDING & SAVINGS
                </Text>
                <View style={[styles.versionPill, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.versionText, { color: colors.muted }]}>v1.0.0 • Official</Text>
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
                Ledgerly is a simple and user-friendly financial management application designed to help users keep track of their expenses, savings, and spending habits. It provides an organized way to record daily transactions, monitor budgets, review spending patterns, and work toward savings goals. With its clean and easy-to-use interface, Ledgerly helps users better understand where their money goes and encourages smarter financial decisions and more responsible money management.
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
                    Official Web Portal
                  </Text>
                </View>
                <Text style={[styles.promptCopy, { color: colors.muted }]}>
                  Visit our official web application, user documentation, and showcase.
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
                try {
                  Haptics.selectionAsync();
                } catch {
                  // Non-fatal
                }
                onClose();
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.closeBtnText, { color: colors.foreground }]}>Close</Text>
            </Pressable>
          </GlassSurface>
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
  glassWrap: {
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
    shadowColor: "#FF6554",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
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
    height: 42,
    borderRadius: 14,
    shadowColor: "#FF6554",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  visitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  closeBtn: {
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
