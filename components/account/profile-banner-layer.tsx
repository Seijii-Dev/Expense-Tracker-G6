import React, { useEffect, useState } from "react";
import { AppState, Image, Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { usePathname } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import type { ProfileBannerMedia } from "@/types/auth";
import { resolveProfileBannerSource } from "@/utils/profile-banner-media";

type ProfileBannerLayerProps = {
  banner?: ProfileBannerMedia | null;
  visible: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ProfileBannerLayer({ banner, visible, style }: ProfileBannerLayerProps) {
  const [sourceUri, setSourceUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    setSourceUri(null);

    if (banner?.uri) {
      resolveProfileBannerSource(banner.uri).then((resolved) => {
        if (!active) {
          resolved?.dispose?.();
          return;
        }
        dispose = resolved?.dispose;
        setSourceUri(resolved?.uri ?? null);
      });
    }

    return () => {
      active = false;
      dispose?.();
    };
  }, [banner?.uri]);

  if (!banner || !sourceUri) {
    return <View pointerEvents="none" style={[styles.fallback, style]} />;
  }

  if (banner.type === "image") {
    return (
      <View pointerEvents="none" style={[styles.media, style]}>
        <Image
          source={{ uri: sourceUri }}
          resizeMode="cover"
          style={styles.media}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[styles.media, style]}>
      <ProfileBannerVideo key={sourceUri} uri={sourceUri} visible={visible} />
    </View>
  );
}

function ProfileBannerVideo({ uri, visible }: { uri: string; visible: boolean }) {
  const pathname = usePathname();
  const focused = pathname.includes("account") || visible;
  const [appIsActive, setAppIsActive] = useState(AppState.currentState === "active");
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.volume = 0;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppIsActive(state === "active");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (visible && focused && appIsActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [appIsActive, focused, player, visible]);

  return (
    <VideoView
      player={player}
      style={styles.media}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      surfaceType={Platform.OS === "android" ? "textureView" : undefined}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#16382B",
  },
  media: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
});

