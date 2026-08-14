import { Eye, EyeOff, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createParam, deleteParams, getParams, updateParam } from "@/features/admin/admin-api";
import { isSensitiveParamCode, maskSensitiveValue, normalizeParamValueType } from "@/features/admin/admin-utils";
import { ParamDialog } from "@/features/admin/param-dialog";
import type { Param, ParamInput } from "@/features/admin/types";

export function ParamsManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [paramCode, setParamCode] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Param | null | undefined>();
  const [deleteTargets, setDeleteTargets] = useState<Param[]>([]);

  const paramsQuery = useQuery({
    queryFn: () => getParams({ limit: pageSize, page, paramCode }),
    queryKey: ["admin-params", paramCode, page, pageSize],
  });
  const parameters = paramsQuery.data?.list || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-params"] });
  const saveMutation = useMutation({ mutationFn: (input: ParamInput) => input.id !== undefined ? updateParam(input) : createParam(input) });
  const deleteMutation = useMutation({ mutationFn: deleteParams });

  async function save(input: ParamInput) {
    const updating = input.id !== undefined;
    try {
      await saveMutation.mutateAsync(input);
      setEditing(undefined);
      await invalidate();
      toast.success(t(updating ? "adminCenter.paramManagement.updateSuccess" : "adminCenter.paramManagement.addSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t(updating ? "adminCenter.paramManagement.updateFailed" : "adminCenter.paramManagement.addFailed")));
    }
  }

  async function remove() {
    const ids = deleteTargets.flatMap((parameter) => parameter.id !== undefined ? [String(parameter.id)] : []);
    if (!ids.length) return;
    try {
      await deleteMutation.mutateAsync(ids);
      if (parameters.length <= ids.length && page > 1) setPage((current) => current - 1);
      setDeleteTargets([]);
      setSelected(new Set());
      await invalidate();
      toast.success(t("adminCenter.paramManagement.batchDeleteSuccess", { paramCount: ids.length }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.paramManagement.deleteFailed")));
    }
  }

  const identifiable = parameters.filter((parameter): parameter is Param & { id: number } => parameter.id !== undefined);
  const allSelected = identifiable.length > 0 && identifiable.every((parameter) => selected.has(String(parameter.id)));
  const selectedParameters = identifiable.filter((parameter) => selected.has(String(parameter.id)));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading actions={<Button onClick={() => setEditing(null)}><Plus className="size-4" />{t("adminCenter.paramManagement.add")}</Button>} description={t("adminCenter.ui.descriptions.parameters")} eyebrow={t("nav.groups.admin")} title={t("adminCenter.paramManagement.pageTitle")} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3"><Checkbox aria-label={t("adminCenter.paramManagement.selectAll")} checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(identifiable.map((parameter) => String(parameter.id))) : new Set())} /><span className="text-sm text-muted-foreground">{t("adminCenter.ui.selected", { count: selected.size })}</span><Button disabled={!selectedParameters.length} onClick={() => setDeleteTargets(selectedParameters)} size="sm" variant="outline"><Trash2 className="size-4 text-destructive" />{t("adminCenter.paramManagement.delete")}</Button></div>
        <form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setSelected(new Set()); setParamCode(search.trim()); }}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("adminCenter.paramManagement.searchPlaceholder")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("adminCenter.paramManagement.searchPlaceholder")} value={search} /></div><Button type="submit" variant="outline">{t("adminCenter.paramManagement.search")}</Button></form>
      </div>
      {paramsQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("adminCenter.paramManagement.getParamsListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(paramsQuery.error, t("adminCenter.paramManagement.getParamsListFailed"))}</AlertDescription></Alert> : null}
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("adminCenter.paramManagement.paramCode")}</th><th className="px-4 py-3">{t("adminCenter.paramManagement.paramValue")}</th><th className="px-4 py-3">{t("adminCenter.paramDialog.valueType")}</th><th className="px-4 py-3">{t("adminCenter.paramManagement.remark")}</th><th className="px-4 py-3 text-right">{t("adminCenter.paramManagement.operation")}</th></tr></thead><tbody className="divide-y">
        {paramsQuery.isPending ? <tr><td className="h-56 text-center" colSpan={6}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : parameters.length ? parameters.map((parameter) => { const id = parameter.id === undefined ? parameter.paramCode || "" : String(parameter.id); const sensitive = isSensitiveParamCode(parameter.paramCode || ""); const visible = revealed.has(id); return <tr className="hover:bg-muted/20" key={id}><td className="px-4 py-3"><Checkbox aria-label={parameter.paramCode} checked={Boolean(parameter.id !== undefined && selected.has(String(parameter.id)))} disabled={parameter.id === undefined} onChange={(event) => setSelected((current) => { const next = new Set(current); if (parameter.id !== undefined) { const key = String(parameter.id); if (event.target.checked) next.add(key); else next.delete(key); } return next; })} /></td><td className="px-4 py-3 font-mono text-xs font-medium">{parameter.paramCode || "—"}</td><td className="max-w-lg px-4 py-3"><div className="flex items-center gap-2"><code className="max-w-md truncate rounded bg-muted px-2 py-1 text-xs" title={visible || !sensitive ? parameter.paramValue : undefined}>{sensitive && !visible ? maskSensitiveValue(parameter.paramValue || "") : parameter.paramValue || "—"}</code>{sensitive ? <Button aria-label={t(visible ? "adminCenter.paramManagement.hide" : "adminCenter.paramManagement.view")} onClick={() => setRevealed((current) => { const next = new Set(current); if (visible) next.delete(id); else next.add(id); return next; })} size="icon" variant="ghost">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button> : null}</div></td><td className="px-4 py-3"><Badge variant="secondary">{normalizeParamValueType(parameter.valueType)}</Badge></td><td className="max-w-xs truncate px-4 py-3 text-muted-foreground" title={parameter.remark}>{parameter.remark || "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button aria-label={t("adminCenter.paramManagement.edit")} onClick={() => setEditing(parameter)} size="icon" variant="ghost"><Pencil className="size-4" /></Button><Button aria-label={t("adminCenter.paramManagement.delete")} disabled={parameter.id === undefined} onClick={() => setDeleteTargets([parameter])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>; }) : <tr><td className="h-56 text-center text-muted-foreground" colSpan={6}>{t("common.noData")}</td></tr>}
      </tbody></table></div><Pagination label={t("adminCenter.paramManagement.totalRecords", { total: paramsQuery.data?.total || 0 })} nextLabel={t("adminCenter.paramManagement.nextPage")} onPageChange={(nextPage) => { setPage(nextPage); setSelected(new Set()); }} onPageSizeChange={(size) => { setPageSize(size); setPage(1); setSelected(new Set()); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("adminCenter.paramManagement.prevPage")} total={paramsQuery.data?.total || 0} /></Card>
      <ParamDialog onOpenChange={(open) => !open && setEditing(undefined)} onSubmit={save} open={editing !== undefined} parameter={editing || null} pending={saveMutation.isPending} />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("adminCenter.paramManagement.delete")} description={t("adminCenter.paramManagement.confirmBatchDelete", { paramCount: deleteTargets.length })} onConfirm={remove} onOpenChange={(open) => !open && setDeleteTargets([])} open={deleteTargets.length > 0} pending={deleteMutation.isPending} title={t("adminCenter.common.warning")} variant="destructive" />
    </div>
  );
}
