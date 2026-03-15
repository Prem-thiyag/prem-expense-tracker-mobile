import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const AppHeader = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  iconName = "sparkles",
}: AppHeaderProps) => {
  return (
    <View style={styles.shell}>
      <View style={styles.badge}>
        <Ionicons color="#1D4ED8" name={iconName} size={18} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#1C1917",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#57534E",
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6D3D1",
  },
  actionText: {
    color: "#1C1917",
    fontSize: 13,
    fontWeight: "700",
  },
});
