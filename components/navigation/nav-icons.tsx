import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export type NavTabName = "overview" | "records" | "reports" | "settings" | "account";

interface NavIconProps {
  name: NavTabName;
  focused: boolean;
  color: string;
  size?: number;
}

export const NavIcon = React.memo(function NavIcon({
  name,
  focused,
  color,
  size = 22,
}: NavIconProps) {
  switch (name) {
    case "overview":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.25L12 3l9 7.25V19.5a2 2 0 0 1-2 2h-4.5a1 1 0 0 1-1-1v-4a1.5 1.5 0 0 0-1.5-1.5h-2a1.5 1.5 0 0 0-1.5 1.5v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-9.25z"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.2 : 0}
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "records":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v15.5l-3-1.5-2.75 1.5-2.75-1.5-2.75 1.5-2.75-1.5-1.5.75V5A1.5 1.5 0 0 1 5 3.5z"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.2 : 0}
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
            strokeLinejoin="round"
          />
          <Path
            d="M8.5 8h7M8.5 12h5M8.5 15.5h7"
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "reports":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 20V10M12 20V4M6 20v-6"
            stroke={color}
            strokeWidth={focused ? "2.2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "settings":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
          />
          <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "account":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="7.5"
            r="4"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
          />
          <Path
            d="M4.5 19.5c0-4 3.35-7.25 7.5-7.25s7.5 3.25 7.5 7.25"
            stroke={color}
            strokeWidth={focused ? "2" : "1.8"}
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return null;
  }
});
