import {
  Braces,
  CheckCircle2,
  Container,
  Languages,
  Route,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const foundations = [
  { icon: Braces, key: "typescript" },
  { icon: Route, key: "routing" },
  { icon: ShieldCheck, key: "contracts" },
  { icon: Languages, key: "i18n" },
  { icon: Container, key: "docker" },
] as const;

export function FoundationPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.4fr_0.6fr] md:px-10 md:py-14">
          <div>
            <Badge>{t("foundation.badge")}</Badge>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("foundation.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              {t("foundation.description")}
            </p>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/50 p-8">
            <div className="text-center">
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto size-14 text-emerald-500"
              />
              <p className="mt-4 text-3xl font-semibold">127</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("foundation.openapiPaths")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label={t("foundation.capabilities")}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {foundations.map(({ icon: Icon, key }) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <Icon aria-hidden="true" className="size-5 text-primary" />
              <CardTitle className="pt-3 text-base">
                {t(`foundation.items.${key}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t(`foundation.items.${key}.description`)}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
