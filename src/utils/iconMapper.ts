import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type IconName = ComponentProps<typeof Ionicons>["name"];

const iconRegistry: Record<string, { icon: IconName; color: string }> = {
  utensils: { icon: "restaurant", color: "#D95D39" },
  pizza: { icon: "pizza", color: "#F18701" },
  "shopping-bag": { icon: "bag-handle", color: "#2B59C3" },
  shirt: { icon: "shirt", color: "#4392F1" },
  car: { icon: "car-sport", color: "#F0A202" },
  train: { icon: "train", color: "#E59500" },
  bus: { icon: "bus", color: "#F18805" },
  ticket: { icon: "ticket", color: "#9C27B0" },
  clapperboard: { icon: "film", color: "#7B2CBF" },
  "gamepad-2": { icon: "game-controller", color: "#C9184A" },
  zap: { icon: "flash", color: "#E5383B" },
  receipt: { icon: "receipt", color: "#D62828" },
  heart: { icon: "heart", color: "#EF476F" },
  pill: { icon: "medical", color: "#F28482" },
  ambulance: { icon: "car", color: "#BA181B" },
  "graduation-cap": { icon: "school", color: "#4361EE" },
  university: { icon: "library", color: "#5E60CE" },
  home: { icon: "home", color: "#0E9594" },
  plane: { icon: "airplane", color: "#00B4D8" },
  building: { icon: "business", color: "#D97706" },
  leaf: { icon: "leaf", color: "#65A30D" },
  sprout: { icon: "flower", color: "#2A9D8F" },
  "paw-print": { icon: "paw", color: "#7C6A0A" },
  cat: { icon: "paw", color: "#57534E" },
  dog: { icon: "paw", color: "#854D0E" },
  briefcase: { icon: "briefcase", color: "#2563EB" },
  laptop: { icon: "laptop", color: "#4B5563" },
  phone: { icon: "phone-portrait", color: "#3B82F6" },
  gift: { icon: "gift", color: "#FB7185" },
  dumbbell: { icon: "barbell", color: "#B91C1C" },
  coffee: { icon: "cafe", color: "#92400E" },
  "piggy-bank": { icon: "wallet", color: "#C026D3" },
  landmark: { icon: "cash", color: "#059669" },
  shapes: { icon: "grid", color: "#64748B" },
  package: { icon: "cube", color: "#6B7280" },
  default: { icon: "help-circle", color: "#9CA3AF" },
};

export const getCategoryIconConfig = (
  categoryName?: string | null,
  iconName?: string | null
) => {
  if (iconName && iconRegistry[iconName]) {
    return iconRegistry[iconName];
  }

  const lowerCategory = categoryName?.toLowerCase() ?? "";

  if (lowerCategory.includes("salary")) return iconRegistry.briefcase;
  if (lowerCategory.includes("food")) return iconRegistry.utensils;
  if (lowerCategory.includes("grocer")) return iconRegistry.leaf;
  if (lowerCategory.includes("travel")) return iconRegistry.plane;
  if (lowerCategory.includes("rent") || lowerCategory.includes("home")) {
    return iconRegistry.home;
  }
  if (lowerCategory.includes("health")) return iconRegistry.heart;
  if (lowerCategory.includes("shop")) return iconRegistry["shopping-bag"];
  if (lowerCategory.includes("pet")) return iconRegistry["paw-print"];
  if (lowerCategory.includes("bill")) return iconRegistry.zap;

  return iconRegistry.default;
};

export const availableIcons = Object.keys(iconRegistry).filter(
  (key) => key !== "default"
);
