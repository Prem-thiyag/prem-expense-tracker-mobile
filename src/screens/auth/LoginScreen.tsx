import axios from "axios";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

import { AppButton } from "../../components/common/AppButton";
import { AppTextInput } from "../../components/common/AppTextInput";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { useAuth } from "../../hooks/useAuth";
import type { AuthStackParamList } from "../../navigation/types";
import { theme } from "../../theme/tokens";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const logoImage = require("../../../assets/web-logo.png");
const heroImage = require("../../../assets/web-login.jpg");

export const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing details",
        text2: "Enter your username or email and password.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await login(identifier.trim(), password);
      Toast.show({
        type: "success",
        text1: "Welcome back",
        text2: "Your mobile session is ready.",
      });
    } catch (error) {
      const status =
        typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;

      const message =
        status === 401 || (axios.isAxiosError(error) && error.response?.status === 401)
          ? "Incorrect username or password."
          : "Login failed. Please check your connection and try again.";

      Toast.show({
        type: "error",
        text1: "Unable to sign in",
        text2: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.screen}>
        <View style={styles.heroShell}>
          <Image resizeMode="contain" source={logoImage} style={styles.logo} />
          <Text style={styles.kicker}>Prem Expense Tracker</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in with the same account your web app already uses.
          </Text>

          <LinearGradient colors={theme.gradients.hero} style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Live sync</Text>
              <Text style={styles.heroTitle}>Track spending, budgets, and alerts on the go.</Text>
              <Text style={styles.heroBody}>
                Your mobile session talks to the same FastAPI backend already powering the web app.
              </Text>
            </View>
            <Image resizeMode="cover" source={heroImage} style={styles.heroImage} />
          </LinearGradient>
        </View>

        <View style={styles.formCard}>
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            label="Email or Username"
            onChangeText={setIdentifier}
            placeholder="your@email.com or username"
            value={identifier}
          />
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            label="Password"
            onChangeText={setPassword}
            placeholder="Your password"
            secureToggle
            value={password}
          />
          <AppButton
            isLoading={isSubmitting}
            label="Log In"
            onPress={handleLogin}
          />
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>
              Need an account? Create one here.
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: theme.spacing.screen,
    paddingTop: 10,
    paddingBottom: 44,
    gap: 20,
  },
  heroShell: {
    gap: 12,
  },
  logo: {
    width: 150,
    height: 48,
  },
  kicker: {
    color: theme.colors.greenSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 320,
  },
  heroCard: {
    borderRadius: 30,
    overflow: "hidden",
    padding: 18,
    minHeight: 232,
    justifyContent: "space-between",
  },
  heroCopy: {
    gap: 8,
    maxWidth: "68%",
  },
  heroEyebrow: {
    color: theme.colors.greenDeep,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: theme.colors.textOnAccent,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  heroBody: {
    color: "rgba(11, 13, 11, 0.78)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  heroImage: {
    alignSelf: "flex-end",
    width: "58%",
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(11, 13, 11, 0.1)",
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    gap: 18,
  },
  link: {
    color: theme.colors.greenSoft,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});

