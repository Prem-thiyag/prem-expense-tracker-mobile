import apiClient from "./api/client";

import type { BudgetPageData, SaveBudgetPlanPayload } from "../types/api";

export const budgetsService = {
  async getBudgetPlan(month: string): Promise<BudgetPageData> {
    const response = await apiClient.get<BudgetPageData>("/budgets/plan", {
      params: { month },
    });

    return response.data;
  },

  async saveBudgetPlan(planData: SaveBudgetPlanPayload) {
    const response = await apiClient.post("/budgets/plan", planData);
    return response.data;
  },

  async deleteBudgetPlan(month: string) {
    const response = await apiClient.delete("/budgets/plan", {
      params: { month },
    });
    return response.data;
  },
};
