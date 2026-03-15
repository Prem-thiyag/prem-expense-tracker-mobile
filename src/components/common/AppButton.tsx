import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../../theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface AppButtonProps extends PressableProps {
  label: string;
  isLoading?: boolean;
  variant?: Variant;
}

const variantStyles: Record<Variant, { button: object; text: object }> = {
  primary: {
    button: {
      backgroundColor: "transparent",
      borderColor: theme.colors.lime,
    },
    text: {
      color: theme.colors.textOnAccent,
    },
  },
  secondary: {
    button: {
      backgroundColor: theme.colors.surfaceSoft,
      borderColor: theme.colors.border,
    },
    text: {
      color: theme.colors.textPrimary,
    },
  },
  ghost: {
    button: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    text: {
      color: theme.colors.textPrimary,
    },
  },
  danger: {
    button: {
      backgroundColor: "rgba(185, 58, 58, 0.12)",
      borderColor: theme.colors.redDeep,
    },
    text: {
      color: "#FFCDCD",
    },
  },
};

export const AppButton = ({
  label,
  isLoading = false,
  disabled,
  style,
  variant = "primary",
  ...props
}: AppButtonProps) => {
  const currentVariant = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        currentVariant.button,
        (disabled || isLoading) && styles.disabled,
        pressed && !disabled && !isLoading && styles.pressed,
        style,
      ]}
      {...props}
    >
      {variant === "primary" ? (
        <LinearGradient colors={theme.gradients.hero} style={StyleSheet.absoluteFillObject} />
      ) : null}
      {variant === "secondary" ? <View style={styles.secondaryGlow} /> : null}
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? theme.colors.textOnAccent : theme.colors.textPrimary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, currentVariant.text]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingHorizontal: 18,
    overflow: "hidden",
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.whiteOverlay,
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

