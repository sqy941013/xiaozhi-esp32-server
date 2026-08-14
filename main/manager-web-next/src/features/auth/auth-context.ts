import { createContext } from "react";

import type {
  AuthStatus,
  PublicConfig,
  TokenResponse,
  UserInfo,
} from "@/features/auth/types";

export interface AuthContextValue {
  authenticate(token: TokenResponse): Promise<UserInfo>;
  configError: string | null;
  configLoading: boolean;
  logout(): void;
  publicConfig: PublicConfig | null;
  refreshPublicConfig(): Promise<PublicConfig>;
  status: AuthStatus;
  user: UserInfo | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
