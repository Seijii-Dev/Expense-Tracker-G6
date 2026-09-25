import React from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";

interface AboutDialogProps {
  visible: boolean;
  onClose: () => void;
}

const WEBSITE_URL = "https://smart-expense-web.vercel.app";

export function AboutDialog({ visible, onClose }: AboutDialogProps) {
  const { colors } = useTheme();

  const handleVisitWebsite = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const supported = await Linking.canOpenURL(WEBSITE_URL);
      if (supported) {
        await Linking.openURL(WEBSITE_URL);
      } else {
        await Linking.openURL("https://github.com/Seijii-Dev/smart-expense-web");
      }
    } catch {
      // Fallback to github repo if custom scheme fails
      Linking.openURL("https://github.com/Seijii-Dev/smart-expense-web");
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
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header with App Logo and Badges */}
          <View style={styles.headerRow}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="cover"
            />
            <View style={styles.headerInfo}>
              <Text style={[styles.appName, { color: colors.foreground }]}>Ledgerly</Text>
              <Text style={[styles.kicker, { color: colors.primary }]}>
                SMART SPENDING & SAVINGS
              </Text>
              <View style={[styles.versionPill, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.versionText, { color: colors.muted }]}>v1.0.0 • Offline Ready</Text>
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
                <Ionicons name="information-circle-outline" size={17} color={colors.primary} />
                <Text style={[styles.promptTitle, { color: colors.foreground }]}>
                  For further information
                </Text>
              </View>
              <Text style={[styles.promptCopy, { color: colors.muted }]}>
                Visit our official documentation, user guides, and web showcase.
              </Text>

              {/* Visit Website Primary Action */}
              <Pressable
                style={({ pressed }) => [
                  styles.visitBtn,
                  { backgroundColor: colors.primary },
                  pressed && styles.btnPressed,
                ]}
                onPress={handleVisitWebsite}
              >
                <Ionicons name="globe-outline" size={16} color="#FFFFFF" />
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
              Haptics.selectionAsync();
              onClose();
            }}
          >
            <Text style={[styles.closeBtnText, { color: colors.foreground }]}>Close</Text>
          </Pressable>
        </View>
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
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "82%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
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
  logo: {
    width: 58,
    height: 58,
    borderRadius: 16,
  },
  headerInfo: {
    flex: 1,
  },
  appName: {
    fontFamily: "Fraunces_700Bold",
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
    maxHeight: 340,
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
    borderRadius: 16,
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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  visitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  closeBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
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
