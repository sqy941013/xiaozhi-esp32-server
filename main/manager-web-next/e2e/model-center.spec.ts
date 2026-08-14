import { expect, test, type Page, type Route } from "@playwright/test";

const publicKey =
  "044692890d5f130f93901ecebcee838dfee4d113317b205c94ef4f69a6c74859df96301dba4733e3e464077459bc7e1aa63416942c37bada11e510e0da1cd26286";

const miniMaxModel = {
  configJson: {
    api_key: "sk-a****4wB8",
    base_url: "https://api.minimaxi.com/v1",
    max_tokens: 8192,
    model_name: "MiniMax-M2.7-highspeed",
    temperature: 0.8,
    thinking: true,
    top_p: 1,
    type: "openai",
  },
  docLink: "https://platform.minimaxi.com/docs/guides/text-generation",
  id: "LLM_MiniMax",
  isDefault: 0,
  isEnabled: 1,
  modelCode: "MiniMax-M2.7-highspeed",
  modelName: "MiniMax-M2.7-highspeed",
  modelType: "LLM",
  remark: "",
  sort: 1,
};

const openAiProvider = {
  fields: JSON.stringify([
    { key: "base_url", label: "基础URL", type: "string" },
    { key: "model_name", label: "模型名称", type: "string" },
    { key: "api_key", label: "API密钥", type: "password" },
    { key: "temperature", label: "温度", type: "number" },
    { key: "max_tokens", label: "最大令牌数", type: "number" },
    { key: "top_p", label: "top_p值", type: "number" },
    { key: "thinking", label: "是否启用思考", type: "boolean" },
  ]),
  id: "SYSTEM_LLM_openai",
  modelType: "LLM",
  name: "OpenAI接口",
  providerCode: "openai",
  sort: 1,
};

async function fulfill(route: Route, data?: unknown) {
  await route.fulfill({
    body: JSON.stringify({ code: 0, data, msg: "success" }),
    contentType: "application/json",
  });
}

async function mockAdminSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "token",
      JSON.stringify({ expire: 7200, token: "model-center-token" }),
    );
    localStorage.setItem("xiaozhi-language", "zh-CN");
  });

  await page.route("**/xiaozhi/user/pub-config", (route) =>
    fulfill(route, {
      allowUserRegister: true,
      enableMobileRegister: false,
      mobileAreaList: [{ key: "+86", name: "中国大陆" }],
      name: "Xiaozhi Model Center Test",
      sm2PublicKey: publicKey,
      systemWebMenu: {
        features: {
          addressBook: { enabled: true },
          knowledgeBase: { enabled: true },
          voiceClone: { enabled: true },
          voiceprintRecognition: { enabled: true },
        },
      },
      version: "test",
      year: "©2026",
    }),
  );
  await page.route("**/xiaozhi/user/info", async (route) => {
    expect(route.request().headers().authorization).toBe(
      "Bearer model-center-token",
    );
    await fulfill(route, { id: 1, superAdmin: 1, username: "admin" });
  });
}

test.beforeEach(async ({ page }) => {
  await mockAdminSession(page);
});

test("edits typed model fields without sending the stored masked secret", async ({
  page,
}, testInfo) => {
  let updatePayload: Record<string, unknown> | undefined;

  await page.route("**/xiaozhi/models/list?**", (route) =>
    fulfill(route, { list: [miniMaxModel], total: 1 }),
  );
  await page.route("**/xiaozhi/models/LLM/provideTypes", (route) =>
    fulfill(route, [openAiProvider]),
  );
  await page.route("**/xiaozhi/models/LLM_MiniMax", (route) =>
    fulfill(route, miniMaxModel),
  );
  await page.route(
    "**/xiaozhi/models/LLM/openai/LLM_MiniMax",
    async (route) => {
      updatePayload = route.request().postDataJSON() as Record<string, unknown>;
      await fulfill(route, { ...miniMaxModel, ...updatePayload });
    },
  );

  await page.goto("/model-config?type=LLM");
  await expect(
    page.getByRole("heading", { name: "模型配置", exact: true }),
  ).toBeVisible();

  const modelRow = page.getByRole("row").filter({
    hasText: "MiniMax-M2.7-highspeed",
  });
  await modelRow.getByRole("button", { name: "修改", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: /修改模型/ });
  const apiKey = dialog.getByLabel("API密钥", { exact: true });
  await expect(apiKey).toHaveValue("");
  await expect(apiKey).toHaveAttribute(
    "placeholder",
    "留空以保留已保存的值",
  );
  const formScreenshot = testInfo.outputPath("model-form-desktop.png");
  await page.screenshot({ fullPage: true, path: formScreenshot });
  await testInfo.attach("model form desktop", {
    contentType: "image/png",
    path: formScreenshot,
  });

  await dialog.getByLabel("温度", { exact: true }).fill("0");
  const thinking = dialog.getByRole("switch", {
    name: "是否启用思考",
  });
  await expect(thinking).toBeChecked();
  await thinking.click();
  await expect(thinking).not.toBeChecked();
  await dialog.getByRole("button", { name: "保存", exact: true }).click();

  await expect.poll(() => updatePayload).toBeTruthy();
  const config = updatePayload?.configJson as Record<string, unknown>;
  expect(Object.hasOwn(config, "api_key")).toBe(false);
  expect(config.temperature).toBe(0);
  expect(config.max_tokens).toBe(8192);
  expect(config.thinking).toBe(false);
  await expect(dialog).toHaveCount(0);
});

test("keeps the model center usable on a mobile viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.route("**/xiaozhi/models/list?**", (route) =>
    fulfill(route, { list: [miniMaxModel], total: 1 }),
  );

  await page.goto("/model-config?type=LLM");
  await expect(
    page.getByRole("heading", { name: "模型配置", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);

  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(
    page.getByRole("link", { name: "模型配置", exact: true }),
  ).toBeVisible();
  const mobileScreenshot = testInfo.outputPath("model-center-mobile.png");
  await page.screenshot({ fullPage: true, path: mobileScreenshot });
  await testInfo.attach("model center mobile", {
    contentType: "image/png",
    path: mobileScreenshot,
  });
});

test("updates model status and confirms an explicit default change", async ({
  page,
}) => {
  await page.route("**/xiaozhi/models/list?**", (route) =>
    fulfill(route, { list: [miniMaxModel], total: 1 }),
  );
  await page.route(
    "**/xiaozhi/models/enable/LLM_MiniMax/0",
    (route) => fulfill(route),
  );
  await page.route("**/xiaozhi/models/default/LLM_MiniMax", (route) =>
    fulfill(route),
  );

  await page.goto("/model-config?type=LLM");
  const modelRow = page.getByRole("row").filter({
    hasText: "MiniMax-M2.7-highspeed",
  });

  const disableRequest = page.waitForRequest(
    (request) =>
      request.method() === "PUT" &&
      request.url().endsWith("/xiaozhi/models/enable/LLM_MiniMax/0"),
  );
  await modelRow.getByRole("switch", { name: "是否启用" }).click();
  await disableRequest;
  await expect(page.getByText("禁用成功")).toBeVisible();

  await modelRow.getByRole("button", { name: "设为默认" }).click();
  const confirmation = page.getByRole("dialog", { name: "切换默认模型" });
  await expect(confirmation).toContainText("MiniMax-M2.7-highspeed");
  const defaultRequest = page.waitForRequest(
    (request) =>
      request.method() === "PUT" &&
      request.url().endsWith("/xiaozhi/models/default/LLM_MiniMax"),
  );
  await confirmation
    .getByRole("button", { name: "确认设为默认" })
    .click();
  await defaultRequest;
  await expect(page.getByText(/设置默认模型成功/)).toBeVisible();
});

test("creates an ordered typed provider schema", async ({ page }) => {
  let providerPayload: Record<string, unknown> | undefined;

  await page.route("**/xiaozhi/models/provider**", async (route) => {
    if (route.request().method() === "POST") {
      providerPayload = route.request().postDataJSON() as Record<
        string,
        unknown
      >;
      await fulfill(route, {
        ...providerPayload,
        id: "SYSTEM_LLM_custom_openai",
      });
      return;
    }
    await fulfill(route, { list: [], total: 0 });
  });

  await page.goto("/provider-management");
  await page.getByRole("button", { name: "新增供应器" }).click();
  const dialog = page.getByRole("dialog", { name: "新增供应器" });

  await dialog.getByLabel("供应器编码").fill("custom_openai");
  await dialog.getByLabel("名称", { exact: true }).fill("自定义 OpenAI");
  await dialog.getByRole("button", { name: "新增字段" }).click();
  await dialog.getByLabel("字段key").fill("api_key");
  await dialog.getByLabel("字段标签").fill("API密钥");
  await dialog.getByLabel("字段类型").selectOption("password");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();

  await expect.poll(() => providerPayload).toBeTruthy();
  expect(providerPayload).toMatchObject({
    id: "",
    modelType: "LLM",
    name: "自定义 OpenAI",
    providerCode: "custom_openai",
    sort: 0,
  });
  expect(JSON.parse(String(providerPayload?.fields))).toEqual([
    {
      default: "",
      key: "api_key",
      label: "API密钥",
      type: "password",
    },
  ]);
  await expect(dialog).toHaveCount(0);
});

test("adds a voice to a TTS model and keeps it linked to that model", async ({
  page,
}) => {
  const ttsModel = {
    ...miniMaxModel,
    configJson: { type: "openai" },
    id: "TTS_OpenAI",
    modelCode: "OpenAITTS",
    modelName: "OpenAI TTS",
    modelType: "TTS",
  };
  let voicePayload: Record<string, unknown> | undefined;

  await page.route("**/xiaozhi/models/list?**", (route) =>
    fulfill(route, { list: [ttsModel], total: 1 }),
  );
  await page.route("**/xiaozhi/ttsVoice**", async (route) => {
    if (route.request().method() === "POST") {
      voicePayload = route.request().postDataJSON() as Record<string, unknown>;
      await fulfill(route);
      return;
    }
    await fulfill(route, { list: [], total: 0 });
  });

  await page.goto("/model-config?type=TTS");
  const modelRow = page.getByRole("row").filter({ hasText: "OpenAI TTS" });
  await modelRow.getByRole("button", { name: "音色管理" }).click();
  await page.getByRole("button", { name: "新增音色" }).click();

  const dialog = page.getByRole("dialog", { name: "新增音色" });
  await dialog.getByLabel("音色编码").fill("alloy");
  await dialog.getByLabel("音色名称").fill("Alloy");
  await dialog.getByLabel("语言类型").fill("zh-CN,en-US");
  await dialog
    .getByLabel("请输入MP3地址")
    .fill("https://example.com/audio/alloy.mp3");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();

  await expect.poll(() => voicePayload).toBeTruthy();
  expect(voicePayload).toMatchObject({
    languages: "zh-CN,en-US",
    name: "Alloy",
    ttsModelId: "TTS_OpenAI",
    ttsVoice: "alloy",
    voiceDemo: "https://example.com/audio/alloy.mp3",
  });
  await expect(dialog).toHaveCount(0);
});
