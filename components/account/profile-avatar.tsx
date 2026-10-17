import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  const imageOpacity = useSharedValue(0);

  useEffect(() => {
    setImageFailed(false);
    if (!uri) {
      imageOpacity.value = 1;
      return;
    }
    imageOpacity.value = 0;
    imageOpacity.value = withTiming(1, { duration: 180 });
  }, [imageOpacity, uri]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

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
          style={[StyleSheet.absoluteFillObject, { borderRadius }, animatedImageStyle]}
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
    fontWeight: "700",
  },
});
