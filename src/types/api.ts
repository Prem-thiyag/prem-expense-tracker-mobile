export interface BudgetVsSpend {
  spent: number;
  budget: number;
  percentUsed: number;
}

export interface TopCategory {
  id: number;
  category: string;
  amount: number;
  icon_name: string | null;
}

export interface RecentTransaction {
  id: number;
  description: string;
  amount: number;
  txn_date: string;
  category_id: number | null;
}

export interface SpendingTrendPoint {
  day: number;
  cumulative_spend: number;
}

export interface DashboardData {
  totalSpent: number;
  percentChangeFromLastMonth: number;
  dailyAverageSpend: number;
  projectedMonthlySpend: number;
  spendingTrend: SpendingTrendPoint[];
  topSpendingCategories: TopCategory[];
  recentTransactions: RecentTransaction[];
}

export interface Category {
  id: number;
  name: string;
  is_income: boolean;
  icon_name?: string | null;
}

export interface BudgetPlanItem {
  categoryId: number;
  categoryName: string;
  budget: number;
  spent: number;
  remaining: number;
  progress: number;
  icon_name: string | null;
  suggestedBudget?: number;
  daysLeft?: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  txn_date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  source: string;
  account_id: number;
  category_id: number | null;
  merchant_id: number | null;
  tags: Tag[];
  tag_ids?: number[];
}

export interface Account {
  id: number;
  name: string;
  type: string;
  provider: string;
}

export interface AnalyticsOverview {
  highestSpendMonth: { month: string; actual: number } | null;
  averageSpendPerMonth: number;
}

export interface MonthlyBreakdownPoint {
  month: string;
  spend: number;
}

export interface CategoryDistributionPoint {
  category: string;
  total: number;
  percentage: number;
  icon_name?: string | null;
}

export interface HabitIdentifierPoint {
  category: string;
  transaction_count: number;
  average_spend: number;
  frequency: number;
  total_spend: number;
}

export interface SpendingVelocityPoint {
  day: number;
  current: number | null;
  previous: number | null;
  average: number | null;
}

export interface SpendingCompositionPoint {
  day: number;
  cumulative_small: number | null;
  cumulative_large: number | null;
}

export interface TransactionHeatmapPoint {
  date: string;
  spend: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  spendingVelocity?: SpendingVelocityPoint[];
  spendingComposition?: SpendingCompositionPoint[];
  habitIdentifier: HabitIdentifierPoint[];
  categoryDistribution: CategoryDistributionPoint[];
  transactionHeatmap?: TransactionHeatmapPoint[];
  monthlyBreakdown?: MonthlyBreakdownPoint[];
}

export interface SuggestedBudget {
  categoryId: number;
  categoryName: string;
  icon_name: string | null;
  suggestedAmount: number;
  currentSpend: number;
}

export interface HistoricalSpend {
  month: string;
  totalSpend: number;
}

export interface BudgetEmptyStateData {
  historicalSpend: HistoricalSpend[];
  averageTotalSpend: number;
  suggestedBudgets: SuggestedBudget[];
}

export interface BudgetPacingPoint {
  day: number;
  actualSpend: number;
  budgetPace?: number;
}

export interface BudgetPageData {
  plan: BudgetPlanItem[] | null;
  historicalData: BudgetEmptyStateData | null;
  pacingData?: BudgetPacingPoint[];
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Alert {
  id: number;
  threshold_percentage: number | null;
  triggered_at: string;
  is_acknowledged: boolean;
  type: "budget" | "new_category";
  context: {
    category_name?: string;
  } | null;
  goal: {
    id: number;
    month: string;
    limit_amount: number;
    category: {
      id: number;
      name: string;
    };
  } | null;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface SaveBudgetPlanPayload {
  month: string;
  budgets: Array<{
    category_id: number;
    limit_amount: number;
  }>;
}

export interface TransactionFilters {
  page?: number;
  page_size?: number;
  month?: string;
  search?: string;
  type?: "debit" | "credit";
  category_id?: number;
  account_id?: number;
  tag_id?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface TransactionsResponse {
  total_count: number;
  transactions: Transaction[];
}

export interface DeleteMyAccountPayload {
  password: string;
}

export interface UploadStatementFile {
  uri: string;
  name: string;
  type: string;
}
