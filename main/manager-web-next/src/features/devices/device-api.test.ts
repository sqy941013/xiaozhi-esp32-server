import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestData } from "@/api/client";
import {
  bindDevice,
  getFirmwareTypes,
  updateAddressBookPermission,
  updateDevice,
} from "@/features/devices/device-api";

vi.mock("@/api/client", () => ({ requestData: vi.fn() }));

const requestMock = vi.mocked(requestData);

describe("device API", () => {
  beforeEach(() => requestMock.mockReset());

  it("encodes binding codes and agent IDs", async () => {
    requestMock.mockResolvedValueOnce(undefined);
    await bindDevice("agent/1", "12 3456");
    expect(requestMock).toHaveBeenCalledWith({
      method: "POST",
      url: "/device/bind/agent%2F1/12%203456",
    });
  });

  it("loads the firmware type dictionary used by manual device binding", async () => {
    requestMock.mockResolvedValueOnce([{ key: "bread-board", name: "Bread board" }]);
    await expect(getFirmwareTypes()).resolves.toEqual([
      { key: "bread-board", name: "Bread board" },
    ]);
    expect(requestMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/admin/dict/data/type/FIRMWARE_TYPE",
    });
  });

  it("keeps zero-valued OTA switches and exact address-book permission payloads", async () => {
    requestMock.mockResolvedValue(undefined);
    await updateDevice("device/1", { autoUpdate: 0 });
    await updateAddressBookPermission({
      hasPermission: false,
      macAddress: "AA:BB:CC:DD:EE:FF",
      targetMac: "11:22:33:44:55:66",
    });
    expect(requestMock).toHaveBeenNthCalledWith(1, {
      data: { autoUpdate: 0 },
      method: "PUT",
      url: "/device/update/device%2F1",
    });
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      data: {
        hasPermission: false,
        macAddress: "AA:BB:CC:DD:EE:FF",
        targetMac: "11:22:33:44:55:66",
      },
      method: "PUT",
      url: "/device/address-book/permission",
    });
  });
});
