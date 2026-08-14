import { describe, expect, it } from "vitest";

import {
  canParseDocument,
  documentProgress,
  documentStatusCode,
  formatFileSize,
  KNOWLEDGE_NAME_PATTERN,
  progressValue,
  validateFirmwareFile,
  validateKnowledgeFiles,
  validateVoiceDuration,
  validateVoiceFile,
} from "@/features/media/media-utils";

describe("media utilities", () => {
  it("validates names and every upload boundary", () => {
    expect(KNOWLEDGE_NAME_PATTERN.test("产品 FAQ_2026-08")).toBe(true);
    expect(KNOWLEDGE_NAME_PATTERN.test("invalid/name")).toBe(false);
    expect(validateKnowledgeFiles([{ name: "guide.pdf", size: 10 * 1024 * 1024 }])).toEqual({ valid: true });
    expect(validateKnowledgeFiles([{ name: "guide.exe", size: 1 }])).toEqual({ code: "type", valid: false });
    expect(validateFirmwareFile({ name: "xiaozhi.bin", size: 100 * 1024 * 1024 + 1 })).toEqual({ code: "size", valid: false });
    expect(validateVoiceFile({ name: "sample.wav", size: 10 })).toEqual({ valid: true });
    expect(validateVoiceDuration(7.99)).toEqual({ code: "duration", valid: false });
    expect(validateVoiceDuration(60)).toEqual({ valid: true });
  });

  it("normalizes document status and real progress", () => {
    expect(documentStatusCode({ run: "DONE" })).toBe(3);
    expect(documentStatusCode({ parseStatusCode: 1, run: "FAIL" })).toBe(1);
    expect(documentProgress({ parseStatusCode: 1, progress: 0.736 })).toBe(74);
    expect(documentProgress({ parseStatusCode: 3 })).toBe(100);
    expect(canParseDocument({ parseStatusCode: 4 })).toBe(true);
    expect(canParseDocument({ parseStatusCode: 1 })).toBe(false);
  });

  it("formats byte sizes and safe progress values", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(progressValue(75, 100)).toEqual({ loaded: 75, percent: 75, total: 100 });
    expect(progressValue(1)).toEqual({ loaded: 1, percent: 0, total: undefined });
  });
});
