import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { analyticsService } from "../../services/analyticsService";
import type { AnalyticsData } from "../../types/api";
import { theme } from "../../theme/tokens";
import { formatCurrency, formatMonthLabel, toMonthParam } from "../../utils/formatter";

type ViewMode = "month" | "trend";

export const AnalyticsScreen = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [trendPeriod, setTrendPeriod] = useState("6m");
  const [includeCapitalTransfers, setIncludeCapitalTransfers] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timePeriod = useMemo(
    () => (viewMode === "month" ? toMonthParam(selectedMonth) : trendPeriod),
    [selectedMonth, trendPeriod, viewMode]
  );

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await analyticsService.getAnalyticsData(timePeriod, includeCapitalTransfers);
        setData(response);
      } catch {
        setError("Could not load analytics data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [includeCapitalTransfers, timePeriod]);

  const handleShiftMonth = (delta: number) => {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>Insights</Text>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.toggleRow}>
          {[
            { label: "Month", value: "month" as const },
            { label: "Trend", value: "trend" as const },
          ].map((option) => {
            const isActive = viewMode === option.value;
            return (
              <Pressable key={option.value} onPress={() => setViewMode(option.value)} style={[styles.toggleChip, isActive ? styles.toggleChipActive : null]}>
                <Text style={[styles.toggleText, isActive ? styles.toggleTextActive : null]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {viewMode === "month" ? (
          <View style={styles.periodRow}>
            <Pressable onPress={() => handleShiftMonth(-1)} style={styles.periodButton}>
              <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={18} />
            </Pressable>
            <Text style={styles.periodText}>{formatMonthLabel(selectedMonth)}</Text>
            <Pressable onPress={() => handleShiftMonth(1)} style={styles.periodButton}>
              <Ionicons color={theme.colors.textPrimary} name="chevron-forward" size={18} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.toggleRow}>
            {["3m", "6m", "1y", "all"].map((option) => {
              const isActive = trendPeriod === option;
              return (
                <Pressable key={option} onPress={() => setTrendPeriod(option)} style={[styles.toggleChip, isActive ? styles.toggleChipActive : null]}>
                  <Text style={[styles.toggleText, isActive ? styles.toggleTextActive : null]}>{option.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable onPress={() => setIncludeCapitalTransfers((value) => !value)} style={[styles.transferChip, includeCapitalTransfers ? styles.transferChipActive : null]}>
          <Text style={[styles.transferText, includeCapitalTransfers ? styles.transferTextActive : null]}>Include capital transfers</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.greenSoft} />
          <Text style={styles.stateText}>Loading analytics...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : !data ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>No analytics available for this period.</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Average per month</Text>
            <Text style={styles.summaryValue}>{formatCurrency(data.overview.averageSpendPerMonth)}</Text>
            <Text style={styles.summaryMeta}>
              {data.overview.highestSpendMonth
                ? `Highest: ${data.overview.highestSpendMonth.month} • ${formatCurrency(data.overview.highestSpendMonth.actual)}`
                : "Highest month unavailable"}
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Category distribution</Text>
            {data.categoryDistribution.length === 0 ? (
              <Text style={styles.stateText}>No category distribution data yet.</Text>
            ) : (
              data.categoryDistribution.slice(0, 6).map((item) => (
                <View key={item.category} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{item.category}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item.percentage}%` }]} />
                  </View>
                  <Text style={styles.metricValue}>{item.percentage.toFixed(1)}%</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{viewMode === "month" ? "Spending velocity" : "Monthly breakdown"}</Text>
            {viewMode === "month"
              ? (data.spendingVelocity ?? []).slice(0, 10).map((item) => (
                  <View key={`${item.day}`} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Day {item.day}</Text>
                    <Text style={styles.metricValue}>{formatCurrency(item.current ?? 0)} / {formatCurrency(item.average ?? 0)}</Text>
                  </View>
                ))
              : (data.monthlyBreakdown ?? []).map((item) => (
                  <View key={item.month} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{item.month}</Text>
                    <Text style={styles.metricValue}>{formatCurrency(item.spend)}</Text>
                  </View>
                ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Habit identifiers</Text>
            {data.habitIdentifier.length === 0 ? (
              <Text style={styles.stateText}>No habit data available yet.</Text>
            ) : (
              data.habitIdentifier.slice(0, 6).map((item) => (
                <View key={item.category} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{item.category}</Text>
                  <Text style={styles.metricValue}>{formatCurrency(item.total_spend)}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 12 },
  kicker: { color: theme.colors.greenSoft, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.1 },
  title: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: "900" },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft },
  toggleChipActive: { backgroundColor: theme.colors.greenSoft },
  toggleText: { color: theme.colors.textPrimary, fontWeight: "700" },
  toggleTextActive: { color: theme.colors.textOnAccent },
  periodRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  periodButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  periodText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  transferChip: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft },
  transferChipActive: { backgroundColor: theme.colors.lime },
  transferText: { color: theme.colors.textPrimary, fontWeight: "700" },
  transferTextActive: { color: theme.colors.textOnAccent },
  stateCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 12, alignItems: "center" },
  stateText: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  summaryCard: { backgroundColor: theme.colors.surfaceRaised, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, padding: 18, gap: 8 },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "700" },
  summaryValue: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900" },
  summaryMeta: { color: theme.colors.greenSoft, fontSize: 13 },
  sectionCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 14 },
  sectionTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "900" },
  metricRow: { gap: 8 },
  metricLabel: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  metricValue: { color: theme.colors.greenSoft, fontSize: 13, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: theme.colors.greenSoft },
});

