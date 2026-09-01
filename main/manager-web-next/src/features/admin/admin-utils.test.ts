import { describe, expect, it } from "vitest";

import {
  buildParamSections,
  buildFeatureMenu,
  filterParams,
  formatParamValue,
  getParamSubGroup,
  getParamTopGroup,
  isSensitiveParamCode,
  maskSensitiveValue,
  replacementDownloadName,
  replacementLines,
  resetFeatureMenu,
  serializeParamValue,
  utf8Size,
  validateReplacementContent,
} from "@/features/admin/admin-utils";

describe("administration utilities", () => {
  it("masks credential parameters without flagging ordinary token counts", () => {
    expect(isSensitiveParamCode("openai.api_key")).toBe(true);
    expect(isSensitiveParamCode("server.mqtt_signature_key")).toBe(true);
    expect(isSensitiveParamCode("max_tokens")).toBe(false);
    expect(maskSensitiveValue("secret-value")).toBe("se****ue");
    expect(maskSensitiveValue("1234")).toBe("****");
  });

  it("formats and serializes typed parameter values", () => {
    expect(formatParamValue("one;two", "array")).toBe("one;\ntwo");
    expect(serializeParamValue("one;\ntwo", "array")).toBe("one;two");
    expect(serializeParamValue("08.50", "number")).toBe("8.5");
    expect(serializeParamValue('{\n  "enabled": true\n}', "json")).toBe(
      '{"enabled":true}',
    );
    expect(() => serializeParamValue("yes", "boolean")).toThrow(
      "invalidBoolean",
    );
  });

  it("classifies, filters, and orders parameters by namespace", () => {
    const parameters = [
      { id: 1, paramCode: "plugins.mem0.base_url", remark: "Memory endpoint" },
      { id: 2, paramCode: "server.tracing.enabled", remark: "Tracing" },
      { id: 3, paramCode: "server.auth.secret", remark: "Credential" },
      { id: 4, paramCode: "server.port", remark: "Listen port" },
      { id: 5, paramCode: "unscoped.setting", remark: "General setting" },
    ];

    expect(getParamTopGroup("SESSION_STATE.timeout")).toBe("session_state");
    expect(getParamTopGroup("unscoped.setting")).toBe("general");
    expect(getParamSubGroup("server.auth.secret")).toBe("auth");
    expect(getParamSubGroup("server.port")).toBe("_root");
    expect(filterParams(parameters, { category: "server", search: "credential" }))
      .toEqual([parameters[2]]);

    const sections = buildParamSections(parameters);
    expect(sections.map((section) => section.key)).toEqual([
      "server:_root",
      "server:auth",
      "server:tracing",
      "plugins:mem0",
      "general:_all",
    ]);
    expect(sections[1]?.items[0]?.paramCode).toBe("server.auth.secret");
  });

  it("validates every replacement line and calculates its UTF-8 size", () => {
    expect(replacementLines(" 小智 | xiao zhi \n\n OTA|O T A ")).toEqual([
      "小智 | xiao zhi",
      "OTA|O T A",
    ]);
    expect(validateReplacementContent("小智|xiao zhi\nOTA|O T A")).toBeNull();
    expect(validateReplacementContent("bad|one|two")).toEqual({
      key: "invalidPipeCount",
      values: { line: 1 },
    });
    expect(validateReplacementContent("bad_name|good")).toEqual({
      key: "invalidOriginalChar",
      values: { line: 1 },
    });
    expect(utf8Size("小智")).toBe(6);
    expect(replacementDownloadName("现场/替换词")).toBe("现场_替换词.txt");
  });

  it("preserves unknown future features and groups while updating known flags", () => {
    const current = {
      features: {
        futureFeature: { enabled: true, name: "future" },
        voiceClone: { enabled: false, name: "custom-name" },
      },
      groups: { futureGroup: ["futureFeature"] },
    };
    const updated = buildFeatureMenu(current, { voiceClone: true });
    expect(updated.features.futureFeature?.enabled).toBe(true);
    expect(updated.features.voiceClone).toMatchObject({
      enabled: true,
      name: "custom-name",
    });
    expect(updated.groups.futureGroup).toEqual(["futureFeature"]);
    expect(resetFeatureMenu(updated).features.voiceClone?.enabled).toBe(false);
  });
});
