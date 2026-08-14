import { createBrowserRouter, Navigate } from "react-router";

import { ModuleContent } from "@/app/module-content";
import { moduleRoutes } from "@/app/module-routes";
import { RouteErrorPage } from "@/app/route-error-page";
import {
  ModuleRouteGuard,
  ProtectedRoute,
  PublicOnlyRoute,
  UnknownRoute,
} from "@/app/route-guards";
import { AppShell } from "@/app/shell";

const protectedModuleRoutes = moduleRoutes.map((route) => ({
  path: route.path === "/foundation" ? "foundation/*" : route.path.slice(1),
  element: (
    <ModuleRouteGuard route={route}>
      <ModuleContent route={route} />
    </ModuleRouteGuard>
  ),
}));

const loadLoginPage = async () => {
  const module = await import("@/features/auth/login-page");
  return { Component: module.LoginPage };
};

const loadRegisterPage = async () => {
  const module = await import("@/features/auth/register-page");
  return { Component: module.RegisterPage };
};

const loadRetrievePasswordPage = async () => {
  const module = await import("@/features/auth/retrieve-password-page");
  return { Component: module.RetrievePasswordPage };
};

export const router = createBrowserRouter(
  [
    {
      Component: PublicOnlyRoute,
      ErrorBoundary: RouteErrorPage,
      children: [
        { path: "/", lazy: loadLoginPage },
        { path: "/login", lazy: loadLoginPage },
        { path: "/register", lazy: loadRegisterPage },
        { path: "/retrieve-password", lazy: loadRetrievePasswordPage },
      ],
    },
    {
      Component: ProtectedRoute,
      ErrorBoundary: RouteErrorPage,
      children: [
        {
          Component: AppShell,
          children: [
            { index: true, element: <Navigate replace to="/home" /> },
            ...protectedModuleRoutes,
          ],
        },
      ],
    },
    { path: "*", Component: UnknownRoute },
  ],
  { basename: import.meta.env.VITE_PUBLIC_PATH || "/" },
);
