import apiClient from "./api/client";

import type { DashboardData } from "../types/api";

export const dashboardService = {
  async getDashboardData(month: string): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>("/dashboard", {
      params: { month },
    });

    return response.data;
  },
};
