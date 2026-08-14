import { describe, expect, it } from "vitest";

import { resolveSupportedLanguage } from "@/i18n";

describe("locale compatibility", () => {
  it("maps browser and legacy Vue locale codes to supported BCP 47 codes", () => {
    expect(resolveSupportedLanguage("zh_HK")).toBe("zh-TW");
    expect(resolveSupportedLanguage("zh_CN")).toBe("zh-CN");
    expect(resolveSupportedLanguage("en-US")).toBe("en");
    expect(resolveSupportedLanguage("de-DE")).toBe("de");
    expect(resolveSupportedLanguage("pt_PT")).toBe("pt-BR");
    expect(resolveSupportedLanguage("fr-FR")).toBeNull();
  });
});
