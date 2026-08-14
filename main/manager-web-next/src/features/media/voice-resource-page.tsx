import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { createVoiceResource, deleteVoiceResources, getVoiceResources } from "@/features/media/media-api";
import { formatMediaDate } from "@/features/media/media-utils";
import { VoiceResourceDialog } from "@/features/media/voice-resource-dialog";
import type { VoiceClone, VoiceResourceInput } from "@/features/media/types";

function trainStatusKey(voice: VoiceClone) {
  if (!voice.hasVoice) return "waitingUpload";
  if (voice.trainStatus === 1) return "training";
  if (voice.trainStatus === 2) return "trainSuccess";
  if (voice.trainStatus === 3) return "trainFailed";
  return "waitingTraining";
}

export function VoiceResourcePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<string[]>([]);

  const resourcesQuery = useQuery({
    queryFn: () => getVoiceResources({ limit: pageSize, name: keyword, page }),
    queryKey: ["voice-resources", keyword, page, pageSize],
  });
  const resources = resourcesQuery.data?.list || [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["voice-resources"] });
  const createMutation = useMutation({ mutationFn: createVoiceResource });
  const deleteMutation = useMutation({ mutationFn: deleteVoiceResources });

  async function create(input: VoiceResourceInput) {
    try {
      await createMutation.mutateAsync(input);
      setDialogOpen(false);
      await invalidate();
      toast.success(t("mediaCenter.voiceClone.addSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.voiceClone.addFailed")));
    }
  }

  async function remove() {
    if (!deleteTargets.length) return;
    try {
      await deleteMutation.mutateAsync(deleteTargets);
      if (resources.length <= deleteTargets.length && page > 1) setPage((current) => current - 1);
      const count = deleteTargets.length;
      setDeleteTargets([]);
      setSelected(new Set());
      await invalidate();
      toast.success(t("mediaCenter.voiceClone.deleteSuccess", { count }));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.voiceClone.deleteFailed")));
    }
  }

  const allSelected = resources.length > 0 && resources.every((voice) => voice.id && selected.has(voice.id));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading actions={<Button onClick={() => setDialogOpen(true)}><Plus className="size-4" />{t("mediaCenter.voiceClone.addNew")}</Button>} description={t("mediaCenter.voiceClone.addVoiceClone")} eyebrow={t("nav.voiceResources")} title={t("mediaCenter.voiceResource.title")} />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3"><Checkbox aria-label={t("mediaCenter.voiceClone.selectAll")} checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(resources.flatMap((voice) => voice.id ? [voice.id] : [])) : new Set())} /><span className="text-sm text-muted-foreground">{selected.size}</span><Button disabled={selected.size === 0} onClick={() => setDeleteTargets([...selected])} size="sm" variant="outline"><Trash2 className="size-4" />{t("mediaCenter.voiceClone.delete")}</Button></div>
        <form className="flex w-full max-w-md gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setKeyword(search.trim()); }}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("mediaCenter.voiceClone.searchPlaceholder")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("mediaCenter.voiceClone.searchPlaceholder")} value={search} /></div><Button type="submit" variant="outline">{t("mediaCenter.voiceClone.search")}</Button></form>
      </div>
      {resourcesQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("mediaCenter.voiceClone.deleteFailed")}</AlertTitle><AlertDescription>{getErrorMessage(resourcesQuery.error, t("mediaCenter.voiceClone.deleteFailed"))}</AlertDescription></Alert> : null}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="w-12 px-4 py-3" /><th className="px-4 py-3">{t("mediaCenter.voiceClone.voiceId")}</th><th className="px-4 py-3">{t("mediaCenter.voiceClone.name")}</th><th className="px-4 py-3">{t("mediaCenter.voiceClone.userId")}</th><th className="px-4 py-3">{t("mediaCenter.voiceClone.platformName")}</th><th className="px-4 py-3">{t("mediaCenter.voiceClone.languages")}</th><th className="px-4 py-3">{t("mediaCenter.voiceClone.trainStatus")}</th><th className="px-4 py-3">{t("mediaCenter.voiceClone.createdAt")}</th><th className="px-4 py-3 text-right">{t("mediaCenter.voiceClone.action")}</th></tr></thead><tbody className="divide-y">
          {resourcesQuery.isPending ? <tr><td className="h-56 text-center" colSpan={9}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : resources.length ? resources.map((voice) => { const state = trainStatusKey(voice); return <tr className="hover:bg-muted/20" key={voice.id}><td className="px-4 py-3"><Checkbox aria-label={voice.voiceId || voice.id} checked={Boolean(voice.id && selected.has(voice.id))} onChange={(event) => setSelected((current) => { const next = new Set(current); if (voice.id) { if (event.target.checked) next.add(voice.id); else next.delete(voice.id); } return next; })} /></td><td className="px-4 py-3 font-mono text-xs">{voice.voiceId || "—"}</td><td className="px-4 py-3 font-medium">{voice.name || "—"}</td><td className="px-4 py-3">{voice.userName || voice.userId || "—"}</td><td className="px-4 py-3">{voice.modelName || voice.modelId || "—"}</td><td className="px-4 py-3">{voice.languages || "—"}</td><td className="px-4 py-3"><Badge title={voice.trainError || undefined} variant={state === "trainFailed" ? "destructive" : state === "trainSuccess" ? "default" : "secondary"}>{t(`mediaCenter.voiceClone.${state}`)}</Badge></td><td className="px-4 py-3 text-muted-foreground">{formatMediaDate(voice.createDate, i18n.language)}</td><td className="px-4 py-3 text-right"><Button aria-label={t("mediaCenter.voiceClone.delete")} onClick={() => voice.id && setDeleteTargets([voice.id])} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></td></tr>; }) : <tr><td className="h-56 text-center text-muted-foreground" colSpan={9}>{t("common.noData")}</td></tr>}
        </tbody></table></div>
        <Pagination label={t("mediaCenter.voiceClone.totalRecords", { total: resourcesQuery.data?.total || 0 })} nextLabel={t("mediaCenter.voiceClone.nextPage")} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("mediaCenter.voiceClone.prevPage")} total={resourcesQuery.data?.total || 0} />
      </Card>
      <VoiceResourceDialog onOpenChange={setDialogOpen} onSubmit={create} open={dialogOpen} pending={createMutation.isPending} />
      <ConfirmDialog cancelLabel={t("mediaCenter.voiceClone.cancel")} confirmLabel={t("mediaCenter.voiceClone.delete")} description={t("mediaCenter.voiceClone.confirmDelete", { count: deleteTargets.length })} onConfirm={remove} onOpenChange={(open) => !open && setDeleteTargets([])} open={deleteTargets.length > 0} pending={deleteMutation.isPending} title={t("mediaCenter.voiceClone.warning")} variant="destructive" />
    </div>
  );
}
