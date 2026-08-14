import {
  AudioWaveform,
  BookOpenText,
  ContactRound,
  FingerprintPattern,
  LoaderCircle,
  MicVocal,
  PlugZap,
  RefreshCcw,
  Save,
  Speech,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateFeatureMenu } from "@/features/admin/admin-api";
import {
  buildFeatureMenu,
  FEATURE_GROUP_IDS,
  FEATURE_IDS,
  resetFeatureMenu,
  type FeatureId,
} from "@/features/admin/admin-utils";
import type { FeatureMenu } from "@/features/admin/types";
import type { AuthContextValue } from "@/features/auth/auth-context";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";

const EMPTY_MENU: FeatureMenu = { features: {}, groups: {} };

const FEATURE_ICONS: Record<FeatureId, LucideIcon> = {
  addressBook: ContactRound,
  asr: Speech,
  knowledgeBase: BookOpenText,
  mcpAccessPoint: PlugZap,
  vad: AudioWaveform,
  voiceClone: MicVocal,
  voiceprintRecognition: FingerprintPattern,
};

function normalizedMenu(menu?: FeatureMenu): FeatureMenu {
  return buildFeatureMenu(menu || EMPTY_MENU, {});
}

function FeatureManagementEditor({ auth }: { auth: AuthContextValue }) {
  const { t } = useTranslation();
  const {
    configError,
    configLoading,
    publicConfig,
    refreshPublicConfig,
  } = auth;
  const sourceMenu = useMemo(
    () => normalizedMenu(publicConfig?.systemWebMenu),
    [publicConfig?.systemWebMenu],
  );
  const [draft, setDraft] = useState<FeatureMenu>(sourceMenu);
  const [baseline, setBaseline] = useState<FeatureMenu>(sourceMenu);
  const [resetOpen, setResetOpen] = useState(false);
  const saveMutation = useMutation({ mutationFn: updateFeatureMenu });

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const allSelected = FEATURE_IDS.every(
    (id) => draft.features[id]?.enabled === true,
  );

  function changeFeature(id: FeatureId, enabled: boolean) {
    setDraft((current) => buildFeatureMenu(current, { [id]: enabled }));
  }

  function toggleAll() {
    const enabled = !allSelected;
    const changes = Object.fromEntries(
      FEATURE_IDS.map((id) => [id, enabled]),
    ) as Partial<Record<FeatureId, boolean>>;
    setDraft((current) => buildFeatureMenu(current, changes));
  }

  function errorMessage(error: unknown) {
    if (error instanceof Error && error.message === "systemWebMenuNotFound") {
      return t("adminCenter.ui.systemWebMenuNotFound");
    }
    return getErrorMessage(error, t("adminCenter.ui.saveFailed"));
  }

  async function persist(menu: FeatureMenu, successKey: string) {
    try {
      await saveMutation.mutateAsync(menu);
      setDraft(menu);
      setBaseline(menu);
      toast.success(t(successKey));
      try {
        await refreshPublicConfig();
      } catch (error) {
        toast.warning(getErrorMessage(error, t("auth.publicConfigUnavailable")));
      }
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function save() {
    if (!dirty) {
      toast.info(t("adminCenter.featureManagement.noChanges"));
      return;
    }
    await persist(draft, "adminCenter.featureManagement.saveSuccess");
  }

  async function reset() {
    const resetMenu = resetFeatureMenu(draft);
    await persist(resetMenu, "adminCenter.featureManagement.resetSuccess");
    setResetOpen(false);
  }

  function renderGroup(group: keyof typeof FEATURE_GROUP_IDS) {
    const ids = FEATURE_GROUP_IDS[group];
    return (
      <Card className="overflow-hidden" key={group}>
        <div className="border-b bg-muted/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {t(`adminCenter.featureManagement.groupName.${group}`)}
            </h2>
            <Badge variant="outline">
              {t("adminCenter.featureManagement.moduleCount", { count: ids.length })}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t(`adminCenter.featureManagement.groupDescription.${group}`)}
          </p>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2 sm:p-6">
          {ids.map((id) => {
            const Icon = FEATURE_ICONS[id];
            const enabled = draft.features[id]?.enabled === true;
            const name = t(`adminCenter.feature.${id}.name`);
            return (
              <div
                className={cn(
                  "flex min-h-36 gap-4 rounded-xl border p-4 transition-colors",
                  enabled ? "border-primary/40 bg-primary/5" : "bg-card",
                )}
                key={id}
              >
                <span
                  className={cn(
                    "h-fit rounded-xl p-3",
                    enabled
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-6">{name}</h3>
                    <Switch
                      aria-label={name}
                      checked={enabled}
                      disabled={saveMutation.isPending}
                      onCheckedChange={(checked) => changeFeature(id, checked)}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(`adminCenter.feature.${id}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={
          <>
            {dirty ? (
              <Badge className="self-center" variant="secondary">
                {t("adminCenter.ui.pendingChanges")}
              </Badge>
            ) : null}
            <Button
              disabled={saveMutation.isPending || (configLoading && !publicConfig)}
              onClick={toggleAll}
              variant="outline"
            >
              {allSelected
                ? t("adminCenter.featureManagement.deselectAll")
                : t("adminCenter.featureManagement.selectAll")}
            </Button>
            <Button
              disabled={saveMutation.isPending || (configLoading && !publicConfig)}
              onClick={() => setResetOpen(true)}
              variant="outline"
            >
              <RefreshCcw className="size-4" />
              {t("adminCenter.featureManagement.reset")}
            </Button>
            <Button
              disabled={saveMutation.isPending || (configLoading && !publicConfig)}
              onClick={() => void save()}
            >
              {saveMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saveMutation.isPending
                ? t("adminCenter.featureManagement.saving")
                : t("adminCenter.featureManagement.save")}
            </Button>
          </>
        }
        description={t("adminCenter.ui.descriptions.features")}
        eyebrow={t("nav.groups.admin")}
        title={t("nav.features")}
      />

      {configError ? (
        <Alert variant={publicConfig ? "info" : "destructive"}>
          <AlertTitle>{t("auth.publicConfigUnavailable")}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{configError}</span>
            <Button
              disabled={configLoading}
              onClick={() => void refreshPublicConfig().catch(() => undefined)}
              size="sm"
              variant="outline"
            >
              {t("common.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {configLoading && !publicConfig ? (
        <Card className="flex min-h-64 items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-primary" />
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {renderGroup("featureManagement")}
          {renderGroup("voiceManagement")}
        </div>
      )}

      <ConfirmDialog
        cancelLabel={t("adminCenter.featureManagement.cancel")}
        confirmLabel={t("adminCenter.featureManagement.confirm")}
        description={t("adminCenter.featureManagement.resetConfirm")}
        onConfirm={reset}
        onOpenChange={setResetOpen}
        open={resetOpen}
        pending={saveMutation.isPending}
        title={t("adminCenter.featureManagement.reset")}
        variant="destructive"
      />
    </div>
  );
}

export function FeatureManagementPage() {
  const auth = useAuth();
  const menuKey = JSON.stringify(auth.publicConfig?.systemWebMenu || null);
  return <FeatureManagementEditor auth={auth} key={menuKey} />;
}
