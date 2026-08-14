import type {
  FileValidationResult,
  KnowledgeDocument,
  UploadProgress,
} from "@/features/media/types";

export const KNOWLEDGE_FILE_LIMIT = 32;
export const KNOWLEDGE_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const FIRMWARE_FILE_MAX_BYTES = 100 * 1024 * 1024;
export const VOICE_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const KNOWLEDGE_NAME_PATTERN = /^[\p{Script=Han}a-zA-Z0-9\s_-]+$/u;
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const knowledgeExtensions = new Set([
  "csv", "doc", "docx", "md", "mdx", "pdf", "ppt", "pptx", "txt", "xls", "xlsx",
]);
const firmwareExtensions = new Set(["apk", "bin"]);
const voiceExtensions = new Set(["mp3", "wav"]);

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

function validateFile(
  file: Pick<File, "name" | "size">,
  allowed: ReadonlySet<string>,
  maxBytes: number,
): FileValidationResult {
  if (!allowed.has(fileExtension(file.name))) return { code: "type", valid: false };
  if (file.size > maxBytes) return { code: "size", valid: false };
  return { valid: true };
}

export function validateKnowledgeFiles(files: readonly Pick<File, "name" | "size">[]): FileValidationResult {
  if (files.length > KNOWLEDGE_FILE_LIMIT) return { code: "count", valid: false };
  for (const file of files) {
    const result = validateFile(file, knowledgeExtensions, KNOWLEDGE_FILE_MAX_BYTES);
    if (!result.valid) return result;
  }
  return { valid: true };
}

export function validateFirmwareFile(file: Pick<File, "name" | "size">): FileValidationResult {
  return validateFile(file, firmwareExtensions, FIRMWARE_FILE_MAX_BYTES);
}

export function validateVoiceFile(file: Pick<File, "name" | "size">): FileValidationResult {
  return validateFile(file, voiceExtensions, VOICE_FILE_MAX_BYTES);
}

export function validateVoiceDuration(seconds: number): FileValidationResult {
  return seconds >= 8 && seconds <= 60
    ? { valid: true }
    : { code: "duration", valid: false };
}

export function progressValue(loaded: number, total?: number): UploadProgress {
  return {
    loaded,
    percent: total && total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0,
    total,
  };
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes < 1) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function formatMediaDate(value: string | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function documentStatusCode(document: KnowledgeDocument): number {
  if (typeof document.parseStatusCode === "number") return document.parseStatusCode;
  switch (document.run?.toUpperCase()) {
    case "RUNNING": return 1;
    case "CANCEL": return 2;
    case "DONE": return 3;
    case "FAIL": return 4;
    default: return 0;
  }
}

export function documentProgress(document: KnowledgeDocument): number {
  const status = documentStatusCode(document);
  if (status === 3) return 100;
  if (status !== 1) return 0;
  const progress = Number(document.progress);
  return Number.isFinite(progress) ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : 50;
}

export function canParseDocument(document: KnowledgeDocument): boolean {
  return ![1, 3].includes(documentStatusCode(document));
}
