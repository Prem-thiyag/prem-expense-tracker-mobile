import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { budgetsService } from "../../services/budgetsService";
import type { BudgetPageData, BudgetPlanItem } from "../../types/api";
import { theme } from "../../theme/tokens";
import { formatCurrency, formatMonthLabel, toMonthParam } from "../../utils/formatter";
import { getCategoryIconConfig } from "../../utils/iconMapper";

const buildDraftFromPlan = (plan: BudgetPlanItem[]) =>
  Object.fromEntries(plan.map((item) => [item.categoryId, item.budget ? String(item.budget) : ""]));

export const BudgetsScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [data, setData] = useState<BudgetPageData | null>(null);
  const [draftBudgets, setDraftBudgets] = useState<Record<number, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthParam = useMemo(() => toMonthParam(selectedMonth), [selectedMonth]);

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await budgetsService.getBudgetPlan(monthParam);
      setData(response);
      setIsEditing(false);
      if (response.plan) {
        setDraftBudgets(buildDraftFromPlan(response.plan));
      }
    } catch {
      setError("Could not load budgets for this month.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [monthParam]);

  const editableItems = useMemo(() => {
    if (data?.plan) {
      return data.plan;
    }

    return (
      data?.historicalData?.suggestedBudgets.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        icon_name: item.icon_name,
        budget: item.suggestedAmount,
        spent: item.currentSpend,
        remaining: 0,
        progress: 0,
        suggestedBudget: item.suggestedAmount,
      })) ?? []
    );
  }, [data]);

  useEffect(() => {
    if (!data?.plan && editableItems.length > 0) {
      setDraftBudgets(
        Object.fromEntries(
          editableItems.map((item) => [item.categoryId, item.suggestedBudget ? String(item.suggestedBudget) : ""])
        )
      );
    }
  }, [data?.plan, editableItems]);

  const totals = useMemo(() => {
    const plan = data?.plan ?? [];
    const totalBudget = plan.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = plan.reduce((sum, item) => sum + item.spent, 0);
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
  }, [data?.plan]);

  const handleShiftMonth = (delta: number) => {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const handleSave = async () => {
    const budgets = editableItems
      .map((item) => ({
        category_id: item.categoryId,
        limit_amount: Number(draftBudgets[item.categoryId] ?? 0),
      }))
      .filter((item) => item.limit_amount > 0);

    if (budgets.length === 0) {
      Toast.show({ type: "error", text1: "No budget values", text2: "Enter at least one budget amount before saving." });
      return;
    }

    try {
      setIsSaving(true);
      await budgetsService.saveBudgetPlan({ month: monthParam, budgets });
      Toast.show({ type: "success", text1: "Budget saved", text2: "Your plan has been updated." });
      await loadPlan();
    } catch {
      Toast.show({ type: "error", text1: "Save failed", text2: "Could not save the budget plan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    try {
      setIsSaving(true);
      await budgetsService.deleteBudgetPlan(monthParam);
      Toast.show({ type: "success", text1: "Budget deleted", text2: "You can create a new plan whenever you're ready." });
      await loadPlan();
    } catch {
      Toast.show({ type: "error", text1: "Delete failed", text2: "Could not delete this plan." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>Planning</Text>
        <Text style={styles.title}>Budgets</Text>
        <View style={styles.monthRow}>
          <Pressable onPress={() => handleShiftMonth(-1)} style={styles.monthButton}>
            <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={18} />
          </Pressable>
          <Text style={styles.monthText}>{formatMonthLabel(selectedMonth)}</Text>
          <Pressable onPress={() => handleShiftMonth(1)} style={styles.monthButton}>
            <Ionicons color={theme.colors.textPrimary} name="chevron-forward" size={18} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.greenSoft} />
          <Text style={styles.stateText}>Loading budget plan...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : data?.plan && !isEditing ? (
        <>
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Budgeted</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.totalBudget)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.totalSpent)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.remaining)}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={() => setIsEditing(true)} style={styles.actionButton}>
              <Text style={styles.actionText}>Edit plan</Text>
            </Pressable>
            <Pressable onPress={handleDeletePlan} style={[styles.actionButton, styles.actionButtonDanger]}>
              <Text style={styles.actionText}>Delete plan</Text>
            </Pressable>
          </View>

          <View style={styles.listCard}>
            {data.plan.map((item) => {
              const icon = getCategoryIconConfig(item.categoryName, item.icon_name);
              const progress = Math.min(item.progress || 0, 100);

              return (
                <View key={item.categoryId} style={styles.planRow}>
                  <View style={[styles.iconWrap, { backgroundColor: `${icon.color}22` }]}>
                    <Ionicons color={icon.color} name={icon.icon} size={18} />
                  </View>
                  <View style={styles.planCopy}>
                    <Text style={styles.planName}>{item.categoryName}</Text>
                    <Text style={styles.planMeta}>{formatCurrency(item.spent)} of {formatCurrency(item.budget)}</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.planAmount}>{progress.toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>{data?.historicalData ? "Create a plan" : "Set up this month's budget"}</Text>
            <Text style={styles.stateText}>Use the suggested amounts as a starting point and save a monthly plan.</Text>
          </View>

          <View style={styles.listCard}>
            {editableItems.map((item) => {
              const icon = getCategoryIconConfig(item.categoryName, item.icon_name);
              return (
                <View key={item.categoryId} style={styles.editRow}>
                  <View style={[styles.iconWrap, { backgroundColor: `${icon.color}22` }]}>
                    <Ionicons color={icon.color} name={icon.icon} size={18} />
                  </View>
                  <View style={styles.editCopy}>
                    <Text style={styles.planName}>{item.categoryName}</Text>
                    <Text style={styles.planMeta}>Suggested {formatCurrency(item.suggestedBudget ?? item.budget)} • Current spend {formatCurrency(item.spent)}</Text>
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={(value) => setDraftBudgets((current) => ({ ...current, [item.categoryId]: value.replace(/[^0-9.]/g, "") }))}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.amountInput}
                    value={draftBudgets[item.categoryId] ?? ""}
                  />
                </View>
              );
            })}
          </View>

          <Pressable disabled={isSaving} onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save budget plan"}</Text>
          </Pressable>
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 12 },
  kicker: { color: theme.colors.greenSoft, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.1 },
  title: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: "900" },
  monthRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  monthButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  monthText: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  stateCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 12, alignItems: "center" },
  stateTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  stateText: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  summaryCard: { backgroundColor: theme.colors.surfaceRaised, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "700" },
  summaryValue: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800", marginTop: 4 },
  actionsRow: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 14, alignItems: "center" },
  actionButtonDanger: { borderColor: theme.colors.redDeep },
  actionText: { color: theme.colors.textPrimary, fontWeight: "800" },
  listCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 14 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  planCopy: { flex: 1, gap: 6 },
  editCopy: { flex: 1, gap: 3 },
  planName: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  planMeta: { color: theme.colors.textMuted, fontSize: 12 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: theme.colors.greenSoft },
  planAmount: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "800" },
  amountInput: { width: 88, minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSoft, color: theme.colors.textPrimary, textAlign: "center", fontWeight: "800" },
  saveButton: { backgroundColor: theme.colors.greenSoft, borderRadius: 20, paddingVertical: 16, alignItems: "center" },
  saveText: { color: theme.colors.textOnAccent, fontWeight: "900", fontSize: 15 },
});

