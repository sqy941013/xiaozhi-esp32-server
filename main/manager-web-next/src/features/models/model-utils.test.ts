import { describe, expect, it } from "vitest";

import {
  buildConfigPayload,
  isMaskedValue,
  isSensitiveField,
  normalizeConfigJson,
  parseProviderFields,
  parseStructuredField,
  safeExternalUrl,
  safeMediaUrl,
  validateModelId,
} from "@/features/models/model-utils";

describe("model configuration utilities", () => {
  it("parses provider field definitions defensively", () => {
    expect(
      parseProviderFields(
        '[{"key":"api_key","label":"API key","type":"string"},{"key":"sample_rate","type":"integer"},{"key":"protocol","type":"string","options":["websocket","http"]},{"key":"options","type":"dict"}]',
      ),
    ).toEqual([
      { key: "api_key", label: "API key", type: "string" },
      { key: "sample_rate", label: "sample_rate", type: "number" },
      {
        key: "protocol",
        label: "protocol",
        options: ["websocket", "http"],
        type: "string",
      },
      { key: "options", label: "options", type: "dict" },
    ]);
    expect(parseProviderFields("not json")).toEqual([]);
  });

  it("recognizes backend masks and credential aliases without flagging max_tokens", () => {
    expect(isMaskedValue("sk-ab****yz")).toBe(true);
    expect(isSensitiveField("embedding_api_key")).toBe(true);
    expect(isSensitiveField("api_secret")).toBe(true);
    expect(isSensitiveField("api_password")).toBe(true);
    expect(isSensitiveField("max_tokens")).toBe(false);
  });

  it("omits an unchanged masked secret while preserving typed zero and false", () => {
    const fields = parseProviderFields([
      { key: "api_key", label: "API key", type: "string" },
      { key: "temperature", label: "Temperature", type: "number" },
      { key: "thinking", label: "Thinking", type: "boolean" },
    ]);

    expect(
      buildConfigPayload(
        fields,
        "openai",
        { api_key: "", temperature: "0", thinking: false },
        {
          editing: true,
          originalConfig: { api_key: "sk-a****z" },
        },
      ),
    ).toEqual({ type: "openai", temperature: 0, thinking: false });

    expect(
      buildConfigPayload(
        [{ key: "credential", label: "Credential", type: "password" }],
        "custom",
        { credential: "" },
        {
          editing: true,
          originalConfig: { credential: "ab****yz" },
        },
      ),
    ).toEqual({ type: "custom" });
  });

  it("requires the correct JSON container type", () => {
    expect(parseStructuredField('{"enabled":true}', "dict")).toEqual({
      enabled: true,
    });
    expect(parseStructuredField('["zh","en"]', "array")).toEqual([
      "zh",
      "en",
    ]);
    expect(() => parseStructuredField("[]", "dict")).toThrow(
      "expectedObject",
    );
  });

  it("normalizes Hutool raw JSON and validates optional model IDs", () => {
    expect(normalizeConfigJson({ raw: { type: "openai" } })).toEqual({
      type: "openai",
    });
    expect(validateModelId("")).toBe(true);
    expect(validateModelId("LLM_MiniMax-27")).toBe(true);
    expect(validateModelId("bad id")).toBe(false);
  });

  it("only exposes safe documentation and media URLs", () => {
    expect(safeExternalUrl("https://example.com/docs")).toBe(
      "https://example.com/docs",
    );
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("/local-doc")).toBeNull();
    expect(safeMediaUrl("/audio/demo.mp3")).toBe("/audio/demo.mp3");
    expect(safeMediaUrl("//evil.example/audio.mp3")).toBeNull();
  });
});
