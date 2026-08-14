import { Database, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictTypes,
  getDictData,
  getDictTypes,
  updateDictData,
  updateDictType,
} from "@/features/admin/admin-api";
import { DictDataDialog } from "@/features/admin/dict-data-dialog";
import { DictTypeDialog } from "@/features/admin/dict-type-dialog";
import type { DictData, DictDataInput, DictType, DictTypeInput } from "@/features/admin/types";
import { cn } from "@/lib/utils";

export function DictManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
  const [selectedData, setSelectedData] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [dictLabel, setDictLabel] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingType, setEditingType] = useState<DictType | null | undefined>();
  const [editingData, setEditingData] = useState<DictData | null | undefined>();
  const [deleteTypeIds, setDeleteTypeIds] = useState<number[]>([]);
  const [deleteDataIds, setDeleteDataIds] = useState<number[]>([]);

  const typesQuery = useQuery({ queryFn: () => getDictTypes(), queryKey: ["admin-dict-types"] });
  const types = typesQuery.data?.list || [];
  const effectiveTypeId = types.some((type) => type.id === selectedTypeId)
    ? selectedTypeId
    : types.find((type) => type.id !== undefined)?.id || 0;
  const selectedType = types.find((type) => type.id === effectiveTypeId);
  const dataQuery = useQuery({
    enabled: effectiveTypeId > 0,
    queryFn: () => getDictData({ dictLabel, dictTypeId: effectiveTypeId, limit: pageSize, page }),
    queryKey: ["admin-dict-data", effectiveTypeId, dictLabel, page, pageSize],
  });
  const values = dataQuery.data?.list || [];
  const invalidateTypes = () => queryClient.invalidateQueries({ queryKey: ["admin-dict-types"] });
  const invalidateData = () => queryClient.invalidateQueries({ queryKey: ["admin-dict-data"] });
  const saveTypeMutation = useMutation({ mutationFn: (input: DictTypeInput) => input.id !== undefined ? updateDictType(input) : createDictType(input) });
  const saveDataMutation = useMutation({ mutationFn: (input: DictDataInput) => input.id !== undefined ? updateDictData(input) : createDictData(input) });
  const deleteTypesMutation = useMutation({ mutationFn: deleteDictTypes });
  const deleteDataMutation = useMutation({ mutationFn: deleteDictData });

  async function saveType(input: DictTypeInput) {
    try {
      await saveTypeMutation.mutateAsync(input);
      setEditingType(undefined);
      await invalidateTypes();
      toast.success(t("adminCenter.dictManagement.saveSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.dictManagement.getDictDataFailed")));
    }
  }

  async function saveData(input: DictDataInput) {
    try {
      await saveDataMutation.mutateAsync(input);
      setEditingData(undefined);
      await invalidateData();
      toast.success(t("adminCenter.dictManagement.saveSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.dictManagement.getDictDataFailed")));
    }
  }

  async function removeTypes() {
    if (!deleteTypeIds.length) return;
    try {
      await deleteTypesMutation.mutateAsync(deleteTypeIds);
      if (deleteTypeIds.includes(effectiveTypeId)) setSelectedTypeId(0);
      setDeleteTypeIds([]);
      setSelectedTypes(new Set());
      setSelectedData(new Set());
      await Promise.all([invalidateTypes(), invalidateData()]);
      toast.success(t("adminCenter.dictManagement.deleteSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.dictManagement.getDictDataFailed")));
    }
  }

  async function removeData() {
    if (!deleteDataIds.length) return;
    try {
      await deleteDataMutation.mutateAsync(deleteDataIds);
      if (values.length <= deleteDataIds.length && page > 1) setPage((current) => current - 1);
      setDeleteDataIds([]);
      setSelectedData(new Set());
      await invalidateData();
      toast.success(t("adminCenter.dictManagement.deleteSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.dictManagement.getDictDataFailed")));
    }
  }

  const validTypes = types.filter((type): type is DictType & { id: number } => type.id !== undefined);
  const validData = values.filter((item): item is DictData & { id: number } => item.id !== undefined);
  const allTypesSelected = validTypes.length > 0 && validTypes.every((type) => selectedTypes.has(type.id));
  const allDataSelected = validData.length > 0 && validData.every((item) => selectedData.has(item.id));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading actions={<Button onClick={() => setEditingType(null)}><Plus className="size-4" />{t("adminCenter.dictManagement.addDictType")}</Button>} description={t("adminCenter.ui.descriptions.dictionary")} eyebrow={t("nav.groups.admin")} title={t("adminCenter.dictManagement.pageTitle")} />
      {(typesQuery.isError || dataQuery.isError) ? <Alert variant="destructive"><AlertTitle>{t("adminCenter.dictManagement.getDictDataFailed")}</AlertTitle><AlertDescription>{getErrorMessage(typesQuery.error || dataQuery.error, t("adminCenter.dictManagement.getDictDataFailed"))}</AlertDescription></Alert> : null}
      <div className="grid gap-5 lg:grid-cols-[minmax(250px,320px)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b p-4"><div><p className="font-semibold">{t("adminCenter.dictManagement.dictTypeCategory")}</p><p className="mt-1 text-xs text-muted-foreground">{types.length} {t("adminCenter.dictManagement.dictTypeName")}</p></div><div className="flex gap-1"><Button aria-label={t("adminCenter.dictManagement.addDictType")} onClick={() => setEditingType(null)} size="icon" variant="ghost"><Plus className="size-4" /></Button><Button aria-label={t("adminCenter.dictManagement.batchDeleteDictType")} disabled={!selectedTypes.size} onClick={() => setDeleteTypeIds([...selectedTypes])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></div>
          <div className="flex items-center gap-3 border-b px-4 py-3"><Checkbox aria-label={t("adminCenter.dictManagement.selectAll")} checked={allTypesSelected} onChange={(event) => setSelectedTypes(event.target.checked ? new Set(validTypes.map((type) => type.id)) : new Set())} /><span className="text-xs text-muted-foreground">{t("adminCenter.ui.selected", { count: selectedTypes.size })}</span></div>
          <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
            {typesQuery.isPending ? <LoaderCircle className="mx-auto my-16 size-5 animate-spin" /> : validTypes.length ? validTypes.map((type) => <div className={cn("flex items-center gap-3 rounded-xl border p-3 transition-colors", effectiveTypeId === type.id ? "border-primary bg-primary/5" : "hover:bg-muted/30")} key={type.id}><Checkbox aria-label={type.dictName || type.dictType} checked={selectedTypes.has(type.id)} onChange={(event) => setSelectedTypes((current) => { const next = new Set(current); if (event.target.checked) next.add(type.id); else next.delete(type.id); return next; })} /><button className="min-w-0 flex-1 text-left" onClick={() => { setSelectedTypeId(type.id); setSelectedData(new Set()); setPage(1); }} type="button"><span className="block truncate text-sm font-medium">{type.dictName || "—"}</span><span className="block truncate font-mono text-xs text-muted-foreground">{type.dictType || "—"}</span></button><Button aria-label={t("adminCenter.dictManagement.editDictType")} onClick={() => setEditingType(type)} size="icon" variant="ghost"><Pencil className="size-4" /></Button></div>) : <div className="py-16 text-center text-sm text-muted-foreground"><Database className="mx-auto mb-3 size-8" />{t("common.noData")}</div>}
          </div>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="font-semibold">{selectedType?.dictName || t("adminCenter.dictManagement.selectDictTypeFirst")}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{selectedType?.dictType || "—"}</p></div><form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setSelectedData(new Set()); setDictLabel(search.trim()); }}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("adminCenter.dictManagement.searchPlaceholder")} className="pl-9" disabled={!effectiveTypeId} onChange={(event) => setSearch(event.target.value)} placeholder={t("adminCenter.dictManagement.searchPlaceholder")} value={search} /></div><Button disabled={!effectiveTypeId} type="submit" variant="outline">{t("adminCenter.dictManagement.search")}</Button></form></div>
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3"><Checkbox aria-label={t("adminCenter.dictManagement.selectAll")} checked={allDataSelected} disabled={!validData.length} onChange={(event) => setSelectedData(event.target.checked ? new Set(validData.map((item) => item.id)) : new Set())} /><span className="text-sm text-muted-foreground">{t("adminCenter.ui.selected", { count: selectedData.size })}</span><Button disabled={!effectiveTypeId} onClick={() => setEditingData(null)} size="sm" variant="outline"><Plus className="size-4" />{t("adminCenter.dictManagement.addDictData")}</Button><Button disabled={!selectedData.size} onClick={() => setDeleteDataIds([...selectedData])} size="sm" variant="outline"><Trash2 className="size-4 text-destructive" />{t("adminCenter.dictManagement.batchDeleteDictData")}</Button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("adminCenter.dictManagement.dictLabel")}</th><th className="px-4 py-3">{t("adminCenter.dictManagement.dictValue")}</th><th className="px-4 py-3">{t("adminCenter.dictManagement.sort")}</th><th className="px-4 py-3 text-right">{t("adminCenter.dictManagement.operation")}</th></tr></thead><tbody className="divide-y">
            {dataQuery.isPending ? <tr><td className="h-56 text-center" colSpan={5}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : validData.length ? validData.map((item) => <tr className="hover:bg-muted/20" key={item.id}><td className="px-4 py-3"><Checkbox aria-label={item.dictLabel || String(item.id)} checked={selectedData.has(item.id)} onChange={(event) => setSelectedData((current) => { const next = new Set(current); if (event.target.checked) next.add(item.id); else next.delete(item.id); return next; })} /></td><td className="px-4 py-3 font-medium">{item.dictLabel || "—"}</td><td className="px-4 py-3 font-mono text-xs">{item.dictValue || "—"}</td><td className="px-4 py-3">{item.sort ?? 0}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button aria-label={t("adminCenter.dictManagement.edit")} onClick={() => setEditingData(item)} size="icon" variant="ghost"><Pencil className="size-4" /></Button><Button aria-label={t("adminCenter.dictManagement.delete")} onClick={() => setDeleteDataIds([item.id])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>) : <tr><td className="h-56 text-center text-muted-foreground" colSpan={5}>{t("common.noData")}</td></tr>}
          </tbody></table></div>
          <Pagination label={t("adminCenter.dictManagement.totalRecords", { total: dataQuery.data?.total || 0 })} nextLabel={t("adminCenter.dictManagement.nextPage")} onPageChange={(nextPage) => { setPage(nextPage); setSelectedData(new Set()); }} onPageSizeChange={(size) => { setPageSize(size); setPage(1); setSelectedData(new Set()); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("adminCenter.dictManagement.prevPage")} total={dataQuery.data?.total || 0} />
        </Card>
      </div>
      <DictTypeDialog dictionaryType={editingType || null} onOpenChange={(open) => !open && setEditingType(undefined)} onSubmit={saveType} open={editingType !== undefined} pending={saveTypeMutation.isPending} />
      <DictDataDialog data={editingData || null} dictTypeId={effectiveTypeId} onOpenChange={(open) => !open && setEditingData(undefined)} onSubmit={saveData} open={editingData !== undefined && effectiveTypeId > 0} pending={saveDataMutation.isPending} />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("adminCenter.dictManagement.confirm")} description={t("adminCenter.dictManagement.confirmDeleteDictType")} onConfirm={removeTypes} onOpenChange={(open) => !open && setDeleteTypeIds([])} open={deleteTypeIds.length > 0} pending={deleteTypesMutation.isPending} title={t("adminCenter.dictManagement.batchDeleteDictType")} variant="destructive" />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("adminCenter.dictManagement.confirm")} description={deleteDataIds.length === 1 ? t("adminCenter.dictManagement.confirmDeleteDictData") : t("adminCenter.dictManagement.confirmBatchDeleteDictData", { count: deleteDataIds.length })} onConfirm={removeData} onOpenChange={(open) => !open && setDeleteDataIds([])} open={deleteDataIds.length > 0} pending={deleteDataMutation.isPending} title={t("adminCenter.dictManagement.batchDeleteDictData")} variant="destructive" />
    </div>
  );
}
