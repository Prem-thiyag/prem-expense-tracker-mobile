import apiClient from "./api/client";

import type {
  Transaction,
  TransactionFilters,
  TransactionsResponse,
} from "../types/api";

export const transactionsService = {
  async getTransactions(
    filters: TransactionFilters
  ): Promise<TransactionsResponse> {
    const response = await apiClient.get<TransactionsResponse>("/transactions", {
      params: filters,
    });
    return response.data;
  },

  async createTransaction(transactionData: Partial<Transaction>) {
    const response = await apiClient.post<Transaction>(
      "/transactions",
      transactionData
    );
    return response.data;
  },

  async updateTransaction(id: number, transactionData: Partial<Transaction>) {
    const response = await apiClient.put<Transaction>(
      `/transactions/${id}`,
      transactionData
    );
    return response.data;
  },

  async deleteTransaction(id: number) {
    await apiClient.delete(`/transactions/${id}`);
  },
};
