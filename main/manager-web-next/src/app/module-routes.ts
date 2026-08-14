import {
  AudioLines,
  Bot,
  BookOpen,
  Boxes,
  Braces,
  Cpu,
  ContactRound,
  Database,
  FileSliders,
  Gauge,
  Library,
  Mic2,
  MessageCircle,
  PackageOpen,
  RefreshCcw,
  ServerCog,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { isFeatureEnabled } from "@/features/auth/auth-api";
import type { PublicConfig, UserInfo } from "@/features/auth/types";

export type NavigationGroup = "admin" | "ai" | "workspace";

export interface ModuleRoute {
  adminOnly?: boolean;
  feature?: string;
  group: NavigationGroup;
  icon: LucideIcon;
  migrationPhase: 3 | 4 | 5 | 6;
  navigation?: boolean;
  path: string;
  titleKey: string;
}

export const moduleRoutes: readonly ModuleRoute[] = [
  { path: "/home", titleKey: "nav.home", group: "workspace", icon: Gauge, migrationPhase: 4 },
  { path: "/role-config", titleKey: "nav.agents", group: "workspace", icon: Bot, migrationPhase: 4 },
  { path: "/device-management", titleKey: "nav.devices", group: "workspace", icon: Cpu, migrationPhase: 4 },
  { path: "/device-chat", titleKey: "deviceChat.title", group: "workspace", icon: MessageCircle, migrationPhase: 4, navigation: false },
  { path: "/voice-print", titleKey: "nav.voicePrint", group: "workspace", icon: AudioLines, feature: "voiceprintRecognition", migrationPhase: 4, navigation: false },
  { path: "/voice-clone-management", titleKey: "nav.voiceClone", group: "ai", icon: Mic2, feature: "voiceClone", migrationPhase: 5 },
  { path: "/voice-resource-management", titleKey: "nav.voiceResources", group: "ai", icon: Library, feature: "voiceClone", adminOnly: true, migrationPhase: 5 },
  { path: "/model-config", titleKey: "nav.models", group: "ai", icon: Braces, adminOnly: true, migrationPhase: 3 },
  { path: "/knowledge-base-management", titleKey: "nav.knowledge", group: "ai", icon: BookOpen, feature: "knowledgeBase", migrationPhase: 5 },
  { path: "/address-book-management", titleKey: "nav.addressBook", group: "ai", icon: ContactRound, feature: "addressBook", migrationPhase: 4 },
  { path: "/params-management", titleKey: "nav.parameters", group: "admin", icon: SlidersHorizontal, adminOnly: true, migrationPhase: 6 },
  { path: "/user-management", titleKey: "nav.users", group: "admin", icon: Users, adminOnly: true, migrationPhase: 6 },
  { path: "/ota-management", titleKey: "nav.ota", group: "admin", icon: RefreshCcw, adminOnly: true, migrationPhase: 5 },
  { path: "/dict-management", titleKey: "nav.dictionary", group: "admin", icon: Database, adminOnly: true, migrationPhase: 6 },
  { path: "/provider-management", titleKey: "nav.providers", group: "admin", icon: Boxes, adminOnly: true, migrationPhase: 3 },
  { path: "/agent-template-management", titleKey: "nav.agentTemplates", group: "admin", icon: PackageOpen, adminOnly: true, migrationPhase: 4 },
  { path: "/template-quick-config", titleKey: "nav.templateQuickConfig", group: "admin", icon: WandSparkles, adminOnly: true, migrationPhase: 4, navigation: false },
  { path: "/replacement-word-management", titleKey: "nav.replacementWords", group: "admin", icon: FileSliders, adminOnly: true, migrationPhase: 6 },
  { path: "/server-side-management", titleKey: "nav.server", group: "admin", icon: ServerCog, adminOnly: true, migrationPhase: 6 },
  { path: "/feature-management", titleKey: "nav.features", group: "admin", icon: Settings2, adminOnly: true, migrationPhase: 6 },
  { path: "/foundation", titleKey: "nav.foundation", group: "admin", icon: ShieldCheck, adminOnly: true, migrationPhase: 6, navigation: false },
] as const;

export function isSuperAdmin(user: UserInfo | null): boolean {
  return user?.superAdmin === 1;
}

export function canAccessRoute(
  route: ModuleRoute,
  user: UserInfo | null,
  config: PublicConfig | null,
): boolean {
  if (route.adminOnly && !isSuperAdmin(user)) return false;
  if (route.feature && !isFeatureEnabled(config, route.feature)) return false;
  return true;
}

export function visibleModuleRoutes(
  user: UserInfo | null,
  config: PublicConfig | null,
): ModuleRoute[] {
  return moduleRoutes.filter(
    (route) => route.navigation !== false && canAccessRoute(route, user, config),
  );
}

export function findModuleRoute(pathname: string): ModuleRoute | undefined {
  return moduleRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
  );
}
