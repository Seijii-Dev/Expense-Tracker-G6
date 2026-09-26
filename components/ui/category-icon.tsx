import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "@/types/expense";
import { CATEGORY_ICON_NAMES, CATEGORY_META } from "@/constants/categories";

interface CategoryIconProps {
  category: Category;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function CategoryIcon({ category, size = 18, color, style }: CategoryIconProps) {
  const iconName = CATEGORY_ICON_NAMES[category] || "grid-outline";
  const iconColor = color || CATEGORY_META[category]?.color || "#7E929E";

  return <Ionicons name={iconName} size={size} color={iconColor} style={style} />;
}
