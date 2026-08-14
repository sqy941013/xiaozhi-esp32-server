import type { paths } from "@/api/generated/schema";

export const criticalApiPaths = [
  "/user/login",
  "/user/info",
  "/models/list",
  "/models/provider",
  "/agent/list",
  "/device/bind/{agentId}",
  "/datasets",
] as const satisfies readonly (keyof paths)[];

export type CriticalApiPath = (typeof criticalApiPaths)[number];
