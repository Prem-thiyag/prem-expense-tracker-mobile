import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { AppTextInput } from "../../components/common/AppTextInput";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { settingsService } from "../../services/settingsService";
import { transactionsService } from "../../services/transactionsService";
import type { Account, Category, Tag, Transaction } from "../../types/api";
import { theme } from "../../theme/tokens";
import { formatCurrency, formatDate, formatMonthLabel, toMonthParam } from "../../utils/formatter";
import { getCategoryIconConfig } from "../../utils/iconMapper";

const PAGE_SIZE = 10;

export const ExpensesScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<"" | "debit" | "credit">("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthParam = useMemo(() => toMonthParam(selectedMonth), [selectedMonth]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsOptionsLoading(true);
        const [categoryData, accountData, tagData] = await Promise.all([
          settingsService.getCategories(),
          settingsService.getAccounts(),
          settingsService.getTags(),
        ]);
        setCategories(categoryData);
        setAccounts(accountData);
        setTags(tagData);
      } catch {
        setError("Could not load expense filters.");
      } finally {
        setIsOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await transactionsService.getTransactions({
          month: monthParam,
          page: currentPage,
          limit: PAGE_SIZE,
          search_term: searchTerm || undefined,
          search: searchTerm || undefined,
          type: type || undefined,
          category_id: categoryId ?? undefined,
        } as any);
        setTransactions(response.transactions ?? []);
        setTotalCount(response.total_count ?? 0);
      } catch {
        setError("Failed to load transactions.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [monthParam, currentPage, searchTerm, type, categoryId, refreshKey]);

  const accountMap = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);

  const handleShiftMonth = (delta: number) => {
    setSelectedMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    setCurrentPage(1);
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      "Delete transaction",
      `Delete \"${transaction.description || "this transaction"}\"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await transactionsService.deleteTransaction(transaction.id);
              Toast.show({ type: "success", text1: "Transaction deleted", text2: "The list has been refreshed." });
              setRefreshKey((value) => value + 1);
            } catch {
              Toast.show({ type: "error", text1: "Delete failed", text2: "Please try again in a moment." });
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>Transactions</Text>
          <Text style={styles.title}>Expenses</Text>
        </View>
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

      <View style={styles.filterCard}>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          label="Search"
          onChangeText={(value) => {
            setCurrentPage(1);
            setSearchTerm(value);
          }}
          placeholder="Search description"
          value={searchTerm}
        />

        <View style={styles.chipGroup}>
          {[
            { label: "All", value: "" as const },
            { label: "Spent", value: "debit" as const },
            { label: "Income", value: "credit" as const },
          ].map((option) => {
            const isActive = type === option.value;
            return (
              <Pressable
                key={option.label}
                onPress={() => {
                  setCurrentPage(1);
                  setType(option.value);
                }}
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              >
                <Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRail}>
            <Pressable
              onPress={() => {
                setCurrentPage(1);
                setCategoryId(null);
              }}
              style={[styles.categoryChip, categoryId === null ? styles.categoryChipActive : null]}
            >
              <Text style={[styles.categoryChipText, categoryId === null ? styles.categoryChipTextActive : null]}>
                All categories
              </Text>
            </Pressable>
            {isOptionsLoading
              ? null
              : categories.map((category) => {
                  const isActive = categoryId === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => {
                        setCurrentPage(1);
                        setCategoryId(category.id);
                      }}
                      style={[styles.categoryChip, isActive ? styles.categoryChipActive : null]}
                    >
                      <Text style={[styles.categoryChipText, isActive ? styles.categoryChipTextActive : null]}>
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Transactions</Text>
          <Text style={styles.listMeta}>{totalCount} total</Text>
        </View>

        {isLoading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={theme.colors.greenSoft} />
            <Text style={styles.stateText}>Loading transactions...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateText}>No transactions match these filters.</Text>
          </View>
        ) : (
          transactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.category_id);
            const account = accountMap.get(transaction.account_id);
            const icon = getCategoryIconConfig(category?.name, category?.icon_name);

            return (
              <View key={transaction.id} style={styles.transactionRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${icon.color}22` }]}>
                  <Ionicons color={icon.color} name={icon.icon} size={18} />
                </View>
                <View style={styles.transactionCopy}>
                  <Text numberOfLines={1} style={styles.transactionTitle}>
                    {transaction.description || category?.name || "Transaction"}
                  </Text>
                  <Text style={styles.transactionMeta}>
                    {(category?.name ?? "Uncategorized")} • {account?.name ?? "Account"}
                  </Text>
                  <Text style={styles.transactionMeta}>
                    {formatDate(transaction.txn_date)}
                    {transaction.tags.length ? ` • ${transaction.tags.map((tag) => tag.name).join(", ")}` : ""}
                  </Text>
                </View>
                <View style={styles.amountWrap}>
                  <Text style={[styles.amountText, transaction.type === "credit" ? styles.amountCredit : styles.amountDebit]}>
                    {transaction.type === "credit" ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
                  </Text>
                  <Pressable onPress={() => handleDelete(transaction)} style={styles.deleteButton}>
                    <Ionicons color={theme.colors.red} name="trash-outline" size={16} />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.paginationRow}>
          <Pressable disabled={currentPage <= 1} onPress={() => setCurrentPage((page) => Math.max(1, page - 1))} style={[styles.pageButton, currentPage <= 1 ? styles.pageButtonDisabled : null]}>
            <Text style={styles.pageButtonText}>Previous</Text>
          </Pressable>
          <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
          <Pressable disabled={currentPage >= totalPages} onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} style={[styles.pageButton, currentPage >= totalPages ? styles.pageButtonDisabled : null]}>
            <Text style={styles.pageButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>
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
  filterCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 18, gap: 14 },
  chipGroup: { flexDirection: "row", gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft },
  filterChipActive: { backgroundColor: theme.colors.greenSoft },
  filterChipText: { color: theme.colors.textPrimary, fontWeight: "700" },
  filterChipTextActive: { color: theme.colors.textOnAccent },
  categoryRail: { flexDirection: "row", gap: 10 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft },
  categoryChipActive: { backgroundColor: theme.colors.lime },
  categoryChipText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "700" },
  categoryChipTextActive: { color: theme.colors.textOnAccent },
  listCard: { backgroundColor: theme.colors.surface, borderRadius: 28, borderWidth: 1, borderColor: theme.colors.border, padding: 20, gap: 16 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listTitle: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: "900" },
  listMeta: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "700" },
  stateWrap: { alignItems: "center", gap: 10, paddingVertical: 16 },
  stateText: { color: theme.colors.textMuted, fontSize: 14, textAlign: "center" },
  transactionRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  transactionCopy: { flex: 1, gap: 3 },
  transactionTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  transactionMeta: { color: theme.colors.textMuted, fontSize: 12 },
  amountWrap: { alignItems: "flex-end", gap: 8 },
  amountText: { fontSize: 14, fontWeight: "800" },
  amountCredit: { color: theme.colors.greenBright },
  amountDebit: { color: theme.colors.red },
  deleteButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surfaceSoft, alignItems: "center", justifyContent: "center" },
  paginationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
  pageButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: theme.colors.surfaceSoft },
  pageButtonDisabled: { opacity: 0.45 },
  pageButtonText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "800" },
  pageText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "700" },
});

