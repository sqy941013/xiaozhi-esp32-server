import { Bot, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { Badge } from "@/components/ui/badge";
import { supportedLanguages } from "@/i18n";

export function AppShell() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    window.localStorage.setItem("xiaozhi-language", language);
    document.documentElement.lang = language;
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bot aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{t("app.name")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("app.subtitle")}</p>
            </div>
            <Badge variant="secondary">React</Badge>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages aria-hidden="true" className="size-4" />
            <span className="sr-only">{t("language.label")}</span>
            <select
              aria-label={t("language.label")}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
