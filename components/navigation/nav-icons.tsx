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
  const strokeW = focused ? 2.1 : 1.75;

  switch (name) {
    case "overview":
      // Overview: 4 rounded dashboard tiles
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3.5"
            y="3.5"
            width="7"
            height="7"
            rx="2"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={strokeW}
          />
          <Rect
            x="13.5"
            y="3.5"
            width="7"
            height="7"
            rx="2"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={strokeW}
          />
          <Rect
            x="3.5"
            y="13.5"
            width="7"
            height="7"
            rx="2"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={strokeW}
          />
          <Rect
            x="13.5"
            y="13.5"
            width="7"
            height="7"
            rx="2"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={strokeW}
          />
        </Svg>
      );

    case "records":
      // Records: clean ledger receipt icon
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4.5 3.5h15a1 1 0 0 1 1 1v15.5l-2.5-1.25-2.5 1.25-2.5-1.25-2.5 1.25-2.5-1.25L5.5 20l-1-1V4.5a1 1 0 0 1 1-1z"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.2 : 0}
            stroke={color}
            strokeWidth={strokeW}
            strokeLinejoin="round"
          />
          <Path
            d="M8 8h8M8 12h5.5M8 15.5h7"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );

    case "reports":
      // Reports: upward dynamic trend analytics
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3.5 19.5h17"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <Path
            d="M4.5 15l5-5 4 4 6.5-7.5"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 6.5h4v4"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="9.5" cy="10" r="1.5" fill={color} />
          <Circle cx="13.5" cy="14" r="1.5" fill={color} />
        </Svg>
      );

    case "settings":
      // Settings: slider tuning controls
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3.5 6.5h8M15.5 6.5h5" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <Circle cx="13.5" cy="6.5" r="2" fill={focused ? color : "none"} stroke={color} strokeWidth={strokeW} />
          <Path d="M3.5 12h4M11.5 12h9" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <Circle cx="9.5" cy="12" r="2" fill={focused ? color : "none"} stroke={color} strokeWidth={strokeW} />
          <Path d="M3.5 17.5h10M17.5 17.5h3" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <Circle cx="15.5" cy="17.5" r="2" fill={focused ? color : "none"} stroke={color} strokeWidth={strokeW} />
        </Svg>
      );

    case "account":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="8"
            r="3.8"
            fill={focused ? color : "none"}
            fillOpacity={focused ? 0.22 : 0}
            stroke={color}
            strokeWidth={strokeW}
          />
          <Path
            d="M4.5 19.5c0-3.8 3.35-6.8 7.5-6.8s7.5 3 7.5 6.8"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return null;
  }
});
