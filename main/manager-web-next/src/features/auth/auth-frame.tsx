import { Bot, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSelect } from "@/components/language-select";
import { useAuth } from "@/features/auth/use-auth";

export function AuthFrame({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  const { t } = useTranslation();
  const { publicConfig } = useAuth();

  return (
    <div className="relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-[minmax(28rem,1.05fr)_minmax(30rem,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.4),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(14,165,233,0.22),transparent_38%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
            <Bot aria-hidden="true" className="size-6 text-sky-300" />
          </div>
          <div>
            <p className="font-semibold">{publicConfig?.name || t("app.name")}</p>
            <p className="text-xs text-slate-400">{t("app.subtitle")}</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200">
            <Sparkles aria-hidden="true" className="size-3.5" />
            {t("auth.heroBadge")}
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight xl:text-5xl">
            {t("auth.heroTitle")}
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-slate-300">
            {t("auth.heroDescription")}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              {t("auth.heroItemRealtime")}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              {t("auth.heroItemSecure")}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          {publicConfig?.year || `©${new Date().getFullYear()}`} · v
          {publicConfig?.version || "—"}
        </p>
      </section>

      <main className="relative flex min-h-svh flex-col">
        <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-6">
          <LanguageSelect />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-20 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Bot aria-hidden="true" className="size-5" />
                </div>
                <p className="font-semibold">{publicConfig?.name || t("app.name")}</p>
              </div>
            </div>
            <div className="mb-7">
              <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>

        <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
          {publicConfig?.beianIcpNum && <span>{publicConfig.beianIcpNum}</span>}
          {publicConfig?.beianIcpNum && publicConfig.beianGaNum && <span> · </span>}
          {publicConfig?.beianGaNum && <span>{publicConfig.beianGaNum}</span>}
        </footer>
      </main>
    </div>
  );
}
