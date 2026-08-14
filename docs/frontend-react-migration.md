# React 管理前端迁移基线

## 目标

在不影响现有 Vue 2 管理台的前提下，使用 React、TypeScript、Vite、Tailwind CSS 和 shadcn/ui 逐模块重写 `main/manager-web`。迁移期间新前端位于 `main/manager-web-next`，并通过独立镜像和端口验收。

## 兼容性约束

- 保持 `/xiaozhi` API 前缀和 Spring Boot `Result<T>` 响应语义。
- 保持现有六种语言：`zh-CN`、`zh-TW`、`en`、`de`、`pt-BR`、`vi`。
- 所有业务路由默认需要登录，公开路由使用显式允许列表。
- 不自动重试 POST、PUT、PATCH、DELETE 等变更请求。
- 上传、下载、音频和二进制响应必须通过真实浏览器验收。
- 智能体快照恢复必须保留原子状态令牌、二次确认和敏感字段脱敏。
- 新前端稳定前不删除 Vue 2 前端或改变生产入口。

## 技术方案

| 层级 | 选型 | 约束 |
| --- | --- | --- |
| 运行时 | React 19、TypeScript 严格模式 | 禁止用 `any` 绕过业务模型，页面按业务域懒加载 |
| 构建与样式 | Vite 8、Tailwind CSS 4 | Tailwind 只扫描 `src`，保证测试前后产物可重复 |
| 组件 | shadcn/ui、Radix UI、Lucide | 组件源码归仓库管理，不依赖黑盒组件包 |
| 路由 | React Router Data Mode | 公共路由、登录路由、权限路由分层定义 |
| 服务端状态 | TanStack Query | 查询可有限重试，所有变更请求默认不重试 |
| HTTP | Axios、Springdoc OpenAPI 生成类型 | 统一处理 `Result<T>`、令牌、业务错误和二进制响应 |
| 国际化 | i18next、react-i18next | 六种语言保持同一键结构，CI 检查缺失键 |
| 测试 | Vitest、Testing Library、Playwright | 单元测试与浏览器测试目录隔离 |
| 交付 | Node 22 多阶段构建、Nginx | 独立镜像、健康检查、SPA 深链和 API 反向代理 |

新旧前端采用并行目录和独立镜像。迁移期间 Vue 管理台继续使用 `18002`，React 预览使用 `18012`；只有全部路由、权限、上传下载和高风险操作通过验收后，才在 Compose 中切换生产入口。

Docker 构建默认通过 `https://registry.npmmirror.com` 下载 pnpm 依赖，并保留 BuildKit 内容缓存；如需切换源，可传入 `--build-arg PNPM_REGISTRY=<registry>`。HTTP/HTTPS 代理继续通过 Docker 标准构建参数注入，不写入镜像层或仓库配置。

## 实施阶段

| 阶段 | 范围 | 合并条件 |
| --- | --- | --- |
| 1. 工程基础 | React/Vite/Tailwind/shadcn 基础、OpenAPI 类型、六语言、Docker、CI | 已完成本地质量、镜像、代理和浏览器验证 |
| 2. 应用骨架 | 登录/注册/找回密码、令牌续用、权限守卫、菜单、整体布局、API 客户端 | 已完成本地静态检查、单元测试、浏览器测试、镜像与真实代理验证 |
| 3. 模型中心 | 模型配置、供应器管理、动态字段与敏感配置 | CRUD、启停、排序、密钥脱敏和模型调用配置通过 |
| 4. 智能体与设备 | 首页、角色配置、模板、设备绑定、通讯录 | 快照、绑定、音频交互和高风险确认通过 |
| 5. 知识与媒体 | 知识库、声纹、语音资源、声音克隆、OTA | 上传、下载、播放、进度和大文件路径通过 |
| 6. 系统管理 | 用户、参数、字典、功能、替换词、服务端管理 | 超级管理员权限、审计和批量操作通过 |
| 7. 切换与收尾 | Compose 改用本地 React 镜像、全路由回归、升级/回滚演练 | 全量验收后切流，再单独移除 Vue 依赖 |

每个阶段使用独立分支和 PR；一个阶段合并并通过主分支 CI 后，才开始下一个阶段。这样每次回滚只影响一个业务域，也便于继续跟随上游仓库升级。

## 目录边界

```text
main/manager-web-next/
├── e2e/                 # Playwright 业务路径
├── nginx/               # 运行时代理和 SPA 配置
├── scripts/             # OpenAPI 等生成脚本
└── src/
    ├── api/             # 生成契约、HTTP 客户端、业务 API
    ├── app/             # Provider、路由、权限和整体布局
    ├── components/ui/   # shadcn/ui 基础组件
    ├── features/        # 按业务域垂直切片
    ├── i18n/            # 语言资源和键校验
    ├── lib/             # 无业务状态的共享工具
    └── test/            # 测试初始化和夹具
```

## 旧版路由迁移矩阵

| 业务域 | 旧版路由 | 风险 | 状态 |
| --- | --- | --- | --- |
| 认证 | `/`、`/login` | 高 | 已迁移，等待阶段 2 合并 |
| 认证 | `/register`、`/retrieve-password` | 中 | 已迁移，等待阶段 2 合并 |
| 应用骨架 | 全部业务路由、权限导航、响应式布局 | 高 | 已迁移，等待阶段 2 合并 |
| 智能体 | `/home`、`/role-config` | 极高 | 路由与权限完成，业务待阶段 4 |
| 智能体 | `/agent-template-management`、`/template-quick-config` | 高 | 待迁移 |
| 设备 | `/device-management`、`/address-book-management` | 高 | 路由与权限完成，业务待阶段 4 |
| 模型 | `/model-config`、`/provider-management` | 高 | 路由与权限完成，业务待阶段 3 |
| 知识库 | `/knowledge-base-management` | 高 | 路由与权限完成，业务待阶段 5 |
| 语音 | `/voice-print`、`/voice-resource-management` | 高 | 路由与权限完成，业务待阶段 5 |
| 语音 | `/voice-clone-management` | 高 | 路由与权限完成，业务待阶段 5 |
| OTA | `/ota-management` | 高 | 路由与权限完成，业务待阶段 5 |
| 系统 | `/user-management`、`/params-management` | 中 | 路由与权限完成，业务待阶段 6 |
| 系统 | `/dict-management`、`/feature-management` | 中 | 路由与权限完成，业务待阶段 6 |
| 系统 | `/replacement-word-management` | 中 | 路由与权限完成，业务待阶段 6 |
| 运维 | `/server-side-management` | 高 | 路由与权限完成，业务待阶段 6 |

## 阶段 2 认证与权限约束

- 沿用 Vue 前端的 `token` JSON 存储格式，可直接续用已有登录态；损坏的令牌会被安全忽略。
- 登录、注册和找回密码继续使用后端要求的 SM2 C1C3C2 密文，明文密码不会进入请求体或日志。
- 前端使用已修复安全公告的 `sm-crypto 0.5.5`，并由 Java/Bouncy Castle 跨语言固定密文测试锁定 C1C3C2 兼容性。
- 所有业务路由默认受保护，只有 `/`、`/login`、`/register` 和 `/retrieve-password` 显式公开。
- 超级管理员菜单与路由同时校验 `superAdmin === 1`；音色、知识库、声纹和通讯录同时受公共功能开关控制。
- 登录前的跳转目标只接受站内绝对路径，拒绝 `//host` 和外部 URL，避免开放重定向。
- 401 会原子清除令牌和用户缓存并回到登录页；公共配置缓存独立保留，用于服务短暂不可达时展示。
- `Accept-Language` 与后端格式保持一致，英语发送 `en-US`，其余语言使用 BCP 47 格式。
- 查询最多有限重试；登录、注册、短信、重置密码和修改密码等变更请求均不自动重试。

## 已确认的基线

- Vue 单文件组件：60 个。
- Vue 视图与组件代码：约 28,000 行。
- 现有前端测试：5 个文件。
- Springdoc OpenAPI 路径：127 条。
- 新前端 OpenAPI 类型来源：`/xiaozhi/v3/api-docs`。

## 阶段合并门槛

每个迁移阶段都必须通过：

1. ESLint 零警告。
2. TypeScript 严格类型检查。
3. Vitest 单元和组件测试。
4. Vite 生产构建。
5. Docker 镜像构建和健康检查。
6. 对应业务域的 Playwright 端到端测试。
7. PR 合并后才开始下一个业务域。
