import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { AppButton } from "../../components/common/AppButton";
import { SectionCard } from "../../components/common/SectionCard";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { useAuth } from "../../hooks/useAuth";
import { theme } from "../../theme/tokens";

export const ProfileScreen = () => {
  const { refreshProfile, user } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshProfile();
      Toast.show({
        type: "success",
        text1: "Profile refreshed",
        text2: "Latest account details loaded from the API.",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Profile refresh failed",
        text2: "Please try again in a moment.",
      });
    }
  };

  return (
    <ScreenContainer>
      <SectionCard subtitle="Core account identity from the backend." title="Profile">
        <View style={styles.block}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username ?? "Unknown"}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? "Unknown"}</Text>
        </View>
      </SectionCard>

      <AppButton label="Refresh Profile" onPress={handleRefresh} variant="secondary" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  block: {
    gap: 6,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
});

