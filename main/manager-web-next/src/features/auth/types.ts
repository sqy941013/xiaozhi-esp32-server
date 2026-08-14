import type { components } from "@/api/generated/schema";

export type LoginRequest = components["schemas"]["LoginDTO"];
export type PasswordChangeRequest = components["schemas"]["PasswordDTO"];
export type RetrievePasswordRequest =
  components["schemas"]["RetrievePasswordDTO"];
export type SmsVerificationRequest =
  components["schemas"]["SmsVerificationDTO"];
export type TokenResponse = components["schemas"]["TokenDTO"];
export type UserInfo = components["schemas"]["UserDetail"];

export interface MobileArea {
  key: string;
  name: string;
}

export interface FeatureConfig {
  description?: string;
  enabled: boolean;
  name?: string;
}

export interface PublicConfig {
  allowUserRegister: boolean;
  beianGaNum: string | null;
  beianIcpNum: string | null;
  enableMobileRegister: boolean;
  mobileAreaList: MobileArea[];
  name: string;
  sm2PublicKey: string;
  systemWebMenu: {
    features: Record<string, FeatureConfig>;
    groups: Record<string, string[]>;
  };
  version: string;
  year: string;
}

export interface StoredToken extends TokenResponse {
  token: string;
}

export type AuthStatus = "bootstrapping" | "anonymous" | "authenticated";
