import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, History, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteAgentSnapshot,
  getAgentSnapshot,
  getAgentSnapshots,
  restoreAgentSnapshot,
} from "@/features/agents/agent-api";
import {
  formatSnapshotValue,
  snapshotFieldValues,
} from "@/features/agents/agent-utils";
import type { AgentSnapshot } from "@/features/agents/types";

interface SnapshotDialogProps {
  agentId: string;
  currentVersionNo?: number;
  onOpenChange: (open: boolean) => void;
  onRestored: () => void;
  open: boolean;
}

function sourceLabel(source: string | undefined, t: (key: string) => string) {
  const normalized = source === "restore" || source === "initial" || source === "current"
    ? source
    : "config";
  return t(`agentCenter.agentSnapshot.source.${normalized}`);
}

export function SnapshotDialog({
  agentId,
  currentVersionNo,
  onOpenChange,
  onRestored,
  open,
}: SnapshotDialogProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState("");
  const [restoreCandidate, setRestoreCandidate] = useState<AgentSnapshot | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AgentSnapshot | null>(null);
  const snapshotsQuery = useQuery({
    enabled: open,
    queryFn: () => getAgentSnapshots(agentId, { limit: 10, page }),
    queryKey: ["agent-snapshots", agentId, page],
  });
  const detailQuery = useQuery({
    enabled: open && Boolean(detailId),
    queryFn: () => getAgentSnapshot(agentId, detailId),
    queryKey: ["agent-snapshot", agentId, detailId],
  });
  const restoreMutation = useMutation({
    mutationFn: async (snapshot: AgentSnapshot) => {
      if (!snapshot.id || !snapshot.currentStateToken) {
        throw new Error(t("agentCenter.agentSnapshot.detailFailed"));
      }
      await restoreAgentSnapshot(
        agentId,
        snapshot.id,
        snapshot.currentStateToken,
      );
    },
    onSuccess: async () => {
      setRestoreCandidate(null);
      setDetailId("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent", agentId] }),
        queryClient.invalidateQueries({ queryKey: ["agent-snapshots", agentId] }),
      ]);
      toast.success(t("agentCenter.agentSnapshot.restoreSuccess"));
      onRestored();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (snapshot: AgentSnapshot) => {
      if (!snapshot.id) return;
      await deleteAgentSnapshot(agentId, snapshot.id);
    },
    onSuccess: async () => {
      setDeleteCandidate(null);
      await queryClient.invalidateQueries({ queryKey: ["agent-snapshots", agentId] });
      toast.success(t("agentCenter.agentSnapshot.deleteSuccess"));
    },
  });

  const detail = detailQuery.data;
  const diff = snapshotFieldValues(
    detail?.snapshotData,
    detail?.currentSnapshotData,
    detail?.fieldOrder,
  );

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              {t("agentCenter.agentSnapshot.title")}
            </DialogTitle>
            <DialogDescription>
              {currentVersionNo
                ? t("agentCenter.agentSnapshot.currentVersion", { version: currentVersionNo })
                : t("agentCenter.roleConfig.restartNotice")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 border-b bg-card text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">{t("agentCenter.agentSnapshot.version")}</th>
                  <th className="px-5 py-3">{t("agentCenter.agentSnapshot.createdAt")}</th>
                  <th className="px-5 py-3">{t("agentCenter.agentSnapshot.source.$value")}</th>
                  <th className="px-5 py-3">{t("agentCenter.agentSnapshot.changedFields")}</th>
                  <th className="px-5 py-3 text-right">{t("agentCenter.agentSnapshot.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {snapshotsQuery.isPending ? (
                  <tr><td className="h-48 text-center" colSpan={5}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr>
                ) : (snapshotsQuery.data?.list || []).length === 0 ? (
                  <tr><td className="h-48 text-center text-muted-foreground" colSpan={5}>{t("agentCenter.agentSnapshot.empty")}</td></tr>
                ) : (snapshotsQuery.data?.list || []).map((snapshot) => (
                  <tr key={snapshot.id}>
                    <td className="px-5 py-3 font-medium">v{snapshot.versionNo || "—"}</td>
                    <td className="px-5 py-3">{snapshot.createdAt ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(snapshot.createdAt)) : "—"}</td>
                    <td className="px-5 py-3">{sourceLabel(snapshot.source, t)}</td>
                    <td className="max-w-xs px-5 py-3 text-muted-foreground">{snapshot.changedFields?.join(", ") || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button aria-label={t("agentCenter.agentSnapshot.view")} onClick={() => setDetailId(snapshot.id || "")} size="icon" type="button" variant="ghost"><Eye className="size-4" /></Button>
                        <Button aria-label={t("agentCenter.agentSnapshot.restore")} onClick={() => setDetailId(snapshot.id || "")} size="icon" type="button" variant="ghost"><RotateCcw className="size-4" /></Button>
                        <Button aria-label={t("agentCenter.agentSnapshot.delete")} onClick={() => setDeleteCandidate(snapshot)} size="icon" type="button" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            label="{{page}} / {{pages}} · {{total}}"
            nextLabel={t("common.next")}
            onPageChange={setPage}
            onPageSizeChange={() => undefined}
            page={page}
            pageSize={10}
            pageSizeLabel={t("common.pageSize")}
            previousLabel={t("common.previous")}
            showPageSize={false}
            total={snapshotsQuery.data?.total || 0}
          />
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(next) => !next && setDetailId("")} open={Boolean(detailId)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{t("agentCenter.agentSnapshot.restorePreviewTitle")}</DialogTitle>
            <DialogDescription>
              {detail?.versionNo ? `v${detail.versionNo}` : t("common.loading")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[62vh] overflow-auto px-6">
            {detailQuery.isPending ? (
              <LoaderCircle className="mx-auto my-24 size-6 animate-spin" />
            ) : detailQuery.isError ? (
              <p className="my-20 text-center text-sm text-destructive">
                {getErrorMessage(detailQuery.error, t("agentCenter.agentSnapshot.detailFailed"))}
              </p>
            ) : (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">{t("agentCenter.agentSnapshot.configValue")}</th>
                    <th className="px-3 py-3">{t("agentCenter.agentSnapshot.beforeRestore")}</th>
                    <th className="px-3 py-3">{t("agentCenter.agentSnapshot.afterRestore")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {diff.map((item) => (
                    <tr key={item.field}>
                      <td className="px-3 py-3 font-medium">{t(`agentCenter.agentSnapshot.field.${item.field}`, { defaultValue: item.field })}</td>
                      <td className="max-w-sm whitespace-pre-wrap break-all px-3 py-3 text-muted-foreground">{formatSnapshotValue(item.current)}</td>
                      <td className="max-w-sm whitespace-pre-wrap break-all px-3 py-3">{formatSnapshotValue(item.snapshot)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailId("")} type="button" variant="outline">{t("common.close")}</Button>
            <Button
              disabled={!detail?.currentStateToken}
              onClick={() => detail && setRestoreCandidate(detail)}
              type="button"
              variant="destructive"
            >
              <RotateCcw className="size-4" />
              {t("agentCenter.agentSnapshot.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("agentCenter.agentSnapshot.restore")}
        description={`${t("agentCenter.agentSnapshot.restoreConfirm", { version: restoreCandidate?.versionNo || "" })} ${t("agentCenter.agentSnapshot.unsavedChangesWarning")} ${t("agentCenter.agentSnapshot.restoreMemoryDestructiveWarning")}`}
        onConfirm={async () => {
          if (!restoreCandidate) return;
          try {
            await restoreMutation.mutateAsync(restoreCandidate);
          } catch (error) {
            toast.error(getErrorMessage(error, t("agentCenter.agentSnapshot.restoreFailed")));
          }
        }}
        onOpenChange={(next) => !next && setRestoreCandidate(null)}
        open={Boolean(restoreCandidate)}
        pending={restoreMutation.isPending}
        title={t("agentCenter.agentSnapshot.confirmRestore")}
        variant="destructive"
      />
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("agentCenter.agentSnapshot.delete")}
        description={t("agentCenter.agentSnapshot.deleteConfirm")}
        onConfirm={async () => {
          if (!deleteCandidate) return;
          try {
            await deleteMutation.mutateAsync(deleteCandidate);
          } catch (error) {
            toast.error(getErrorMessage(error, t("agentCenter.agentSnapshot.deleteFailed")));
          }
        }}
        onOpenChange={(next) => !next && setDeleteCandidate(null)}
        open={Boolean(deleteCandidate)}
        pending={deleteMutation.isPending}
        title={t("agentCenter.agentSnapshot.delete")}
        variant="destructive"
      />
    </>
  );
}
