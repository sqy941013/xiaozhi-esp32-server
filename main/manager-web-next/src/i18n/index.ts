import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "@/i18n/resources";

export const supportedLanguages = [
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "pt-BR", label: "Português" },
  { code: "vi", label: "Tiếng Việt" },
] as const;

const supportedCodes = new Set<string>(
  supportedLanguages.map(({ code }) => code),
);

export function resolveSupportedLanguage(language?: string | null): string | null {
  if (!language) return null;
  const normalized = language.replace("_", "-");
  if (supportedCodes.has(normalized)) return normalized;

  const lower = normalized.toLowerCase();
  if (lower.startsWith("zh")) {
    return /(^|-)tw|(^|-)hk|(^|-)mo|(^|-)hant/.test(lower)
      ? "zh-TW"
      : "zh-CN";
  }
  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("vi")) return "vi";
  if (lower.startsWith("en")) return "en";
  return null;
}

const storedLanguage = window.localStorage.getItem("xiaozhi-language");
const legacyLanguage = window.localStorage.getItem("userLanguage");
const initialLanguage =
  resolveSupportedLanguage(storedLanguage) ||
  resolveSupportedLanguage(legacyLanguage) ||
  resolveSupportedLanguage(navigator.language) ||
  "en";

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "zh-CN",
  supportedLngs: [...supportedCodes],
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = initialLanguage;

export default i18n;
