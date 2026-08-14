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
const storedLanguage = window.localStorage.getItem("xiaozhi-language");
const browserLanguage = navigator.language;
const initialLanguage =
  (storedLanguage && supportedCodes.has(storedLanguage) && storedLanguage) ||
  (supportedCodes.has(browserLanguage) && browserLanguage) ||
  "zh-CN";

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
