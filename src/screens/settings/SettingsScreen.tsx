import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { AppButton } from "../../components/common/AppButton";
import { AppTextInput } from "../../components/common/AppTextInput";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { useAuth } from "../../hooks/useAuth";
import { settingsService } from "../../services/settingsService";
import type { Account, Category, Tag } from "../../types/api";
import { theme } from "../../theme/tokens";

const SectionList = ({ title, items }: { title: string; items: string[] }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items.length === 0 ? <Text style={styles.sectionText}>Nothing added yet.</Text> : items.map((item) => (
      <View key={item} style={styles.itemRow}>
        <Text style={styles.itemText}>{item}</Text>
      </View>
    ))}
  </View>
);

export const SettingsScreen = () => {
  const { logout, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [categoryResult, tagResult, accountResult] = await Promise.allSettled([
          settingsService.getCategories(),
          settingsService.getTags(),
          settingsService.getAccounts(),
        ]);

        setCategories(categoryResult.status === "fulfilled" ? categoryResult.value : []);
        setTags(tagResult.status === "fulfilled" ? tagResult.value : []);
        setAccounts(accountResult.status === "fulfilled" ? accountResult.value : []);

        if (
          categoryResult.status === "rejected" &&
          tagResult.status === "rejected" &&
          accountResult.status === "rejected"
        ) {
          setError("Could not load settings data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Toast.show({ type: "error", text1: "Password required", text2: "Enter your password to delete the account." });
      return;
    }

    try {
      setIsDeleting(true);
      await settingsService.deleteMyAccount({ password: password.trim() });
      Toast.show({ type: "success", text1: "Account deleted", text2: "Your account has been removed." });
      await logout();
    } catch {
      Toast.show({ type: "error", text1: "Delete failed", text2: "Please check your password and try again." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.accountCard}>
        <Text style={styles.accountLabel}>Signed in as</Text>
        <Text style={styles.accountValue}>{user?.username ?? "User"}</Text>
        <Text style={styles.accountEmail}>{user?.email ?? "Unknown email"}</Text>
      </View>

      {isLoading ? (
        <View style={styles.sectionCard}>
          <ActivityIndicator color={theme.colors.greenSoft} />
          <Text style={styles.sectionText}>Loading categories, tags, and accounts...</Text>
        </View>
      ) : (
        <>
          {error ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionText}>{error}</Text>
            </View>
          ) : null}
          <SectionList title={`Categories (${categories.length})`} items={categories.map((item) => item.name)} />
          <SectionList title={`Tags (${tags.length})`} items={tags.map((item) => item.name)} />
          <SectionList title={`Accounts (${accounts.length})`} items={accounts.map((item) => `${item.name} • ${item.provider}`)} />
        </>
      )}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Danger zone</Text>
        <Text style={styles.sectionText}>Deleting your account removes all associated data from the backend.</Text>
        <AppTextInput autoCapitalize="none" autoCorrect={false} label="Confirm password" onChangeText={setPassword} placeholder="Enter password" secureToggle value={password} />
        <AppButton isLoading={isDeleting} label="Delete My Account" onPress={handleDeleteAccount} variant="danger" />
      </View>

      <Pressable onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  accountCard: { backgroundColor: theme.colors.surfaceRaised, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 6 },
  accountLabel: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  accountValue: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "900" },
  accountEmail: { color: theme.colors.greenSoft, fontSize: 14 },
  sectionCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 14 },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900" },
  sectionText: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  itemRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700" },
  logoutButton: { alignItems: "center", paddingVertical: 14 },
  logoutText: { color: theme.colors.greenSoft, fontWeight: "800", fontSize: 15 },
});

