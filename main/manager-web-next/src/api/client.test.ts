import { describe, expect, it, vi } from "vitest";

import {
  ApiError,
  AUTH_EXPIRED_EVENT,
  toAcceptLanguage,
  unwrapEnvelope,
} from "@/api/client";

describe("API envelope handling", () => {
  it("unwraps both current and legacy success codes", () => {
    expect(unwrapEnvelope({ code: 0, data: { ok: true } })).toEqual({ ok: true });
    expect(unwrapEnvelope({ code: "success", data: 7 })).toBe(7);
  });

  it("surfaces the backend message for business errors", () => {
    expect(() => unwrapEnvelope({ code: 500, msg: "invalid model" })).toThrow(
      new ApiError("invalid model", { code: 500 }),
    );
  });

  it("clears the session and emits an expiry event on code 401", () => {
    localStorage.setItem("token", '{"token":"expired"}');
    const listener = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    expect(() => unwrapEnvelope({ code: 401, msg: "expired" })).toThrow("expired");
    expect(localStorage.getItem("token")).toBeNull();
    expect(listener).toHaveBeenCalledOnce();

    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });

  it("normalizes the language header expected by the backend", () => {
    expect(toAcceptLanguage("zh_CN")).toBe("zh-CN");
    expect(toAcceptLanguage("en")).toBe("en-US");
    expect(toAcceptLanguage("pt-BR")).toBe("pt-BR");
  });
});
