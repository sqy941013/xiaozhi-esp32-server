import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
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
import { getVoicePlatforms, searchAdminUsers } from "@/features/media/media-api";
import type { VoiceResourceInput } from "@/features/media/types";
import { useQuery } from "@tanstack/react-query";

interface VoiceResourceDialogProps {
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: VoiceResourceInput) => void | Promise<void>;
  open: boolean;
  pending: boolean;
}

export function VoiceResourceDialog({ onOpenChange, onSubmit, open, pending }: VoiceResourceDialogProps) {
  if (!open) return null;
  return <OpenVoiceResourceDialog onOpenChange={onOpenChange} onSubmit={onSubmit} pending={pending} />;
}

function OpenVoiceResourceDialog({ onOpenChange, onSubmit, pending }: Omit<VoiceResourceDialogProps, "open">) {
  const { t } = useTranslation();
  const [modelId, setModelId] = useState("");
  const [voiceIds, setVoiceIds] = useState<string[]>([]);
  const [voiceInput, setVoiceInput] = useState("");
  const [userId, setUserId] = useState("");
  const [languages, setLanguages] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userKeyword, setUserKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setUserKeyword(userSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [userSearch]);

  const platformsQuery = useQuery({ queryFn: getVoicePlatforms, queryKey: ["voice-platforms"], staleTime: 5 * 60_000 });
  const usersQuery = useQuery({ enabled: Boolean(userKeyword), queryFn: () => searchAdminUsers(userKeyword), queryKey: ["admin-users", userKeyword] });

  function addVoiceId() {
    const values = voiceInput.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean);
    if (!values.length) return;
    setVoiceIds((current) => [...new Set([...current, ...values])]);
    setVoiceInput("");
  }

  async function submit() {
    setSubmitted(true);
    addVoiceId();
    const pendingIds = voiceInput.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean);
    const ids = [...new Set([...voiceIds, ...pendingIds])];
    if (!modelId || !ids.length || !userId || !languages.trim()) return;
    await onSubmit({ languages: languages.trim(), modelId, userId: Number(userId), voiceIds: ids });
  }

  return (
    <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("mediaCenter.voiceClone.addVoiceClone")}</DialogTitle><DialogDescription>{t("mediaCenter.voiceResource.title")}</DialogDescription></DialogHeader>
        <div className="grid gap-5 overflow-y-auto px-6 py-1">
          <div className="grid gap-2">
            <Label htmlFor="voice-platform">{t("mediaCenter.voiceClone.platformName")}</Label>
            <select aria-invalid={submitted && !modelId} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" id="voice-platform" onChange={(event) => setModelId(event.target.value)} value={modelId}>
              <option value="">{t("mediaCenter.voiceClone.platformNamePlaceholder")}</option>
              {(platformsQuery.data || []).map((platform) => <option key={platform.id} value={platform.id}>{platform.modelName}</option>)}
            </select>
            {submitted && !modelId ? <p className="text-xs text-destructive">{t("mediaCenter.voiceClone.platformNameRequired")}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="voice-ids">{t("mediaCenter.voiceClone.voiceId")}</Label>
            <div className="flex gap-2"><Input id="voice-ids" onChange={(event) => setVoiceInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addVoiceId(); } }} placeholder={t("mediaCenter.voiceClone.voiceIdPlaceholder")} value={voiceInput} /><Button onClick={addVoiceId} type="button" variant="outline">{t("mediaCenter.voiceClone.addNew")}</Button></div>
            {voiceIds.length ? <div className="flex flex-wrap gap-2">{voiceIds.map((id) => <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs" key={id}>{id}<button aria-label={`${t("mediaCenter.voiceClone.delete")} ${id}`} onClick={() => setVoiceIds((current) => current.filter((value) => value !== id))} type="button"><X className="size-3" /></button></span>)}</div> : null}
            {submitted && voiceIds.length === 0 && !voiceInput.trim() ? <p className="text-xs text-destructive">{t("mediaCenter.voiceClone.voiceIdRequired")}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="voice-user-search">{t("mediaCenter.voiceClone.userId")}</Label>
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={t("mediaCenter.voiceClone.userIdPlaceholder")} className="pl-9" id="voice-user-search" onChange={(event) => { setUserSearch(event.target.value); setUserId(""); }} placeholder={t("mediaCenter.voiceClone.userIdPlaceholder")} value={userSearch} /></div>
            {userKeyword ? <select aria-invalid={submitted && !userId} aria-label={t("mediaCenter.voiceClone.userId")} className="h-10 rounded-md border border-input bg-background px-3 text-sm" onChange={(event) => setUserId(event.target.value)} value={userId}><option value="">{usersQuery.isPending ? t("common.loading") : t("mediaCenter.voiceClone.userIdPlaceholder")}</option>{(usersQuery.data?.list || []).map((user) => <option key={user.userid} value={user.userid}>{user.mobile || user.userid}</option>)}</select> : null}
            {submitted && !userId ? <p className="text-xs text-destructive">{t("mediaCenter.voiceClone.userIdRequired")}</p> : null}
          </div>
          <div className="grid gap-2"><Label htmlFor="voice-languages">{t("mediaCenter.voiceClone.languages")}</Label><Input aria-invalid={submitted && !languages.trim()} id="voice-languages" onChange={(event) => setLanguages(event.target.value)} placeholder={t("mediaCenter.voiceClone.languagesPlaceholder")} value={languages} />{submitted && !languages.trim() ? <p className="text-xs text-destructive">{t("mediaCenter.voiceClone.languagesRequired")}</p> : null}</div>
        </div>
        <DialogFooter><Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">{t("mediaCenter.voiceClone.cancel")}</Button><Button disabled={pending} onClick={() => void submit()} type="button">{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{t("mediaCenter.voiceClone.ok")}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
