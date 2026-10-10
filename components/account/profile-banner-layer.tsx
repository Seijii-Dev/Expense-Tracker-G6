import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    setSourceUri(null);
    setHasError(false);
    opacityAnim.setValue(0);

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
  }, [banner?.uri, opacityAnim]);

  const handleMediaLoaded = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  };

  if (!banner || !sourceUri || hasError) {
    return null;
  }

  if (banner.type === "image") {
    return (
      <Animated.View pointerEvents="none" style={[styles.media, style, { opacity: opacityAnim }]}>
        <Image
          source={{ uri: sourceUri }}
          resizeMode="cover"
          style={styles.image}
          onLoad={handleMediaLoaded}
          onError={() => setHasError(true)}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.media, style, { opacity: opacityAnim }]}>
      <ProfileBannerVideo
        key={sourceUri}
        uri={sourceUri}
        visible={visible}
        onReady={handleMediaLoaded}
        onError={() => setHasError(true)}
      />
    </Animated.View>
  );
}

function ProfileBannerVideo({
  uri,
  visible,
  onReady,
  onError,
}: {
  uri: string;
  visible: boolean;
  onReady: () => void;
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
        onReady();
      } catch {
        onError();
      }
    } else {
      try {
        player.pause();
      } catch {}
    }
  }, [appIsActive, focused, onError, onReady, player, visible]);

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
