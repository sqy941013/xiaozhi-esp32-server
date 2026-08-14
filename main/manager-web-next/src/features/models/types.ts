import type { components } from "@/api/generated/schema";

type GeneratedModelConfig = components["schemas"]["ModelConfigDTO"];
type GeneratedProvider = components["schemas"]["ModelProviderDTO"];
type GeneratedTimbre = components["schemas"]["TimbreDetailsVO"];

export const MODEL_TYPES = [
  "VAD",
  "ASR",
  "LLM",
  "VLLM",
  "Intent",
  "TTS",
  "Memory",
  "RAG",
] as const;

export const PROVIDER_MODEL_TYPES = [...MODEL_TYPES, "Plugin"] as const;

export type ModelType = (typeof MODEL_TYPES)[number];
export type ProviderModelType = (typeof PROVIDER_MODEL_TYPES)[number];

export type JsonRecord = Record<string, unknown>;

export interface ModelConfig
  extends Omit<GeneratedModelConfig, "configJson"> {
  configJson: JsonRecord;
  id: string;
  isDefault: number;
  isEnabled: number;
  modelCode: string;
  modelName: string;
  modelType: string;
  sort: number;
}

export type ProviderFieldType =
  | "array"
  | "boolean"
  | "dict"
  | "number"
  | "password"
  | "RAG"
  | "string";

export interface ProviderFieldDefinition {
  default?: unknown;
  dict_name?: string;
  key: string;
  label: string;
  options?: string[];
  type: ProviderFieldType;
}

export interface ModelProvider
  extends Omit<GeneratedProvider, "fields"> {
  fields: ProviderFieldDefinition[];
}

export interface ModelPage {
  list: ModelConfig[];
  total: number;
}

export interface ProviderPage {
  list: ModelProvider[];
  total: number;
}

export interface ModelMutationInput {
  configJson: JsonRecord;
  docLink?: string;
  id?: string;
  isDefault: number;
  isEnabled: number;
  modelCode: string;
  modelName: string;
  remark?: string;
  sort: number;
}

export interface ProviderMutationInput {
  fields: ProviderFieldDefinition[];
  id?: string;
  modelType: ProviderModelType;
  name: string;
  providerCode: string;
  sort: number;
}

export interface Timbre extends GeneratedTimbre {
  id: string;
  languages: string;
  name: string;
  sort: number;
  ttsModelId: string;
  ttsVoice: string;
}

export interface TimbrePage {
  list: Timbre[];
  total: number;
}

export interface TimbreMutationInput {
  languages: string;
  name: string;
  referenceAudio?: string;
  referenceText?: string;
  remark?: string;
  sort: number;
  ttsModelId: string;
  ttsVoice: string;
  voiceDemo?: string;
}
