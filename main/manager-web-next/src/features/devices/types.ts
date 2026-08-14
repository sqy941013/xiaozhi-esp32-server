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

export interface WebChatSession {
  agentId: string;
  clientId: string;
  deviceAlias?: string;
  deviceId: string;
  deviceMac?: string;
  maxSessionSeconds: number;
  sessionId: string;
  ticket: string;
  ticketExpiresAt: number;
  websocketPath: string;
}

export interface WebChatSessionStatus {
  agentId?: string;
  createdAt?: number;
  deviceAlias?: string;
  deviceId: string;
  deviceMac?: string;
  expiresAt?: number;
  memoryStatus: string;
  message?: string;
  sessionId: string;
  status: string;
  updatedAt?: number;
}

export interface DeviceMemory {
  createdAt?: string;
  id: string;
  memory: string;
  updatedAt?: string;
}
