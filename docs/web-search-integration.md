# 联网搜索插件使用指南

## 功能简介

联网搜索插件 `web_search` 支持在对话过程中实时联网搜索信息并返回结果。插件支持 AnySearch、秘塔（Metaso）和 Tavily。AnySearch 可配置多个 API Key，服务端会轮询使用，并在 Key 失效、限流或上游临时错误时自动切换。

## API Key申请指南

### 方式一：使用 AnySearch

- 访问 [AnySearch 文档](https://www.anysearch.com/docs) 并创建 API Key
- 可创建并配置多个 Key，管理端中每个输入框填写一个
- 不配置 Key 时也可使用 AnySearch 匿名搜索，但限流额度更低
- `zone` 可选 `cn` 或 `intl`，`language` 可填 `zh-CN`、`en` 等语言代码
- `tag` 是可选的垂直搜索标签，例如 `code.doc`

### 方式二：使用秘塔搜索

- 访问 [秘塔搜索API](https://metaso.cn/search-api/api-keys)，注册并登录账号
- 在API密钥管理页面，点击"创建新的Key"
- 复制生成的API Key（以 `mk-` 为前缀），这是配置所需的关键信息

### 方式三：使用 Tavily 搜索

- 访问 [Tavily控制台](https://app.tavily.com/home)，注册并登录账号
- 在控制台中创建API Key
- 复制生成的API Key（以 `tvly-` 为前缀），这是配置所需的关键信息

## 配置方式

### 方式1. 使用智控台部署（推荐）

- 登录智控台
- 进入"配置角色"页面，选择要配置的智能体
- 点击"编辑功能"按钮，在右侧参数配置区域找到"联网搜索"插件
- 勾选"联网搜索"
- 搜索源填写 `anysearch`
- 在 `AnySearch API Keys` 中添加一个或多个 Key，可按需调整 `zone`、`language` 和 `tag`
- 如使用秘塔或 Tavily，将搜索源改为 `metaso` 或 `tavily`，并填写“单 API Key”
- 保存配置，再保存智能体配置

### 方式2. 单模块xiaozhi-server部署

在 `data/.config.yaml` 中配置：

- 将搜索源填入 `provider`，可选值为 `anysearch`、`metaso` 或 `tavily`
- AnySearch 的 Key 列表填入 `api_keys`；秘塔和 Tavily 仍可使用 `api_key`

```yaml
plugins:
  web_search:
    provider: "anysearch"
    api_keys:
      - "你的 AnySearch API Key 1"
      - "你的 AnySearch API Key 2"
    zone: "cn"
    language: "zh-CN"
    tag: ""
```

如需自定义返回结果数量和工具描述，可额外配置 `max_results` 和 `description`：

```yaml
plugins:
  web_search:
    provider: "anysearch"
    description: "联网搜索工具。当用户明确需要联网搜索问题时使用此工具。"
    max_results: 5
    api_keys:
      - "你的 AnySearch API Key"
```

同时在当前启用的意图识别模块的 `functions` 列表中确保已启用 `web_search`：

```yaml
Intent:
  function_call:
    type: function_call
    functions:
      - web_search
```

配置完成后重启服务即可生效。搜索词会发送到 AnySearch 服务，不要用它搜索密码、私钥或其他敏感数据。
