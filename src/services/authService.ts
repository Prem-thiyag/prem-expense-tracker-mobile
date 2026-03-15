import apiClient from "./api/client";
import {
  ApiBaseUrlNotConfiguredError,
  getConfiguredApiBaseUrl,
} from "./api/client";

import type { LoginResponse, RegisterPayload, User } from "../types/api";

const buildLoginError = async (response: Response) => {
  let detail = "";

  try {
    const data = (await response.json()) as { detail?: string };
    detail = data.detail ?? "";
  } catch {
    detail = "";
  }

  const error = new Error(detail || `Request failed with status ${response.status}`);
  (error as Error & { status?: number }).status = response.status;
  return error;
};

const fetchWithTimeout = async (input: string, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const baseUrl = await getConfiguredApiBaseUrl();

    if (!baseUrl) {
      throw new ApiBaseUrlNotConfiguredError();
    }

    const formBody = [
      "grant_type=password",
      `username=${encodeURIComponent(identifier)}`,
      `password=${encodeURIComponent(password)}`,
      "scope=",
      "client_id=",
      "client_secret=",
    ].join("&");

    let response: Response;

    try {
      response = await fetchWithTimeout(
        `${baseUrl}/auth/login/password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: formBody,
        },
        12000
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || /aborted/i.test(error.message))
      ) {
        const timeoutError = new Error("Login request timed out.");
        (timeoutError as Error & { status?: number }).status = 408;
        throw timeoutError;
      }

      throw error;
    }

    if (!response.ok) {
      throw await buildLoginError(response);
    }

    return (await response.json()) as LoginResponse;
  },

  async register(userData: RegisterPayload) {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  async getMyProfile(): Promise<User> {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },
};

