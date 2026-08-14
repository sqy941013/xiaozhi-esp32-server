import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="text-center" role="status">
        <div className="mx-auto flex size-12 animate-pulse items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Bot aria-hidden="true" className="size-6" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    </div>
  );
}
