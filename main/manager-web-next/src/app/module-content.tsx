import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import type { ModuleRoute } from "@/app/module-routes";
import { FoundationPage } from "@/features/foundation/foundation-page";
import { ModulePlaceholder } from "@/features/foundation/module-placeholder";
import { WorkspacePage } from "@/features/foundation/workspace-page";

const ModelConfigPage = lazy(async () => ({
  default: (await import("@/features/models/model-config-page")).ModelConfigPage,
}));
const ProviderManagementPage = lazy(async () => ({
  default: (await import("@/features/models/provider-management-page"))
    .ProviderManagementPage,
}));

function ModuleLoading() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground"
      role="status"
    >
      {t("common.loading")}
    </div>
  );
}

export function ModuleContent({ route }: { route: ModuleRoute }) {
  let content: React.ReactNode;
  if (route.path === "/home") content = <WorkspacePage />;
  else if (route.path === "/foundation") content = <FoundationPage />;
  else if (route.path === "/model-config") content = <ModelConfigPage />;
  else if (route.path === "/provider-management") {
    content = <ProviderManagementPage />;
  } else content = <ModulePlaceholder route={route} />;

  return <Suspense fallback={<ModuleLoading />}>{content}</Suspense>;
}
