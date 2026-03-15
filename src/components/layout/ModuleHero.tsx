import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../theme/tokens";

interface ModuleHeroProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const ModuleHero = ({
  iconName,
  title,
  subtitle,
  badge,
  actionLabel,
  onActionPress,
}: ModuleHeroProps) => {
  return (
    <View style={styles.shell}>
      <Text style={styles.badge}>{badge}</Text>
      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <Ionicons color={theme.colors.greenSoft} name={iconName} size={20} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    gap: 16,
    paddingTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    color: theme.colors.greenSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
});

