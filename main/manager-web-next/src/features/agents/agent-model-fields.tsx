import { useQueries, useQuery } from "@tanstack/react-query";
import { AudioLines, LoaderCircle } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCorrectWordFiles,
  getModelOptions,
  getVoiceOptions,
} from "@/features/agents/agent-api";
import {
  availableVoiceLanguages,
  voicesForLanguage,
} from "@/features/agents/agent-utils";
import type {
  AgentUpdateInput,
  ModelKind,
} from "@/features/agents/types";

const MODEL_FIELDS: ReadonlyArray<{
  field: keyof AgentUpdateInput;
  kind: ModelKind;
  labelKey: string;
}> = [
  { field: "vadModelId", kind: "VAD", labelKey: "vad" },
  { field: "asrModelId", kind: "ASR", labelKey: "asr" },
  { field: "llmModelId", kind: "LLM", labelKey: "llm" },
  { field: "slmModelId", kind: "SLM", labelKey: "slm" },
  { field: "vllmModelId", kind: "VLLM", labelKey: "vllm" },
  { field: "intentModelId", kind: "Intent", labelKey: "intent" },
  { field: "memModelId", kind: "Memory", labelKey: "memory" },
  { field: "ttsModelId", kind: "TTS", labelKey: "tts" },
];

interface AgentModelFieldsProps {
  disabled?: boolean;
  onChange: (value: AgentUpdateInput) => void;
  value: AgentUpdateInput;
}

function numericValue(value: string): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(-100, Math.min(100, number)) : 0;
}

export function AgentModelFields({
  disabled = false,
  onChange,
  value,
}: AgentModelFieldsProps) {
  const { t } = useTranslation();
  const modelQueries = useQueries({
    queries: MODEL_FIELDS.map(({ kind }) => ({
      queryFn: () => getModelOptions(kind),
      queryKey: ["agent-model-options", kind],
      staleTime: 60_000,
    })),
  });
  const voicesQuery = useQuery({
    enabled: Boolean(value.ttsModelId),
    queryFn: () => getVoiceOptions(value.ttsModelId || ""),
    queryKey: ["agent-voice-options", value.ttsModelId],
  });
  const correctWordsQuery = useQuery({
    queryFn: getCorrectWordFiles,
    queryKey: ["correct-word-files", "all"],
    staleTime: 60_000,
  });

  const voices = useMemo(() => voicesQuery.data || [], [voicesQuery.data]);
  const languages = useMemo(() => availableVoiceLanguages(voices), [voices]);
  const filteredVoices = useMemo(
    () => voicesForLanguage(voices, value.ttsLanguage || ""),
    [value.ttsLanguage, voices],
  );
  const selectedVoice = voices.find((voice) => voice.id === value.ttsVoiceId);
  const selectedCorrectWords = new Set(value.correctWordFileIds || []);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODEL_FIELDS.map(({ field, kind, labelKey }, index) => {
          const query = modelQueries[index]!;
          const currentValue = String(value[field] || "");
          return (
            <div className="space-y-2" key={kind}>
              <Label htmlFor={`agent-model-${kind}`}>
                {t(`agentCenter.roleConfig.${labelKey}`)}
              </Label>
              <div className="relative">
                <select
                  aria-label={t(`agentCenter.roleConfig.${labelKey}`)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  disabled={disabled || query.isPending}
                  id={`agent-model-${kind}`}
                  onChange={(event) => {
                    const next = { ...value, [field]: event.target.value };
                    if (kind === "Memory") {
                      next.chatHistoryConf = event.target.value === "Memory_nomem" ? 0 : 2;
                      if (["Memory_nomem", "Memory_mem_report_only"].includes(event.target.value)) {
                        next.summaryMemory = "";
                      }
                    }
                    if (kind === "TTS") {
                      next.ttsLanguage = "";
                      next.ttsVoiceId = "";
                    }
                    onChange(next);
                  }}
                  value={currentValue}
                >
                  <option value="">{t("agentCenter.roleConfig.pleaseSelect")}</option>
                  {(query.data || []).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.modelName}
                    </option>
                  ))}
                </select>
                {query.isPending ? (
                  <LoaderCircle className="absolute right-2.5 top-3 size-4 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 rounded-xl border bg-muted/15 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="agent-tts-language">
            {t("agentCenter.roleConfig.language")}
          </Label>
          <select
            aria-label={t("agentCenter.roleConfig.language")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
            disabled={disabled || voicesQuery.isPending || languages.length === 0}
            id="agent-tts-language"
            onChange={(event) => {
              const nextLanguage = event.target.value;
              const compatible = voicesForLanguage(voices, nextLanguage);
              onChange({
                ...value,
                ttsLanguage: nextLanguage,
                ttsVoiceId: compatible.some((voice) => voice.id === value.ttsVoiceId)
                  ? value.ttsVoiceId
                  : compatible[0]?.id || "",
              });
            }}
            value={value.ttsLanguage || ""}
          >
            <option value="">{t("agentCenter.roleConfig.selectLanguage")}</option>
            {languages.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-tts-voice">
            {t("agentCenter.roleConfig.voiceType")}
          </Label>
          <select
            aria-label={t("agentCenter.roleConfig.voiceType")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
            disabled={disabled || voicesQuery.isPending || filteredVoices.length === 0}
            id="agent-tts-voice"
            onChange={(event) => onChange({ ...value, ttsVoiceId: event.target.value })}
            value={value.ttsVoiceId || ""}
          >
            <option value="">{t("agentCenter.roleConfig.pleaseSelect")}</option>
            {filteredVoices.map((voice) => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
          </select>
          {selectedVoice?.voiceDemo ? (
            <audio className="mt-2 h-8 w-full" controls preload="none" src={selectedVoice.voiceDemo}>
              <track kind="captions" />
            </audio>
          ) : null}
        </div>
        {([
          ["ttsVolume", "ttsVolume"],
          ["ttsRate", "ttsRate"],
          ["ttsPitch", "ttsPitch"],
        ] as const).map(([field, labelKey]) => (
          <div className="space-y-2" key={field}>
            <div className="flex items-center justify-between">
              <Label htmlFor={`agent-${field}`}>
                {t(`agentCenter.roleConfig.${labelKey}`)}
              </Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {Number(value[field] ?? 0)}%
              </span>
            </div>
            <Input
              disabled={disabled}
              id={`agent-${field}`}
              max={100}
              min={-100}
              onChange={(event) => onChange({
                ...value,
                [field]: numericValue(event.target.value),
              })}
              type="range"
              value={Number(value[field] ?? 0)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AudioLines className="size-4 text-primary" />
          <Label>{t("agentCenter.roleConfig.replacementWordLabel")}</Label>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl border p-3">
          {correctWordsQuery.isPending ? (
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
          ) : (correctWordsQuery.data || []).length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            (correctWordsQuery.data || []).map((file) => file.id ? (
              <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm" key={file.id}>
                <input
                  checked={selectedCorrectWords.has(file.id)}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = new Set(selectedCorrectWords);
                    if (event.target.checked) next.add(file.id || "");
                    else next.delete(file.id || "");
                    onChange({ ...value, correctWordFileIds: [...next] });
                  }}
                  type="checkbox"
                />
                {file.fileName || file.id}
              </label>
            ) : null)
          )}
        </div>
      </div>
    </div>
  );
}
