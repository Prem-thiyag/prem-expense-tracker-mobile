import apiClient from "./api/client";

import type { AnalyticsData } from "../types/api";

export const analyticsService = {
  async getAnalyticsData(
    timePeriod: string,
    includeCapitalTransfers: boolean
  ): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>("/analytics", {
      params: {
        time_period: timePeriod,
        include_capital_transfers: includeCapitalTransfers,
      },
    });

    return response.data;
  },
};
