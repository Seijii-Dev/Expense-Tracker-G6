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
      return focused ? (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="4"
            fill={color}
            fillOpacity={0.16}
            stroke={color}
            strokeWidth="2"
          />
          <Path d="M3 9.5h18" stroke={color} strokeWidth="2" />
          <Rect x="6" y="13" width="4.5" height="3.5" rx="1.2" fill={color} />
          <Circle cx="16.5" cy="14.75" r="1.5" fill={color} />
        </Svg>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="4"
            stroke={color}
            strokeWidth="1.8"
          />
          <Path d="M3 9.5h18" stroke={color} strokeWidth="1.8" />
          <Rect
            x="6"
            y="13"
            width="4.5"
            height="3.5"
            rx="1.2"
            stroke={color}
            strokeWidth="1.5"
          />
          <Circle cx="16.5" cy="14.75" r="1.2" fill={color} />
        </Svg>
      );

    case "records":
      return focused ? (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v15.5l-3-1.5-2.75 1.5-2.75-1.5-2.75 1.5-2.75-1.5-1.5.75V5A1.5 1.5 0 0 1 5 3.5z"
            fill={color}
            fillOpacity={0.16}
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <Path
            d="M8.5 8h7M8.5 12h5M8.5 15.5h7"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v15.5l-3-1.5-2.75 1.5-2.75-1.5-2.75 1.5-2.75-1.5-1.5.75V5A1.5 1.5 0 0 1 5 3.5z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <Path
            d="M8.5 8h7M8.5 12h5M8.5 15.5h7"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      );

    case "reports":
      return focused ? (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3.5" y="12" width="4" height="8.5" rx="1.5" fill={color} />
          <Rect x="10" y="7" width="4" height="13.5" rx="1.5" fill={color} />
          <Rect x="16.5" y="3.5" width="4" height="17" rx="1.5" fill={color} />
          <Path
            d="M3.5 10l5-4 4.5 3 6-5.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3.5"
            y="12"
            width="4"
            height="8.5"
            rx="1.5"
            stroke={color}
            strokeWidth="1.8"
          />
          <Rect
            x="10"
            y="7"
            width="4"
            height="13.5"
            rx="1.5"
            stroke={color}
            strokeWidth="1.8"
          />
          <Rect
            x="16.5"
            y="3.5"
            width="4"
            height="17"
            rx="1.5"
            stroke={color}
            strokeWidth="1.8"
          />
          <Path
            d="M3.5 10l5-4 4.5 3 6-5.5"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case "settings":
      return focused ? (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3.5 7h17M3.5 17h17"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <Circle cx="8.5" cy="7" r="3.2" fill={color} />
          <Circle cx="15.5" cy="17" r="3.2" fill={color} />
        </Svg>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3.5 7h17M3.5 17h17"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Circle
            cx="8.5"
            cy="7"
            r="3"
            fill="transparent"
            stroke={color}
            strokeWidth="1.8"
          />
          <Circle
            cx="15.5"
            cy="17"
            r="3"
            fill="transparent"
            stroke={color}
            strokeWidth="1.8"
          />
        </Svg>
      );

    case "account":
      return focused ? (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="7.5" r="4.2" fill={color} />
          <Path
            d="M4.5 19.5c0-4 3.35-7.25 7.5-7.25s7.5 3.25 7.5 7.25"
            fill={color}
            fillOpacity={0.2}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="7.5"
            r="4"
            stroke={color}
            strokeWidth="1.8"
          />
          <Path
            d="M4.5 19.5c0-4 3.35-7.25 7.5-7.25s7.5 3.25 7.5 7.25"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return null;
  }
});
