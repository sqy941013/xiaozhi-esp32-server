import { expect, test, type Page, type Route } from "@playwright/test";

const publicKey =
  "044692890d5f130f93901ecebcee838dfee4d113317b205c94ef4f69a6c74859df96301dba4733e3e464077459bc7e1aa63416942c37bada11e510e0da1cd26286";

async function fulfill(route: Route, data?: unknown) {
  await route.fulfill({
    body: JSON.stringify({ code: 0, data, msg: "success" }),
    contentType: "application/json",
  });
}

function wavBuffer(seconds = 9, sampleRate = 8_000) {
  const samples = Math.floor(seconds * sampleRate);
  const dataLength = samples * 2;
  const output = Buffer.alloc(44 + dataLength);
  output.write("RIFF", 0);
  output.writeUInt32LE(36 + dataLength, 4);
  output.write("WAVE", 8);
  output.write("fmt ", 12);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write("data", 36);
  output.writeUInt32LE(dataLength, 40);
  for (let index = 0; index < samples; index += 1) {
    const sample = Math.sin((index / sampleRate) * Math.PI * 440) * 0x1800;
    output.writeInt16LE(Math.round(sample), 44 + index * 2);
  }
  return output;
}

async function mockAdminSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("token", JSON.stringify({ expire: 7200, token: "phase-five-token" }));
    localStorage.setItem("xiaozhi-language", "zh-CN");
  });
  await page.route("**/xiaozhi/user/pub-config", (route) => fulfill(route, {
    allowUserRegister: true,
    enableMobileRegister: false,
    mobileAreaList: [{ key: "+86", name: "中国大陆" }],
    name: "Xiaozhi Media Center",
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
  }));
  await page.route("**/xiaozhi/user/info", (route) => fulfill(route, {
    id: 1,
    superAdmin: 1,
    username: "admin",
  }));
}

test.beforeEach(async ({ page }) => {
  await mockAdminSession(page);
});

test("manages knowledge bases, multipart documents, parsing, slices, and retrieval", async ({ page }, testInfo) => {
  const knowledgeBases = [{
    chunkCount: 0,
    createdAt: "2026-08-14T02:00:00Z",
    datasetId: "kb-1",
    description: "小智产品和部署资料",
    documentCount: 1,
    id: "local-kb-1",
    name: "产品知识",
    ragModelId: "RAG_1",
    status: 1,
  }];
  const documents = [{
    chunkCount: 0,
    createdAt: "2026-08-14T02:30:00Z",
    documentId: "doc-1",
    fileSize: 1024,
    fileType: "md",
    id: "doc-1",
    name: "部署指南.md",
    parseStatusCode: 0,
    progress: 0,
    run: "UNSTART",
  }];
  let createdPayload: unknown;
  let uploadedBody = "";
  let parsePayload: unknown;
  let retrievalPayload: unknown;

  await page.route("**/xiaozhi/datasets**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/xiaozhi", "");
    const method = route.request().method();
    if (path === "/datasets/rag-models") return fulfill(route, [{ id: "RAG_1", modelName: "RAGFlow" }]);
    if (path === "/datasets" && method === "GET") return fulfill(route, { list: knowledgeBases, total: knowledgeBases.length });
    if (path === "/datasets" && method === "POST") {
      createdPayload = route.request().postDataJSON();
      const created = { ...(createdPayload as object), datasetId: "kb-2", id: "local-kb-2", documentCount: 0 };
      knowledgeBases.push(created as (typeof knowledgeBases)[number]);
      return fulfill(route, created);
    }
    if (path === "/datasets/kb-1/documents" && method === "GET") return fulfill(route, { list: documents, total: documents.length });
    if (path === "/datasets/kb-2/documents" && method === "GET") return fulfill(route, { list: [], total: 0 });
    if (path === "/datasets/kb-1/documents" && method === "POST") {
      uploadedBody = route.request().postDataBuffer()?.toString("utf8") || "";
      if (!documents.some((item) => item.documentId === "doc-upload")) {
        documents.push({ ...documents[0], documentId: "doc-upload", id: "doc-upload", name: "现场手册.md" });
      }
      knowledgeBases[0].documentCount = documents.length;
      return fulfill(route, documents.at(-1));
    }
    if (path === "/datasets/kb-1/chunks" && method === "POST") {
      parsePayload = route.request().postDataJSON();
      documents[0].parseStatusCode = 3;
      documents[0].progress = 1;
      documents[0].run = "DONE";
      documents[0].chunkCount = 1;
      return fulfill(route);
    }
    if (path === "/datasets/kb-1/documents/doc-1/chunks") return fulfill(route, {
      chunks: [{ content: "Docker Compose 使用本地源码构建。", document_id: "doc-1", id: "chunk-1" }],
      total: 1,
    });
    if (path === "/datasets/kb-1/retrieval-test" && method === "POST") {
      retrievalPayload = route.request().postDataJSON();
      return fulfill(route, {
        chunks: [{ content: "使用 docker compose build。", document_id: "doc-1", document_name: "部署指南.md", id: "hit-1", similarity: 0.91 }],
        total: 1,
      });
    }
    return fulfill(route);
  });

  await page.goto("/knowledge-base-management");
  await expect(page.getByRole("heading", { name: "知识库", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "产品知识" })).toBeVisible();

  await page.getByRole("button", { name: "新增", exact: true }).click();
  const addDialog = page.getByRole("dialog", { name: "新增知识库" });
  await addDialog.getByLabel("知识库名称").fill("售后知识");
  await addDialog.getByLabel("知识库描述").fill("售后问题和解决方案");
  await addDialog.getByLabel("RAG模型").selectOption("RAG_1");
  await addDialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect.poll(() => createdPayload).toMatchObject({ name: "售后知识", ragModelId: "RAG_1", status: 1 });

  await page.getByRole("heading", { name: "产品知识" }).click();
  await page.getByRole("button", { name: "新增文档" }).click();
  const uploadDialog = page.getByRole("dialog", { name: "上传文档" });
  await uploadDialog.locator('input[type="file"]').setInputFiles({
    buffer: Buffer.from("# 现场部署\n使用 Compose。"),
    mimeType: "text/markdown",
    name: "现场手册.md",
  });
  await uploadDialog.getByRole("button", { name: "确定" }).click();
  await expect.poll(() => uploadedBody).toContain('filename="现场手册.md"');
  await expect(page.getByText("现场手册.md", { exact: true })).toBeVisible();

  const documentRow = page.getByRole("row").filter({ hasText: "部署指南.md" });
  await documentRow.getByRole("button", { name: "解析", exact: true }).click();
  await page.getByRole("dialog", { name: "解析" }).getByRole("button", { name: "解析" }).click();
  await expect.poll(() => parsePayload).toEqual({ document_ids: ["doc-1"] });
  await expect(documentRow.getByText("已完成")).toBeVisible();

  await documentRow.getByRole("button", { name: "查看切片" }).click();
  const chunksDialog = page.getByRole("dialog", { name: "查看切片" });
  await expect(chunksDialog.getByText("Docker Compose 使用本地源码构建。")).toBeVisible();
  await chunksDialog.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("button", { name: "召回测试" }).click();
  const retrievalDialog = page.getByRole("dialog", { name: "召回测试" });
  await retrievalDialog.getByLabel("测试问题").fill("如何构建 Docker？");
  await retrievalDialog.getByRole("button", { name: "执行测试" }).click();
  await expect.poll(() => retrievalPayload).toMatchObject({ dataset_ids: ["kb-1"], question: "如何构建 Docker？" });
  await expect(retrievalDialog.getByText("使用 docker compose build。")).toBeVisible();

  const screenshot = testInfo.outputPath("knowledge-center.png");
  await page.screenshot({ fullPage: true, path: screenshot });
  await testInfo.attach("knowledge center", { contentType: "image/png", path: screenshot });
});

test("renames, uploads, previews, and starts a cloned voice", async ({ page }) => {
  const voice = {
    createDate: "2026-08-14T03:00:00Z",
    hasVoice: true,
    id: "voice-1",
    languages: "中文,English",
    name: "我的音色",
    trainStatus: 0,
    voiceId: "clone_voice_01",
  };
  let renamePayload: unknown;
  let uploadBody = "";
  let clonePayload: unknown;

  await page.route("**/xiaozhi/voiceClone**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/xiaozhi", "");
    const method = route.request().method();
    if (path === "/voiceClone" && method === "GET") return fulfill(route, { list: [voice], total: 1 });
    if (path === "/voiceClone/updateName") {
      renamePayload = route.request().postDataJSON();
      voice.name = String((renamePayload as { name: string }).name);
      return fulfill(route);
    }
    if (path === "/voiceClone/upload") {
      uploadBody = route.request().postDataBuffer()?.toString("latin1") || "";
      return fulfill(route);
    }
    if (path === "/voiceClone/cloneAudio") {
      clonePayload = route.request().postDataJSON();
      return fulfill(route);
    }
    if (path === "/voiceClone/audio/voice-1") return fulfill(route, "audio-token");
    if (path === "/voiceClone/play/audio-token") return route.fulfill({ body: wavBuffer(1), contentType: "audio/wav" });
    return fulfill(route);
  });

  await page.goto("/voice-clone-management");
  await expect(page.getByText("clone_voice_01")).toBeVisible();
  await page.getByRole("button", { name: "编辑" }).click();
  await page.getByLabel("声音名称", { exact: true }).fill("家庭音色");
  await page.getByLabel("声音名称", { exact: true }).press("Enter");
  await expect.poll(() => renamePayload).toEqual({ id: "voice-1", name: "家庭音色" });

  await page.getByRole("button", { name: "上传音频" }).click();
  const dialog = page.getByRole("dialog", { name: "声音复刻" });
  await dialog.locator('input[type="file"]').setInputFiles({
    buffer: wavBuffer(),
    mimeType: "audio/wav",
    name: "reference.wav",
  });
  await expect(dialog.locator("audio")).toBeVisible();
  await dialog.getByRole("button", { name: "上传音频" }).click();
  await expect.poll(() => uploadBody).toContain('name="id"');
  expect(uploadBody).toContain("voice-1");
  expect(uploadBody).toContain('filename="reference.wav"');

  const playRequest = page.waitForRequest((request) => request.url().endsWith("/voiceClone/play/audio-token"));
  await page.getByRole("button", { name: "播放" }).click();
  await playRequest;

  await page.getByRole("button", { name: "立即复刻" }).click();
  await page.getByRole("dialog", { name: "声音复刻" }).getByRole("button", { name: "立即复刻" }).click();
  await expect.poll(() => clonePayload).toEqual({ cloneId: "voice-1" });
});

test("assigns and removes administrator voice resources", async ({ page }) => {
  const voices = [{
    createDate: "2026-08-14T03:00:00Z",
    hasVoice: false,
    id: "resource-1",
    languages: "中文",
    modelId: "TTS_HS",
    modelName: "火山双流",
    name: "待训练音色",
    trainStatus: 0,
    userId: 7,
    userName: "13800138000",
    voiceId: "voice_admin_01",
  }];
  let createPayload: unknown;
  let deletePath = "";

  await page.route("**/xiaozhi/voiceResource**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/xiaozhi", "");
    if (path === "/voiceResource" && route.request().method() === "GET") return fulfill(route, { list: voices, total: voices.length });
    if (path === "/voiceResource" && route.request().method() === "POST") {
      createPayload = route.request().postDataJSON();
      return fulfill(route);
    }
    if (path === "/voiceResource/ttsPlatforms") return fulfill(route, [{ id: "TTS_HS", modelName: "火山双流" }]);
    if (route.request().method() === "DELETE") {
      deletePath = path;
      return fulfill(route);
    }
    return fulfill(route);
  });
  await page.route("**/xiaozhi/admin/users**", (route) => fulfill(route, { list: [{ mobile: "13800138000", userid: "7" }], total: 1 }));

  await page.goto("/voice-resource-management");
  await page.getByRole("button", { name: "新增" }).click();
  const dialog = page.getByRole("dialog", { name: "新增音色资源" });
  await dialog.getByLabel("平台名称").selectOption("TTS_HS");
  await dialog.getByLabel("声音ID").fill("voice_new_01");
  await dialog.getByLabel("声音ID").press("Enter");
  await dialog.getByLabel("请输入关键词选择归属账号").fill("138");
  await dialog.getByRole("combobox", { name: "归属账号" }).selectOption("7");
  await dialog.getByLabel("语言").fill("中文,English");
  await dialog.getByRole("button", { name: "确定" }).click();
  await expect.poll(() => createPayload).toEqual({ languages: "中文,English", modelId: "TTS_HS", userId: 7, voiceIds: ["voice_new_01"] });

  const row = page.getByRole("row").filter({ hasText: "voice_admin_01" });
  await row.getByRole("button", { name: "删除" }).click();
  await page.getByRole("dialog", { name: "警告" }).getByRole("button", { name: "删除" }).click();
  await expect.poll(() => deletePath).toBe("/voiceResource/resource-1");
});

test("uploads, saves, downloads, and removes OTA firmware", async ({ page }) => {
  const firmware = [{
    createDate: "2026-08-14T01:00:00Z",
    firmwareName: "面包板稳定版",
    firmwarePath: "uploadfile/stable.bin",
    id: "firmware-1",
    remark: "稳定版",
    size: 2048,
    type: "bread-board",
    updateDate: "2026-08-14T02:00:00Z",
    version: "1.2.3",
  }];
  let uploadBody = "";
  let createPayload: unknown;

  await page.route("**/xiaozhi/admin/dict/data/type/FIRMWARE_TYPE", (route) => fulfill(route, [{ key: "bread-board", name: "面包板" }]));
  await page.route("**/xiaozhi/otaMag**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/xiaozhi", "");
    const method = route.request().method();
    if (path === "/otaMag" && method === "GET") return fulfill(route, { list: firmware, total: firmware.length });
    if (path === "/otaMag/upload") {
      uploadBody = route.request().postDataBuffer()?.toString("latin1") || "";
      return fulfill(route, "uploadfile/new.bin");
    }
    if (path === "/otaMag" && method === "POST") {
      createPayload = route.request().postDataJSON();
      return fulfill(route);
    }
    if (path === "/otaMag/getDownloadUrl/firmware-1") return fulfill(route, "firmware-token");
    if (path === "/otaMag/download/firmware-token") {
      return route.fulfill({
        body: Buffer.from([1, 2, 3, 4]),
        headers: {
          "content-disposition": 'attachment; filename="bread-board_1.2.3.bin"',
          "content-type": "application/octet-stream",
        },
      });
    }
    return fulfill(route);
  });

  await page.goto("/ota-management");
  await page.getByRole("button", { name: "新增" }).click();
  const dialog = page.getByRole("dialog", { name: "新增固件" });
  await dialog.getByLabel("固件名称").fill("面包板测试版");
  await dialog.getByLabel("固件类型").selectOption("bread-board");
  await dialog.getByLabel("版本号").fill("2.0.0");
  await dialog.locator('input[type="file"]').setInputFiles({ buffer: Buffer.from([0xe9, 0x07, 0x02, 0x20]), mimeType: "application/octet-stream", name: "xiaozhi.bin" });
  await expect(page.getByText("固件文件上传成功")).toBeVisible();
  await dialog.getByRole("button", { name: "保存" }).click();
  await expect.poll(() => uploadBody).toContain('filename="xiaozhi.bin"');
  await expect.poll(() => createPayload).toMatchObject({ firmwareName: "面包板测试版", firmwarePath: "uploadfile/new.bin", size: 4, type: "bread-board", version: "2.0.0" });

  const row = page.getByRole("row").filter({ hasText: "面包板稳定版" });
  await page.evaluate(() => {
    const state = window as Window & { __downloadHref?: string };
    state.__downloadHref = "";
    HTMLAnchorElement.prototype.click = function captureDownload() {
      state.__downloadHref = this.href;
    };
  });
  await row.getByRole("button", { name: "下载" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __downloadHref?: string }).__downloadHref)).toBe("http://127.0.0.1:18013/xiaozhi/otaMag/download/firmware-token");

  await page.setViewportSize({ height: 844, width: 390 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "固件管理" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
