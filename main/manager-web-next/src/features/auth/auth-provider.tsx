import { useCallback, useEffect, useMemo, useState } from "react";

import { AUTH_EXPIRED_EVENT, getErrorMessage } from "@/api/client";
import { getPublicConfig, getUserInfo } from "@/features/auth/auth-api";
import {
  clearAuthStorage,
  readPublicConfig,
  readToken,
  readUser,
  savePublicConfig,
  saveToken,
  saveUser,
} from "@/features/auth/auth-storage";
import {
  AuthContext,
  type AuthContextValue,
} from "@/features/auth/auth-context";
import type {
  AuthStatus,
  PublicConfig,
  TokenResponse,
  UserInfo,
} from "@/features/auth/types";

let activePublicConfigRequest: Promise<PublicConfig> | null = null;

function requestPublicConfig() {
  activePublicConfigRequest ??= getPublicConfig().finally(() => {
    activePublicConfigRequest = null;
  });
  return activePublicConfigRequest;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedToken = readToken();
  const [status, setStatus] = useState<AuthStatus>(
    storedToken ? "bootstrapping" : "anonymous",
  );
  const [user, setUser] = useState<UserInfo | null>(
    storedToken ? readUser() : null,
  );
  const [publicConfig, setPublicConfig] = useState<PublicConfig | null>(() =>
    readPublicConfig(),
  );
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const refreshPublicConfig = useCallback(async () => {
    setConfigLoading(true);
    setConfigError(null);
    try {
      const config = await requestPublicConfig();
      savePublicConfig(config);
      setPublicConfig(config);
      return config;
    } catch (error) {
      setConfigError(getErrorMessage(error, "Unable to load public settings."));
      throw error;
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (token: TokenResponse) => {
    saveToken(token);
    try {
      const currentUser = await getUserInfo();
      saveUser(currentUser);
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (error) {
      clearAuthStorage();
      setUser(null);
      setStatus("anonymous");
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const configTimer = window.setTimeout(() => {
      void refreshPublicConfig().catch(() => {
        // The cached configuration remains usable; forms show the load error.
      });
    }, 0);

    if (!readToken()) {
      return () => {
        active = false;
        window.clearTimeout(configTimer);
      };
    }

    void getUserInfo()
      .then((currentUser) => {
        if (!active) return;
        saveUser(currentUser);
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        clearAuthStorage();
        setUser(null);
        setStatus("anonymous");
      });

    return () => {
      active = false;
      window.clearTimeout(configTimer);
    };
  }, [refreshPublicConfig]);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticate,
      configError,
      configLoading,
      logout,
      publicConfig,
      refreshPublicConfig,
      status,
      user,
    }),
    [
      authenticate,
      configError,
      configLoading,
      logout,
      publicConfig,
      refreshPublicConfig,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
