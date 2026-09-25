import React from "react";
import {
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
import { GlassSurface } from "@/components/ui/glass-surface";
import {
  hasPromptedStoragePermission,
  requestStoragePermission,
  setPromptedStoragePermission,
} from "@/utils/storage-permission";

interface StoragePermissionDialogProps {
  visible: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export function StoragePermissionPrompt() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      const alreadyPrompted = await hasPromptedStoragePermission();
      if (!alreadyPrompted && isMounted) {
        setVisible(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StoragePermissionDialog
      visible={visible}
      onClose={() => setVisible(false)}
    />
  );
}

export function StoragePermissionDialog({
  visible,
  onClose,
  onGranted,
}: StoragePermissionDialogProps) {
  const { colors, dark } = useTheme();

  const handleGrant = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await requestStoragePermission();
    await setPromptedStoragePermission();
    onGranted?.();
    onClose();
  };

  const handleDismiss = async () => {
    Haptics.selectionAsync();
    await setPromptedStoragePermission();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.dialogBackdrop }]}>
        <GlassSurface
          variant="sheet"
          radius={28}
          style={styles.cardWrap}
          contentStyle={styles.card}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="folder-open" size={24} color={colors.primary} />
            </View>
            <View style={[styles.badge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>SYSTEM PERMISSION</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: colors.foreground }]}>Storage Permission</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Ledgerly requires storage permission to keep your financial records secure, generate CSV exports, and enable instant offline access.
          </Text>

          {/* Feature List */}
          <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.featureItem,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.45)",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="save-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                  Local Ledger Persistence
                </Text>
                <Text style={[styles.featureCopy, { color: colors.muted }]}>
                  Saves your transactions, budget targets, and history safely on your device.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureItem,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.45)",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: "rgba(90, 158, 126, 0.16)" }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.success} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                  CSV Backup & Export
                </Text>
                <Text style={[styles.featureCopy, { color: colors.muted }]}>
                  Exports spreadsheet-ready financial reports and backups directly to your device storage.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureItem,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.45)",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: "rgba(77, 138, 240, 0.16)" }]}>
                <Ionicons name="cloud-offline-outline" size={16} color="#4D8AF0" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                  Offline Continuity
                </Text>
                <Text style={[styles.featureCopy, { color: colors.muted }]}>
                  Ensures all your expense summaries and money maps load instantly without internet.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary },
                pressed && styles.btnPressed,
              ]}
              onPress={handleGrant}
            >
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Grant Storage Permission</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
                pressed && styles.btnPressed,
              ]}
              onPress={handleDismiss}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.muted }]}>Maybe Later</Text>
            </Pressable>
          </View>
        </GlassSurface>
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
  },
  card: {
    padding: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  featureList: {
    maxHeight: 240,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  featureCopy: {
    fontSize: 11,
    lineHeight: 15,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
