import React from "react";
import { StyleProp, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category, CustomCategory } from "@/types/expense";
import { getCategoryIconName, getCategoryStyle } from "@/constants/categories";

interface CategoryIconProps {
  category: Category;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  customCategories?: CustomCategory[];
}

export function CategoryIcon({ category, size = 18, color, style, customCategories }: CategoryIconProps) {
  const iconName = getCategoryIconName(category, customCategories);
  const iconColor = color || getCategoryStyle(category, customCategories).color;

  return <Ionicons name={iconName} size={size} color={iconColor} style={style} />;
}

