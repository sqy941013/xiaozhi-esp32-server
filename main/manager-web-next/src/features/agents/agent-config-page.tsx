import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Braces,
  Cpu,
  History,
  LoaderCircle,
  MessageSquareText,
  Plus,
  RotateCcw,
  Save,
  Tags,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getAgent,
  getAgentTags,
  getAgentTemplates,
  updateAgent,
} from "@/features/agents/agent-api";
import { AgentModelFields } from "@/features/agents/agent-model-fields";
import { AgentSelect } from "@/features/agents/agent-select";
import { ChatHistoryDialog } from "@/features/agents/chat-history-dialog";
import { ContextProviderDialog } from "@/features/agents/context-provider-dialog";
import { FunctionDialog } from "@/features/agents/function-dialog";
import { toAgentUpdateInput } from "@/features/agents/agent-utils";
import { SnapshotDialog } from "@/features/agents/snapshot-dialog";
import type {
  AgentTemplateInput,
  AgentUpdateInput,
} from "@/features/agents/types";

function templatePatch(template: AgentTemplateInput): Partial<AgentUpdateInput> {
  return {
    agentCode: template.agentCode || "",
    agentName: template.agentName || "",
    asrModelId: template.asrModelId || "",
    chatHistoryConf: template.chatHistoryConf ?? 0,
    intentModelId: template.intentModelId || "",
    langCode: template.langCode || "",
    language: template.language || "",
    llmModelId: template.llmModelId || "",
    memModelId: template.memModelId || "",
    summaryMemory: template.summaryMemory || "",
    systemPrompt: template.systemPrompt || "",
    ttsLanguage: template.ttsLanguage || "",
    ttsModelId: template.ttsModelId || "",
    ttsPitch: template.ttsPitch ?? 0,
    ttsRate: template.ttsRate ?? 0,
    ttsVoiceId: template.ttsVoiceId || "",
    ttsVolume: template.ttsVolume ?? 0,
    vadModelId: template.vadModelId || "",
    vllmModelId: template.vllmModelId || "",
  };
}

export function AgentConfigPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const agentId = searchParams.get("agentId") || "";
  const [draft, setDraft] = useState<{
    agentId: string;
    value: AgentUpdateInput;
  } | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [functionsOpen, setFunctionsOpen] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const setAgentId = useCallback((nextAgentId: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextAgentId) next.set("agentId", nextAgentId);
      else next.delete("agentId");
      return next;
    });
  }, [setSearchParams]);

  const agentQuery = useQuery({
    enabled: Boolean(agentId),
    queryFn: () => getAgent(agentId),
    queryKey: ["agent", agentId],
  });
  const tagsQuery = useQuery({
    enabled: Boolean(agentId),
    queryFn: () => getAgentTags(agentId),
    queryKey: ["agent-tags", agentId],
  });
  const templatesQuery = useQuery({
    queryFn: getAgentTemplates,
    queryKey: ["agent-templates", "all"],
    staleTime: 60_000,
  });

  const initial = useMemo(() => {
    if (!agentQuery.data || tagsQuery.isPending) return null;
    return toAgentUpdateInput(agentQuery.data, {
      tagNames: (tagsQuery.data || []).flatMap((tag) => tag.tagName ? [tag.tagName] : []),
    });
  }, [agentQuery.data, tagsQuery.data, tagsQuery.isPending]);
  const form = draft?.agentId === agentId ? draft.value : initial;
  const setForm = useCallback((value: AgentUpdateInput) => {
    setDraft({ agentId, value });
  }, [agentId]);

  const saveMutation = useMutation({
    mutationFn: async (value: AgentUpdateInput) => updateAgent(agentId, value),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent", agentId] }),
        queryClient.invalidateQueries({ queryKey: ["agent-tags", agentId] }),
        queryClient.invalidateQueries({ queryKey: ["agents"] }),
        queryClient.invalidateQueries({ queryKey: ["agent-snapshots", agentId] }),
      ]);
      setDraft(null);
      toast.success(t("agentCenter.roleConfig.saveSuccess"));
    },
  });

  const dirty = useMemo(
    () => Boolean(form && initial && JSON.stringify(form) !== JSON.stringify(initial)),
    [form, initial],
  );

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || !form) return;
    if ((form.tagNames || []).includes(tag)) {
      setTagInput("");
      return;
    }
    setForm({ ...form, tagNames: [...(form.tagNames || []), tag] });
    setTagInput("");
  }

  async function save() {
    if (!form || !form.agentName?.trim()) return;
    try {
      await saveMutation.mutateAsync({ ...form, agentName: form.agentName.trim() });
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.roleConfig.saveFailed")));
    }
  }

  if (!agentId) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeading
          description={t("agentCenter.roleConfig.tooltip.agentName")}
          title={t("agentCenter.roleConfig.title")}
        />
        <Card>
          <CardContent className="p-6">
            <AgentSelect onChange={setAgentId} value="" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (agentQuery.isError || tagsQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertTitle>{t("agentCenter.roleConfig.fetchConfigFailed")}</AlertTitle>
          <AlertDescription>
            {getErrorMessage(agentQuery.error || tagsQuery.error, t("agentCenter.roleConfig.fetchConfigFailed"))}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!form) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="size-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={
          <>
            <Button asChild variant="outline"><Link to="/home"><ArrowLeft className="size-4" />{t("common.close")}</Link></Button>
            <Button onClick={() => setHistoryOpen(true)} type="button" variant="outline"><MessageSquareText className="size-4" />{t("agentCenter.home.chatHistory")}</Button>
            <Button onClick={() => setSnapshotsOpen(true)} type="button" variant="outline"><History className="size-4" />{t("agentCenter.roleConfig.snapshotHistory")}</Button>
            <Button disabled={!dirty || saveMutation.isPending} onClick={() => void save()} type="button">
              {saveMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t("agentCenter.roleConfig.saveConfig")}
            </Button>
          </>
        }
        description={t("agentCenter.roleConfig.restartNotice")}
        eyebrow={agentQuery.data?.currentVersionNo ? t("agentCenter.roleConfig.currentVersion", { version: agentQuery.data.currentVersionNo }) : undefined}
        title={form.agentName || t("agentCenter.roleConfig.title")}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t("agentCenter.roleConfig.agentName")}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agent-name">{t("agentCenter.roleConfig.agentName")}</Label>
                <Input id="agent-name" maxLength={64} onChange={(event) => setForm({ ...form, agentName: event.target.value })} value={form.agentName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-code">Agent Code</Label>
                <Input id="agent-code" onChange={(event) => setForm({ ...form, agentCode: event.target.value })} value={form.agentCode || ""} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("agentCenter.roleConfig.roleTemplate")}</Label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(templatesQuery.data || []).map((template) => (
                    <Button
                      className="shrink-0"
                      key={template.id || template.agentName}
                      onClick={() => {
                        setForm({ ...form, ...templatePatch(template) });
                        toast.success(`${template.agentName || ""}${t("agentCenter.roleConfig.templateApplied")}`);
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {template.agentName}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="agent-prompt">{t("agentCenter.roleConfig.roleIntroduction")}</Label>
                <Textarea id="agent-prompt" maxLength={2000} onChange={(event) => setForm({ ...form, systemPrompt: event.target.value })} rows={10} value={form.systemPrompt || ""} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="agent-memory">{t("agentCenter.roleConfig.memoryHis")}</Label>
                <Textarea
                  disabled={form.memModelId !== "Memory_mem_local_short"}
                  id="agent-memory"
                  maxLength={2000}
                  onChange={(event) => setForm({ ...form, summaryMemory: event.target.value })}
                  rows={5}
                  value={form.summaryMemory || ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("nav.models")}</CardTitle></CardHeader>
            <CardContent>
              <AgentModelFields onChange={setForm} value={form} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="size-4 text-primary" />{t("agentCenter.roleConfig.addTag")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  aria-label={t("agentCenter.roleConfig.addTag")}
                  maxLength={20}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }}
                  value={tagInput}
                />
                <Button aria-label={t("agentCenter.roleConfig.addTag")} onClick={addTag} size="icon" type="button" variant="outline"><Plus className="size-4" /></Button>
              </div>
              <div className="flex min-h-10 flex-wrap gap-2">
                {(form.tagNames || []).map((tag) => (
                  <Badge className="gap-1" key={tag} variant="secondary">
                    {tag}
                    <button aria-label={`remove ${tag}`} onClick={() => setForm({ ...form, tagNames: (form.tagNames || []).filter((item) => item !== tag) })} type="button"><X className="size-3" /></button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("agentCenter.roleConfig.reportText")}</CardTitle></CardHeader>
            <CardContent>
              <label className="space-y-2 text-sm font-medium">
                {t("agentCenter.roleConfig.reportText")}
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  onChange={(event) => setForm({ ...form, chatHistoryConf: Number(event.target.value) })}
                  value={form.chatHistoryConf ?? 0}
                >
                  <option value={0}>{t("agentCenter.agentSnapshot.chatHistoryConf.none")}</option>
                  <option value={1}>{t("agentCenter.agentSnapshot.chatHistoryConf.text")}</option>
                  <option value={2}>{t("agentCenter.agentSnapshot.chatHistoryConf.textVoice")}</option>
                </select>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("agentCenter.functionDialog.title")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={() => setFunctionsOpen(true)} type="button" variant="outline"><Braces className="size-4" />{t("agentCenter.roleConfig.editFunctions")} · {form.functions?.length || 0}</Button>
              <Button className="w-full justify-start" onClick={() => setContextOpen(true)} type="button" variant="outline"><UsersRound className="size-4" />{t("agentCenter.roleConfig.editContextProvider")} · {form.contextProviders?.length || 0}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("nav.devices")}</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline"><Link to={`/device-management?agentId=${encodeURIComponent(agentId)}`}><Cpu className="size-4" />{t("nav.devices")}</Link></Button>
              <Button asChild variant="outline"><Link to={`/voice-print?agentId=${encodeURIComponent(agentId)}`}><UsersRound className="size-4" />{t("nav.voicePrint")}</Link></Button>
            </CardContent>
          </Card>

          <Button className="w-full" disabled={!dirty} onClick={() => setResetOpen(true)} type="button" variant="outline"><RotateCcw className="size-4" />{t("agentCenter.roleConfig.reset")}</Button>
        </div>
      </div>

      {contextOpen ? (
        <ContextProviderDialog
          onOpenChange={setContextOpen}
          onSave={(providers) => setForm({ ...form, contextProviders: providers })}
          open
          providers={form.contextProviders || []}
        />
      ) : null}
      {functionsOpen ? (
        <FunctionDialog
          agentId={agentId}
          functions={form.functions || []}
          onOpenChange={setFunctionsOpen}
          onSave={(functions) => setForm({ ...form, functions })}
          open
        />
      ) : null}
      {snapshotsOpen ? (
        <SnapshotDialog
          agentId={agentId}
          currentVersionNo={agentQuery.data?.currentVersionNo}
          onOpenChange={setSnapshotsOpen}
          onRestored={() => {
            setSnapshotsOpen(false);
            void agentQuery.refetch();
            void tagsQuery.refetch();
          }}
          open
        />
      ) : null}
      {historyOpen ? (
        <ChatHistoryDialog
          agentId={agentId}
          agentName={form.agentName || ""}
          onOpenChange={setHistoryOpen}
          open
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("agentCenter.roleConfig.reset")}
        description={t("agentCenter.roleConfig.confirmReset")}
        onConfirm={() => {
          if (initial) setForm(initial);
          setResetOpen(false);
          toast.success(t("agentCenter.roleConfig.resetSuccess"));
        }}
        onOpenChange={setResetOpen}
        open={resetOpen}
        title={t("agentCenter.roleConfig.reset")}
      />
    </div>
  );
}
