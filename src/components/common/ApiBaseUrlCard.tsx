import axios from "axios";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { appConfigStorage } from "../../storage/appConfigStorage";
import {
  ApiBaseUrlNotConfiguredError,
  getConfiguredApiBaseUrl,
  getConfiguredApiBaseUrlSync,
  normalizeApiBaseUrl,
  pingApiBaseUrl,
} from "../../services/api/client";
import { theme } from "../../theme/tokens";
import { AppButton } from "./AppButton";
import { AppTextInput } from "./AppTextInput";

export const ApiBaseUrlCard = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeValue, setActiveValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const savedOverride = await appConfigStorage.getApiBaseUrlOverride();
      const configured = await getConfiguredApiBaseUrl();
      setInputValue(savedOverride || getConfiguredApiBaseUrlSync());
      setActiveValue(configured);
    };

    load();
  }, []);

  const handleSave = async () => {
    const normalized = normalizeApiBaseUrl(inputValue);

    if (!normalized) {
      Toast.show({
        type: "error",
        text1: "Backend URL required",
        text2: "Enter your live backend URL before testing Expo Go.",
      });
      return;
    }

    setIsSaving(true);

    try {
      await appConfigStorage.setApiBaseUrlOverride(normalized);
      setInputValue(normalized);
      setActiveValue(normalized);
      Toast.show({
        type: "success",
        text1: "Backend URL saved",
        text2: "The app will now use this API base URL.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    const normalized = normalizeApiBaseUrl(inputValue);

    setIsTesting(true);

    try {
      const response = await pingApiBaseUrl(normalized);
      Toast.show({
        type: "success",
        text1: "Backend reachable",
        text2: response.message ?? "The API root responded successfully.",
      });
    } catch (error) {
      const message =
        error instanceof ApiBaseUrlNotConfiguredError
          ? "Enter your live API URL first."
          : axios.isAxiosError(error)
            ? error.response?.data?.message ??
              error.message ??
              "Could not reach that backend URL."
            : "Could not reach that backend URL.";

      Toast.show({
        type: "error",
        text1: "Backend test failed",
        text2: message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = async () => {
    await appConfigStorage.clearApiBaseUrlOverride();
    const envValue = getConfiguredApiBaseUrlSync();
    setInputValue(envValue);
    setActiveValue(envValue);
    Toast.show({
      type: "success",
      text1: "Saved override cleared",
      text2: envValue
        ? "The app will fall back to the bundled API URL."
        : "No bundled API URL is set yet.",
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Backend Connection</Text>
      <Text style={styles.subtitle}>
        Use your live FastAPI base URL so Expo Go can talk to the same backend as the web app.
      </Text>
      <View style={styles.statusPill}>
        <Text style={styles.statusLabel}>Active URL</Text>
        <Text numberOfLines={2} style={styles.statusValue}>
          {activeValue || "Not configured"}
        </Text>
      </View>
      <AppTextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        label="API Base URL"
        onChangeText={setInputValue}
        placeholder="https://your-backend-host/api/v1"
        value={inputValue}
      />
      <View style={styles.actions}>
        <AppButton
          isLoading={isSaving}
          label="Save URL"
          onPress={handleSave}
          style={styles.actionButton}
          variant="secondary"
        />
        <AppButton
          isLoading={isTesting}
          label="Test URL"
          onPress={handleTest}
          style={styles.actionButton}
          variant="ghost"
        />
      </View>
      <AppButton label="Clear Saved Override" onPress={handleClear} variant="ghost" />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 14,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  statusPill: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 6,
  },
  statusLabel: {
    color: theme.colors.greenSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statusValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

