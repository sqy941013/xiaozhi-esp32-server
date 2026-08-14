import { describe, expect, it } from "vitest";

import {
  deviceOnlineKey,
  isDeviceOnline,
  MAC_ADDRESS_PATTERN,
  parseDeviceOnlineMap,
  timestampValue,
} from "@/features/devices/device-utils";

describe("device utilities", () => {
  const device = { board: "bread:board", macAddress: "AA:BB:CC:DD:EE:FF" };

  it("matches colon- and hyphen-delimited MAC addresses", () => {
    expect(MAC_ADDRESS_PATTERN.test("AA:BB:CC:DD:EE:FF")).toBe(true);
    expect(MAC_ADDRESS_PATTERN.test("AA-BB-CC-DD-EE-FF")).toBe(true);
    expect(MAC_ADDRESS_PATTERN.test("AA:BB:CC:DD:EE")).toBe(false);
  });

  it("maps MQTT gateway state to the exact device client key", () => {
    const key = "bread_board@@@AA_BB_CC_DD_EE_FF@@@AA_BB_CC_DD_EE_FF";
    expect(deviceOnlineKey(device)).toBe(key);
    expect(isDeviceOnline(device, { [key]: { exists: true, isAlive: null } })).toBe(true);
    expect(isDeviceOnline(device, { [key]: { exists: true, isAlive: false } })).toBe(false);
  });

  it("parses gateway JSON and both second/millisecond timestamps safely", () => {
    expect(parseDeviceOnlineMap('{"client":{"isAlive":true}}')).toEqual({
      client: { isAlive: true },
    });
    expect(parseDeviceOnlineMap("invalid")).toEqual({});
    expect(timestampValue(1_700_000_000)).toBe(1_700_000_000_000);
    expect(timestampValue("1700000000000")).toBe(1_700_000_000_000);
    expect(timestampValue("2026-08-14T00:00:00Z")).toBe(Date.parse("2026-08-14T00:00:00Z"));
  });
});
