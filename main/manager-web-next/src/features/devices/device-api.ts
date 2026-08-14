import { requestData } from "@/api/client";
import type {
  AddressBookEntry,
  BoundDevice,
  FirmwareType,
  ManualDeviceInput,
} from "@/features/devices/types";

export function getFirmwareTypes(): Promise<readonly FirmwareType[]> {
  return requestData({
    method: "GET",
    url: "/admin/dict/data/type/FIRMWARE_TYPE",
  });
}

export function getBoundDevices(agentId: string): Promise<readonly BoundDevice[]> {
  return requestData({
    method: "GET",
    url: `/device/bind/${encodeURIComponent(agentId)}`,
  });
}

export function getDeviceOnlineStatus(agentId: string): Promise<string> {
  return requestData({
    data: {},
    method: "POST",
    url: `/device/bind/${encodeURIComponent(agentId)}`,
  });
}

export function bindDevice(agentId: string, deviceCode: string): Promise<void> {
  return requestData({
    method: "POST",
    url: `/device/bind/${encodeURIComponent(agentId)}/${encodeURIComponent(deviceCode)}`,
  });
}

export function unbindDevice(deviceId: string): Promise<void> {
  return requestData({
    data: { deviceId },
    method: "POST",
    url: "/device/unbind",
  });
}

export function updateDevice(
  deviceId: string,
  input: { alias?: string; autoUpdate?: number },
): Promise<void> {
  return requestData({
    data: input,
    method: "PUT",
    url: `/device/update/${encodeURIComponent(deviceId)}`,
  });
}

export function manualAddDevice(input: ManualDeviceInput): Promise<void> {
  return requestData({ data: input, method: "POST", url: "/device/manual-add" });
}

export function getAddressBook(macAddress: string): Promise<readonly AddressBookEntry[]> {
  return requestData({
    method: "GET",
    url: `/device/address-book/${encodeURIComponent(macAddress)}`,
  });
}

export function updateAddressBookAlias(input: {
  alias: string;
  macAddress: string;
  targetMac: string;
}): Promise<void> {
  return requestData({
    data: input,
    method: "PUT",
    url: "/device/address-book/alias",
  });
}

export function updateAddressBookPermission(input: {
  hasPermission: boolean;
  macAddress: string;
  targetMac: string;
}): Promise<void> {
  return requestData({
    data: input,
    method: "PUT",
    url: "/device/address-book/permission",
  });
}
