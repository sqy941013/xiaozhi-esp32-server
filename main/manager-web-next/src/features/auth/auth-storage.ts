import type {
  PublicConfig,
  StoredToken,
  TokenResponse,
  UserInfo,
} from "@/features/auth/types";

const TOKEN_KEY = "token";
const USER_KEY = "userInfo";
const PUBLIC_CONFIG_KEY = "pubConfig";

function getStorage(storage?: Storage): Storage | undefined {
  if (storage) {
    return storage;
  }

  return typeof window === "undefined" ? undefined : window.localStorage;
}

function parseJson(value: string | null): unknown {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseStoredToken(value: string | null): StoredToken | null {
  if (!value) {
    return null;
  }

  const parsed = parseJson(value);
  if (isRecord(parsed) && typeof parsed.token === "string" && parsed.token) {
    return {
      ...parsed,
      token: parsed.token,
    } as StoredToken;
  }

  if (typeof parsed === "string" && parsed.trim()) {
    return { token: parsed.trim() };
  }

  // Accept a raw bearer token written by early development builds, then rewrite
  // it in the legacy-compatible JSON shape the next time it is saved.
  if (
    !value.startsWith("{") &&
    !value.startsWith("[") &&
    !value.startsWith('"') &&
    !["null", "undefined"].includes(value.trim()) &&
    value.trim()
  ) {
    return { token: value.trim() };
  }

  return null;
}

export function readToken(storage?: Storage): StoredToken | null {
  return parseStoredToken(getStorage(storage)?.getItem(TOKEN_KEY) ?? null);
}

export function readAccessToken(storage?: Storage): string | null {
  return readToken(storage)?.token ?? null;
}

export function saveToken(token: TokenResponse, storage?: Storage): StoredToken {
  if (!token.token) {
    throw new Error("The login response did not contain an access token.");
  }

  const storedToken: StoredToken = { ...token, token: token.token };
  getStorage(storage)?.setItem(TOKEN_KEY, JSON.stringify(storedToken));
  return storedToken;
}

export function readUser(storage?: Storage): UserInfo | null {
  const parsed = parseJson(getStorage(storage)?.getItem(USER_KEY) ?? null);
  return isRecord(parsed) && typeof parsed.username === "string"
    ? (parsed as UserInfo)
    : null;
}

export function saveUser(user: UserInfo, storage?: Storage) {
  getStorage(storage)?.setItem(USER_KEY, JSON.stringify(user));
}

export function readPublicConfig(storage?: Storage): PublicConfig | null {
  const parsed = parseJson(
    getStorage(storage)?.getItem(PUBLIC_CONFIG_KEY) ?? null,
  );
  return isRecord(parsed) &&
    typeof parsed.sm2PublicKey === "string" &&
    Array.isArray(parsed.mobileAreaList) &&
    isRecord(parsed.systemWebMenu)
    ? (parsed as unknown as PublicConfig)
    : null;
}

export function savePublicConfig(config: PublicConfig, storage?: Storage) {
  getStorage(storage)?.setItem(PUBLIC_CONFIG_KEY, JSON.stringify(config));
}

export function clearAuthStorage(storage?: Storage) {
  const target = getStorage(storage);
  target?.removeItem(TOKEN_KEY);
  target?.removeItem(USER_KEY);
}
