import apiClient from "./api/client";

import type { Alert } from "../types/api";

export const alertsService = {
  async getUnreadAlerts(): Promise<Alert[]> {
    const response = await apiClient.get<Alert[]>("/alerts/unread");
    return response.data;
  },

  async acknowledgeAlert(alertId: number): Promise<Alert> {
    const response = await apiClient.put<Alert>(
      `/alerts/${alertId}/acknowledge`
    );
    return response.data;
  },
};
