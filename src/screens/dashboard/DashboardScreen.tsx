import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dashboardService";
import { settingsService } from "../../services/settingsService";
import type { AppStackParamList } from "../../navigation/types";
import type { Category, DashboardData } from "../../types/api";
import { theme } from "../../theme/tokens";
import { formatCurrency, formatDate, formatMonthLabel, toMonthParam } from "../../utils/formatter";
import { getCategoryIconConfig } from "../../utils/iconMapper";

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthParam = useMemo(() => toMonthParam(selectedMonth), [selectedMonth]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const dashboardData = await dashboardService.getDashboardData(monthParam);
        setData(dashboardData);

        const categoryResult = await settingsService.getCategories().catch(() => [] as Category[]);
        setCategories(categoryResult);
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Could not load dashboard data right now.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [monthParam]);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const trendMax = useMemo(() => {
    const values = data?.spendingTrend.map((point) => point.cumulative_spend) ?? [];
    return Math.max(...values, 1);
  }, [data?.spendingTrend]);

  const handleShiftMonth = (delta: number) => {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const initials = useMemo(() => {
    const name = user?.username?.trim() || "U";
    return name.slice(0, 2).toUpperCase();
  }, [user?.username]);

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.hello}>Hello!</Text>
            <Text numberOfLines={1} style={styles.name}>
              {user?.username ?? "there"}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => navigation.navigate("Profile" satisfies keyof AppStackParamList)} style={styles.iconCircle}>
          <Ionicons color={theme.colors.textPrimary} name="person-outline" size={18} />
        </Pressable>
      </View>

      <View style={styles.monthCard}>
        <Pressable onPress={() => handleShiftMonth(-1)} style={styles.monthButton}>
          <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={18} />
        </Pressable>
        <View style={styles.monthCopy}>
          <Text style={styles.monthLabel}>Overview</Text>
          <Text style={styles.monthValue}>{formatMonthLabel(selectedMonth)}</Text>
        </View>
        <Pressable onPress={() => handleShiftMonth(1)} style={styles.monthButton}>
          <Ionicons color={theme.colors.textPrimary} name="chevron-forward" size={18} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.greenSoft} />
          <Text style={styles.stateText}>Loading dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>{error}</Text>
          <Text style={styles.stateMeta}>Month param: {monthParam}</Text>
        </View>
      ) : !data ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No dashboard data is available for this month.</Text>
        </View>
      ) : (
        <>
          <View style={styles.kpiGrid}>
            {[
              { label: "Total spent", value: formatCurrency(data.totalSpent) },
              { label: "Daily average", value: formatCurrency(data.dailyAverageSpend) },
              { label: "Projected", value: formatCurrency(data.projectedMonthlySpend) },
              { label: "Vs last month", value: `${data.percentChangeFromLastMonth >= 0 ? "+" : ""}${data.percentChangeFromLastMonth.toFixed(1)}%` },
            ].map((item, index) => (
              <View key={item.label} style={[styles.kpiCard, index === 0 ? styles.kpiCardHero : null]}>
                <Text style={[styles.kpiLabel, index === 0 ? styles.kpiLabelHero : null]}>{item.label}</Text>
                <Text style={[styles.kpiValue, index === 0 ? styles.kpiValueHero : null]}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending trend</Text>
              <Text style={styles.sectionMeta}>{data.spendingTrend.length} points</Text>
            </View>
            <View style={styles.trendBars}>
              {data.spendingTrend.map((point) => (
                <View key={`${point.day}`} style={styles.trendBarItem}>
                  <View style={[styles.trendBar, { height: Math.max(10, (point.cumulative_spend / trendMax) * 110) }]} />
                  <Text style={styles.trendLabel}>{point.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top categories</Text>
            </View>
            {data.topSpendingCategories.length === 0 ? (
              <Text style={styles.emptyText}>No category spend available yet.</Text>
            ) : (
              data.topSpendingCategories.map((category) => {
                const icon = getCategoryIconConfig(category.category, category.icon_name);
                const share = data.totalSpent > 0 ? (category.amount / data.totalSpent) * 100 : 0;
                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={[styles.categoryIconWrap, { backgroundColor: `${icon.color}22` }]}>
                      <Ionicons color={icon.color} name={icon.icon} size={18} />
                    </View>
                    <View style={styles.categoryCopy}>
                      <Text style={styles.categoryName}>{category.category}</Text>
                      <Text style={styles.categoryMeta}>{share.toFixed(1)}% of total spend</Text>
                    </View>
                    <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent transactions</Text>
            </View>
            {data.recentTransactions.length === 0 ? (
              <Text style={styles.emptyText}>No recent transactions for this month.</Text>
            ) : (
              data.recentTransactions.map((transaction) => {
                const category = transaction.category_id ? categoryMap.get(transaction.category_id) : null;
                const icon = getCategoryIconConfig(category?.name, category?.icon_name);
                return (
                  <View key={transaction.id} style={styles.transactionRow}>
                    <View style={[styles.categoryIconWrap, { backgroundColor: `${icon.color}22` }]}>
                      <Ionicons color={icon.color} name={icon.icon} size={18} />
                    </View>
                    <View style={styles.transactionCopy}>
                      <Text numberOfLines={1} style={styles.transactionTitle}>{transaction.description || category?.name || "Transaction"}</Text>
                      <Text style={styles.transactionMeta}>{category?.name ?? "Uncategorized"} • {formatDate(transaction.txn_date)}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>{formatCurrency(Math.abs(transaction.amount))}</Text>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.greenSoft, fontSize: 18, fontWeight: "900" },
  hello: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "600" },
  name: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900" },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  monthCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 26, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  monthCopy: { alignItems: "center", gap: 2 },
  monthLabel: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  monthValue: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  stateCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 28, padding: 24, alignItems: "center", gap: 12 },
  stateText: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  stateMeta: { color: theme.colors.greenSoft, fontSize: 12 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kpiCard: { width: "48%", backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 24, padding: 18, gap: 8 },
  kpiCardHero: { backgroundColor: theme.colors.surfaceRaised },
  kpiLabel: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "700" },
  kpiLabelHero: { color: theme.colors.greenSoft },
  kpiValue: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900" },
  kpiValueHero: { fontSize: 24 },
  sectionCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 28, padding: 20, gap: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900" },
  sectionMeta: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "700" },
  trendBars: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 140 },
  trendBarItem: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 8 },
  trendBar: { width: "100%", maxWidth: 16, borderRadius: 999, backgroundColor: theme.colors.greenSoft },
  trendLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "700" },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  categoryIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  categoryCopy: { flex: 1, gap: 2 },
  categoryName: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  categoryMeta: { color: theme.colors.textMuted, fontSize: 12 },
  categoryAmount: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "800" },
  transactionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  transactionCopy: { flex: 1, gap: 2 },
  transactionTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  transactionMeta: { color: theme.colors.textMuted, fontSize: 12 },
  transactionAmount: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: "800" },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 },
});

