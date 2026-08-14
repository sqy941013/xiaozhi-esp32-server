import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { supportedLanguages } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSelect({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    window.localStorage.setItem("xiaozhi-language", language);
    window.localStorage.setItem(
      "userLanguage",
      language === "zh-CN"
        ? "zh_CN"
        : language === "zh-TW"
          ? "zh_TW"
          : language === "pt-BR"
            ? "pt_BR"
            : language,
    );
    document.documentElement.lang = language;
  };

  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Languages aria-hidden="true" className="size-4" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        className="h-9 rounded-lg border border-input bg-background/80 px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onChange={(event) => changeLanguage(event.target.value)}
        value={i18n.resolvedLanguage ?? "zh-CN"}
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
