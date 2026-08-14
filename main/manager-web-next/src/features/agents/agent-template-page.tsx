import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deleteAgentTemplate,
  deleteAgentTemplates,
  getAgentTemplatePage,
} from "@/features/agents/agent-api";
import type { AgentTemplate } from "@/features/agents/types";

function positive(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function AgentTemplatePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = positive(searchParams.get("page"), 1);
  const pageSize = positive(searchParams.get("limit"), 10);
  const search = searchParams.get("search") || "";
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<AgentTemplate[]>([]);
  const templatesQuery = useQuery({
    queryFn: () => getAgentTemplatePage({ agentName: search, limit: pageSize, page }),
    queryKey: ["agent-template-page", { page, pageSize, search }],
  });
  const templates = templatesQuery.data?.list || [];
  const allSelected = templates.length > 0 && templates.every((item) => item.id && selected.has(item.id));

  function updateQuery(patch: Partial<{ limit: number; page: number; search: string }>) {
    setSelected(new Set());
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (patch.limit !== undefined) next.set("limit", String(patch.limit));
      if (patch.page !== undefined) next.set("page", String(patch.page));
      if (patch.search !== undefined) {
        if (patch.search) next.set("search", patch.search);
        else next.delete("search");
      }
      return next;
    });
  }

  const deleteMutation = useMutation({
    mutationFn: async (targets: readonly AgentTemplate[]) => {
      const ids = targets.flatMap((target) => target.id ? [target.id] : []);
      if (ids.length > 1) await deleteAgentTemplates(ids);
      else if (ids[0]) await deleteAgentTemplate(ids[0]);
    },
    onSuccess: async (_data, targets) => {
      setDeleteTargets([]);
      setSelected(new Set());
      await queryClient.invalidateQueries({ queryKey: ["agent-template-page"] });
      toast.success(t(targets.length > 1
        ? "agentCenter.agentTemplateManagement.batchDeleteSuccess"
        : "agentCenter.agentTemplateManagement.deleteSuccess"));
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={<Button asChild><Link to="/template-quick-config"><Plus className="size-4" />{t("agentCenter.agentTemplateManagement.createTemplate")}</Link></Button>}
        description={t("agentCenter.templateQuickConfig.agentSettings.systemPromptPlaceholder")}
        title={t("agentCenter.agentTemplateManagement.title")}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex w-full max-w-lg gap-2"
            key={search}
            onSubmit={(event) => {
              event.preventDefault();
              updateQuery({ page: 1, search: String(new FormData(event.currentTarget).get("search") || "").trim() });
            }}
          >
            <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" defaultValue={search} name="search" placeholder={t("agentCenter.agentTemplateManagement.searchPlaceholder")} /></div>
            <Button type="submit" variant="secondary">{t("agentCenter.agentTemplateManagement.search")}</Button>
          </form>
          <Button disabled={selected.size === 0} onClick={() => setDeleteTargets(templates.filter((item) => item.id && selected.has(item.id)))} variant="outline"><Trash2 className="size-4" />{t("agentCenter.agentTemplateManagement.batchDelete")}</Button>
        </div>

        {templatesQuery.isError ? <div className="p-4"><Alert variant="destructive"><AlertTitle>{t("agentCenter.agentTemplateManagement.deleteBackendError")}</AlertTitle><AlertDescription>{getErrorMessage(templatesQuery.error, t("agentCenter.agentTemplateManagement.deleteBackendError"))}</AlertDescription></Alert></div> : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3"><Checkbox aria-label={t("agentCenter.agentTemplateManagement.selectAll")} checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(templates.flatMap((item) => item.id ? [item.id] : [])) : new Set())} /></th><th className="px-4 py-3">{t("agentCenter.agentTemplateManagement.serialNumber")}</th><th className="px-4 py-3">{t("agentCenter.agentTemplateManagement.templateName")}</th><th className="px-4 py-3">LLM</th><th className="px-4 py-3">TTS</th><th className="px-4 py-3 text-right">{t("agentCenter.agentTemplateManagement.action")}</th></tr></thead>
            <tbody className="divide-y">
              {templatesQuery.isPending ? <tr><td className="h-56 text-center" colSpan={6}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : templates.length === 0 ? <tr><td className="h-56 text-center text-muted-foreground" colSpan={6}>{t("common.noData")}</td></tr> : templates.map((template, index) => (
                <tr key={template.id}><td className="px-4 py-3"><Checkbox aria-label={template.agentName || template.id} checked={Boolean(template.id && selected.has(template.id))} onChange={(event) => setSelected((current) => { const next = new Set(current); if (template.id) { if (event.target.checked) next.add(template.id); else next.delete(template.id); } return next; })} /></td><td className="px-4 py-3 tabular-nums">{(page - 1) * pageSize + index + 1}</td><td className="px-4 py-3 font-medium">{template.agentName}</td><td className="px-4 py-3 text-muted-foreground">{template.llmModelName || template.llmModelId || "—"}</td><td className="px-4 py-3 text-muted-foreground">{template.ttsModelName || template.ttsModelId || "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button asChild size="icon" variant="ghost"><Link aria-label={t("agentCenter.agentTemplateManagement.editTemplate")} to={`/template-quick-config?templateId=${encodeURIComponent(template.id || "")}`}><Pencil className="size-4" /></Link></Button><Button aria-label={t("agentCenter.agentTemplateManagement.deleteTemplate")} onClick={() => setDeleteTargets([template])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination label="{{page}} / {{pages}} · {{total}}" nextLabel={t("common.next")} onPageChange={(next) => updateQuery({ page: next })} onPageSizeChange={(limit) => updateQuery({ limit, page: 1 })} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("common.previous")} total={templatesQuery.data?.total || 0} />
      </Card>

      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("agentCenter.agentTemplateManagement.deleteTemplate")}
        description={deleteTargets.length > 1 ? t("agentCenter.agentTemplateManagement.confirmBatchDelete", { count: deleteTargets.length }) : t("agentCenter.agentTemplateManagement.confirmSingleDelete", { name: deleteTargets[0]?.agentName || "" })}
        onConfirm={async () => { try { await deleteMutation.mutateAsync(deleteTargets); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.agentTemplateManagement.deleteFailed"))); } }}
        onOpenChange={(open) => !open && setDeleteTargets([])}
        open={deleteTargets.length > 0}
        pending={deleteMutation.isPending}
        title={t("agentCenter.agentTemplateManagement.deleteTemplate")}
        variant="destructive"
      />
    </div>
  );
}
