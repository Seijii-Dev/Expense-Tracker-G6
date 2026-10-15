import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Account } from "@/types/auth";

interface ProfileAvatarProps {
  account: Account | null;
  size: number;
  backgroundColor: string;
  textColor: string;
  fontSize?: number;
  borderRadius?: number;
}

export function ProfileAvatar({
  account,
  size,
  backgroundColor,
  textColor,
  fontSize = size * 0.34,
  borderRadius = size / 2,
}: ProfileAvatarProps) {
  const uri = account?.profilePictureUri;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  const initials =
    (account?.name || "User")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius, backgroundColor }]}>
      {uri && !imageFailed ? (
        <Image
          source={{ uri }}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          accessibilityLabel={`${account?.name || "Account"} profile picture`}
        />
      ) : (
        <Text style={[styles.initials, { color: textColor, fontSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
  },
});
