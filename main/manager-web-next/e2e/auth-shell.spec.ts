import { expect, test, type Page } from "@playwright/test";

const publicKey =
  "044692890d5f130f93901ecebcee838dfee4d113317b205c94ef4f69a6c74859df96301dba4733e3e464077459bc7e1aa63416942c37bada11e510e0da1cd26286";
const transparentGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

async function mockPublicConfig(
  page: Page,
  options: { allowRegistration?: boolean; mobileRegistration?: boolean } = {},
) {
  await page.route("**/xiaozhi/user/pub-config", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: 0,
        data: {
          allowUserRegister: options.allowRegistration ?? true,
          enableMobileRegister: options.mobileRegistration ?? false,
          mobileAreaList: [{ key: "+86", name: "中国大陆" }],
          name: "Xiaozhi Test",
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
        },
        msg: "success",
      }),
    }),
  );
}

async function mockPublicEndpoints(page: Page) {
  await mockPublicConfig(page);
  await page.route("**/xiaozhi/user/captcha?**", (route) =>
    route.fulfill({ body: transparentGif, contentType: "image/gif" }),
  );
  await page.route("**/xiaozhi/agent/list**", (route) =>
    route.fulfill({
      body: JSON.stringify({ code: 0, data: [], msg: "success" }),
      contentType: "application/json",
    }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockPublicEndpoints(page);
});

test("redirects every unauthenticated business deep link to sign in", async ({ page }) => {
  await page.goto("/params-management?section=security");

  await expect(page).toHaveURL(/\/login\?redirect=/);
  await expect(page.getByRole("heading", { name: "欢迎回来" })).toBeVisible();
});

test("signs in with encrypted credentials and opens the permission-aware shell", async ({ page }) => {
  await page.route("**/xiaozhi/user/login", async (route) => {
    const body = route.request().postDataJSON() as {
      captchaId: string;
      password: string;
      username: string;
    };
    expect(body.username).toBe("admin");
    expect(body.captchaId).toBeTruthy();
    expect(body.password).toMatch(/^04[0-9a-f]+$/i);
    expect(body.password).not.toContain("test-password");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 0, data: { token: "test-token", expire: 7200 } }),
    });
  });
  await page.route("**/xiaozhi/user/info", async (route) => {
    expect(route.request().headers().authorization).toBe("Bearer test-token");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 0, data: { id: 1, username: "admin", superAdmin: 1 } }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("用户名").fill("admin");
  await page.getByLabel("密码", { exact: true }).fill("test-password");
  await page.getByLabel("图形验证码").fill("a1b2");
  await page.getByRole("button", { name: "登录", exact: true }).click();

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "你好，admin" })).toBeVisible();
  await expect(page.getByRole("link", { name: "模型配置", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "用户管理", exact: true })).toBeVisible();
});

test("reuses a legacy token while blocking a member from administrator routes", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "token",
      JSON.stringify({ token: "member-token", expire: 7200 }),
    );
  });
  await page.route("**/xiaozhi/user/info", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: 0,
        data: { id: 7, username: "member", superAdmin: 0 },
      }),
    }),
  );

  await page.goto("/model-config");
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "你好，member" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "模型配置", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "音色克隆", exact: true }),
  ).toBeVisible();
});

test("registers with an SM2-encrypted password", async ({ page }) => {
  await page.route("**/xiaozhi/user/register", async (route) => {
    const body = route.request().postDataJSON() as {
      captchaId: string;
      password: string;
      username: string;
    };
    expect(body.username).toBe("new-user");
    expect(body.captchaId).toBeTruthy();
    expect(body.password).toMatch(/^04[0-9a-f]+$/i);
    expect(body.password).not.toContain("new-password");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 0 }),
    });
  });

  await page.goto("/register");
  await page.getByLabel("用户名").fill("new-user");
  await page.getByLabel("图形验证码").fill("c4d5");
  await page.getByLabel("密码", { exact: true }).fill("new-password");
  await page.getByLabel("确认密码").fill("new-password");
  await page.getByRole("button", { name: "注册", exact: true }).click();

  await expect(page).toHaveURL(/\/login\?registered=1$/);
  await expect(page.getByText("注册成功，现在可以登录。")).toBeVisible();
});

test("sends an SMS code and resets a mobile account password", async ({ page }) => {
  await page.unroute("**/xiaozhi/user/pub-config");
  await mockPublicConfig(page, { mobileRegistration: true });
  await page.route("**/xiaozhi/user/smsVerification", async (route) => {
    const body = route.request().postDataJSON() as {
      captcha: string;
      phone: string;
    };
    expect(body).toMatchObject({
      captcha: "r7s8",
      phone: "+8613800138000",
    });
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 0 }),
    });
  });
  await page.route("**/xiaozhi/user/retrieve-password", async (route) => {
    const body = route.request().postDataJSON() as {
      code: string;
      password: string;
      phone: string;
    };
    expect(body.phone).toBe("+8613800138000");
    expect(body.code).toBe("246810");
    expect(body.password).toMatch(/^04[0-9a-f]+$/i);
    expect(body.password).not.toContain("reset-password");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 0 }),
    });
  });

  await page.goto("/retrieve-password");
  await page.getByLabel("手机号").fill("13800138000");
  await page.getByLabel("图形验证码").fill("r7s8");
  await page.getByRole("button", { name: "发送验证码" }).click();
  await page.getByLabel("短信验证码").fill("246810");
  await page.getByLabel("新密码").fill("reset-password");
  await page.getByLabel("确认密码").fill("reset-password");
  await page
    .getByRole("button", { name: "重置密码", exact: true })
    .click();

  await expect(page).toHaveURL(/\/login\?reset=1$/);
  await expect(page.getByText("密码已更新，请使用新密码登录。")).toBeVisible();
});

test("switches and persists all six languages on the public screen", async ({ page }) => {
  await page.goto("/login");
  const languageSelect = page.getByRole("combobox", { name: "界面语言" });
  await expect(languageSelect.locator("option")).toHaveCount(6);

  await languageSelect.selectOption("en");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("userLanguage"))).toBe("en");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
});
