import { createBrowserRouter } from "react-router";

import { AppShell } from "@/app/shell";
import { RouteErrorPage } from "@/app/route-error-page";
import { FoundationPage } from "@/features/foundation/foundation-page";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: AppShell,
      ErrorBoundary: RouteErrorPage,
      children: [
        {
          index: true,
          Component: FoundationPage,
        },
        {
          path: "foundation/*",
          Component: FoundationPage,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.VITE_PUBLIC_PATH || "/",
  },
);
