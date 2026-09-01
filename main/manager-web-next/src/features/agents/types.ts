import type { components } from "@/api/generated/schema";

export type AgentSummary = components["schemas"]["AgentDTO"];
export type AgentDetails = components["schemas"]["AgentInfoVO"];
export type AgentTag = components["schemas"]["AgentTagDTO"];
export type AgentTagEntity = components["schemas"]["AgentTagEntity"];
export type AgentTemplate = components["schemas"]["AgentTemplateVO"];
export type AgentTemplateInput = components["schemas"]["AgentTemplateEntity"];
export type AgentSnapshot = components["schemas"]["AgentSnapshotVO"];
export type AgentSnapshotData = components["schemas"]["AgentSnapshotDataDTO"];
export type ChatSession = components["schemas"]["AgentChatSessionDTO"];
export type ChatMessage = components["schemas"]["AgentChatHistoryDTO"];
export type VoicePrint = components["schemas"]["AgentVoicePrintVO"];
export type RecentVoiceMessage =
  components["schemas"]["AgentChatHistoryUserVO"];

export interface AgentPage<T> {
  list: readonly T[];
  total: number;
}

export interface AgentFunction {
  paramInfo: Record<string, unknown>;
  pluginId: string;
}

export interface ContextProvider {
  headers: Record<string, unknown>;
  url: string;
}

export interface AgentUpdateInput {
  agentCode?: string;
  agentName?: string;
  asrModelId?: string;
  chatHistoryConf?: number;
  contextProviders?: readonly ContextProvider[];
  correctWordFileIds?: readonly string[];
  functions?: readonly AgentFunction[];
  intentModelId?: string;
  langCode?: string;
  language?: string;
  llmModelId?: string;
  memModelId?: string;
  slmModelId?: string;
  sort?: number;
  summaryMemory?: string;
  systemPrompt?: string;
  tagIds?: readonly string[];
  tagNames?: readonly string[];
  ttsLanguage?: string;
  ttsModelId?: string;
  ttsPitch?: number;
  ttsRate?: number;
  ttsVoiceId?: string;
  ttsVolume?: number;
  vadModelId?: string;
  vllmModelId?: string;
}

export type ModelKind =
  | "ASR"
  | "Intent"
  | "LLM"
  | "Memory"
  | "SLM"
  | "TTS"
  | "VAD"
  | "VLLM";

export interface ModelOption {
  id: string;
  modelName: string;
  type?: string;
}

export interface VoiceOption {
  id: string;
  isClone: boolean;
  languages: string;
  name: string;
  voiceDemo?: string;
}

export type PluginFieldType =
  | "array"
  | "bool"
  | "boolean"
  | "json"
  | "number"
  | "password"
  | "password_array"
  | "string";

export interface PluginField {
  default?: unknown;
  key: string;
  label: string;
  remark?: string;
  type: PluginFieldType;
}

export interface PluginDefinition {
  fields: readonly PluginField[];
  id: string;
  name: string;
  providerCode: string;
}

export interface VoicePrintInput {
  agentId?: string;
  audioId: string;
  id?: string;
  introduce: string;
  sourceName: string;
}
