import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { theme } from "../../theme/tokens";

interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  secureToggle?: boolean;
}

export const AppTextInput = ({
  label,
  error,
  secureToggle = false,
  secureTextEntry,
  style,
  ...props
}: AppTextInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecureEntry = secureToggle ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error ? styles.inputShellError : null]}>
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isSecureEntry}
          selectionColor={theme.colors.green}
          style={[styles.input, style]}
          {...props}
        />
        {secureToggle ? (
          <Pressable
            hitSlop={10}
            onPress={() => setIsPasswordVisible((value) => !value)}
          >
            <Ionicons
              color={theme.colors.textMuted}
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  inputShell: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  inputShellError: {
    borderColor: theme.colors.red,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 14,
  },
  error: {
    color: theme.colors.red,
    fontSize: 12,
    fontWeight: "600",
  },
});

