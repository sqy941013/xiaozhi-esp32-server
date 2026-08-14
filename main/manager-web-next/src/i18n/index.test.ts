import { describe, expect, it } from "vitest";

import { resolveSupportedLanguage } from "@/i18n";
import { resources } from "@/i18n/resources";

describe("locale compatibility", () => {
  it("maps browser and legacy Vue locale codes to supported BCP 47 codes", () => {
    expect(resolveSupportedLanguage("zh_HK")).toBe("zh-TW");
    expect(resolveSupportedLanguage("zh_CN")).toBe("zh-CN");
    expect(resolveSupportedLanguage("en-US")).toBe("en");
    expect(resolveSupportedLanguage("de-DE")).toBe("de");
    expect(resolveSupportedLanguage("pt_PT")).toBe("pt-BR");
    expect(resolveSupportedLanguage("fr-FR")).toBeNull();
  });

  it("provides the model center workflow in every supported locale", () => {
    for (const resource of Object.values(resources)) {
      const modelCenter = resource.translation.modelCenter;
      expect(modelCenter.models.title).toBeTruthy();
      expect(modelCenter.providerForm.fieldKey).toBeTruthy();
      expect(modelCenter.voices.name).toBeTruthy();
      expect(modelCenter.feedback.modelSaveFailed).toBeTruthy();
    }
  });

  it("provides agent, device, snapshot, template, and voiceprint workflows in every locale", () => {
    for (const resource of Object.values(resources)) {
      const agentCenter = resource.translation.agentCenter;
      expect(resource.translation.common.pageSize).toBeTruthy();
      expect(resource.translation.common.play).toBeTruthy();
      expect(resource.translation.dashboard.noAgents).toBeTruthy();
      expect(agentCenter.home.addAgent).toBeTruthy();
      expect(agentCenter.roleConfig.saveConfig).toBeTruthy();
      expect(agentCenter.agentSnapshot.restoreConfirm).toBeTruthy();
      expect(agentCenter.device.bindWithCode).toBeTruthy();
      expect(agentCenter.addressBookManagement.permissionSaved).toBeTruthy();
      expect(agentCenter.agentTemplateManagement.createTemplate).toBeTruthy();
      expect(agentCenter.voicePrintDialog.requiredAudioVector).toBeTruthy();
    }
  });

  it("provides knowledge, voice, and OTA workflows in every locale", () => {
    for (const resource of Object.values(resources)) {
      const mediaCenter = resource.translation.mediaCenter;
      expect(mediaCenter.knowledgeBaseManagement.title).toBeTruthy();
      expect(mediaCenter.knowledgeFileUpload.retrievalTest).toBeTruthy();
      expect(mediaCenter.voiceClone.uploadSuccess).toBeTruthy();
      expect(mediaCenter.voiceResource.title).toBeTruthy();
      expect(mediaCenter.otaManagement.firmwareManagement).toBeTruthy();
      expect(mediaCenter.firmwareDialog.invalidFileSize).toBeTruthy();
    }
  });

  it("provides every administration workflow in every locale", () => {
    for (const resource of Object.values(resources)) {
      const adminCenter = resource.translation.adminCenter;
      expect(adminCenter.user.resetPassword).toBeTruthy();
      expect(adminCenter.paramManagement.pageTitle).toBeTruthy();
      expect(adminCenter.dictManagement.pageTitle).toBeTruthy();
      expect(adminCenter.replacementDialog.invalidPipeCount).toBeTruthy();
      expect(adminCenter.serverSideManager.restartServer).toBeTruthy();
      expect(adminCenter.featureManagement.save).toBeTruthy();
      expect(adminCenter.feature.addressBook.name).toBeTruthy();
    }
  });
});
