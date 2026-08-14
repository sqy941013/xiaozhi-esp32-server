import type { components } from "@/api/generated/schema";

export type BoundDevice = components["schemas"]["UserShowDeviceListVO"];
export type FirmwareType = components["schemas"]["SysDictDataItem"];

export interface ManualDeviceInput {
  agentId: string;
  appVersion: string;
  board: string;
  macAddress: string;
}

export interface AddressBookEntry {
  alias?: string;
  createDate?: string;
  hasPermission?: boolean;
  macAddress?: string;
  targetMac?: string;
  updateDate?: string;
}

export interface DeviceOnlineState {
  exists?: boolean;
  isAlive?: boolean | null;
}

export type DeviceOnlineMap = Record<string, DeviceOnlineState>;
