import {
  Copy,
  LoaderCircle,
  RadioTower,
  RefreshCcw,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { emitServerAction, getServers } from "@/features/admin/admin-api";
import type { ServerActionInput } from "@/features/admin/types";

interface PendingCommand extends ServerActionInput {
  action: "restart" | "update_config";
}

export function ServerSidePage() {
  const { t } = useTranslation();
  const [command, setCommand] = useState<PendingCommand | null>(null);
  const serversQuery = useQuery({
    queryFn: getServers,
    queryKey: ["admin-servers"],
  });
  const actionMutation = useMutation({ mutationFn: emitServerAction });

  const isRestart = command?.action === "restart";
  const dialogTitle = t(
    isRestart
      ? "adminCenter.serverSideManager.restartServer"
      : "adminCenter.serverSideManager.updateConfigTitle",
  );
  const dialogDescription = t(
    isRestart
      ? "adminCenter.serverSideManager.confirmRestart"
      : "adminCenter.serverSideManager.confirmUpdateConfig",
  );
  const dialogConfirm = t(
    isRestart
      ? "adminCenter.serverSideManager.restart"
      : "adminCenter.serverSideManager.updateConfig",
  );

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(t("adminCenter.common.copySuccess"));
    } catch {
      toast.error(t("adminCenter.common.copyFailed"));
    }
  }

  async function runCommand() {
    if (!command) return;
    try {
      const completed = await actionMutation.mutateAsync(command);
      if (!completed) throw new Error(t("adminCenter.serverSideManager.operationFailed"));
      toast.success(
        t(
          command.action === "restart"
            ? "adminCenter.serverSideManager.restartSuccess"
            : "adminCenter.serverSideManager.updateConfigSuccess",
        ),
      );
      setCommand(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t("adminCenter.serverSideManager.operationFailed"),
        ),
      );
    }
  }

  const servers = serversQuery.data || [];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={
          <Button
            disabled={serversQuery.isFetching}
            onClick={() => void serversQuery.refetch()}
            variant="outline"
          >
            <RefreshCcw
              className={serversQuery.isFetching ? "size-4 animate-spin" : "size-4"}
            />
            {t("adminCenter.ui.refresh")}
          </Button>
        }
        description={t("adminCenter.ui.descriptions.server")}
        eyebrow={t("nav.groups.admin")}
        title={t("adminCenter.serverSideManager.pageTitle")}
      />

      {serversQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("adminCenter.serverSideManager.getServerListFailed")}</AlertTitle>
          <AlertDescription>
            {getErrorMessage(
              serversQuery.error,
              t("adminCenter.serverSideManager.getServerListFailed"),
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      {serversQuery.isPending ? (
        <Card className="flex min-h-64 items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-primary" />
        </Card>
      ) : servers.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {servers.map((address) => (
            <Card className="overflow-hidden" key={address}>
              <div className="flex items-start gap-4 border-b p-5 sm:p-6">
                <span className="rounded-xl bg-primary/10 p-3 text-primary">
                  <RadioTower className="size-6" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adminCenter.serverSideManager.wsAddress")}
                  </p>
                  <p className="break-all font-mono text-sm font-medium">{address}</p>
                </div>
                <Button
                  aria-label={t("adminCenter.common.copyAddress")}
                  onClick={() => void copyAddress(address)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap justify-end gap-2 bg-muted/20 p-4 sm:px-6">
                <Button
                  disabled={actionMutation.isPending}
                  onClick={() => setCommand({ action: "restart", targetWs: address })}
                  variant="outline"
                >
                  <RotateCcw className="size-4" />
                  {t("adminCenter.serverSideManager.restart")}
                </Button>
                <Button
                  disabled={actionMutation.isPending}
                  onClick={() => setCommand({ action: "update_config", targetWs: address })}
                >
                  <Settings2 className="size-4" />
                  {t("adminCenter.serverSideManager.updateConfig")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
          <RadioTower className="size-10" />
          <p className="max-w-lg text-sm">{t("adminCenter.ui.noServers")}</p>
        </Card>
      )}

      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={dialogConfirm}
        description={dialogDescription}
        onConfirm={runCommand}
        onOpenChange={(open) => !open && setCommand(null)}
        open={command !== null}
        pending={actionMutation.isPending}
        title={dialogTitle}
        variant={isRestart ? "destructive" : "default"}
      />
    </div>
  );
}
