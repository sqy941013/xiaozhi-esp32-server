import type {
  BoundDevice,
  DeviceOnlineMap,
} from "@/features/devices/types";

export const MAC_ADDRESS_PATTERN = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;

export function deviceGeneratorPath(
  deviceId: string,
  basePath = "/",
): string {
  const absoluteBase = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const normalizedBase = absoluteBase.endsWith("/")
    ? absoluteBase
    : `${absoluteBase}/`;
  return `${normalizedBase}generator/?deviceId=${encodeURIComponent(deviceId)}`;
}

export function parseDeviceOnlineMap(value: unknown): DeviceOnlineMap {
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as DeviceOnlineMap)
      : {};
  } catch {
    return {};
  }
}

export function deviceOnlineKey(device: BoundDevice): string {
  const board = (device.board || "GID_default").replaceAll(":", "_");
  const mac = (device.macAddress || "unknown").replaceAll(":", "_");
  return `${board}@@@${mac}@@@${mac}`;
}

export function isDeviceOnline(
  device: BoundDevice,
  states: DeviceOnlineMap,
): boolean {
  const state = states[deviceOnlineKey(device)];
  return state?.isAlive === true ||
    (state?.isAlive === null && state.exists === true);
}

export function timestampValue(value: string | number | undefined): number | null {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
  }
  const date = typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isFinite(date) ? date : null;
}

export function formatDeviceTime(
  value: string | number | undefined,
  locale: string,
): string {
  const timestamp = timestampValue(value);
  if (timestamp === null) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}
