import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { FirmwareDialog } from "@/features/media/firmware-dialog";
import {
  createFirmware,
  deleteFirmware,
  getFirmwareDownloadUrl,
  getFirmwarePage,
  getFirmwareTypes,
  updateFirmware,
} from "@/features/media/media-api";
import { formatFileSize, formatMediaDate } from "@/features/media/media-utils";
import type { Firmware, FirmwareInput } from "@/features/media/types";

function download(url: string) {
  const anchor = document.createElement("a");
  anchor.download = "";
  anchor.href = url;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export function OtaPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingFirmware, setEditingFirmware] = useState<Firmware | null | undefined>();
  const [deleteTargets, setDeleteTargets] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState("");

  const firmwareQuery = useQuery({ queryFn: () => getFirmwarePage({ firmwareName: keyword, limit: pageSize, page }), queryKey: ["firmware", keyword, page, pageSize] });
  const typesQuery = useQuery({ queryFn: getFirmwareTypes, queryKey: ["dict-data", "FIRMWARE_TYPE"], staleTime: 5 * 60_000 });
  const firmware = firmwareQuery.data?.list || [];
  const typeNames = new Map((typesQuery.data || []).map((type) => [type.key, type.name]));
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["firmware"] });
  const saveMutation = useMutation({ mutationFn: ({ current, input }: { current: Firmware | null; input: FirmwareInput }) => current?.id ? updateFirmware(current.id, input) : createFirmware(input) });
  const deleteMutation = useMutation({ mutationFn: deleteFirmware });

  async function save(input: FirmwareInput) {
    const current = editingFirmware || null;
    try {
      await saveMutation.mutateAsync({ current, input });
      setEditingFirmware(undefined);
      await invalidate();
      toast.success(t(current ? "mediaCenter.otaManagement.updateSuccess" : "mediaCenter.otaManagement.addSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t(current ? "mediaCenter.otaManagement.updateFailed" : "mediaCenter.otaManagement.addFailed")));
    }
  }

  async function remove() {
    if (!deleteTargets.length) return;
    try {
      await deleteMutation.mutateAsync(deleteTargets);
      if (firmware.length <= deleteTargets.length && page > 1) setPage((current) => current - 1);
      const count = deleteTargets.length;
      setDeleteTargets([]);
      setSelected(new Set());
      await invalidate();
      toast.success(t("mediaCenter.otaManagement.batchDeleteSuccess", { paramCount: count }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.otaManagement.deleteFailed")));
    }
  }

  async function downloadFirmwareFile(item: Firmware) {
    if (!item.id) return;
    setDownloadingId(item.id);
    try {
      download(await getFirmwareDownloadUrl(item.id));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.otaManagement.getDownloadUrlFailed")));
    } finally {
      setDownloadingId("");
    }
  }

  const allSelected = firmware.length > 0 && firmware.every((item) => item.id && selected.has(item.id));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading actions={<Button onClick={() => setEditingFirmware(null)}><Plus className="size-4" />{t("mediaCenter.otaManagement.addNew")}</Button>} description={t("mediaCenter.firmwareDialog.uploadHint")} eyebrow={t("nav.ota")} title={t("mediaCenter.otaManagement.firmwareManagement")} />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><Checkbox aria-label={t("mediaCenter.otaManagement.selectAll")} checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(firmware.flatMap((item) => item.id ? [item.id] : [])) : new Set())} /><span className="text-sm text-muted-foreground">{selected.size}</span><Button disabled={selected.size === 0} onClick={() => setDeleteTargets([...selected])} size="sm" variant="outline"><Trash2 className="size-4" />{t("mediaCenter.otaManagement.delete")}</Button></div><form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setKeyword(search.trim()); }}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("mediaCenter.otaManagement.searchPlaceholder")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("mediaCenter.otaManagement.searchPlaceholder")} value={search} /></div><Button type="submit" variant="outline">{t("mediaCenter.otaManagement.search")}</Button></form></div>
      {firmwareQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("mediaCenter.otaManagement.fetchFirmwareListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(firmwareQuery.error, t("mediaCenter.otaManagement.fetchFirmwareListFailed"))}</AlertDescription></Alert> : null}
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("mediaCenter.otaManagement.firmwareName")}</th><th className="px-4 py-3">{t("mediaCenter.otaManagement.firmwareType")}</th><th className="px-4 py-3">{t("mediaCenter.otaManagement.version")}</th><th className="px-4 py-3">{t("mediaCenter.otaManagement.fileSize")}</th><th className="px-4 py-3">{t("mediaCenter.otaManagement.remark")}</th><th className="px-4 py-3">{t("mediaCenter.otaManagement.createTime")}</th><th className="px-4 py-3">{t("mediaCenter.otaManagement.updateTime")}</th><th className="px-4 py-3 text-right">{t("mediaCenter.otaManagement.action")}</th></tr></thead><tbody className="divide-y">
        {firmwareQuery.isPending ? <tr><td className="h-56 text-center" colSpan={9}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : firmware.length ? firmware.map((item) => <tr className="hover:bg-muted/20" key={item.id}><td className="px-4 py-3"><Checkbox aria-label={item.firmwareName || item.id} checked={Boolean(item.id && selected.has(item.id))} onChange={(event) => setSelected((current) => { const next = new Set(current); if (item.id) { if (event.target.checked) next.add(item.id); else next.delete(item.id); } return next; })} /></td><td className="px-4 py-3 font-medium">{item.firmwareName || "—"}</td><td className="px-4 py-3">{typeNames.get(item.type) || item.type || "—"}</td><td className="px-4 py-3 font-mono text-xs">{item.version || "—"}</td><td className="px-4 py-3">{formatFileSize(item.size)}</td><td className="max-w-xs truncate px-4 py-3 text-muted-foreground" title={item.remark}>{item.remark || "—"}</td><td className="px-4 py-3 text-muted-foreground">{formatMediaDate(item.createDate, i18n.language)}</td><td className="px-4 py-3 text-muted-foreground">{formatMediaDate(item.updateDate, i18n.language)}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button aria-label={t("mediaCenter.otaManagement.download")} disabled={downloadingId === item.id} onClick={() => void downloadFirmwareFile(item)} size="icon" variant="ghost">{downloadingId === item.id ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}</Button><Button aria-label={t("mediaCenter.otaManagement.edit")} onClick={() => setEditingFirmware(item)} size="icon" variant="ghost"><Pencil className="size-4" /></Button><Button aria-label={t("mediaCenter.otaManagement.delete")} onClick={() => item.id && setDeleteTargets([item.id])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>) : <tr><td className="h-56 text-center text-muted-foreground" colSpan={9}>{t("common.noData")}</td></tr>}
      </tbody></table></div><Pagination label={t("mediaCenter.otaManagement.totalRecords", { total: firmwareQuery.data?.total || 0 })} nextLabel={t("mediaCenter.otaManagement.nextPage")} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("mediaCenter.otaManagement.prevPage")} total={firmwareQuery.data?.total || 0} /></Card>
      <FirmwareDialog firmware={editingFirmware || null} firmwareTypes={typesQuery.data || []} onOpenChange={(open) => !open && setEditingFirmware(undefined)} onSubmit={save} open={editingFirmware !== undefined} pending={saveMutation.isPending} />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("mediaCenter.otaManagement.delete")} description={t("mediaCenter.otaManagement.confirmBatchDelete", { paramCount: deleteTargets.length })} onConfirm={remove} onOpenChange={(open) => !open && setDeleteTargets([])} open={deleteTargets.length > 0} pending={deleteMutation.isPending} title={t("mediaCenter.otaManagement.delete")} variant="destructive" />
    </div>
  );
}
