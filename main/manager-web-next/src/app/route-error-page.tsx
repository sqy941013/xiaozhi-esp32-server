import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router";

import { Button } from "@/components/ui/button";

export function RouteErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();
  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t("error.unexpected");

  return (
    <main className="grid min-h-svh place-items-center bg-background p-6">
      <section className="max-w-md text-center">
        <AlertTriangle
          aria-hidden="true"
          className="mx-auto size-12 text-destructive"
        />
        <h1 className="mt-5 text-2xl font-semibold">{t("error.title")}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <Button className="mt-6" onClick={() => window.location.assign("/")}>
          {t("error.backHome")}
        </Button>
      </section>
    </main>
  );
}
