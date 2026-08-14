import { ArrowUpRight, CheckCircle2, Layers3, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { visibleModuleRoutes } from "@/app/module-routes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/use-auth";

export function WorkspacePage() {
  const { t } = useTranslation();
  const { publicConfig, user } = useAuth();
  const visibleRoutes = visibleModuleRoutes(user, publicConfig);
  const nextRoutes = visibleRoutes.filter((route) => route.path !== "/home").slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-3xl border border-border bg-slate-950 text-white shadow-sm">
        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,.3),transparent_35%)]" />
          <div className="relative">
            <Badge className="border-white/10 bg-white/10 text-sky-100">{t("dashboard.badge")}</Badge>
            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("dashboard.welcome", { name: user?.username || t("dashboard.user") })}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty leading-7 text-slate-300">
              {t("dashboard.description")}
            </p>
          </div>
          <div className="relative flex items-center gap-4 self-center rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <ShieldCheck className="size-8 text-emerald-400" />
            <div>
              <p className="text-sm font-medium">{t("dashboard.sessionVerified")}</p>
              <p className="mt-1 text-xs text-slate-400">{t("dashboard.allRoutesProtected")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><Layers3 className="size-5" /></div>
            <div><p className="text-2xl font-semibold">{visibleRoutes.length}</p><p className="text-sm text-muted-foreground">{t("dashboard.availableModules")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600"><CheckCircle2 className="size-5" /></div>
            <div><p className="text-2xl font-semibold">6</p><p className="text-sm text-muted-foreground">{t("dashboard.locales")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-600"><ShieldCheck className="size-5" /></div>
            <div><p className="text-2xl font-semibold">{user?.superAdmin === 1 ? t("dashboard.admin") : t("dashboard.member")}</p><p className="text-sm text-muted-foreground">{t("dashboard.currentRole")}</p></div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t("dashboard.moduleAccess")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.moduleAccessDescription")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {nextRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <Link className="group" key={route.path} to={route.path}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="rounded-xl bg-muted p-3 text-foreground group-hover:bg-primary/10 group-hover:text-primary"><Icon className="size-5" /></div>
                    <div className="min-w-0 flex-1"><CardTitle className="text-base">{t(route.titleKey)}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{t("module.phase", { phase: route.migrationPhase })}</p></div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
