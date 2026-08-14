import { describe, expect, it } from "vitest";

import {
  clearAuthStorage,
  parseStoredToken,
  readAccessToken,
  readUser,
  saveToken,
  saveUser,
} from "@/features/auth/auth-storage";

describe("auth storage compatibility", () => {
  it("reads the JSON token shape written by the Vue frontend", () => {
    expect(parseStoredToken('{"token":"legacy-token","expire":7200}')).toEqual({
      expire: 7200,
      token: "legacy-token",
    });
  });

  it("accepts a raw token but rejects corrupted JSON", () => {
    expect(parseStoredToken("raw-token")?.token).toBe("raw-token");
    expect(parseStoredToken('"quoted-token"')?.token).toBe("quoted-token");
    expect(parseStoredToken('{"token":')).toBeNull();
    expect(parseStoredToken("null")).toBeNull();
  });

  it("persists a legacy-compatible token and clears only authentication data", () => {
    localStorage.setItem("pubConfig", '{"version":"test"}');
    saveToken({ token: "new-token", expire: 60 });
    saveUser({ id: 1, username: "admin", superAdmin: 1 });

    expect(readAccessToken()).toBe("new-token");
    expect(readUser()?.username).toBe("admin");

    clearAuthStorage();
    expect(readAccessToken()).toBeNull();
    expect(readUser()).toBeNull();
    expect(localStorage.getItem("pubConfig")).toBe('{"version":"test"}');
  });
});
