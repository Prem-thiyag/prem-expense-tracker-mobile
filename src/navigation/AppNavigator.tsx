import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoadingScreen } from "../components/common/LoadingScreen";
import { useAuth } from "../hooks/useAuth";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { theme } from "../theme/tokens";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import type { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

const AuthenticatedNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "800",
        },
      }}
    >
      <Stack.Screen
        component={MainTabNavigator}
        name="MainTabs"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ProfileScreen}
        name="Profile"
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen message="Restoring your secure session..." />;
  }

  return isAuthenticated ? <AuthenticatedNavigator /> : <AuthNavigator />;
};

