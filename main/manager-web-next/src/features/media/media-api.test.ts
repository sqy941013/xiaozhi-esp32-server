import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiResourceUrl, requestData } from "@/api/client";
import {
  deleteKnowledgeDocuments,
  deleteVoiceResources,
  getFirmwareDownloadUrl,
  getKnowledgeChunks,
  getKnowledgeDocuments,
  runRetrievalTest,
  uploadKnowledgeDocument,
  uploadVoiceSample,
} from "@/features/media/media-api";

vi.mock("@/api/client", () => ({
  apiResourceUrl: vi.fn((path: string) => `/xiaozhi${path}`),
  requestData: vi.fn(),
}));

const requestMock = vi.mocked(requestData);

describe("media API", () => {
  beforeEach(() => requestMock.mockReset());

  it("uses backend page_size names and encodes dataset path segments", async () => {
    requestMock.mockResolvedValueOnce({ list: [{ id: "doc-1" }], total: 1 });
    await getKnowledgeDocuments("data/set", { name: "manual", page: 2, pageSize: 20 });
    expect(requestMock).toHaveBeenCalledWith({
      method: "GET",
      params: { name: "manual", page: 2, page_size: 20 },
      url: "/datasets/data%2Fset/documents",
    });
  });

  it("sends exact batch and retrieval payloads", async () => {
    requestMock.mockResolvedValue(undefined);
    await deleteKnowledgeDocuments("kb", ["one", "two"]);
    await runRetrievalTest("kb", "How does OTA work?");
    expect(requestMock).toHaveBeenNthCalledWith(1, {
      data: { ids: ["one", "two"] },
      method: "DELETE",
      url: "/datasets/kb/documents",
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      data: { dataset_ids: ["kb"], page: 1, page_size: 10, question: "How does OTA work?" },
      method: "POST",
      url: "/datasets/kb/retrieval-test",
    });
  });

  it("normalizes both chunk response shapes", async () => {
    requestMock.mockResolvedValueOnce({ chunks: [{ id: "c1", content: "A", document_id: "d" }], total: 3 });
    await expect(getKnowledgeChunks("kb", "doc", { page: 1, pageSize: 10 })).resolves.toMatchObject({ total: 3 });
    requestMock.mockResolvedValueOnce([{ id: "c2", content: "B", document_id: "d" }]);
    await expect(getKnowledgeChunks("kb", "doc", { page: 1, pageSize: 10 })).resolves.toMatchObject({ total: 1 });
  });

  it("builds multipart requests without overriding the browser boundary", async () => {
    requestMock.mockResolvedValue(undefined);
    const document = new File(["hello"], "guide.md", { type: "text/markdown" });
    const voice = new File(["wave"], "voice.wav", { type: "audio/wav" });
    await uploadKnowledgeDocument("kb", document);
    await uploadVoiceSample("voice/1", voice);

    const documentConfig = requestMock.mock.calls[0]?.[0];
    const voiceConfig = requestMock.mock.calls[1]?.[0];
    expect(documentConfig?.data).toBeInstanceOf(FormData);
    expect((documentConfig?.data as FormData).get("file")).toBe(document);
    expect(documentConfig?.headers).toBeUndefined();
    expect((voiceConfig?.data as FormData).get("id")).toBe("voice/1");
    expect((voiceConfig?.data as FormData).get("voiceFile")).toBe(voice);
  });

  it("uses one-time token URLs and safely encoded batch paths", async () => {
    requestMock.mockResolvedValueOnce("download/token");
    await expect(getFirmwareDownloadUrl("firmware/1")).resolves.toBe("/xiaozhi/otaMag/download/download%2Ftoken");
    expect(apiResourceUrl).toHaveBeenCalledWith("/otaMag/download/download%2Ftoken");

    requestMock.mockResolvedValueOnce(undefined);
    await deleteVoiceResources(["voice/1", "voice two"]);
    expect(requestMock).toHaveBeenLastCalledWith({
      method: "DELETE",
      url: "/voiceResource/voice%2F1,voice%20two",
    });
  });
});
