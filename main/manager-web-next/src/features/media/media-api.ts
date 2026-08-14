import type { AxiosProgressEvent } from "axios";

import { apiResourceUrl, requestData } from "@/api/client";
import { progressValue } from "@/features/media/media-utils";
import type {
  AdminUser,
  ChunkPage,
  Firmware,
  FirmwareInput,
  FirmwareType,
  KnowledgeBase,
  KnowledgeBaseInput,
  KnowledgeChunk,
  KnowledgeDocument,
  PageData,
  RagModel,
  RetrievalResult,
  UploadProgress,
  VoiceClone,
  VoicePlatform,
  VoiceResourceInput,
} from "@/features/media/types";

interface RawPage<T> {
  list?: readonly T[];
  total?: number;
}

interface RawChunkPage {
  chunks?: readonly KnowledgeChunk[];
  list?: readonly KnowledgeChunk[];
  total?: number;
}

function page<T>(value?: RawPage<T>): PageData<T> {
  return { list: [...(value?.list || [])], total: Number(value?.total) || 0 };
}

function uploadProgress(callback?: (progress: UploadProgress) => void) {
  if (!callback) return undefined;
  return (event: AxiosProgressEvent) => callback(progressValue(event.loaded, event.total));
}

export async function getKnowledgeBases(params: { name: string; page?: number; pageSize?: number }): Promise<PageData<KnowledgeBase>> {
  return page(await requestData<RawPage<KnowledgeBase>>({
    method: "GET",
    params: { name: params.name, page: params.page || 1, page_size: params.pageSize || 100 },
    url: "/datasets",
  }));
}

export function createKnowledgeBase(input: KnowledgeBaseInput): Promise<KnowledgeBase> {
  return requestData({ data: input, method: "POST", url: "/datasets" });
}

export function updateKnowledgeBase(datasetId: string, input: KnowledgeBaseInput): Promise<KnowledgeBase> {
  return requestData({ data: input, method: "PUT", url: `/datasets/${encodeURIComponent(datasetId)}` });
}

export function deleteKnowledgeBase(datasetId: string): Promise<void> {
  return requestData({ method: "DELETE", url: `/datasets/${encodeURIComponent(datasetId)}` });
}

export function getRagModels(): Promise<readonly RagModel[]> {
  return requestData({ method: "GET", url: "/datasets/rag-models" });
}

export async function getKnowledgeDocuments(datasetId: string, params: { name: string; page: number; pageSize: number }): Promise<PageData<KnowledgeDocument>> {
  return page(await requestData<RawPage<KnowledgeDocument>>({
    method: "GET",
    params: { name: params.name, page: params.page, page_size: params.pageSize },
    url: `/datasets/${encodeURIComponent(datasetId)}/documents`,
  }));
}

export function uploadKnowledgeDocument(datasetId: string, file: File, onProgress?: (progress: UploadProgress) => void): Promise<KnowledgeDocument> {
  const data = new FormData();
  data.append("file", file);
  return requestData({
    data,
    method: "POST",
    onUploadProgress: uploadProgress(onProgress),
    url: `/datasets/${encodeURIComponent(datasetId)}/documents`,
  });
}

export function deleteKnowledgeDocuments(datasetId: string, ids: readonly string[]): Promise<void> {
  return requestData({
    data: { ids },
    method: "DELETE",
    url: `/datasets/${encodeURIComponent(datasetId)}/documents`,
  });
}

export function parseKnowledgeDocuments(datasetId: string, ids: readonly string[]): Promise<void> {
  return requestData({
    data: { document_ids: ids },
    method: "POST",
    url: `/datasets/${encodeURIComponent(datasetId)}/chunks`,
  });
}

export async function getKnowledgeChunks(datasetId: string, documentId: string, params: { keywords?: string; page: number; pageSize: number }): Promise<ChunkPage> {
  const value = await requestData<RawChunkPage | readonly KnowledgeChunk[]>({
    method: "GET",
    params: { keywords: params.keywords || undefined, page: params.page, page_size: params.pageSize },
    url: `/datasets/${encodeURIComponent(datasetId)}/documents/${encodeURIComponent(documentId)}/chunks`,
  });
  if (Array.isArray(value)) return { chunks: [...value] as KnowledgeChunk[], total: value.length };
  const result = value as RawChunkPage | undefined;
  const chunks = [...(result?.chunks || result?.list || [])];
  return { chunks, total: Number(result?.total) || chunks.length };
}

export async function runRetrievalTest(datasetId: string, question: string): Promise<RetrievalResult> {
  const result = await requestData<Partial<RetrievalResult>>({
    data: { dataset_ids: [datasetId], page: 1, page_size: 10, question },
    method: "POST",
    url: `/datasets/${encodeURIComponent(datasetId)}/retrieval-test`,
  });
  return { chunks: [...(result?.chunks || [])], total: Number(result?.total) || result?.chunks?.length || 0 };
}

export async function getVoiceClones(params: { limit: number; name: string; page: number }): Promise<PageData<VoiceClone>> {
  return page(await requestData<RawPage<VoiceClone>>({
    method: "GET",
    params: { ...params, order: "desc", orderField: "create_date" },
    url: "/voiceClone",
  }));
}

export function uploadVoiceSample(id: string, file: File, onProgress?: (progress: UploadProgress) => void): Promise<void> {
  const data = new FormData();
  data.append("id", id);
  data.append("voiceFile", file);
  return requestData({ data, method: "POST", onUploadProgress: uploadProgress(onProgress), url: "/voiceClone/upload" });
}

export function updateVoiceCloneName(id: string, name: string): Promise<void> {
  return requestData({ data: { id, name }, method: "POST", url: "/voiceClone/updateName" });
}

export function startVoiceClone(id: string): Promise<void> {
  return requestData({ data: { cloneId: id }, method: "POST", url: "/voiceClone/cloneAudio" });
}

export async function getVoicePlaybackUrl(id: string): Promise<string> {
  const token = await requestData<string>({ method: "POST", url: `/voiceClone/audio/${encodeURIComponent(id)}` });
  return apiResourceUrl(`/voiceClone/play/${encodeURIComponent(token)}`);
}

export async function getVoiceResources(params: { limit: number; name: string; page: number }): Promise<PageData<VoiceClone>> {
  return page(await requestData<RawPage<VoiceClone>>({
    method: "GET",
    params: { ...params, order: "desc", orderField: "create_date" },
    url: "/voiceResource",
  }));
}

export function createVoiceResource(input: VoiceResourceInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/voiceResource" });
}

export function deleteVoiceResources(ids: readonly string[]): Promise<void> {
  return requestData({ method: "DELETE", url: `/voiceResource/${ids.map(encodeURIComponent).join(",")}` });
}

export async function getVoicePlatforms(): Promise<VoicePlatform[]> {
  const values = await requestData<readonly Record<string, unknown>[]>({ method: "GET", url: "/voiceResource/ttsPlatforms" });
  return (values || []).flatMap((value) => {
    const id = String(value.id || "");
    if (!id) return [];
    return [{ id, modelName: String(value.modelName || value.name || id) }];
  });
}

export async function searchAdminUsers(mobile: string): Promise<PageData<AdminUser>> {
  return page(await requestData<RawPage<AdminUser>>({
    method: "GET",
    params: { limit: 20, mobile, page: 1 },
    url: "/admin/users",
  }));
}

export async function getFirmwarePage(params: { firmwareName: string; limit: number; page: number }): Promise<PageData<Firmware>> {
  return page(await requestData<RawPage<Firmware>>({
    method: "GET",
    params: { ...params, order: "desc", orderField: "create_date" },
    url: "/otaMag",
  }));
}

export function createFirmware(input: FirmwareInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/otaMag" });
}

export function updateFirmware(id: string, input: FirmwareInput): Promise<void> {
  return requestData({ data: input, method: "PUT", url: `/otaMag/${encodeURIComponent(id)}` });
}

export function deleteFirmware(ids: readonly string[]): Promise<void> {
  return requestData({ method: "DELETE", url: `/otaMag/${ids.map(encodeURIComponent).join(",")}` });
}

export function uploadFirmware(file: File, onProgress?: (progress: UploadProgress) => void): Promise<string> {
  const data = new FormData();
  data.append("file", file);
  return requestData({ data, method: "POST", onUploadProgress: uploadProgress(onProgress), url: "/otaMag/upload" });
}

export async function getFirmwareDownloadUrl(id: string): Promise<string> {
  const token = await requestData<string>({ method: "GET", url: `/otaMag/getDownloadUrl/${encodeURIComponent(id)}` });
  return apiResourceUrl(`/otaMag/download/${encodeURIComponent(token)}`);
}

export function getFirmwareTypes(): Promise<readonly FirmwareType[]> {
  return requestData({ method: "GET", url: "/admin/dict/data/type/FIRMWARE_TYPE" });
}
