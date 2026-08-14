import { expect, test, type Page, type Route } from "@playwright/test";

const publicKey =
  "044692890d5f130f93901ecebcee838dfee4d113317b205c94ef4f69a6c74859df96301dba4733e3e464077459bc7e1aa63416942c37bada11e510e0da1cd26286";

const agent = {
  agentName: "客厅小智",
  deviceCount: 2,
  id: "agent-1",
  lastConnectedAt: "2026-08-14T03:00:00Z",
  llmModelName: "Qwen 3.6",
  memModelId: "Memory_mem_local_short",
  summaryMemory: "喜欢爵士乐",
  systemPrompt: "你是客厅里的家庭助手",
  tags: [{ id: "tag-1", tagName: "家庭" }],
  ttsModelName: "Edge TTS",
  ttsVoiceName: "晓晓",
  vllmModelName: "Qwen VL",
};

const agentDetails = {
  agentCode: "小智",
  agentName: "客厅小智",
  asrModelId: "ASR_1",
  chatHistoryConf: 2,
  contextProviders: [],
  correctWordFileIds: [],
  currentVersionNo: 7,
  functions: [],
  intentModelId: "Intent_1",
  langCode: "zh-CN",
  language: "中文",
  llmModelId: "LLM_1",
  memModelId: "Memory_mem_local_short",
  slmModelId: "SLM_1",
  sort: 1,
  summaryMemory: "喜欢爵士乐",
  systemPrompt: "你是客厅里的家庭助手",
  ttsLanguage: "中文",
  ttsModelId: "TTS_1",
  ttsPitch: 0,
  ttsRate: 0,
  ttsVoiceId: "voice-1",
  ttsVolume: 0,
  vadModelId: "VAD_1",
  vllmModelId: "VLLM_1",
};

const devices = [
  {
    alias: "客厅音箱",
    appVersion: "1.2.3",
    autoUpdate: 1,
    board: "bread-board",
    createDateTimestamp: "1786672800000",
    id: "device-1",
    macAddress: "AA:BB:CC:DD:EE:01",
  },
  {
    alias: "书房音箱",
    appVersion: "1.2.3",
    autoUpdate: 0,
    board: "bread-board",
    createDateTimestamp: "1786672800000",
    id: "device-2",
    macAddress: "AA:BB:CC:DD:EE:02",
  },
];

async function fulfill(route: Route, data?: unknown) {
  await route.fulfill({
    body: JSON.stringify({ code: 0, data, msg: "success" }),
    contentType: "application/json",
  });
}

async function mockSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "token",
      JSON.stringify({ expire: 7200, token: "phase-four-token" }),
    );
    localStorage.setItem("xiaozhi-language", "zh-CN");
  });
  await page.route("**/xiaozhi/user/pub-config", (route) => fulfill(route, {
    allowUserRegister: true,
    enableMobileRegister: false,
    mobileAreaList: [{ key: "+86", name: "中国大陆" }],
    name: "Xiaozhi Phase Four",
    sm2PublicKey: publicKey,
    systemWebMenu: {
      features: {
        addressBook: { enabled: true },
        knowledgeBase: { enabled: true },
        mcpAccessPoint: { enabled: false },
        voiceClone: { enabled: true },
        voiceprintRecognition: { enabled: true },
      },
    },
    version: "test",
    year: "©2026",
  }));
  await page.route("**/xiaozhi/user/info", (route) => fulfill(route, {
    id: 1,
    superAdmin: 1,
    username: "admin",
  }));
}

async function mockAgentSelectors(page: Page) {
  await page.route("**/xiaozhi/agent/list**", (route) => fulfill(route, [agent]));
  await page.route("**/xiaozhi/models/llm/names**", (route) => fulfill(route, [
    { id: "LLM_1", modelName: "Qwen 3.6", type: "ollama" },
  ]));
  await page.route("**/xiaozhi/models/names**", (route) => {
    const kind = new URL(route.request().url()).searchParams.get("modelType") || "Model";
    return fulfill(route, kind === "Memory"
      ? [
          { id: "Memory_1", modelName: "Memory model" },
          { id: "Memory_nomem", modelName: "No memory" },
        ]
      : [{ id: `${kind}_1`, modelName: `${kind} model` }]);
  });
  await page.route("**/xiaozhi/models/TTS_1/voices**", (route) => fulfill(route, [
    { id: "voice-1", isClone: false, languages: "中文,English", name: "晓晓" },
  ]));
  await page.route("**/xiaozhi/correct-word/file/select", (route) => fulfill(route, []));
}

test.beforeEach(async ({ page }) => {
  await mockSession(page);
});

test("manages agents with an exact-name deletion guard and a mobile-safe workspace", async ({ page }, testInfo) => {
  let deleted = false;
  await page.route("**/xiaozhi/agent/list**", (route) => fulfill(route, deleted ? [] : [agent]));
  await page.route("**/xiaozhi/agent/agent-1", async (route) => {
    expect(route.request().method()).toBe("DELETE");
    deleted = true;
    await fulfill(route);
  });

  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "你好，admin" })).toBeVisible();
  await expect(page.getByText("客厅小智", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "删除智能体" }).click();
  const dialog = page.getByRole("dialog", { name: "删除智能体" });
  const confirm = dialog.getByRole("button", { name: "删除智能体" });
  await dialog.getByLabel("请输入智能体名称").fill("错误名称");
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel("请输入智能体名称").fill("客厅小智");
  await confirm.click();
  await expect(page.getByText("删除成功")).toBeVisible();

  await page.setViewportSize({ height: 844, width: 390 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "你好，admin" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const screenshot = testInfo.outputPath("agents-mobile.png");
  await page.screenshot({ fullPage: true, path: screenshot });
  await testInfo.attach("agents mobile", { contentType: "image/png", path: screenshot });
});

test("saves the complete agent draft and restores a snapshot with its state token", async ({ page }, testInfo) => {
  let updatePayload: Record<string, unknown> | undefined;
  let restorePayload: Record<string, unknown> | undefined;
  await mockAgentSelectors(page);
  await page.route("**/xiaozhi/agent/agent-1", async (route) => {
    if (route.request().method() === "PUT") {
      updatePayload = route.request().postDataJSON() as Record<string, unknown>;
      await fulfill(route);
    } else {
      await fulfill(route, agentDetails);
    }
  });
  await page.route("**/xiaozhi/agent/agent-1/tags", (route) => fulfill(route, [
    { id: "tag-1", tagName: "家庭" },
  ]));
  await page.route("**/xiaozhi/agent/template", (route) => fulfill(route, []));
  await page.route("**/xiaozhi/models/provider/plugin/names", (route) => fulfill(route, [
    {
      fields: JSON.stringify([{ default: 3, key: "limit", label: "条数", type: "number" }]),
      id: "plugin-weather",
      modelType: "Plugin",
      name: "天气查询",
      providerCode: "weather",
      sort: 1,
    },
  ]));
  await page.route("**/xiaozhi/agent/agent-1/snapshots?**", (route) => fulfill(route, {
    list: [{ changedFields: ["agentName", "summaryMemory"], createdAt: "2026-08-14T03:00:00Z", id: "snapshot-6", source: "config", versionNo: 6 }],
    total: 1,
  }));
  await page.route("**/xiaozhi/agent/agent-1/snapshots/snapshot-6", async (route) => {
    if (route.request().method() === "GET") {
      await fulfill(route, {
        currentSnapshotData: { agentName: "客厅小智", summaryMemory: "新记忆" },
        currentStateToken: "state-token-v7",
        fieldOrder: ["agentName", "summaryMemory"],
        id: "snapshot-6",
        snapshotData: { agentName: "旧版小智", summaryMemory: "旧记忆" },
        versionNo: 6,
      });
    } else {
      await fulfill(route);
    }
  });
  await page.route("**/xiaozhi/agent/agent-1/snapshots/snapshot-6/restore", async (route) => {
    restorePayload = route.request().postDataJSON() as Record<string, unknown>;
    await fulfill(route);
  });

  await page.goto("/role-config?agentId=agent-1");
  await expect(page.getByRole("heading", { name: "客厅小智" })).toBeVisible();
  await page.getByLabel("助手昵称", { exact: true }).fill("客厅助理");
  await page.getByRole("slider", { name: "音量" }).fill("-10");
  await page.getByRole("combobox", { name: "记忆模式(Mem)" }).selectOption("Memory_nomem");
  await page.getByRole("textbox", { name: "添加新标签" }).fill("测试");
  await page.getByRole("button", { name: "添加新标签" }).click();

  await page.getByRole("button", { name: /编辑功能/ }).click();
  const functionDialog = page.getByRole("dialog", { name: "功能管理" });
  await functionDialog.getByRole("button", { name: /天气查询/ }).click();
  await functionDialog.getByLabel("条数").fill("0");
  await functionDialog.getByRole("button", { name: "保存配置" }).click();

  await page.getByRole("button", { name: /编辑源/ }).click();
  const contextDialog = page.getByRole("dialog", { name: "编辑源" });
  await contextDialog.getByLabel("接口地址").fill("http://192.168.123.225:11434/api/chat");
  await contextDialog.getByRole("button", { name: "确定" }).click();

  await page.getByRole("button", { name: "保存配置" }).click();
  await expect.poll(() => updatePayload).toBeTruthy();
  expect(updatePayload).toMatchObject({
    agentName: "客厅助理",
    contextProviders: [{ headers: {}, url: "http://192.168.123.225:11434/api/chat" }],
    functions: [{ paramInfo: { limit: 0 }, pluginId: "plugin-weather" }],
    chatHistoryConf: 0,
    memModelId: "Memory_nomem",
    summaryMemory: "",
    tagNames: ["家庭", "测试"],
    ttsVolume: -10,
  });

  await page.getByRole("button", { name: "历史版本" }).click();
  const history = page.getByRole("dialog", { name: "历史版本" });
  await history.getByRole("button", { name: "查看" }).click();
  const preview = page.getByRole("dialog", { name: "恢复确认" });
  await expect(preview).toContainText("旧版小智");
  const screenshot = testInfo.outputPath("snapshot-preview.png");
  await page.screenshot({ fullPage: true, path: screenshot });
  await testInfo.attach("snapshot restore preview", { contentType: "image/png", path: screenshot });
  await preview.getByRole("button", { name: "恢复" }).click();
  await page.getByRole("dialog", { name: "确认恢复" }).getByRole("button", { name: "恢复" }).click();
  await expect.poll(() => restorePayload).toEqual({ currentStateToken: "state-token-v7" });
});

test("binds, adds, edits, and unbinds devices without losing zero-valued switches", async ({ page }) => {
  const mutations: Array<{ body?: unknown; method: string; url: string }> = [];
  await page.route("**/xiaozhi/agent/list**", (route) => fulfill(route, [agent]));
  await page.route("**/xiaozhi/device/bind/agent-1", async (route) => {
    if (route.request().method() === "POST") {
      await fulfill(route, JSON.stringify({
        "bread-board@@@AA_BB_CC_DD_EE_01@@@AA_BB_CC_DD_EE_01": { isAlive: true },
      }));
    } else await fulfill(route, devices);
  });
  await page.route("**/xiaozhi/device/bind/agent-1/123456", async (route) => {
    mutations.push({ method: route.request().method(), url: route.request().url() });
    await fulfill(route);
  });
  await page.route("**/xiaozhi/device/update/device-1", async (route) => {
    mutations.push({ body: route.request().postDataJSON(), method: route.request().method(), url: route.request().url() });
    await fulfill(route);
  });
  await page.route("**/xiaozhi/device/unbind", async (route) => {
    mutations.push({ body: route.request().postDataJSON(), method: route.request().method(), url: route.request().url() });
    await fulfill(route);
  });
  await page.route("**/xiaozhi/admin/dict/data/type/FIRMWARE_TYPE", (route) => fulfill(route, [
    { key: "bread-board", name: "开发板" },
  ]));
  await page.route("**/xiaozhi/device/manual-add", async (route) => {
    mutations.push({ body: route.request().postDataJSON(), method: route.request().method(), url: route.request().url() });
    await fulfill(route);
  });

  await page.goto("/device-management?agentId=agent-1");
  const firstRow = page.getByRole("row").filter({ hasText: "AA:BB:CC:DD:EE:01" });
  await expect(firstRow.getByText("在线")).toBeVisible();
  await firstRow.getByRole("switch", { name: "自动升级" }).click();
  await expect.poll(() => mutations.some((item) => JSON.stringify(item.body) === '{"autoUpdate":0}')).toBe(true);

  await firstRow.getByRole("button", { name: "编辑设备" }).click();
  const editDialog = page.getByRole("dialog", { name: "编辑设备" });
  await editDialog.getByLabel("备注").fill("客厅新音箱");
  await editDialog.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => mutations.some((item) => JSON.stringify(item.body) === '{"alias":"客厅新音箱"}')).toBe(true);

  await page.getByRole("button", { name: "手动添加" }).click();
  const manualDialog = page.getByRole("dialog", { name: "手动添加设备" });
  await manualDialog.getByLabel("设备型号").selectOption("bread-board");
  await manualDialog.getByLabel("固件版本").fill("2.0.0");
  await manualDialog.getByLabel("Mac地址").fill("11-22-33-44-55-66");
  await manualDialog.getByRole("button", { name: "确定" }).click();
  await expect.poll(() => mutations.some((item) => JSON.stringify(item.body) === '{"agentId":"agent-1","appVersion":"2.0.0","board":"bread-board","macAddress":"11:22:33:44:55:66"}')).toBe(true);

  await page.getByRole("button", { name: "6位验证码绑定" }).click();
  const bindDialog = page.getByRole("dialog");
  await bindDialog.getByRole("textbox", { name: "验证码：" }).fill("123456");
  await bindDialog.getByRole("button", { name: "确定" }).click();
  await expect.poll(() => mutations.some((item) => item.url.endsWith("/device/bind/agent-1/123456"))).toBe(true);

  await firstRow.getByRole("button", { name: "解绑" }).click();
  await page.getByRole("dialog", { name: "解绑" }).getByRole("button", { name: "解绑" }).click();
  await expect.poll(() => mutations.some((item) => JSON.stringify(item.body) === '{"deviceId":"device-1"}')).toBe(true);
});

test("updates address-book permissions from the selected caller device", async ({ page }) => {
  let permissionPayload: Record<string, unknown> | undefined;
  await page.route("**/xiaozhi/agent/list**", (route) => fulfill(route, [agent]));
  await page.route("**/xiaozhi/device/bind/agent-1", async (route) => {
    if (route.request().method() === "POST") await fulfill(route, "{}");
    else await fulfill(route, devices);
  });
  await page.route("**/xiaozhi/device/address-book/AA%3ABB%3ACC%3ADD%3AEE%3A01", (route) => fulfill(route, [
    { alias: "书房", hasPermission: true, macAddress: devices[0].macAddress, targetMac: devices[1].macAddress.toLowerCase() },
  ]));
  await page.route("**/xiaozhi/device/address-book/permission", async (route) => {
    permissionPayload = route.request().postDataJSON() as Record<string, unknown>;
    await fulfill(route);
  });

  await page.goto("/address-book-management");
  await expect(page.getByRole("heading", { name: "通讯录管理" })).toBeVisible();
  const contact = page.getByText("书房", { exact: true }).locator("..").locator("..");
  await contact.getByRole("checkbox").uncheck();
  await page.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => permissionPayload).toEqual({
    hasPermission: false,
    macAddress: "AA:BB:CC:DD:EE:01",
    targetMac: "AA:BB:CC:DD:EE:02",
  });
});

test("creates a full template and a voiceprint from recorded user audio", async ({ page }) => {
  let templatePayload: Record<string, unknown> | undefined;
  let voicePayload: Record<string, unknown> | undefined;
  await mockAgentSelectors(page);
  await page.route("**/xiaozhi/agent/template", async (route) => {
    if (route.request().method() === "POST") {
      templatePayload = route.request().postDataJSON() as Record<string, unknown>;
      await fulfill(route, templatePayload);
    } else await fulfill(route, []);
  });
  await page.route("**/xiaozhi/agent/voice-print/list/agent-1", (route) => fulfill(route, []));
  await page.route("**/xiaozhi/agent/agent-1/chat-history/user", (route) => fulfill(route, [
    { audioId: "audio-1", content: "你好，小智" },
  ]));
  await page.route("**/xiaozhi/agent/voice-print", async (route) => {
    voicePayload = route.request().postDataJSON() as Record<string, unknown>;
    await fulfill(route);
  });

  await page.goto("/template-quick-config");
  await page.getByLabel("助手昵称").fill("家庭助手模板");
  await page.getByLabel("角色介绍").fill("你是一位耐心可靠的家庭助手。每天提供日程提醒和天气信息。");
  await page.getByRole("button", { name: "保存配置" }).click();
  await expect.poll(() => templatePayload).toMatchObject({
    agentName: "家庭助手模板",
    systemPrompt: "你是一位耐心可靠的家庭助手。每天提供日程提醒和天气信息。",
  });

  await page.goto("/voice-print?agentId=agent-1");
  await page.getByRole("button", { name: "新增" }).click();
  const dialog = page.getByRole("dialog", { name: "添加说话人" });
  await dialog.getByRole("combobox", { name: "声纹向量" }).selectOption("audio-1");
  await dialog.getByLabel("姓名").fill("Jack");
  await dialog.getByLabel("描述").fill("家庭管理员");
  await dialog.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => voicePayload).toEqual({
    agentId: "agent-1",
    audioId: "audio-1",
    introduce: "家庭管理员",
    sourceName: "Jack",
  });
});
