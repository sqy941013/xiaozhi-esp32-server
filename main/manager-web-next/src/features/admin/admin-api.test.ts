import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient, requestData } from "@/api/client";
import {
  changeUserStatus,
  deleteReplacementFiles,
  downloadReplacementFile,
  emitServerAction,
  getAllParams,
  getDictData,
  getParams,
  resetUserPassword,
  updateFeatureMenu,
  updateReplacementFile,
} from "@/features/admin/admin-api";

vi.mock("@/api/client", () => ({
  apiClient: { get: vi.fn() },
  requestData: vi.fn(),
  unwrapEnvelope: vi.fn((value: { data?: unknown }) => value.data),
}));

const requestMock = vi.mocked(requestData);
const getMock = vi.mocked(apiClient.get);

describe("administration API", () => {
  beforeEach(() => {
    requestMock.mockReset();
    getMock.mockReset();
  });

  it("uses exact pagination parameters and encodes user paths", async () => {
    requestMock.mockResolvedValueOnce({ list: [], total: 0 });
    await getParams({ limit: 20, page: 2, paramCode: "server" });
    expect(requestMock).toHaveBeenCalledWith({
      method: "GET",
      params: { limit: 20, page: 2, paramCode: "server" },
      url: "/admin/params/page",
    });

    requestMock.mockResolvedValueOnce("new-password");
    await resetUserPassword("12/34");
    expect(requestMock).toHaveBeenLastCalledWith({
      method: "PUT",
      url: "/admin/users/12%2F34",
    });
  });

  it("loads every parameter page for namespace grouping", async () => {
    requestMock
      .mockResolvedValueOnce({
        list: Array.from({ length: 500 }, (_, id) => ({ id, paramCode: `server.item.${id}` })),
        total: 501,
      })
      .mockResolvedValueOnce({
        list: [{ id: 500, paramCode: "plugins.mem0.enabled" }],
        total: 501,
      });

    const result = await getAllParams();

    expect(result.list).toHaveLength(501);
    expect(result.total).toBe(501);
    expect(requestMock).toHaveBeenNthCalledWith(1, {
      method: "GET",
      params: { limit: 500, page: 1, paramCode: "" },
      url: "/admin/params/page",
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      method: "GET",
      params: { limit: 500, page: 2, paramCode: "" },
      url: "/admin/params/page",
    });
  });

  it("sends status, dictionary, and replacement batch payloads once", async () => {
    requestMock.mockResolvedValue(undefined);
    await changeUserStatus(0, ["1", "2"]);
    await getDictData({ dictLabel: "board", dictTypeId: 3, limit: 10, page: 1 });
    await deleteReplacementFiles(["a", "b"]);
    expect(requestMock).toHaveBeenNthCalledWith(1, {
      data: ["1", "2"],
      method: "PUT",
      url: "/admin/users/changeStatus/0",
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      method: "GET",
      params: {
        dictLabel: "board",
        dictTypeId: 3,
        dictValue: "",
        limit: 10,
        page: 1,
      },
      url: "/admin/dict/data/page",
    });
    expect(requestMock).toHaveBeenNthCalledWith(3, {
      data: ["a", "b"],
      method: "POST",
      url: "/correct-word/file/batch-delete",
    });
  });

  it("looks up the feature parameter instead of relying on a fixed database ID", async () => {
    requestMock.mockResolvedValueOnce({
      list: [{ id: 812, paramCode: "system-web.menu", remark: "menu" }],
      total: 1,
    });
    requestMock.mockResolvedValueOnce(undefined);
    await updateFeatureMenu({
      features: { voiceClone: { enabled: true } },
      groups: { featureManagement: ["voiceClone"] },
    });
    expect(requestMock).toHaveBeenNthCalledWith(1, {
      method: "GET",
      params: { limit: 100, page: 1, paramCode: "system-web.menu" },
      url: "/admin/params/page",
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      data: {
        id: 812,
        paramCode: "system-web.menu",
        paramValue: JSON.stringify({
          features: { voiceClone: { enabled: true } },
          groups: { featureManagement: ["voiceClone"] },
        }),
        remark: "menu",
        valueType: "json",
      },
      method: "PUT",
      url: "/admin/params",
    });
  });

  it("preserves future menu metadata from the stored parameter", async () => {
    requestMock.mockResolvedValueOnce({
      list: [{
        id: 813,
        paramCode: "system-web.menu",
        paramValue: JSON.stringify({
          features: {
            futureFeature: { enabled: true, icon: "future-icon" },
            voiceClone: { enabled: false, rollout: 25 },
          },
          groups: { futureGroup: ["futureFeature"] },
          schemaVersion: 2,
        }),
      }],
      total: 1,
    });
    requestMock.mockResolvedValueOnce(undefined);
    await updateFeatureMenu({
      features: {
        futureFeature: { enabled: true },
        voiceClone: { enabled: true },
      },
      groups: { featureManagement: ["voiceClone"] },
    });

    const update = requestMock.mock.calls[1]?.[0] as {
      data?: { paramValue?: string };
    };
    expect(JSON.parse(update.data?.paramValue || "{}")).toEqual({
      features: {
        futureFeature: { enabled: true, icon: "future-icon" },
        voiceClone: { enabled: true, rollout: 25 },
      },
      groups: {
        featureManagement: ["voiceClone"],
        futureGroup: ["futureFeature"],
      },
      schemaVersion: 2,
    });
  });

  it("encodes replacement paths and downloads authenticated blobs", async () => {
    requestMock.mockResolvedValue(undefined);
    await updateReplacementFile("file/one", {
      content: ["OTA|O T A"],
      fileName: "terms",
    });
    expect(requestMock).toHaveBeenCalledWith({
      data: { content: ["OTA|O T A"], fileName: "terms" },
      method: "PUT",
      url: "/correct-word/file/file%2Fone",
    });

    const blob = new Blob(["OTA|O T A"], { type: "text/plain" });
    getMock.mockResolvedValueOnce({ data: blob, status: 200 } as never);
    await expect(downloadReplacementFile("file/one")).resolves.toBe(blob);
    expect(getMock).toHaveBeenCalledWith(
      "/correct-word/file/download/file%2Fone",
      { responseType: "blob" },
    );
  });

  it("allows the server action to use the backend response window", async () => {
    requestMock.mockResolvedValueOnce(true);
    await emitServerAction({ action: "restart", targetWs: "ws://server:8000" });
    expect(requestMock).toHaveBeenCalledWith({
      data: { action: "restart", targetWs: "ws://server:8000" },
      method: "POST",
      timeout: 130_000,
      url: "/admin/server/emit-action",
    });
  });
});
