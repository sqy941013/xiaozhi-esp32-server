import { describe, expect, it } from "vitest";

import {
  buildWebChatSocketUrl,
  normalizeDeviceMemories,
  parseWebChatFrame,
  textFromAssistantMessage,
} from "@/features/devices/device-chat-utils";

describe("device chat utilities", () => {
  it("builds a same-origin secure WebSocket URL with one ticket", () => {
    expect(
      buildWebChatSocketUrl(
        "/xiaozhi-ws/xiaozhi/v1/web-chat",
        "one-time_ticket",
        "https://console.example.test/device-chat",
      ),
    ).toBe("wss://console.example.test/xiaozhi-ws/xiaozhi/v1/web-chat?ticket=one-time_ticket");
  });

  it("rejects malformed and oversized WebSocket frames", () => {
    expect(parseWebChatFrame("not-json")).toBeNull();
    expect(parseWebChatFrame("[]")).toBeNull();
    expect(parseWebChatFrame("x".repeat(65 * 1024))).toBeNull();
    expect(parseWebChatFrame('{"type":"web_chat","event":"ready"}')).toMatchObject({
      event: "ready",
      type: "web_chat",
    });
  });

  it("normalizes both hosted and self-managed Mem0 response shapes", () => {
    expect(normalizeDeviceMemories({
      results: [{ id: "m1", memory: "喜欢无糖咖啡", updated_at: "2026-08-14" }],
    })).toEqual([{ id: "m1", memory: "喜欢无糖咖啡", updatedAt: "2026-08-14" }]);
    expect(normalizeDeviceMemories([{ content: "住在杭州" }])).toEqual([
      { id: "memory-0", memory: "住在杭州" },
    ]);
  });

  it("extracts only text parts from assistant-ui messages", () => {
    expect(textFromAssistantMessage([
      { type: "text", text: " 请记住 " },
      { type: "image" },
      { type: "text", text: "这件事" },
    ])).toBe("请记住 这件事");
  });
});
