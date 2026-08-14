import type { DeviceMemory } from "@/features/devices/types";

export interface WebChatFrame {
  [key: string]: unknown;
  event?: string;
  type?: string;
}

export function buildWebChatSocketUrl(
  websocketPath: string,
  ticket: string,
  pageUrl = window.location.href,
): string {
  const url = new URL(websocketPath, pageUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.search = "";
  url.searchParams.set("ticket", ticket);
  return url.toString();
}

export function parseWebChatFrame(data: unknown): WebChatFrame | null {
  if (typeof data !== "string" || data.length > 64 * 1024) return null;
  try {
    const parsed: unknown = JSON.parse(data);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as WebChatFrame)
      : null;
  } catch {
    return null;
  }
}

function memoryArray(payload: unknown): readonly unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.results)) return record.results;
  if (Array.isArray(record.memories)) return record.memories;
  return [];
}

export function normalizeDeviceMemories(payload: unknown): DeviceMemory[] {
  return memoryArray(payload).flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const memory = [record.memory, record.content, record.text].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    if (!memory) return [];
    return [{
      createdAt: typeof record.created_at === "string" ? record.created_at : undefined,
      id: typeof record.id === "string" ? record.id : `memory-${index}`,
      memory: memory.trim(),
      updatedAt: typeof record.updated_at === "string" ? record.updated_at : undefined,
    }];
  });
}

export function textFromAssistantMessage(
  content: readonly { type: string; text?: string }[],
): string {
  return content
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
}
