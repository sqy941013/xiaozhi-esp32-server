import { requestData } from "@/api/client";
import type { components } from "@/api/generated/schema";
import {
  normalizePluginDefinition,
} from "@/features/agents/agent-utils";
import type {
  AgentDetails,
  AgentPage,
  AgentSnapshot,
  AgentSummary,
  AgentTag,
  AgentTagEntity,
  AgentTemplate,
  AgentTemplateInput,
  AgentUpdateInput,
  ChatMessage,
  ChatSession,
  ModelKind,
  ModelOption,
  PluginDefinition,
  RecentVoiceMessage,
  VoiceOption,
  VoicePrint,
  VoicePrintInput,
} from "@/features/agents/types";

interface RawPage<T> {
  list?: readonly T[];
  total?: number;
}

interface RawModelOption {
  id?: string;
  modelName?: string;
  type?: string;
}

interface RawPlugin {
  fields?: unknown;
  id?: string;
  name?: string;
  providerCode?: string;
}

type CorrectWordFile = components["schemas"]["CorrectWordFileVO"];

function page<T>(value: RawPage<T> | undefined): AgentPage<T> {
  return {
    list: value?.list || [],
    total: Number(value?.total) || 0,
  };
}

function normalizeModelOption(value: RawModelOption): ModelOption | null {
  if (!value.id) return null;
  return {
    id: value.id,
    modelName: value.modelName || value.id,
    type: value.type,
  };
}

export function getAgents(params: {
  keyword?: string;
  searchType?: "mac" | "name";
} = {}): Promise<readonly AgentSummary[]> {
  return requestData({ method: "GET", params, url: "/agent/list" });
}

export function createAgent(agentName: string): Promise<string> {
  return requestData({ data: { agentName }, method: "POST", url: "/agent" });
}

export function deleteAgent(agentId: string): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/agent/${encodeURIComponent(agentId)}`,
  });
}

export function getAgent(agentId: string): Promise<AgentDetails> {
  return requestData({
    method: "GET",
    url: `/agent/${encodeURIComponent(agentId)}`,
  });
}

export function updateAgent(
  agentId: string,
  input: AgentUpdateInput,
): Promise<void> {
  return requestData({
    data: input,
    method: "PUT",
    url: `/agent/${encodeURIComponent(agentId)}`,
  });
}

export async function getModelOptions(kind: ModelKind): Promise<ModelOption[]> {
  const values = await requestData<readonly RawModelOption[]>({
    method: "GET",
    params: kind === "LLM" ? { modelName: "" } : { modelName: "", modelType: kind },
    url: kind === "LLM" ? "/models/llm/names" : "/models/names",
  });
  return (values || []).flatMap((value) => {
    const normalized = normalizeModelOption(value);
    return normalized ? [normalized] : [];
  });
}

export async function getVoiceOptions(modelId: string): Promise<VoiceOption[]> {
  if (!modelId) return [];
  const values = await requestData<readonly components["schemas"]["VoiceDTO"][]>({
    method: "GET",
    params: { voiceName: "" },
    url: `/models/${encodeURIComponent(modelId)}/voices`,
  });
  return (values || []).flatMap((voice) => {
    if (!voice.id) return [];
    return [{
      id: voice.id,
      isClone: voice.isClone === true,
      languages: voice.languages || "",
      name: voice.name || voice.id,
      voiceDemo: voice.voiceDemo,
    }];
  });
}

export async function getPluginDefinitions(): Promise<PluginDefinition[]> {
  const values = await requestData<readonly RawPlugin[]>({
    method: "GET",
    url: "/models/provider/plugin/names",
  });
  return (values || []).flatMap((value) => {
    const normalized = normalizePluginDefinition(value);
    return normalized ? [normalized] : [];
  });
}

export function getAgentTemplates(): Promise<readonly AgentTemplateInput[]> {
  return requestData({ method: "GET", url: "/agent/template" });
}

export async function getAgentTemplatePage(params: {
  agentName?: string;
  limit: number;
  page: number;
}): Promise<AgentPage<AgentTemplate>> {
  return page(await requestData<RawPage<AgentTemplate>>({
    method: "GET",
    params,
    url: "/agent/template/page",
  }));
}

export function getAgentTemplate(id: string): Promise<AgentTemplate> {
  return requestData({
    method: "GET",
    url: `/agent/template/${encodeURIComponent(id)}`,
  });
}

export function createAgentTemplate(
  input: AgentTemplateInput,
): Promise<AgentTemplateInput> {
  return requestData({ data: input, method: "POST", url: "/agent/template" });
}

export function updateAgentTemplate(
  input: AgentTemplateInput,
): Promise<AgentTemplateInput> {
  return requestData({ data: input, method: "PUT", url: "/agent/template" });
}

export function deleteAgentTemplate(id: string): Promise<string> {
  return requestData({
    method: "DELETE",
    url: `/agent/template/${encodeURIComponent(id)}`,
  });
}

export function deleteAgentTemplates(ids: readonly string[]): Promise<string> {
  return requestData({
    data: ids,
    method: "POST",
    url: "/agent/template/batch-remove",
  });
}

export async function getAgentSnapshots(
  agentId: string,
  params: { limit: number; page: number },
): Promise<AgentPage<AgentSnapshot>> {
  return page(await requestData<RawPage<AgentSnapshot>>({
    method: "GET",
    params,
    url: `/agent/${encodeURIComponent(agentId)}/snapshots`,
  }));
}

export function getAgentSnapshot(
  agentId: string,
  snapshotId: string,
): Promise<AgentSnapshot> {
  return requestData({
    method: "GET",
    url: `/agent/${encodeURIComponent(agentId)}/snapshots/${encodeURIComponent(snapshotId)}`,
  });
}

export function restoreAgentSnapshot(
  agentId: string,
  snapshotId: string,
  currentStateToken: string,
): Promise<void> {
  return requestData({
    data: { currentStateToken },
    method: "POST",
    url: `/agent/${encodeURIComponent(agentId)}/snapshots/${encodeURIComponent(snapshotId)}/restore`,
  });
}

export function deleteAgentSnapshot(
  agentId: string,
  snapshotId: string,
): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/agent/${encodeURIComponent(agentId)}/snapshots/${encodeURIComponent(snapshotId)}`,
  });
}

export function getAgentTags(agentId: string): Promise<readonly AgentTag[]> {
  return requestData({
    method: "GET",
    url: `/agent/${encodeURIComponent(agentId)}/tags`,
  });
}

export function getAllTags(): Promise<readonly AgentTag[]> {
  return requestData({ method: "GET", url: "/agent/tag/list" });
}

export function createTag(tagName: string): Promise<AgentTagEntity> {
  return requestData({ data: { tagName }, method: "POST", url: "/agent/tag" });
}

export function deleteTag(id: string): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/agent/tag/${encodeURIComponent(id)}`,
  });
}

export function saveAgentTags(
  agentId: string,
  tagNames: readonly string[],
): Promise<void> {
  return requestData({
    data: { tagNames },
    method: "PUT",
    url: `/agent/${encodeURIComponent(agentId)}/tags`,
  });
}

export async function getChatSessions(
  agentId: string,
  params: { limit: number; page: number },
): Promise<AgentPage<ChatSession>> {
  return page(await requestData<RawPage<ChatSession>>({
    method: "GET",
    params,
    url: `/agent/${encodeURIComponent(agentId)}/sessions`,
  }));
}

export function getChatHistory(
  agentId: string,
  sessionId: string,
): Promise<readonly ChatMessage[]> {
  return requestData({
    method: "GET",
    url: `/agent/${encodeURIComponent(agentId)}/chat-history/${encodeURIComponent(sessionId)}`,
  });
}

export function getRecentVoiceMessages(
  agentId: string,
): Promise<readonly RecentVoiceMessage[]> {
  return requestData({
    method: "GET",
    url: `/agent/${encodeURIComponent(agentId)}/chat-history/user`,
  });
}

export function getVoiceMessageContent(audioId: string): Promise<string> {
  return requestData({
    method: "GET",
    url: `/agent/${encodeURIComponent(audioId)}/chat-history/audio`,
  });
}

export function createAudioPlayToken(audioId: string): Promise<string> {
  return requestData({
    method: "POST",
    url: `/agent/audio/${encodeURIComponent(audioId)}`,
  });
}

export function createHistoryDownloadToken(
  agentId: string,
  sessionId: string,
): Promise<string> {
  return requestData({
    method: "POST",
    url: `/agent/chat-history/getDownloadUrl/${encodeURIComponent(agentId)}/${encodeURIComponent(sessionId)}`,
  });
}

export function getMcpAddress(agentId: string): Promise<string> {
  return requestData({
    method: "GET",
    url: `/agent/mcp/address/${encodeURIComponent(agentId)}`,
  });
}

export function getMcpTools(agentId: string): Promise<readonly string[]> {
  return requestData({
    method: "GET",
    url: `/agent/mcp/tools/${encodeURIComponent(agentId)}`,
  });
}

export function getVoicePrints(agentId: string): Promise<readonly VoicePrint[]> {
  return requestData({
    method: "GET",
    url: `/agent/voice-print/list/${encodeURIComponent(agentId)}`,
  });
}

export function createVoicePrint(input: VoicePrintInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/agent/voice-print" });
}

export function updateVoicePrint(input: VoicePrintInput): Promise<void> {
  return requestData({ data: input, method: "PUT", url: "/agent/voice-print" });
}

export function deleteVoicePrint(id: string): Promise<void> {
  return requestData({
    method: "DELETE",
    url: `/agent/voice-print/${encodeURIComponent(id)}`,
  });
}

export function getCorrectWordFiles(): Promise<readonly CorrectWordFile[]> {
  return requestData({ method: "GET", url: "/correct-word/file/select" });
}
