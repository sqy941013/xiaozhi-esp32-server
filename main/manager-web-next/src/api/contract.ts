import type { paths } from "@/api/generated/schema";

export const criticalApiPaths = [
  "/user/login",
  "/user/info",
  "/models/list",
  "/models/provider",
  "/agent/list",
  "/agent/{id}",
  "/agent/{agentId}/snapshots/{snapshotId}/restore",
  "/agent/template/page",
  "/agent/voice-print/list/{id}",
  "/admin/dict/data/type/{dictType}",
  "/device/bind/{agentId}",
  "/device/manual-add",
  "/device/address-book/{macAddress}",
  "/device/address-book/permission",
  "/datasets",
] as const satisfies readonly (keyof paths)[];

export type CriticalApiPath = (typeof criticalApiPaths)[number];
