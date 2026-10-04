import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
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
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setImageFailed(false);
    imageOpacity.setValue(uri ? 0 : 1);
    if (!uri) return;

    const animation = Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [imageOpacity, uri]);

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
        <Animated.Image
          source={{ uri }}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          style={[StyleSheet.absoluteFillObject, { borderRadius, opacity: imageOpacity }]}
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
    fontFamily: "Fraunces_700Bold",
    fontWeight: "700",
  },
});
