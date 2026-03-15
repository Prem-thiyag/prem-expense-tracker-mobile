import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { theme } from "../../theme/tokens";

interface SectionCardProps extends ViewProps {
  title: string;
  subtitle?: string;
}

export const SectionCard = ({
  title,
  subtitle,
  style,
  children,
  ...props
}: SectionCardProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: 28,
    padding: 22,
    gap: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    gap: 8,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});

