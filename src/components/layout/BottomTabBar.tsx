import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../../theme/tokens";

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  Expenses: "wallet-outline",
  Analytics: "pie-chart-outline",
  Dashboard: "home-outline",
  Budgets: "swap-horizontal-outline",
  Settings: "person-outline",
};

const iconMapFocused: Record<string, keyof typeof Ionicons.glyphMap> = {
  Expenses: "wallet",
  Analytics: "pie-chart",
  Dashboard: "home",
  Budgets: "swap-horizontal",
  Settings: "person",
};

export const BottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {state.routes.map((route) => {
        const index = state.routes.indexOf(route);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, isFocused && styles.iconWrapFocused]}>
              <Ionicons
                name={isFocused ? (iconMapFocused[route.name] ?? "ellipse") : (iconMap[route.name] ?? "ellipse-outline")}
                size={24}
                color={isFocused ? theme.colors.greenSoft : theme.colors.textMuted}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapFocused: {
    backgroundColor: theme.colors.surfaceSoft,
  },
});