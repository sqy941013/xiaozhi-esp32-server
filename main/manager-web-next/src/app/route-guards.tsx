import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import type { ModuleRoute } from "@/app/module-routes";
import { canAccessRoute } from "@/app/module-routes";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/features/auth/use-auth";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "bootstrapping") return <LoadingScreen />;
  if (status !== "authenticated") {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate replace to={`/login?redirect=${encodeURIComponent(redirect)}`} />;
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === "bootstrapping") return <LoadingScreen />;
  return status === "authenticated" ? <Navigate replace to="/home" /> : <Outlet />;
}

export function ModuleRouteGuard({
  children,
  route,
}: {
  children: ReactNode;
  route: ModuleRoute;
}) {
  const { publicConfig, user } = useAuth();
  return canAccessRoute(route, user, publicConfig) ? children : <Navigate replace to="/home" />;
}

export function UnknownRoute() {
  const { status } = useAuth();
  if (status === "bootstrapping") return <LoadingScreen />;
  return <Navigate replace to={status === "authenticated" ? "/home" : "/login"} />;
}
