import { apiClient, requestData, unwrapEnvelope } from "@/api/client";
import type {
  LoginRequest,
  PasswordChangeRequest,
  PublicConfig,
  RetrievePasswordRequest,
  SmsVerificationRequest,
  TokenResponse,
  UserInfo,
} from "@/features/auth/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown): string | null {
  const result = stringValue(value);
  return result && result !== "null" ? result : null;
}

function recordValue(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parsePublicConfig(value: Record<string, unknown>): PublicConfig {
  const rawAreas = Array.isArray(value.mobileAreaList)
    ? value.mobileAreaList
    : [];
  const rawMenu = recordValue(value.systemWebMenu);
  const rawFeatures = isRecord(rawMenu.features) ? rawMenu.features : {};
  const rawGroups = isRecord(rawMenu.groups) ? rawMenu.groups : {};

  const features = Object.fromEntries(
    Object.entries(rawFeatures)
      .filter((entry): entry is [string, Record<string, unknown>] =>
        isRecord(entry[1]),
      )
      .map(([key, feature]) => [
        key,
        {
          description: stringValue(feature.description) || undefined,
          enabled: feature.enabled === true,
          name: stringValue(feature.name) || undefined,
        },
      ]),
  );

  const groups = Object.fromEntries(
    Object.entries(rawGroups).map(([key, group]) => [
      key,
      Array.isArray(group)
        ? group.filter((item): item is string => typeof item === "string")
        : [],
    ]),
  );

  return {
    allowUserRegister: value.allowUserRegister === true,
    beianGaNum: nullableString(value.beianGaNum),
    beianIcpNum: nullableString(value.beianIcpNum),
    enableMobileRegister: value.enableMobileRegister === true,
    mobileAreaList: rawAreas
      .filter((area): area is Record<string, unknown> => isRecord(area))
      .map((area) => ({
        key: stringValue(area.key),
        name: stringValue(area.name),
      }))
      .filter((area) => area.key && area.name),
    name: stringValue(value.name, "xiaozhi-esp32-server"),
    sm2PublicKey: stringValue(value.sm2PublicKey),
    systemWebMenu: { features, groups },
    version: stringValue(value.version),
    year: stringValue(value.year),
  };
}

export async function getPublicConfig(): Promise<PublicConfig> {
  const data = await requestData<Record<string, unknown>>({
    method: "GET",
    url: "/user/pub-config",
  });
  return parsePublicConfig(data);
}

export async function getCaptcha(uuid: string): Promise<Blob> {
  const response = await apiClient.get<Blob>("/user/captcha", {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    params: { uuid },
    responseType: "blob",
  });

  if (response.data.type.includes("json")) {
    const raw = JSON.parse(await response.data.text()) as {
      code?: number | string;
      msg?: string;
    };
    unwrapEnvelope(raw, response.status);
  }

  return response.data;
}

export function login(payload: LoginRequest): Promise<TokenResponse> {
  return requestData({ method: "POST", url: "/user/login", data: payload });
}

export function register(payload: LoginRequest): Promise<void> {
  return requestData({ method: "POST", url: "/user/register", data: payload });
}

export function sendSmsVerification(
  payload: SmsVerificationRequest,
): Promise<void> {
  return requestData({
    method: "POST",
    url: "/user/smsVerification",
    data: payload,
  });
}

export function retrievePassword(
  payload: RetrievePasswordRequest,
): Promise<void> {
  return requestData({
    method: "PUT",
    url: "/user/retrieve-password",
    data: payload,
  });
}

export function getUserInfo(): Promise<UserInfo> {
  return requestData({ method: "GET", url: "/user/info" });
}

export function changePassword(payload: PasswordChangeRequest): Promise<void> {
  return requestData({
    method: "PUT",
    url: "/user/change-password",
    data: payload,
  });
}

export function isFeatureEnabled(
  config: PublicConfig | null,
  feature: string,
): boolean {
  return config?.systemWebMenu.features[feature]?.enabled === true;
}
