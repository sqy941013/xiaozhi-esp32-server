import type {
  AgentDetails,
  AgentFunction,
  AgentSnapshotData,
  AgentUpdateInput,
  ContextProvider,
  PluginDefinition,
  PluginField,
  PluginFieldType,
  VoiceOption,
} from "@/features/agents/types";

const SUPPORTED_PLUGIN_FIELD_TYPES = new Set<PluginFieldType>([
  "array",
  "bool",
  "boolean",
  "json",
  "number",
  "password",
  "string",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeParamInfo(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return { ...value };
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function parsePluginFields(value: unknown): PluginField[] {
  let candidate = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(candidate)) return [];

  return candidate.flatMap((field) => {
    if (!isRecord(field)) return [];
    const key = typeof field.key === "string" ? field.key.trim() : "";
    if (!key) return [];
    const rawType = typeof field.type === "string" ? field.type : "string";
    const type = SUPPORTED_PLUGIN_FIELD_TYPES.has(rawType as PluginFieldType)
      ? (rawType as PluginFieldType)
      : "string";
    return [
      {
        default: field.default,
        key,
        label:
          typeof field.label === "string" && field.label.trim()
            ? field.label
            : key,
        remark: typeof field.remark === "string" ? field.remark : undefined,
        type,
      },
    ];
  });
}

export function normalizePluginDefinition(value: {
  fields?: unknown;
  id?: string;
  name?: string;
  providerCode?: string;
}): PluginDefinition | null {
  if (!value.id) return null;
  return {
    fields: parsePluginFields(value.fields),
    id: value.id,
    name: value.name || value.id,
    providerCode: value.providerCode || "",
  };
}

export function normalizeAgentFunctions(
  value: AgentDetails["functions"],
): AgentFunction[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((mapping) => {
    if (!mapping.pluginId) return [];
    return [
      {
        paramInfo: normalizeParamInfo(mapping.paramInfo),
        pluginId: mapping.pluginId,
      },
    ];
  });
}

export function normalizeContextProviders(
  value: AgentDetails["contextProviders"],
): ContextProvider[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((provider) => {
    const url = provider.url?.trim();
    if (!url) return [];
    return [
      {
        headers: isRecord(provider.headers) ? { ...provider.headers } : {},
        url,
      },
    ];
  });
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function splitVoiceLanguages(voice: Pick<VoiceOption, "languages">): string[] {
  return voice.languages
    .split(/[、；;,，]/)
    .map((language) => language.trim())
    .filter(Boolean);
}

export function availableVoiceLanguages(voices: readonly VoiceOption[]): string[] {
  return [...new Set(voices.flatMap(splitVoiceLanguages))];
}

export function voicesForLanguage(
  voices: readonly VoiceOption[],
  language: string,
): VoiceOption[] {
  return voices.filter((voice) => {
    const languages = splitVoiceLanguages(voice);
    return languages.length === 0 || !language || languages.includes(language);
  });
}

export function toAgentUpdateInput(
  details: AgentDetails,
  overrides: Partial<AgentUpdateInput> = {},
): AgentUpdateInput {
  return {
    agentCode: details.agentCode || "",
    agentName: details.agentName || "",
    asrModelId: details.asrModelId || "",
    chatHistoryConf: details.chatHistoryConf ?? 0,
    contextProviders: normalizeContextProviders(details.contextProviders),
    correctWordFileIds: details.correctWordFileIds || [],
    functions: normalizeAgentFunctions(details.functions),
    intentModelId: details.intentModelId || "",
    langCode: details.langCode || "",
    language: details.language || "",
    llmModelId: details.llmModelId || "",
    memModelId: details.memModelId || "",
    slmModelId: details.slmModelId || "",
    sort: details.sort ?? 0,
    summaryMemory: details.summaryMemory || "",
    systemPrompt: details.systemPrompt || "",
    ttsLanguage: details.ttsLanguage || "",
    ttsModelId: details.ttsModelId || "",
    ttsPitch: details.ttsPitch ?? 0,
    ttsRate: details.ttsRate ?? 0,
    ttsVoiceId: details.ttsVoiceId || "",
    ttsVolume: details.ttsVolume ?? 0,
    vadModelId: details.vadModelId || "",
    vllmModelId: details.vllmModelId || "",
    ...overrides,
  };
}

export function snapshotFieldValues(
  snapshot: AgentSnapshotData | undefined,
  current: AgentSnapshotData | undefined,
  fieldOrder: readonly string[] | undefined,
): Array<{ current: unknown; field: string; snapshot: unknown }> {
  const keys = fieldOrder?.length
    ? fieldOrder
    : [...new Set([...Object.keys(snapshot || {}), ...Object.keys(current || {})])];
  return keys.map((field) => ({
    current: current?.[field as keyof AgentSnapshotData],
    field,
    snapshot: snapshot?.[field as keyof AgentSnapshotData],
  }));
}

export function formatSnapshotValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}
