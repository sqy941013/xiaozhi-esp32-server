import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  Check,
  Copy,
  LoaderCircle,
  Pause,
  Pencil,
  Play,
  Search,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  getVoiceClones,
  getVoicePlaybackUrl,
  startVoiceClone,
  updateVoiceCloneName,
} from "@/features/media/media-api";
import type { VoiceClone } from "@/features/media/types";
import { VoiceSampleDialog } from "@/features/media/voice-sample-dialog";

function statusKey(voice: VoiceClone) {
  if (!voice.hasVoice) return "waitingUpload";
  if (voice.trainStatus === 1) return "training";
  if (voice.trainStatus === 2) return "trainSuccess";
  if (voice.trainStatus === 3) return "trainFailed";
  return "waitingTraining";
}

export function VoiceClonePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [uploadTarget, setUploadTarget] = useState<VoiceClone | null>(null);
  const [cloneTarget, setCloneTarget] = useState<VoiceClone | null>(null);
  const [playingId, setPlayingId] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voicesQuery = useQuery({
    queryFn: () => getVoiceClones({ limit: pageSize, name: keyword, page }),
    queryKey: ["voice-clones", keyword, page, pageSize],
    refetchInterval: (query) => query.state.data?.list.some((voice) => voice.trainStatus === 1) ? 5_000 : false,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["voice-clones"] });
  const renameMutation = useMutation({ mutationFn: ({ id, name }: { id: string; name: string }) => updateVoiceCloneName(id, name) });
  const cloneMutation = useMutation({ mutationFn: startVoiceClone });

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  function stopAudio() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    setPlayingId("");
  }

  async function togglePlayback(voice: VoiceClone) {
    if (!voice.id) return;
    if (playingId === voice.id) {
      stopAudio();
      return;
    }
    stopAudio();
    try {
      const url = await getVoicePlaybackUrl(voice.id);
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingId(voice.id);
      audio.addEventListener("ended", stopAudio, { once: true });
      audio.addEventListener("error", stopAudio, { once: true });
      await audio.play();
    } catch (error) {
      stopAudio();
      toast.error(getErrorMessage(error, t("mediaCenter.voiceClone.playFailed")));
    }
  }

  async function saveName(voice: VoiceClone) {
    const name = editingName.trim();
    if (!voice.id || !name) return;
    try {
      await renameMutation.mutateAsync({ id: voice.id, name });
      setEditingId("");
      await invalidate();
      toast.success(t("mediaCenter.voiceClone.updateNameSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.voiceClone.updateNameFailed")));
    }
  }

  async function cloneVoice() {
    if (!cloneTarget?.id) return;
    try {
      await cloneMutation.mutateAsync(cloneTarget.id);
      setCloneTarget(null);
      await invalidate();
      toast.success(t("mediaCenter.voiceClone.cloneSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("mediaCenter.voiceClone.cloneErrorTip")));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading description={t("mediaCenter.voiceClone.contactAdmin")} eyebrow={t("nav.voiceClone")} title={t("mediaCenter.voiceClone.title")} />
      <form className="flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setKeyword(search.trim()); }}>
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("mediaCenter.voiceClone.searchPlaceholder")} className="pl-9" onChange={(event) => setSearch(event.target.value)} placeholder={t("mediaCenter.voiceClone.searchPlaceholder")} value={search} /></div>
        <Button type="submit" variant="outline">{t("mediaCenter.voiceClone.search")}</Button>
      </form>

      {voicesQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("mediaCenter.voiceClone.deleteFailed")}</AlertTitle><AlertDescription>{getErrorMessage(voicesQuery.error, t("mediaCenter.voiceClone.deleteFailed"))}</AlertDescription></Alert> : null}

      {voicesQuery.isPending ? (
        <div className="flex h-64 items-center justify-center"><LoaderCircle className="size-5 animate-spin" /></div>
      ) : voicesQuery.data?.list.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {voicesQuery.data.list.map((voice) => {
            const state = statusKey(voice);
            const editing = editingId === voice.id;
            return (
              <Card className="overflow-hidden" key={voice.id || voice.voiceId}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 text-primary"><AudioLines className="size-7" /></div>
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <form className="flex gap-1" onSubmit={(event) => { event.preventDefault(); void saveName(voice); }}><Input aria-label={t("mediaCenter.voiceClone.name")} autoFocus maxLength={64} onChange={(event) => setEditingName(event.target.value)} value={editingName} /><Button aria-label={t("common.save")} disabled={renameMutation.isPending} size="icon" type="submit" variant="ghost"><Check className="size-4" /></Button></form>
                      ) : <h2 className="truncate font-semibold" title={voice.name}>{voice.name || "—"}</h2>}
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={voice.voiceId}>{voice.voiceId || "—"}</p>
                    </div>
                    <Badge title={voice.trainError || undefined} variant={state === "trainFailed" ? "destructive" : state === "trainSuccess" ? "default" : "secondary"}>{t(`mediaCenter.voiceClone.${state}`)}</Badge>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3 text-sm">
                    <div><dt className="text-xs text-muted-foreground">{t("mediaCenter.voiceClone.languages")}</dt><dd className="mt-1 truncate">{voice.languages || "—"}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">{t("mediaCenter.voiceClone.createdAt")}</dt><dd className="mt-1 truncate">{voice.createDate ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(voice.createDate)) : "—"}</dd></div>
                  </dl>
                </div>
                <div className="flex flex-wrap items-center gap-1 border-t bg-muted/15 p-3">
                  {voice.hasVoice ? <Button onClick={() => void togglePlayback(voice)} size="sm" variant="ghost">{playingId === voice.id ? <Pause className="size-4" /> : <Play className="size-4" />}{t(playingId === voice.id ? "mediaCenter.voiceClone.stop" : "mediaCenter.voiceClone.play")}</Button> : null}
                  <Button onClick={() => setUploadTarget(voice)} size="sm" variant="ghost"><Upload className="size-4" />{t("mediaCenter.voiceClone.upload")}</Button>
                  {voice.hasVoice ? <Button disabled={voice.trainStatus === 1} onClick={() => setCloneTarget(voice)} size="sm" variant="ghost"><Copy className="size-4" />{t("mediaCenter.voiceClone.clone")}</Button> : null}
                  <Button aria-label={t("mediaCenter.knowledgeBaseManagement.edit")} className="ml-auto" onClick={() => { setEditingId(voice.id || ""); setEditingName(voice.name || ""); }} size="icon" variant="ghost"><Pencil className="size-4" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 border-dashed text-center"><AudioLines className="size-9 text-muted-foreground" /><p className="font-medium">{t("mediaCenter.voiceClone.noVoiceCloneAssigned")}</p><p className="text-sm text-muted-foreground">{t("mediaCenter.voiceClone.contactAdmin")}</p></Card>
      )}

      <Card className="overflow-hidden"><Pagination label={t("mediaCenter.voiceClone.totalRecords", { total: voicesQuery.data?.total || 0 })} nextLabel={t("mediaCenter.voiceClone.nextPage")} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} page={page} pageSize={pageSize} pageSizeLabel={t("common.pageSize")} previousLabel={t("mediaCenter.voiceClone.prevPage")} total={voicesQuery.data?.total || 0} /></Card>

      <VoiceSampleDialog onOpenChange={(open) => !open && setUploadTarget(null)} onSuccess={invalidate} voice={uploadTarget} />
      <ConfirmDialog cancelLabel={t("mediaCenter.voiceClone.cancel")} confirmLabel={t("mediaCenter.voiceClone.clone")} description={t("mediaCenter.voiceClone.confirmClone")} onConfirm={cloneVoice} onOpenChange={(open) => !open && setCloneTarget(null)} open={Boolean(cloneTarget)} pending={cloneMutation.isPending} title={t("mediaCenter.voiceClone.dialogTitle")} />
    </div>
  );
}
