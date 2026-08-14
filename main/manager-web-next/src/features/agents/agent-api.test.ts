import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestData } from "@/api/client";
import {
  getAgentSnapshots,
  getModelOptions,
  restoreAgentSnapshot,
  updateAgent,
} from "@/features/agents/agent-api";

vi.mock("@/api/client", () => ({ requestData: vi.fn() }));

const requestMock = vi.mocked(requestData);

describe("agent API", () => {
  beforeEach(() => requestMock.mockReset());

  it("uses the dedicated LLM selector endpoint and normalizes incomplete rows", async () => {
    requestMock.mockResolvedValueOnce([
      { id: "LLM_Qwen", modelName: "Qwen", type: "ollama" },
      { modelName: "missing id" },
    ]);
    await expect(getModelOptions("LLM")).resolves.toEqual([
      { id: "LLM_Qwen", modelName: "Qwen", type: "ollama" },
    ]);
    expect(requestMock).toHaveBeenCalledWith({
      method: "GET",
      params: { modelName: "" },
      url: "/models/llm/names",
    });
  });

  it("encodes agent paths and sends plugin parameter objects unchanged", async () => {
    requestMock.mockResolvedValueOnce(undefined);
    await updateAgent("agent/1", {
      functions: [{ paramInfo: { enabled: false, limit: 0 }, pluginId: "weather" }],
      tagNames: ["family", "test"],
    });
    expect(requestMock).toHaveBeenCalledWith({
      data: {
        functions: [{ paramInfo: { enabled: false, limit: 0 }, pluginId: "weather" }],
        tagNames: ["family", "test"],
      },
      method: "PUT",
      url: "/agent/agent%2F1",
    });
  });

  it("preserves snapshot pagination and requires the preview state token on restore", async () => {
    requestMock.mockResolvedValueOnce({ list: [{ id: "s1" }], total: 1 });
    await expect(getAgentSnapshots("a/1", { limit: 10, page: 2 })).resolves.toEqual({
      list: [{ id: "s1" }],
      total: 1,
    });
    requestMock.mockResolvedValueOnce(undefined);
    await restoreAgentSnapshot("a/1", "s/1", "current-state-token");
    expect(requestMock).toHaveBeenLastCalledWith({
      data: { currentStateToken: "current-state-token" },
      method: "POST",
      url: "/agent/a%2F1/snapshots/s%2F1/restore",
    });
  });
});
