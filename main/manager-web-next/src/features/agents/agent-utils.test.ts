import { describe, expect, it } from "vitest";

import {
  availableVoiceLanguages,
  formatSnapshotValue,
  isHttpUrl,
  normalizeAgentFunctions,
  normalizeContextProviders,
  normalizeParamInfo,
  parsePluginFields,
  snapshotFieldValues,
  voicesForLanguage,
} from "@/features/agents/agent-utils";

describe("agent configuration utilities", () => {
  it("normalizes saved plugin mappings and invalid JSON defensively", () => {
    expect(normalizeParamInfo('{"city":"深圳"}')).toEqual({ city: "深圳" });
    expect(normalizeParamInfo("not-json")).toEqual({});
    expect(normalizeAgentFunctions([
      { agentId: "a", pluginId: "weather", paramInfo: '{"city":"深圳"}' },
      { agentId: "a", paramInfo: "{}" },
    ])).toEqual([{ paramInfo: { city: "深圳" }, pluginId: "weather" }]);
  });

  it("parses typed plugin fields while rejecting malformed definitions", () => {
    expect(parsePluginFields('[{"key":"enabled","type":"bool"},{"key":"keys","type":"password_array"},{"key":"limit","type":"integer"}]')).toEqual([
      { default: undefined, key: "enabled", label: "enabled", remark: undefined, type: "bool" },
      { default: undefined, key: "keys", label: "keys", remark: undefined, type: "password_array" },
      { default: undefined, key: "limit", label: "limit", remark: undefined, type: "string" },
    ]);
    expect(parsePluginFields("not-json")).toEqual([]);
  });

  it("only accepts HTTP context providers and normalizes headers", () => {
    expect(isHttpUrl("http://192.168.123.225:11434/api/chat")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(normalizeContextProviders([
      { headers: { Authorization: "Bearer token" }, url: " http://localhost/context " },
      { headers: {}, url: "" },
    ])).toEqual([
      { headers: { Authorization: "Bearer token" }, url: "http://localhost/context" },
    ]);
  });

  it("derives voice languages without hiding voices that declare no language", () => {
    const voices = [
      { id: "a", isClone: false, languages: "中文, English", name: "A" },
      { id: "b", isClone: false, languages: "", name: "B" },
    ];
    expect(availableVoiceLanguages(voices)).toEqual(["中文", "English"]);
    expect(voicesForLanguage(voices, "English").map((voice) => voice.id)).toEqual(["a", "b"]);
  });

  it("keeps the server-defined snapshot field order for restore previews", () => {
    expect(snapshotFieldValues(
      { agentName: "old", summaryMemory: "memory" },
      { agentName: "current", summaryMemory: "new memory" },
      ["summaryMemory", "agentName"],
    )).toEqual([
      { current: "new memory", field: "summaryMemory", snapshot: "memory" },
      { current: "current", field: "agentName", snapshot: "old" },
    ]);
    expect(formatSnapshotValue({ enabled: true })).toBe('{\n  "enabled": true\n}');
  });
});
