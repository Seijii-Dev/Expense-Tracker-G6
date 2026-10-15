import React, { useCallback, useEffect, useState } from "react";
import {
  AppState,
  Image,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    setSourceUri(null);
    setHasError(false);

    if (banner?.uri) {
      resolveProfileBannerSource(banner.uri).then((resolved) => {
        if (!active) {
          resolved?.dispose?.();
          return;
        }
        dispose = resolved?.dispose;
        if (resolved?.uri) {
          setSourceUri(resolved.uri);
        } else {
          setHasError(true);
        }
      }).catch(() => {
        if (active) setHasError(true);
      });
    }

    return () => {
      active = false;
      dispose?.();
    };
  }, [banner?.uri]);

  const handleMediaError = useCallback(() => setHasError(true), []);

  if (!banner || !sourceUri || hasError) {
    return null;
  }

  if (banner.type === "image") {
    return (
      <View pointerEvents="none" style={[styles.media, style]}>
        <Image
          source={{ uri: sourceUri }}
          resizeMode="cover"
          style={styles.image}
          onError={handleMediaError}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[styles.media, style]}>
      <ProfileBannerVideo
        key={sourceUri}
        uri={sourceUri}
        visible={visible}
        onError={handleMediaError}
      />
    </View>
  );
}

function ProfileBannerVideo({
  uri,
  visible,
  onError,
}: {
  uri: string;
  visible: boolean;
  onError: () => void;
}) {
  const pathname = usePathname();
  const focused = pathname.includes("account") || visible;
  const [appIsActive, setAppIsActive] = useState(AppState.currentState === "active");

  const player = useVideoPlayer(uri, (videoPlayer) => {
    try {
      videoPlayer.loop = true;
      videoPlayer.muted = true;
      videoPlayer.volume = 0;
    } catch {
      onError();
    }
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppIsActive(state === "active");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (visible && focused && appIsActive) {
      try {
        player.play();
      } catch {
        onError();
      }
    } else {
      try {
        player.pause();
      } catch {}
    }
  }, [appIsActive, focused, onError, player, visible]);

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
  media: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
