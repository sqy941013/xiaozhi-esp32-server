import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Play, Plus, Trash2, UserRound } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { apiResourceUrl, getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAudioPlayToken,
  createVoicePrint,
  deleteVoicePrint,
  getRecentVoiceMessages,
  getVoiceMessageContent,
  getVoicePrints,
  updateVoicePrint,
} from "@/features/agents/agent-api";
import { AgentSelect } from "@/features/agents/agent-select";
import type { VoicePrint, VoicePrintInput } from "@/features/agents/types";

const EMPTY_FORM: VoicePrintInput = {
  audioId: "",
  introduce: "",
  sourceName: "",
};

export function VoicePrintPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const agentId = searchParams.get("agentId") || "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<VoicePrintInput>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<VoicePrint | null>(null);

  const setAgentId = useCallback((nextAgentId: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextAgentId) next.set("agentId", nextAgentId);
      else next.delete("agentId");
      return next;
    });
  }, [setSearchParams]);

  const printsQuery = useQuery({
    enabled: Boolean(agentId),
    queryFn: () => getVoicePrints(agentId),
    queryKey: ["voice-prints", agentId],
    retry: false,
  });
  const messagesQuery = useQuery({
    enabled: dialogOpen && Boolean(agentId),
    queryFn: () => getRecentVoiceMessages(agentId),
    queryKey: ["recent-voice-messages", agentId],
  });
  const existingAudioQuery = useQuery({
    enabled: dialogOpen && Boolean(form.audioId) &&
      !messagesQuery.data?.some((item) => item.audioId === form.audioId),
    queryFn: () => getVoiceMessageContent(form.audioId),
    queryKey: ["voice-message-content", form.audioId],
    retry: false,
  });
  const existingAudioContent = existingAudioQuery.data || "";

  const saveMutation = useMutation({
    mutationFn: (input: VoicePrintInput) => input.id
      ? updateVoicePrint(input)
      : createVoicePrint({ ...input, agentId }),
    onSuccess: async (_data, input) => {
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await queryClient.invalidateQueries({ queryKey: ["voice-prints", agentId] });
      toast.success(t(input.id ? "agentCenter.voicePrint.updateSuccess" : "agentCenter.voicePrint.addSuccess"));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVoicePrint(id),
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["voice-prints", agentId] });
      toast.success(t("agentCenter.voicePrint.deleteSuccess"));
    },
  });

  async function play(audioId: string) {
    try {
      const token = await createAudioPlayToken(audioId);
      await new Audio(apiResourceUrl(`/agent/play/${encodeURIComponent(token)}`)).play();
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.roleConfig.audioPlayFailed")));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={<Button disabled={!agentId} onClick={() => { setForm(EMPTY_FORM); setDialogOpen(true); }}><Plus className="size-4" />{t("agentCenter.voicePrint.add")}</Button>}
        description={t("agentCenter.voicePrintDialog.selectVoiceMessage")}
        title={t("agentCenter.voicePrint.pageTitle")}
      />
      <div className="max-w-md"><AgentSelect onChange={setAgentId} value={agentId} /></div>

      {printsQuery.isError ? <Alert variant="destructive"><AlertTitle>{t("agentCenter.voicePrint.fetchFailed")}</AlertTitle><AlertDescription>{getErrorMessage(printsQuery.error, t("agentCenter.voicePrint.fetchFailed"))}</AlertDescription></Alert> : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/30 text-xs text-muted-foreground"><tr><th className="px-4 py-3">{t("agentCenter.voicePrint.name")}</th><th className="px-4 py-3">{t("agentCenter.voicePrint.description")}</th><th className="px-4 py-3">{t("agentCenter.voicePrint.createTime")}</th><th className="px-4 py-3 text-right">{t("agentCenter.voicePrint.action")}</th></tr></thead>
            <tbody className="divide-y">
              {!agentId ? <tr><td className="h-56 text-center text-muted-foreground" colSpan={4}>{t("agentCenter.addressBookManagement.selectAgentFirst")}</td></tr> : printsQuery.isPending ? <tr><td className="h-56 text-center" colSpan={4}><LoaderCircle className="mx-auto size-5 animate-spin" /></td></tr> : (printsQuery.data || []).length === 0 ? <tr><td className="h-56 text-center text-muted-foreground" colSpan={4}><UserRound className="mx-auto mb-3 size-9 opacity-40" />{t("common.noData")}</td></tr> : (printsQuery.data || []).map((print) => (
                <tr key={print.id}><td className="px-4 py-3 font-medium">{print.sourceName}</td><td className="max-w-md px-4 py-3 text-muted-foreground">{print.introduce || "—"}</td><td className="px-4 py-3">{print.createDate ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(print.createDate)) : "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-1">{print.audioId ? <Button aria-label={t("agentCenter.voicePrintDialog.voicePrintVector")} onClick={() => void play(print.audioId || "")} size="icon" variant="ghost"><Play className="size-4" /></Button> : null}<Button aria-label={t("agentCenter.voicePrint.edit")} onClick={() => { setForm({ audioId: print.audioId || "", id: print.id, introduce: print.introduce || "", sourceName: print.sourceName || "" }); setDialogOpen(true); }} size="icon" variant="ghost"><Pencil className="size-4" /></Button><Button aria-label={t("agentCenter.voicePrint.delete")} onClick={() => setDeleteTarget(print)} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog onOpenChange={(open) => !saveMutation.isPending && setDialogOpen(open)} open={dialogOpen}>
        <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>{t(form.id ? "agentCenter.voicePrint.editSpeaker" : "agentCenter.voicePrint.addSpeaker")}</DialogTitle><DialogDescription>{t("agentCenter.voicePrintDialog.selectVoiceMessage")}</DialogDescription></DialogHeader><div className="space-y-4 overflow-y-auto px-6 py-4"><div className="space-y-2"><Label htmlFor="voice-print-audio">{t("agentCenter.voicePrintDialog.voicePrintVector")}</Label><div className="flex gap-2"><select aria-label={t("agentCenter.voicePrintDialog.voicePrintVector")} className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm" id="voice-print-audio" onChange={(event) => setForm({ ...form, audioId: event.target.value })} value={form.audioId}><option value="">{t("agentCenter.voicePrintDialog.selectVoiceMessage")}</option>{form.audioId && !messagesQuery.data?.some((item) => item.audioId === form.audioId) ? <option value={form.audioId}>{existingAudioContent || form.audioId}</option> : null}{(messagesQuery.data || []).filter((item) => item.audioId).map((item) => <option key={item.audioId} value={item.audioId}>{item.content || item.audioId}</option>)}</select><Button aria-label={t("common.play")} disabled={!form.audioId} onClick={() => void play(form.audioId)} size="icon" variant="outline"><Play className="size-4" /></Button></div></div><div className="space-y-2"><Label htmlFor="voice-print-name">{t("agentCenter.voicePrintDialog.name")}</Label><Input id="voice-print-name" onChange={(event) => setForm({ ...form, sourceName: event.target.value })} placeholder={t("agentCenter.voicePrintDialog.enterName")} value={form.sourceName} /></div><div className="space-y-2"><Label htmlFor="voice-print-description">{t("agentCenter.voicePrintDialog.description")}</Label><Textarea id="voice-print-description" maxLength={100} onChange={(event) => setForm({ ...form, introduce: event.target.value })} placeholder={t("agentCenter.voicePrintDialog.enterDescription")} rows={4} value={form.introduce} /></div></div><DialogFooter><Button onClick={() => setDialogOpen(false)} variant="outline">{t("common.cancel")}</Button><Button disabled={!form.audioId || !form.sourceName.trim() || !form.introduce.trim() || saveMutation.isPending} onClick={async () => { try { await saveMutation.mutateAsync(form); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.voicePrint.fetchFailed"))); } }}>{saveMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("common.save")}</Button></DialogFooter></DialogContent>
      </Dialog>

      <ConfirmDialog cancelLabel={t("agentCenter.voicePrint.cancel")} confirmLabel={t("agentCenter.voicePrint.confirm")} description={t("agentCenter.voicePrint.confirmDelete")} onConfirm={async () => { if (!deleteTarget?.id) return; try { await deleteMutation.mutateAsync(deleteTarget.id); } catch (error) { toast.error(getErrorMessage(error, t("agentCenter.voicePrint.deleteFailed"))); } }} onOpenChange={(open) => !open && setDeleteTarget(null)} open={Boolean(deleteTarget)} pending={deleteMutation.isPending} title={t("agentCenter.voicePrint.warning")} variant="destructive" />
    </div>
  );
}
