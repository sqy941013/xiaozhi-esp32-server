import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";

import type { ModuleRoute } from "@/app/module-routes";
import { FoundationPage } from "@/features/foundation/foundation-page";
import { ModulePlaceholder } from "@/features/foundation/module-placeholder";

const AgentsPage = lazy(async () => ({
  default: (await import("@/features/agents/agents-page")).AgentsPage,
}));
const AgentConfigPage = lazy(async () => ({
  default: (await import("@/features/agents/agent-config-page")).AgentConfigPage,
}));
const VoicePrintPage = lazy(async () => ({
  default: (await import("@/features/agents/voice-print-page")).VoicePrintPage,
}));
const AgentTemplatePage = lazy(async () => ({
  default: (await import("@/features/agents/agent-template-page")).AgentTemplatePage,
}));
const TemplateQuickConfigPage = lazy(async () => ({
  default: (await import("@/features/agents/template-quick-config-page")).TemplateQuickConfigPage,
}));
const DeviceManagementPage = lazy(async () => ({
  default: (await import("@/features/devices/device-management-page"))
    .DeviceManagementPage,
}));
const DeviceChatPage = lazy(async () => ({
  default: (await import("@/features/devices/device-chat-page")).DeviceChatPage,
}));
const AddressBookPage = lazy(async () => ({
  default: (await import("@/features/devices/address-book-page")).AddressBookPage,
}));

const ModelConfigPage = lazy(async () => ({
  default: (await import("@/features/models/model-config-page")).ModelConfigPage,
}));
const ProviderManagementPage = lazy(async () => ({
  default: (await import("@/features/models/provider-management-page"))
    .ProviderManagementPage,
}));
const KnowledgeBasePage = lazy(async () => ({
  default: (await import("@/features/media/knowledge-base-page")).KnowledgeBasePage,
}));
const VoiceClonePage = lazy(async () => ({
  default: (await import("@/features/media/voice-clone-page")).VoiceClonePage,
}));
const VoiceResourcePage = lazy(async () => ({
  default: (await import("@/features/media/voice-resource-page")).VoiceResourcePage,
}));
const OtaPage = lazy(async () => ({
  default: (await import("@/features/media/ota-page")).OtaPage,
}));
const UserManagementPage = lazy(async () => ({
  default: (await import("@/features/admin/user-management-page"))
    .UserManagementPage,
}));
const ParamsManagementPage = lazy(async () => ({
  default: (await import("@/features/admin/params-management-page"))
    .ParamsManagementPage,
}));
const DictManagementPage = lazy(async () => ({
  default: (await import("@/features/admin/dict-management-page"))
    .DictManagementPage,
}));
const ReplacementWordPage = lazy(async () => ({
  default: (await import("@/features/admin/replacement-word-page"))
    .ReplacementWordPage,
}));
const ServerSidePage = lazy(async () => ({
  default: (await import("@/features/admin/server-side-page")).ServerSidePage,
}));
const FeatureManagementPage = lazy(async () => ({
  default: (await import("@/features/admin/feature-management-page"))
    .FeatureManagementPage,
}));

function ModuleLoading() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground"
      role="status"
    >
      {t("common.loading")}
    </div>
  );
}

export function ModuleContent({ route }: { route: ModuleRoute }) {
  let content: React.ReactNode;
  if (route.path === "/home") content = <AgentsPage />;
  else if (route.path === "/role-config") content = <AgentConfigPage />;
  else if (route.path === "/device-management") content = <DeviceManagementPage />;
  else if (route.path === "/device-chat") content = <DeviceChatPage />;
  else if (route.path === "/address-book-management") content = <AddressBookPage />;
  else if (route.path === "/voice-print") content = <VoicePrintPage />;
  else if (route.path === "/agent-template-management") content = <AgentTemplatePage />;
  else if (route.path === "/template-quick-config") content = <TemplateQuickConfigPage />;
  else if (route.path === "/foundation") content = <FoundationPage />;
  else if (route.path === "/model-config") content = <ModelConfigPage />;
  else if (route.path === "/provider-management") {
    content = <ProviderManagementPage />;
  } else if (route.path === "/knowledge-base-management") {
    content = <KnowledgeBasePage />;
  } else if (route.path === "/voice-clone-management") {
    content = <VoiceClonePage />;
  } else if (route.path === "/voice-resource-management") {
    content = <VoiceResourcePage />;
  } else if (route.path === "/ota-management") {
    content = <OtaPage />;
  } else if (route.path === "/user-management") {
    content = <UserManagementPage />;
  } else if (route.path === "/params-management") {
    content = <ParamsManagementPage />;
  } else if (route.path === "/dict-management") {
    content = <DictManagementPage />;
  } else if (route.path === "/replacement-word-management") {
    content = <ReplacementWordPage />;
  } else if (route.path === "/server-side-management") {
    content = <ServerSidePage />;
  } else if (route.path === "/feature-management") {
    content = <FeatureManagementPage />;
  } else content = <ModulePlaceholder route={route} />;

  return <Suspense fallback={<ModuleLoading />}>{content}</Suspense>;
}
