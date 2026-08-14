import { Bot, KeyRound, LogOut, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router";

import {
  findModuleRoute,
  type NavigationGroup,
  visibleModuleRoutes,
} from "@/app/module-routes";
import { LanguageSelect } from "@/components/language-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/features/auth/change-password-dialog";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";

const groupOrder: readonly NavigationGroup[] = ["workspace", "ai", "admin"];

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout, publicConfig, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const routes = visibleModuleRoutes(user, publicConfig);
  const currentRoute = findModuleRoute(location.pathname);

  const navigation = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
          <Bot aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{publicConfig?.name || t("app.name")}</p>
          <p className="text-xs text-slate-500">v{publicConfig?.version || "—"}</p>
        </div>
      </div>

      <nav aria-label={t("shell.primaryNavigation")} className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groupOrder.map((group) => {
          const groupRoutes = routes.filter((route) => route.group === group);
          if (!groupRoutes.length) return null;
          return (
            <div key={group}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t(`nav.groups.${group}`)}</p>
              <div className="space-y-1">
                {groupRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <NavLink
                      className={({ isActive }) => cn(
                        "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-white/7 hover:text-white",
                        isActive && "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-400/15",
                      )}
                      key={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      to={route.path}
                    >
                      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                      <span className="truncate">{t(route.titleKey)}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-300">
            {(user?.username || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-slate-500">{user?.superAdmin === 1 ? t("dashboard.admin") : t("dashboard.member")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-white/7 hover:text-white" onClick={() => setPasswordDialogOpen(true)} type="button">
            <KeyRound className="size-3.5" />{t("auth.changePassword")}
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-white/7 hover:text-white" onClick={logout} type="button">
            <LogOut className="size-3.5" />{t("auth.logout")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh lg:block">{navigation}</aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label={t("common.close")} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} type="button" />
          <aside className="relative h-full w-[min(19rem,85vw)] shadow-2xl">
            {navigation}
            <Button aria-label={t("common.close")} className="absolute right-3 top-3 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setMobileMenuOpen(false)} size="icon" variant="ghost"><X className="size-5" /></Button>
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button aria-label={t("shell.openNavigation")} className="lg:hidden" onClick={() => setMobileMenuOpen(true)} size="icon" variant="ghost"><Menu className="size-5" /></Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentRoute ? t(currentRoute.titleKey) : t("app.name")}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">{t("shell.workspaceSubtitle")}</p>
            </div>
            {user?.superAdmin === 1 && <Badge className="hidden sm:inline-flex" variant="secondary"><Shield className="mr-1 size-3" />{t("dashboard.admin")}</Badge>}
          </div>
          <LanguageSelect />
        </header>
        <main><Outlet /></main>
      </div>

      {passwordDialogOpen && <ChangePasswordDialog onClose={() => setPasswordDialogOpen(false)} />}
    </div>
  );
}
