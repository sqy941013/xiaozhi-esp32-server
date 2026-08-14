import { ArrowRight, Construction } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ModuleRoute } from "@/app/module-routes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ModulePlaceholder({ route }: { route: ModuleRoute }) {
  const { t } = useTranslation();
  const Icon = route.icon;
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-10">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">{t(route.titleKey)}</h1>
                <Badge variant="secondary">{t("module.phase", { phase: route.migrationPhase })}</Badge>
              </div>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                {t("module.placeholderDescription")}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                <Construction aria-hidden="true" className="size-4" />
                {t("module.vueStillAvailable")}
              </div>
            </div>
            <ArrowRight aria-hidden="true" className="hidden size-8 self-center text-muted-foreground/40 md:block" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
