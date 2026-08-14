import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAgentTemplate,
  getAgentTemplate,
  getAgentTemplates,
  updateAgentTemplate,
} from "@/features/agents/agent-api";
import { AgentModelFields } from "@/features/agents/agent-model-fields";
import type { AgentTemplateInput, AgentUpdateInput } from "@/features/agents/types";

const DEFAULT_TEMPLATE: AgentUpdateInput = {
  agentCode: "小智",
  agentName: "",
  asrModelId: "ASR_FunASR",
  chatHistoryConf: 0,
  intentModelId: "Intent_function_call",
  langCode: "",
  language: "",
  llmModelId: "LLM_ChatGLMLLM",
  memModelId: "Memory_nomem",
  summaryMemory: "",
  systemPrompt: "",
  ttsLanguage: "",
  ttsModelId: "TTS_EdgeTTS",
  ttsPitch: 0,
  ttsRate: 0,
  ttsVoiceId: "",
  ttsVolume: 0,
  vadModelId: "VAD_SileroVAD",
  vllmModelId: "VLLM_ChatGLMVLLM",
};

function templateToForm(template: AgentTemplateInput): AgentUpdateInput {
  return {
    ...DEFAULT_TEMPLATE,
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

function formToTemplate(form: AgentUpdateInput, id: string, sort: number): AgentTemplateInput {
  return {
    agentCode: form.agentCode,
    agentName: form.agentName,
    asrModelId: form.asrModelId,
    chatHistoryConf: form.chatHistoryConf,
    id: id || undefined,
    intentModelId: form.intentModelId,
    langCode: form.langCode,
    language: form.language,
    llmModelId: form.llmModelId,
    memModelId: form.memModelId,
    sort,
    summaryMemory: form.summaryMemory,
    systemPrompt: form.systemPrompt,
    ttsLanguage: form.ttsLanguage,
    ttsModelId: form.ttsModelId,
    ttsPitch: form.ttsPitch,
    ttsRate: form.ttsRate,
    ttsVoiceId: form.ttsVoiceId,
    ttsVolume: form.ttsVolume,
    vadModelId: form.vadModelId,
    vllmModelId: form.vllmModelId,
  };
}

export function TemplateQuickConfigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId") || "";
  const draftKey = templateId || "new";
  const [draft, setDraft] = useState<{
    key: string;
    sort: number;
    value: AgentUpdateInput;
  } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const templateQuery = useQuery({
    enabled: Boolean(templateId),
    queryFn: () => getAgentTemplate(templateId),
    queryKey: ["agent-template", templateId],
  });
  const templateListQuery = useQuery({
    enabled: !templateId,
    queryFn: getAgentTemplates,
    queryKey: ["agent-templates", "all"],
  });

  const initial = useMemo(() => {
    if (templateId && templateQuery.data) {
      return {
        sort: templateQuery.data.sort ?? 1,
        value: templateToForm(templateQuery.data),
      };
    }
    if (!templateId && templateListQuery.data) {
      return {
        sort: Math.max(0, ...templateListQuery.data.map((item) => item.sort || 0)) + 1,
        value: {
          ...DEFAULT_TEMPLATE,
          agentName: t("agentCenter.templateQuickConfig.newTemplate"),
        },
      };
    }
    return null;
  }, [templateId, templateListQuery.data, templateQuery.data, t]);
  const form = draft?.key === draftKey ? draft.value : initial?.value || null;
  const sort = draft?.key === draftKey ? draft.sort : initial?.sort || 1;
  const setForm = useCallback((value: AgentUpdateInput) => {
    setDraft((current) => ({
      key: draftKey,
      sort: current?.key === draftKey ? current.sort : initial?.sort || 1,
      value,
    }));
  }, [draftKey, initial?.sort]);
  const setSort = useCallback((nextSort: number) => {
    setDraft((current) => ({
      key: draftKey,
      sort: nextSort,
      value: current?.key === draftKey
        ? current.value
        : initial?.value || DEFAULT_TEMPLATE,
    }));
  }, [draftKey, initial?.value]);

  const saveMutation = useMutation({
    mutationFn: (input: AgentTemplateInput) => templateId
      ? updateAgentTemplate(input)
      : createAgentTemplate(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent-template-page"] }),
        queryClient.invalidateQueries({ queryKey: ["agent-templates"] }),
      ]);
      toast.success(t("agentCenter.templateQuickConfig.saveSuccess"));
      void navigate("/agent-template-management");
    },
  });
  const dirty = useMemo(() => Boolean(form && initial && (
    JSON.stringify(form) !== JSON.stringify(initial.value) || sort !== initial.sort
  )), [form, initial, sort]);

  async function save() {
    if (!form?.agentName?.trim() || !form.systemPrompt?.trim()) return;
    try {
      await saveMutation.mutateAsync(formToTemplate({ ...form, agentName: form.agentName.trim() }, templateId, sort));
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.templateQuickConfig.saveFailed")));
    }
  }

  if (!form) return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto w-full max-w-[1300px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={<><Button asChild variant="outline"><Link to="/agent-template-management"><ArrowLeft className="size-4" />{t("common.close")}</Link></Button><Button disabled={!dirty || !form.agentName?.trim() || !form.systemPrompt?.trim() || saveMutation.isPending} onClick={() => void save()}>{saveMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{t("agentCenter.templateQuickConfig.saveConfig")}</Button></>}
        description={t("agentCenter.templateQuickConfig.agentSettings.systemPromptPlaceholder")}
        title={templateId ? t("agentCenter.templateQuickConfig.editTemplate") : t("agentCenter.templateQuickConfig.addTemplate")}
      />
      <Card>
        <CardHeader><CardTitle>{t("agentCenter.templateQuickConfig.title")}</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-[1fr_160px]">
          <div className="space-y-2"><Label htmlFor="template-name">{t("agentCenter.templateQuickConfig.agentSettings.agentName")}</Label><Input id="template-name" onChange={(event) => setForm({ ...form, agentName: event.target.value })} value={form.agentName || ""} /></div>
          <div className="space-y-2"><Label htmlFor="template-sort">Sort</Label><Input id="template-sort" min={0} onChange={(event) => setSort(Number(event.target.value) || 0)} type="number" value={sort} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="template-prompt">{t("agentCenter.templateQuickConfig.agentSettings.systemPrompt")}</Label><Textarea id="template-prompt" maxLength={2000} onChange={(event) => setForm({ ...form, systemPrompt: event.target.value })} rows={14} value={form.systemPrompt || ""} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("nav.models")}</CardTitle></CardHeader>
        <CardContent><AgentModelFields onChange={setForm} value={form} /></CardContent>
      </Card>
      <div className="flex justify-end"><Button disabled={!dirty} onClick={() => setResetOpen(true)} variant="outline"><RotateCcw className="size-4" />{t("agentCenter.templateQuickConfig.resetConfig")}</Button></div>
      <ConfirmDialog cancelLabel={t("common.cancel")} confirmLabel={t("agentCenter.templateQuickConfig.resetConfig")} description={t("agentCenter.templateQuickConfig.confirmReset")} onConfirm={() => { setDraft(null); setResetOpen(false); }} onOpenChange={setResetOpen} open={resetOpen} title={t("agentCenter.templateQuickConfig.resetConfig")} />
    </div>
  );
}
