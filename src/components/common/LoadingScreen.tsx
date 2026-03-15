import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../../theme/tokens";

export const LoadingScreen = ({
  message = "Loading your workspace...",
}: {
  message?: string;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <LinearGradient colors={theme.gradients.hero} style={styles.orb}>
          <ActivityIndicator color={theme.colors.textOnAccent} size="large" />
        </LinearGradient>
        <Text style={styles.title}>Prem Expense Tracker</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    padding: 28,
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});

