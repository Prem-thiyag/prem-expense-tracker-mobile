import apiClient from "./api/client";

import type {
  Account,
  Category,
  DeleteMyAccountPayload,
  Tag,
  UploadStatementFile,
} from "../types/api";

export const settingsService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },

  async createCategory(data: {
    name: string;
    is_income: boolean;
    icon_name?: string | null;
  }): Promise<Category> {
    const response = await apiClient.post<Category>("/categories", data);
    return response.data;
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number) {
    await apiClient.delete(`/categories/${id}`);
  },

  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>("/tags");
    return response.data;
  },

  async createTag(data: { name: string }): Promise<Tag> {
    const response = await apiClient.post<Tag>("/tags", data);
    return response.data;
  },

  async updateTag(id: number, data: { name: string }): Promise<Tag> {
    const response = await apiClient.put<Tag>(`/tags/${id}`, data);
    return response.data;
  },

  async deleteTag(id: number) {
    await apiClient.delete(`/tags/${id}`);
  },

  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<Account[]>("/accounts");
    return response.data;
  },

  async createAccount(data: {
    name: string;
    type: string;
    provider: string;
  }): Promise<Account> {
    const response = await apiClient.post<Account>("/accounts", data);
    return response.data;
  },

  async updateAccount(id: number, data: Partial<Account>): Promise<Account> {
    const response = await apiClient.put<Account>(`/accounts/${id}`, data);
    return response.data;
  },

  async deleteAccount(id: number) {
    await apiClient.delete(`/accounts/${id}`);
  },

  async uploadStatements(files: UploadStatementFile[]) {
    const formData = new FormData();

    files.forEach((file) => {
      (formData as any).append("files", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
    });

    const response = await apiClient.post(
      "/settings/upload-statements",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async deleteMyAccount(data: DeleteMyAccountPayload) {
    const response = await apiClient.delete("/users/me", { data });
    return response.data;
  },
};
