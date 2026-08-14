import type { components } from "@/api/generated/schema";

export type KnowledgeBase = components["schemas"]["KnowledgeBaseDTO"];
export type KnowledgeDocument = components["schemas"]["KnowledgeFilesDTO"];
export type Firmware = components["schemas"]["OtaEntity"];
export type VoiceClone = components["schemas"]["VoiceCloneResponseDTO"];
export type VoiceResourceInput = components["schemas"]["VoiceCloneDTO"];
export type RagModel = components["schemas"]["ModelConfigEntity"];
export type AdminUser = components["schemas"]["AdminPageUserVO"];
export type FirmwareType = components["schemas"]["SysDictDataItem"];

export interface PageData<T> {
  list: T[];
  total: number;
}

export interface KnowledgeBaseInput {
  description: string;
  name: string;
  ragModelId: string;
  status: number;
}

export interface KnowledgeChunk {
  available?: boolean;
  content: string;
  dataset_id?: string;
  docnm_kwd?: string;
  document_id: string;
  id: string;
  important_keywords?: readonly string[];
  questions?: readonly string[];
}

export interface ChunkPage {
  chunks: KnowledgeChunk[];
  total: number;
}

export interface RetrievalHit {
  content: string;
  document_id: string;
  document_keyword?: string;
  document_name?: string;
  id: string;
  similarity: number;
}

export interface RetrievalResult {
  chunks: RetrievalHit[];
  total: number;
}

export interface VoicePlatform {
  id: string;
  modelName: string;
}

export interface FirmwareInput {
  firmwareName: string;
  firmwarePath: string;
  remark: string;
  size: number;
  type: string;
  version: string;
}

export interface UploadProgress {
  loaded: number;
  percent: number;
  total?: number;
}

export interface FileValidationResult {
  code?: "count" | "duration" | "size" | "type";
  valid: boolean;
}
