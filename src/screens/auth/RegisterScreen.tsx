import axios from "axios";
import { useMemo, useState } from "react";
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
import {
  getPasswordValidationChecks,
  isEmailValid,
  isPasswordStrong,
} from "../../utils/validation";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const logoImage = require("../../../assets/web-logo.png");
const heroImage = require("../../../assets/web-register.png");

export const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError = useMemo(() => {
    if (!email) {
      return null;
    }

    return isEmailValid(email) ? null : "Please enter a valid email address.";
  }, [email]);

  const passwordMismatchError = useMemo(() => {
    if (!confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : "Passwords do not match.";
  }, [confirmPassword, password]);

  const validationChecks = getPasswordValidationChecks(password);

  const handleRegister = async () => {
    if (!username.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing name",
        text2: "Enter a username to continue.",
      });
      return;
    }

    if (emailError) {
      Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: emailError,
      });
      return;
    }

    if (!isPasswordStrong(password)) {
      Toast.show({
        type: "error",
        text1: "Weak password",
        text2: "Use the checklist below before creating the account.",
      });
      return;
    }

    if (passwordMismatchError) {
      Toast.show({
        type: "error",
        text1: "Password mismatch",
        text2: passwordMismatchError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      Toast.show({
        type: "success",
        text1: "Account created",
        text2: "Sign in with your new credentials.",
      });
      navigation.replace("Login");
    } catch (error) {
      const message = axios.isAxiosError<{ detail?: string }>(error)
        ? error.response?.data?.detail ??
          "Registration failed. That username or email may already be taken."
        : "Registration failed. Please try again.";

      Toast.show({
        type: "error",
        text1: "Unable to register",
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Register once and use the same credentials across web and mobile.
          </Text>

          <LinearGradient colors={theme.gradients.hero} style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Secure onboarding</Text>
              <Text style={styles.heroTitle}>Start with a strong password and sync instantly.</Text>
              <Text style={styles.heroBody}>
                Your account is created through the same live backend registration flow as the web app.
              </Text>
            </View>
            <Image resizeMode="cover" source={heroImage} style={styles.heroImage} />
          </LinearGradient>
        </View>

        <View style={styles.formCard}>
          <AppTextInput
            autoCapitalize="words"
            label="Username"
            onChangeText={setUsername}
            placeholder="Prem"
            value={username}
          />
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            label="Password"
            onChangeText={setPassword}
            placeholder="Create a strong password"
            secureToggle
            value={password}
          />
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            error={passwordMismatchError}
            label="Confirm Password"
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureToggle
            value={confirmPassword}
          />

          <View style={styles.validationPanel}>
            <Text style={styles.validationTitle}>Password checklist</Text>
            {validationChecks.map((check) => (
              <Text
                key={check.label}
                style={[
                  styles.validationText,
                  check.met ? styles.valid : styles.invalid,
                ]}
              >
                • {check.label}
              </Text>
            ))}
          </View>

          <AppButton
            isLoading={isSubmitting}
            label="Create Account"
            onPress={handleRegister}
          />
          <Pressable onPress={() => navigation.replace("Login")}>
            <Text style={styles.link}>Already registered? Sign in instead.</Text>
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
    fontSize: 34,
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
  validationPanel: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: 20,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  validationTitle: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  validationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  valid: {
    color: theme.colors.greenBright,
  },
  invalid: {
    color: theme.colors.red,
  },
  link: {
    color: theme.colors.greenSoft,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});

