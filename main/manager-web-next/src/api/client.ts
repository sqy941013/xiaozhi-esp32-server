import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

import i18n from "@/i18n";
import {
  clearAuthStorage,
  readAccessToken,
} from "@/features/auth/auth-storage";

export const AUTH_EXPIRED_EVENT = "xiaozhi:auth-expired";

export interface ApiEnvelope<T> {
  code?: number | string;
  data?: T;
  msg?: string;
}

export class ApiError extends Error {
  readonly code?: number | string;
  readonly status?: number;

  constructor(
    message: string,
    options: { code?: number | string; status?: number } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
  }
}

export function toAcceptLanguage(language?: string): string {
  const normalized = (language || "zh-CN").replace("_", "-");
  return normalized === "en" ? "en-US" : normalized;
}

function isSuccessCode(code: ApiEnvelope<unknown>["code"]): boolean {
  return code === undefined || code === 0 || code === "success";
}

function isUnauthorized(code: ApiEnvelope<unknown>["code"], status?: number) {
  return code === 401 || code === "401" || status === 401;
}

function expireSession() {
  clearAuthStorage();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

export function unwrapEnvelope<T>(
  envelope: ApiEnvelope<T>,
  status?: number,
): T {
  if (isSuccessCode(envelope.code)) {
    return envelope.data as T;
  }

  if (isUnauthorized(envelope.code, status)) {
    expireSession();
  }

  throw new ApiError(envelope.msg || "Request failed.", {
    code: envelope.code,
    status,
  });
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/xiaozhi",
    timeout: 30_000,
  });

  client.interceptors.request.use((config) => {
    config.headers.set(
      "Accept-Language",
      toAcceptLanguage(i18n.resolvedLanguage || i18n.language),
    );

    const token = readAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  });

  client.interceptors.response.use(undefined, (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      expireSession();
    }
    return Promise.reject(error);
  });

  return client;
}

export const apiClient = createApiClient();

function apiErrorFromAxios(error: AxiosError<ApiEnvelope<unknown>>): ApiError {
  const response = error.response;
  const envelope = response?.data;

  return new ApiError(
    envelope?.msg || error.message || "Unable to reach the server.",
    {
      code: envelope?.code,
      status: response?.status,
    },
  );
}

export async function requestData<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.request<ApiEnvelope<T>>(config);
    return unwrapEnvelope(response.data, response.status);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof AxiosError) {
      throw apiErrorFromAxios(error);
    }
    throw error;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
