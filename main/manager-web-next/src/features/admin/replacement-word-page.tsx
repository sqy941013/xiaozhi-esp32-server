import { Download, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
  createReplacementFile,
  deleteReplacementFile,
  deleteReplacementFiles,
  downloadReplacementFile,
  getReplacementFiles,
  updateReplacementFile,
} from "@/features/admin/admin-api";
import { replacementDownloadName } from "@/features/admin/admin-utils";
import { ReplacementDialog } from "@/features/admin/replacement-dialog";
import type { CorrectWordFile, CorrectWordInput } from "@/features/admin/types";

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const EMPTY_FILES: CorrectWordFile[] = [];

export function ReplacementWordPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<CorrectWordFile | null | undefined>();
  const [deleteTargets, setDeleteTargets] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState("");

  const filesQuery = useQuery({ queryFn: () => getReplacementFiles({ limit: pageSize, page }), queryKey: ["replacement-files", page, pageSize] });
  const files = filesQuery.data?.list || EMPTY_FILES;
  const visibleFiles = useMemo(() => {
    const normalized = keyword.toLocaleLowerCase();
    return normalized ? files.filter((file) => (file.fileName || "").toLocaleLowerCase().includes(normalized)) : files;
  }, [files, keyword]);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["replacement-files"] });
  const saveMutation = useMutation({ mutationFn: async ({ current, input }: { current: CorrectWordFile | null; input: CorrectWordInput }) => {
    if (current?.id) await updateReplacementFile(current.id, input);
    else await createReplacementFile(input);
  } });
  const deleteMutation = useMutation({ mutationFn: async (ids: readonly string[]) => {
    const onlyId = ids.length === 1 ? ids[0] : undefined;
    if (onlyId) await deleteReplacementFile(onlyId);
    else await deleteReplacementFiles(ids);
  } });

  async function save(input: CorrectWordInput) {
    const current = editing || null;
    try {
      await saveMutation.mutateAsync({ current, input });
      setEditing(undefined);
      await invalidate();
      toast.success(t("adminCenter.replacementWordManagement.saveSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t(current ? "adminCenter.replacementWordManagement.saveFailed" : "adminCenter.replacementWordManagement.addFailed")));
    }
  }

  async function remove() {
    if (!deleteTargets.length) return;
    try {
      await deleteMutation.mutateAsync(deleteTargets);
      if (files.length <= deleteTargets.length && page > 1) setPage((current) => current - 1);
      setDeleteTargets([]);
      setSelected(new Set());
      await invalidate();
      toast.success(t("adminCenter.common.deleteSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.common.deleteFailure")));
    }
  }

  async function download(file: CorrectWordFile) {
    if (!file.id) return;
    setDownloadingId(file.id);
    try {
      const blob = await downloadReplacementFile(file.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download = replacementDownloadName(file.fileName);
      anchor.href = url;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      toast.error(getErrorMessage(error, t("adminCenter.ui.downloadFailed")));
    } finally {
      setDownloadingId("");
    }
  }

  const validFiles = visibleFiles.filter((file): file is CorrectWordFile & { id: string } => Boolean(file.id));
  const allSelected = validFiles.length > 0 && validFiles.every((file) => selected.has(file.id));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading actions={<Button onClick={() => setEditing(null)}><Plus className="size-4" />{t("adminCenter.replacementWordManagement.addFile")}</Button>} description={t("adminCenter.ui.descriptions.replacementWords")} eyebrow={t("nav.groups.admin")} title={t("adminCenter.replacementWordManagement.pageTitle")} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><Checkbox aria-label={t("adminCenter.user.selectAll")} checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(validFiles.map((file) => file.id)) : new Set())} /><span className="text-sm text-muted-foreground">{t("adminCenter.ui.selected", { count: selected.size })}</span><Button disabled={!selected.size} onClick={() => setDeleteTargets([...selected])} size="sm" variant="outline"><Trash2 className="size-4 text-destructive" />{t("adminCenter.replacementWordManagement.batchDelete")}</Button></div><form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setSelected(new Set()); setKeyword(search.trim()); }}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("adminCenter.replacementWordManagement.searchPlaceholder")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("adminCenter.replacementWordManagement.searchPlaceholder")} value={search} /></div><Button type="submit" variant="outline">{t("adminCenter.replacementWordManagement.search")}</Button></form></div>
      {filesQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("adminCenter.replacementWordManagement.getListFailed")}</AlertTitle><AlertDescription>{getErrorMessage(filesQuery.error, t("adminCenter.replacementWordManagement.getListFailed"))}</AlertDescription></Alert> : null}
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("adminCenter.replacementWordManagement.fileName")}</th><th className="px-4 py-3">{t("adminCenter.replacementWordManagement.replacementWordCount")}</th><th className="px-4 py-3">{t("adminCenter.replacementWordManagement.replacementWordContent")}</th><th className="px-4 py-3">{t("adminCenter.replacementWordManagement.createTime")}</th><th className="px-4 py-3">{t("adminCenter.replacementWordManagement.updateTime")}</th><th className="px-4 py-3 text-right">{t("adminCenter.replacementWordManagement.operation")}</th></tr></thead><tbody className="divide-y">
        {filesQuery.isPending ? <tr><td className="h-56 text-center" colSpan={7}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : visibleFiles.length ? visibleFiles.map((file) => <tr className="hover:bg-muted/20" key={file.id || file.fileName}><td className="px-4 py-3"><Checkbox aria-label={file.fileName} checked={Boolean(file.id && selected.has(file.id))} disabled={!file.id} onChange={(event) => setSelected((current) => { const next = new Set(current); if (file.id) { if (event.target.checked) next.add(file.id); else next.delete(file.id); } return next; })} /></td><td className="px-4 py-3 font-medium">{file.fileName || "—"}</td><td className="px-4 py-3">{file.wordCount || 0}</td><td className="max-w-sm px-4 py-3"><div className="flex max-w-sm gap-1 overflow-hidden" title={[...(file.content || [])].join("\n")}>{[...(file.content || [])].slice(0, 3).map((line) => <span className="max-w-32 truncate rounded-full bg-primary/10 px-2 py-1 text-xs text-primary" key={line}>{line}</span>)}{(file.content?.length || 0) > 3 ? <span className="text-xs text-muted-foreground">+{(file.content?.length || 0) - 3}</span> : null}</div></td><td className="px-4 py-3 text-muted-foreground">{formatDate(file.createdAt, i18n.language)}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(file.updatedAt, i18n.language)}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button aria-label={t("adminCenter.replacementWordManagement.edit")} onClick={() => setEditing(file)} size="icon" variant="ghost"><Pencil className="size-4" /></Button><Button aria-label={t("adminCenter.replacementWordManagement.download")} disabled={!file.id || downloadingId === file.id} onClick={() => void download(file)} size="icon" variant="ghost">{downloadingId === file.id ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}</Button><Button aria-label={t("adminCenter.replacementWordManagement.delete")} disabled={!file.id} onClick={() => file.id && setDeleteTargets([file.id])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>) : <tr><td className="h-56 text-center text-muted-foreground" colSpan={7}>{t("common.noData")}</td></tr>}
      </tbody></table></div><Pagination label={t("adminCenter.paramManagement.totalRecords", { total: filesQuery.data?.total || 0 })} nextLabel={t("adminCenter.paramManagement.nextPage")} onPageChange={(nextPage) => { setPage(nextPage); setSelected(new Set()); }} onPageSizeChange={(size) => { setPageSize(size); setPage(1); setSelected(new Set()); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("adminCenter.paramManagement.prevPage")} total={filesQuery.data?.total || 0} /></Card>
      <ReplacementDialog file={editing || null} onOpenChange={(open) => !open && setEditing(undefined)} onSubmit={save} open={editing !== undefined} pending={saveMutation.isPending} />
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("adminCenter.replacementWordManagement.delete")} description={deleteTargets.length === 1 ? t("adminCenter.replacementWordManagement.confirmDelete") : t("adminCenter.replacementWordManagement.confirmBatchDelete", { count: deleteTargets.length })} onConfirm={remove} onOpenChange={(open) => !open && setDeleteTargets([])} open={deleteTargets.length > 0} pending={deleteMutation.isPending} title={t(deleteTargets.length === 1 ? "adminCenter.replacementWordManagement.deleteHint" : "adminCenter.replacementWordManagement.batchDeleteHint")} variant="destructive" />
    </div>
  );
}
