import { StatusBar } from "expo-status-bar";
import { NavigationContainer, type Theme } from "@react-navigation/native";
import { BaseToast, ErrorToast, type ToastConfig } from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/providers/AuthProvider";
import { theme } from "./src/theme/tokens";

const navigationTheme: Theme = {
  dark: true,
  colors: {
    primary: theme.colors.green,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.yellow,
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "400",
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "System",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "System",
      fontWeight: "800",
    },
  },
};

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      contentContainerStyle={{
        backgroundColor: theme.colors.surfaceRaised,
        borderRadius: 18,
        paddingHorizontal: 14,
      }}
      style={{
        borderLeftColor: theme.colors.green,
        backgroundColor: theme.colors.surfaceRaised,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 64,
      }}
      text1Style={{
        color: theme.colors.textPrimary,
        fontSize: 15,
        fontWeight: "800",
      }}
      text2Style={{
        color: theme.colors.textMuted,
        fontSize: 13,
        fontWeight: "600",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      contentContainerStyle={{
        backgroundColor: theme.colors.surfaceRaised,
        borderRadius: 18,
        paddingHorizontal: 14,
      }}
      style={{
        borderLeftColor: theme.colors.red,
        backgroundColor: theme.colors.surfaceRaised,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 64,
      }}
      text1Style={{
        color: theme.colors.textPrimary,
        fontSize: 15,
        fontWeight: "800",
      }}
      text2Style={{
        color: theme.colors.textMuted,
        fontSize: 13,
        fontWeight: "600",
      }}
    />
  ),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
