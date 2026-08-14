import { expect, test, type Page, type Route } from "@playwright/test";

const publicKey =
  "044692890d5f130f93901ecebcee838dfee4d113317b205c94ef4f69a6c74859df96301dba4733e3e464077459bc7e1aa63416942c37bada11e510e0da1cd26286";

async function fulfill(route: Route, data?: unknown) {
  await route.fulfill({
    body: JSON.stringify({ code: 0, data, msg: "success" }),
    contentType: "application/json",
  });
}

function publicConfig(systemWebMenu?: Record<string, unknown>) {
  return {
    allowUserRegister: true,
    enableMobileRegister: false,
    mobileAreaList: [{ key: "+86", name: "中国大陆" }],
    name: "Xiaozhi Administration Test",
    sm2PublicKey: publicKey,
    systemWebMenu: systemWebMenu || {
      features: {
        addressBook: { enabled: true },
        knowledgeBase: { enabled: true },
        voiceClone: { enabled: true },
        voiceprintRecognition: { enabled: true },
      },
      groups: {},
    },
    version: "test",
    year: "©2026",
  };
}

async function mockAdminSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "token",
      JSON.stringify({ expire: 7200, token: "phase-six-token" }),
    );
    localStorage.setItem("xiaozhi-language", "zh-CN");
  });
  await page.route("**/xiaozhi/user/pub-config", (route) =>
    fulfill(route, publicConfig()),
  );
  await page.route("**/xiaozhi/user/info", (route) =>
    fulfill(route, { id: 1, superAdmin: 1, username: "admin" }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockAdminSession(page);
});

test("resets passwords and confirms status and delete operations", async ({
  page,
}) => {
  const users = [
    {
      createDate: "2026-08-14T01:00:00Z",
      deviceCount: "2",
      mobile: "13800138000",
      status: 1,
      userid: "user-1",
    },
    {
      createDate: "2026-08-14T02:00:00Z",
      deviceCount: "0",
      mobile: "13900139000",
      status: 0,
      userid: "user-2",
    },
  ];
  let statusPayload: unknown;
  let deletedPath = "";

  await page.route("**/xiaozhi/admin/users**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/xiaozhi", "");
    const method = route.request().method();
    if (path === "/admin/users" && method === "GET") {
      return fulfill(route, { list: users, total: users.length });
    }
    if (path === "/admin/users/user-1" && method === "PUT") {
      return fulfill(route, "generated-P4ssword");
    }
    if (path === "/admin/users/changeStatus/0" && method === "PUT") {
      statusPayload = route.request().postDataJSON();
      return fulfill(route);
    }
    if (path === "/admin/users/user-1" && method === "DELETE") {
      deletedPath = path;
      return fulfill(route);
    }
    return fulfill(route);
  });

  await page.goto("/user-management");
  await expect(page.getByRole("heading", { name: "用户管理" })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "13800138000" });

  await row.getByRole("button", { name: "重置密码" }).click();
  await page
    .getByRole("dialog", { name: "警告" })
    .getByRole("button", { name: "重置密码" })
    .click();
  const passwordDialog = page.getByRole("dialog", { name: "用户新密码" });
  await expect(passwordDialog.getByLabel("生成的默认密码")).toHaveValue(
    "generated-P4ssword",
  );
  await passwordDialog.getByRole("button", { name: "关闭" }).click();

  await row.getByRole("checkbox", { name: "13800138000" }).check();
  await page.getByRole("button", { name: "禁用", exact: true }).click();
  await page
    .getByRole("dialog", { name: "警告" })
    .getByRole("button", { name: "禁用", exact: true })
    .click();
  await expect.poll(() => statusPayload).toEqual(["user-1"]);

  await row.getByRole("button", { name: "删除用户" }).click();
  await page
    .getByRole("dialog", { name: "警告" })
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await expect.poll(() => deletedPath).toBe("/admin/users/user-1");
});

test("masks secrets and serializes typed parameters", async ({ page }) => {
  const parameters = [
    {
      id: 51,
      paramCode: "openai.api_key",
      paramValue: "sk-secret-1234",
      remark: "模型密钥",
      valueType: "string",
    },
  ];
  let createPayload: Record<string, unknown> | undefined;
  let deletePayload: unknown;

  await page.route("**/xiaozhi/admin/params**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return fulfill(route, { list: parameters, total: parameters.length });
    }
    if (method === "POST" && new URL(route.request().url()).pathname.endsWith("/delete")) {
      deletePayload = route.request().postDataJSON();
      return fulfill(route);
    }
    if (method === "POST") {
      createPayload = route.request().postDataJSON() as Record<string, unknown>;
      return fulfill(route);
    }
    return fulfill(route);
  });

  await page.goto("/params-management");
  const secretRow = page.getByRole("row").filter({ hasText: "openai.api_key" });
  await expect(secretRow.getByText("sk****34")).toBeVisible();
  await expect(secretRow.getByText("sk-secret-1234")).toHaveCount(0);
  await secretRow.getByRole("button", { name: "查看" }).click();
  await expect(secretRow.getByText("sk-secret-1234")).toBeVisible();

  await page.getByRole("button", { name: "新增", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "新增参数" });
  await dialog.getByLabel("参数编码").fill("runtime.options");
  await dialog.getByLabel("值类型").selectOption("json");
  await dialog.getByLabel("参数值").fill('{\n  "enabled": true\n}');
  await dialog.getByLabel("备注").fill("运行参数");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect.poll(() => createPayload).toEqual({
    paramCode: "runtime.options",
    paramValue: '{"enabled":true}',
    remark: "运行参数",
    valueType: "json",
  });

  await secretRow.getByRole("checkbox", { name: "openai.api_key" }).check();
  await page.getByRole("button", { name: "删除", exact: true }).first().click();
  await page
    .getByRole("dialog", { name: "警告" })
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await expect.poll(() => deletePayload).toEqual(["51"]);
});

test("creates dictionary types and values and deletes selected data", async ({
  page,
}) => {
  const types = [
    { dictName: "固件类型", dictType: "FIRMWARE_TYPE", id: 7, sort: 1 },
  ];
  const values = [
    {
      dictLabel: "面包板",
      dictTypeId: 7,
      dictValue: "bread-board",
      id: 91,
      sort: 1,
    },
  ];
  let typePayload: Record<string, unknown> | undefined;
  let dataPayload: Record<string, unknown> | undefined;
  let deletePayload: unknown;

  await page.route("**/xiaozhi/admin/dict/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/xiaozhi", "");
    const method = route.request().method();
    if (path === "/admin/dict/type/page") {
      return fulfill(route, { list: types, total: types.length });
    }
    if (path === "/admin/dict/data/page") {
      return fulfill(route, { list: values, total: values.length });
    }
    if (path === "/admin/dict/type/save" && method === "POST") {
      typePayload = route.request().postDataJSON() as Record<string, unknown>;
      return fulfill(route);
    }
    if (path === "/admin/dict/data/save" && method === "POST") {
      dataPayload = route.request().postDataJSON() as Record<string, unknown>;
      return fulfill(route);
    }
    if (path === "/admin/dict/data/delete" && method === "POST") {
      deletePayload = route.request().postDataJSON();
      return fulfill(route);
    }
    return fulfill(route);
  });

  await page.goto("/dict-management");
  await expect(page.getByRole("heading", { name: "字典管理" })).toBeVisible();
  await page.getByRole("button", { name: "新增字典类型" }).first().click();
  const typeDialog = page.getByRole("dialog", { name: "新增字典类型" });
  await typeDialog.getByLabel("字典类型名称").fill("设备状态");
  await typeDialog.getByLabel("字典类型编码").fill("DEVICE_STATUS");
  await typeDialog.getByLabel("排序").fill("2");
  await typeDialog.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => typePayload).toMatchObject({
    dictName: "设备状态",
    dictType: "DEVICE_STATUS",
    sort: 2,
  });

  await page.getByRole("button", { name: "新增字典数据" }).click();
  const dataDialog = page.getByRole("dialog", { name: "新增字典数据" });
  await dataDialog.getByLabel("字典标签").fill("已激活");
  await dataDialog.getByLabel("字典值").fill("active");
  await dataDialog.getByLabel("排序").fill("3");
  await dataDialog.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => dataPayload).toMatchObject({
    dictLabel: "已激活",
    dictTypeId: 7,
    dictValue: "active",
    sort: 3,
  });

  const valueRow = page.getByRole("row").filter({ hasText: "bread-board" });
  await valueRow.getByRole("checkbox", { name: "面包板" }).check();
  await page.getByRole("button", { name: "批量删除字典数据" }).click();
  await page
    .getByRole("dialog", { name: "批量删除字典数据" })
    .getByRole("button", { name: "确定" })
    .click();
  await expect.poll(() => deletePayload).toEqual([91]);
});

test("imports, downloads, and deletes replacement-word files", async ({
  page,
}) => {
  const files = [
    {
      content: ["小智|晓知"],
      createdAt: "2026-08-14T03:00:00Z",
      fileName: "默认替换词",
      id: "file-1",
      updatedAt: "2026-08-14T03:30:00Z",
      wordCount: 1,
    },
  ];
  let createPayload: Record<string, unknown> | undefined;
  let deletedPath = "";
  let downloadRequested = false;

  await page.route("**/xiaozhi/correct-word/file**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/xiaozhi", "");
    const method = route.request().method();
    if (path === "/correct-word/file/list") {
      return fulfill(route, { list: files, total: files.length });
    }
    if (path === "/correct-word/file" && method === "POST") {
      createPayload = route.request().postDataJSON() as Record<string, unknown>;
      return fulfill(route, { ...createPayload, id: "file-2" });
    }
    if (path === "/correct-word/file/download/file-1") {
      downloadRequested = true;
      return route.fulfill({ body: "小智|晓知", contentType: "text/plain" });
    }
    if (path === "/correct-word/file/file-1" && method === "DELETE") {
      deletedPath = path;
      return fulfill(route);
    }
    return fulfill(route);
  });

  await page.goto("/replacement-word-management");
  await page.getByRole("button", { name: "新增替换词文件" }).click();
  const dialog = page.getByRole("dialog", { name: "新增替换词文件" });
  await dialog.locator('input[type="file"]').setInputFiles({
    buffer: Buffer.from("小智|晓知\nOTA|O T A"),
    mimeType: "text/plain",
    name: "custom-words.txt",
  });
  await expect(dialog.getByLabel("文件名称")).toHaveValue("custom-words");
  await dialog.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => createPayload).toMatchObject({
    content: ["小智|晓知", "OTA|O T A"],
    fileName: "custom-words",
  });
  expect(Number(createPayload?.fileSize)).toBeGreaterThan(0);

  const row = page.getByRole("row").filter({ hasText: "默认替换词" });
  const download = page.waitForEvent("download");
  await row.getByRole("button", { name: "下载" }).click();
  await download;
  await expect.poll(() => downloadRequested).toBe(true);

  await row.getByRole("button", { name: "删除" }).click();
  await page
    .getByRole("dialog", { name: "提示" })
    .getByRole("button", { name: "删除" })
    .click();
  await expect.poll(() => deletedPath).toBe("/correct-word/file/file-1");
});

test("confirms server configuration refresh and restart commands", async ({
  page,
}) => {
  const actions: unknown[] = [];
  await page.route("**/xiaozhi/admin/server/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/xiaozhi", "");
    if (path === "/admin/server/server-list") {
      return fulfill(route, ["ws://127.0.0.1:8000/xiaozhi/v1/"]);
    }
    actions.push(route.request().postDataJSON());
    return fulfill(route, true);
  });

  await page.goto("/server-side-management");
  await expect(page.getByText("ws://127.0.0.1:8000/xiaozhi/v1/")).toBeVisible();

  await page.getByRole("button", { name: "更新配置" }).click();
  await page
    .getByRole("dialog", { name: "更新配置" })
    .getByRole("button", { name: "更新配置" })
    .click();
  await expect.poll(() => actions).toContainEqual({
    action: "update_config",
    targetWs: "ws://127.0.0.1:8000/xiaozhi/v1/",
  });

  await page.getByRole("button", { name: "重启" }).click();
  await page
    .getByRole("dialog", { name: "重启服务端" })
    .getByRole("button", { name: "重启" })
    .click();
  await expect.poll(() => actions).toContainEqual({
    action: "restart",
    targetWs: "ws://127.0.0.1:8000/xiaozhi/v1/",
  });
});

test("persists feature flags using the discovered parameter id and preserves unknown config", async ({
  page,
}, testInfo) => {
  let menu = {
    features: {
      futureFeature: { description: "future.description", enabled: true, name: "future.name" },
      vad: { enabled: true },
      voiceClone: { enabled: false },
    },
    groups: { futureGroup: ["futureFeature"] },
  };
  const updates: Record<string, unknown>[] = [];

  await page.unroute("**/xiaozhi/user/pub-config");
  await page.route("**/xiaozhi/user/pub-config", (route) =>
    fulfill(route, publicConfig(menu)),
  );
  await page.route("**/xiaozhi/admin/params**", async (route) => {
    if (route.request().method() === "GET") {
      return fulfill(route, {
        list: [
          {
            id: 812,
            paramCode: "system-web.menu",
            paramValue: JSON.stringify(menu),
            remark: "系统功能菜单配置",
            valueType: "json",
          },
        ],
        total: 1,
      });
    }
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    updates.push(payload);
    menu = JSON.parse(String(payload.paramValue)) as typeof menu;
    return fulfill(route);
  });

  await page.goto("/feature-management");
  const voiceClone = page.getByRole("switch", { name: "音色克隆" });
  await expect(voiceClone).not.toBeChecked();
  await voiceClone.click();
  await expect(page.getByText("有尚未保存的更改")).toBeVisible();
  await page.getByRole("button", { name: "保存配置" }).click();
  await expect.poll(() => updates.length).toBe(1);

  const firstMenu = JSON.parse(String(updates[0]?.paramValue)) as typeof menu;
  expect(updates[0]).toMatchObject({ id: 812, paramCode: "system-web.menu" });
  expect(firstMenu.features.voiceClone?.enabled).toBe(true);
  expect(firstMenu.features.futureFeature?.enabled).toBe(true);
  expect(firstMenu.groups.futureGroup).toEqual(["futureFeature"]);

  const screenshot = testInfo.outputPath("feature-management.png");
  await page.screenshot({ fullPage: true, path: screenshot });
  await testInfo.attach("feature management", {
    contentType: "image/png",
    path: screenshot,
  });

  await page.getByRole("button", { name: "重置" }).click();
  await page
    .getByRole("dialog", { name: "重置" })
    .getByRole("button", { name: "确定" })
    .click();
  await expect.poll(() => updates.length).toBe(2);
  const resetMenu = JSON.parse(String(updates[1]?.paramValue)) as typeof menu;
  expect(resetMenu.features.voiceClone?.enabled).toBe(false);
  expect(resetMenu.features.vad?.enabled).toBe(false);
  expect(resetMenu.features.futureFeature?.enabled).toBe(true);
  expect(resetMenu.groups.futureGroup).toEqual(["futureFeature"]);
});
