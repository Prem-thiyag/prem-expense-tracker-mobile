import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";

import { authStorage } from "../../storage/authStorage";
import { appConfigStorage } from "../../storage/appConfigStorage";

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";

export class ApiBaseUrlNotConfiguredError extends Error {
  constructor() {
    super("API base URL is not configured.");
    this.name = "ApiBaseUrlNotConfiguredError";
  }
}

export const normalizeApiBaseUrl = (value: string) => {
  let normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  normalized = normalized.replace(/\/+$/, "");

  if (!/\/api\/v1$/i.test(normalized)) {
    normalized = `${normalized}/api/v1`;
  }

  return normalized;
};

export const getConfiguredApiBaseUrl = async () => {
  const savedOverride = await appConfigStorage.getApiBaseUrlOverride();

  return normalizeApiBaseUrl(savedOverride || envBaseUrl);
};

export const getConfiguredApiBaseUrlSync = () => {
  return normalizeApiBaseUrl(envBaseUrl);
};

export const pingApiBaseUrl = async (value: string) => {
  const normalized = normalizeApiBaseUrl(value);

  if (!normalized) {
    throw new ApiBaseUrlNotConfiguredError();
  }

  const rootUrl = normalized.replace(/\/api\/v1$/i, "");
  const response = await axios.get<{ message?: string }>(`${rootUrl}/`, {
    timeout: 15000,
  });

  return response.data;
};

let unauthorizedHandler: (() => Promise<void> | void) | null = null;
let isHandlingUnauthorized = false;

export const setUnauthorizedHandler = (
  handler: (() => Promise<void> | void) | null
) => {
  unauthorizedHandler = handler;
};

const apiClient = axios.create({
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const baseURL = await getConfiguredApiBaseUrl();

  if (!baseURL) {
    throw new ApiBaseUrlNotConfiguredError();
  }

  config.baseURL = baseURL;

  const token = await authStorage.getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail?: string }>) => {
    const headers = error.config?.headers as
      | Record<string, string>
      | undefined;
    const authorizationHeader =
      headers?.Authorization ?? headers?.authorization;
    const isAuthenticatedRequest = authorizationHeader?.startsWith("Bearer ");

    if (
      error.response?.status === 401 &&
      isAuthenticatedRequest &&
      unauthorizedHandler &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;

      try {
        await unauthorizedHandler();
        Toast.show({
          type: "error",
          text1: "Session expired",
          text2: "Please sign in again.",
        });
      } finally {
        isHandlingUnauthorized = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

