import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { BottomTabBar } from "../components/layout/BottomTabBar";
import { AnalyticsScreen } from "../screens/analytics/AnalyticsScreen";
import { BudgetsScreen } from "../screens/budgets/BudgetsScreen";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { ExpensesScreen } from "../screens/expenses/ExpensesScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { theme } from "../theme/tokens";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
          paddingBottom: 90,
        },
      }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen component={ExpensesScreen} name="Expenses" />
      <Tab.Screen component={AnalyticsScreen} name="Analytics" />
      <Tab.Screen component={DashboardScreen} name="Dashboard" />
      <Tab.Screen component={BudgetsScreen} name="Budgets" />
      <Tab.Screen component={SettingsScreen} name="Settings" />
    </Tab.Navigator>
  );
};