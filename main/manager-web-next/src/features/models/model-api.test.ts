import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestData } from "@/api/client";
import {
  getModelPage,
  getProviderPage,
  updateModel,
} from "@/features/models/model-api";

vi.mock("@/api/client", () => ({ requestData: vi.fn() }));

const requestMock = vi.mocked(requestData);

describe("model center API", () => {
  beforeEach(() => requestMock.mockReset());

  it("normalizes model pages and passes stable pagination parameters", async () => {
    requestMock.mockResolvedValueOnce({
      list: [
        {
          configJson: { raw: { type: "openai", temperature: 0 } },
          id: "LLM_1",
          isEnabled: 1,
          modelName: "Fast model",
        },
      ],
      total: 1,
    });

    const page = await getModelPage({
      limit: 10,
      modelName: "Fast",
      modelType: "LLM",
      page: 1,
    });

    expect(requestMock).toHaveBeenCalledWith({
      method: "GET",
      params: {
        limit: 10,
        modelName: "Fast",
        modelType: "LLM",
        page: 1,
      },
      url: "/models/list",
    });
    expect(page.list[0]?.configJson).toEqual({
      type: "openai",
      temperature: 0,
    });
  });

  it("parses provider field JSON without leaking transport details to the UI", async () => {
    requestMock.mockResolvedValueOnce({
      list: [
        {
          fields: '[{"key":"api_key","label":"API key","type":"string"}]',
          id: "SYSTEM_LLM_openai",
          modelType: "LLM",
          name: "OpenAI",
          providerCode: "openai",
          sort: 1,
        },
      ],
      total: 1,
    });

    const page = await getProviderPage({
      limit: 10,
      modelType: "LLM",
      name: "",
      page: 1,
    });

    expect(page.list[0]?.fields[0]?.key).toBe("api_key");
  });

  it("encodes path segments when updating a model", async () => {
    requestMock.mockResolvedValueOnce({ id: "LLM/1", configJson: {} });

    await updateModel("LLM", "open ai", "LLM/1", {
      configJson: { type: "open ai" },
      isDefault: 0,
      isEnabled: 1,
      modelCode: "m",
      modelName: "Model",
      sort: 0,
    });

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        url: "/models/LLM/open%20ai/LLM%2F1",
      }),
    );
  });
});
