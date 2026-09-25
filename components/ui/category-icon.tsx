import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import { Category } from "@/types/expense";
import { CATEGORY_ICONS } from "@/constants/categories";

interface CategoryIconProps {
  category: Category;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function CategoryIcon({ category, size = 20, style }: CategoryIconProps) {
  const source = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
}
