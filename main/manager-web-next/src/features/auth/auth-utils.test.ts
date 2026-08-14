import { describe, expect, it } from "vitest";

import {
  createCaptchaId,
  encryptPassword,
  internationalPhone,
  safeRedirect,
  validateMobile,
} from "@/features/auth/auth-utils";

const publicKey =
  "044692890d5f130f93901ecebcee838dfee4d113317b205c94ef4f69a6c74859df96301dba4733e3e464077459bc7e1aa63416942c37bada11e510e0da1cd26286";

describe("authentication utilities", () => {
  it("uses the native UUID implementation when the browser exposes it", () => {
    const nativeCrypto = {
      getRandomValues: () => {
        throw new Error("fallback should not run");
      },
      randomUUID: () => "11111111-2222-4333-8444-555555555555",
    } as unknown as Crypto;

    expect(createCaptchaId(nativeCrypto)).toBe("11111111-2222-4333-8444-555555555555");
  });

  it("creates an RFC 4122 v4 UUID when randomUUID is unavailable", () => {
    const fallbackCrypto = {
      getRandomValues: (target: Uint8Array) => {
        target.set(Array.from({ length: 16 }, (_, index) => index));
        return target;
      },
    } as unknown as Crypto;

    expect(createCaptchaId(fallbackCrypto)).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
  });

  it("does not silently use predictable randomness for captcha identifiers", () => {
    expect(() => createCaptchaId({} as Crypto)).toThrow(
      "Secure random number generation is unavailable.",
    );
  });

  it("validates local mobile numbers and produces the international username", () => {
    expect(validateMobile("138 0013 8000", "+86")).toBe(true);
    expect(validateMobile("123", "+86")).toBe(false);
    expect(internationalPhone("+86", "138-0013-8000")).toBe("+8613800138000");
  });

  it("encrypts captcha plus password in the backend-compatible SM2 format", () => {
    const encrypted = encryptPassword(publicKey, "a1b2", "secret");
    expect(encrypted).toMatch(/^04[0-9a-f]+$/i);
    expect(encrypted).not.toContain("secret");
  });

  it("only accepts same-origin redirect paths", () => {
    expect(safeRedirect("/model-config?page=2")).toBe("/model-config?page=2");
    expect(safeRedirect("//evil.example/path")).toBe("/home");
    expect(safeRedirect("https://evil.example/path")).toBe("/home");
  });
});
