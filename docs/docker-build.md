# 从本地源码构建并升级全模块 Docker 部署

这套流程适用于修改过本仓库代码、需要由 Docker Compose 从当前源码构建 `xiaozhi-server`、React 智控台和 `manager-api` 的场景。它不拉取官方业务镜像，MySQL、Redis、配置、模型和上传文件则继续保存在独立运行目录中。

## 1. 准备运行目录

进入仓库中的 Compose 目录：

```bash
cd main/xiaozhi-server
cp source.env.example .env
```

至少修改 `.env` 中的 `MYSQL_ROOT_PASSWORD`。生产环境建议把运行数据放到源码目录之外，例如：

```dotenv
XIAOZHI_SOURCE_DIR=/absolute/path/to/xiaozhi-esp32-server
XIAOZHI_RUNTIME_DIR=/mnt/store/xiaozhi-server-all
XIAOZHI_MUSIC_DIR=/absolute/path/to/music
XIAOZHI_SERVER_REPOSITORY=my-local/xiaozhi-esp32-server
XIAOZHI_WEB_REPOSITORY=my-local/xiaozhi-esp32-server-web
XIAOZHI_WS_PORT=18000
XIAOZHI_WEB_PORT=18002
XIAOZHI_VISION_PORT=18003
```

运行目录中需要保留以下持久化内容：

```text
data/.config.yaml
music/
models/SenseVoiceSmall/model.pt
mysql/data/
uploadfile/
```

`XIAOZHI_MUSIC_DIR` 会以只读方式挂载到服务端的音乐目录。将 `.mp3`、`.wav` 或 `.p3` 文件放入该目录后，`play_music` 插件即可扫描并播放；只读挂载可以避免容器误删宿主机音乐文件。

不要把真实密码、API 密钥、`.config.yaml` 或数据库目录提交到 Git。

## 2. 国内网络与本地代理

React 构建默认使用 `https://registry.npmmirror.com`，pnpm 和 Maven 均使用 BuildKit 缓存。需要本地 HTTP 代理时，在 `.env` 中增加：

```dotenv
HTTP_PROXY=http://192.168.123.135:20171
HTTPS_PROXY=http://192.168.123.135:20171
NO_PROXY=127.0.0.1,localhost
```

这些值通过 Docker 的标准代理构建参数传入，不会主动写入镜像配置。若代理地址变化，只需修改本机 `.env`。

## 3. 首次构建与启动

先检查完整配置，再执行升级命令：

```bash
./source-deploy.sh config
./source-deploy.sh upgrade
```

`upgrade` 会依次执行：

1. 校验 Compose 配置。
2. 对正在运行的 MySQL 创建压缩逻辑备份。
3. 从当前 Git 工作树构建 Server 和 Web 两个本地镜像。
4. 用“UTC 时间 + Git 提交”生成不可变镜像标签。
5. 校验现有 MySQL/Redis 状态，只更新两个业务容器，并等待 WebSocket 服务及管理 API 健康。
6. 健康检查失败时自动恢复到升级前的应用镜像。

查看当前和上一个版本：

```bash
./source-deploy.sh status
```

脚本把两个版本标签记录在未纳入 Git 的 `.deploy.env` 中。不要执行 `docker compose down -v`，它会扩大操作范围并可能删除持久化卷。

## 4. 日常升级

先审查并拉取你希望部署的提交，再重新构建：

```bash
git pull --ff-only
cd main/xiaozhi-server
./source-deploy.sh upgrade
```

默认复用本地基础镜像和 BuildKit 缓存，以缩短构建时间。如确实需要刷新所有基础镜像，可单次执行：

```bash
XIAOZHI_BUILD_PULL=1 ./source-deploy.sh upgrade
```

也可以显式指定便于识别的 Docker 标签：

```bash
./source-deploy.sh upgrade release-20260814
```

## 5. 回滚

把两个业务容器切回上一次健康镜像：

```bash
./source-deploy.sh rollback
```

回滚前仍会备份数据库。脚本只切换应用镜像，不会自动覆盖数据库；若某次升级包含不向后兼容的数据迁移，应在维护窗口内根据 `backups/` 下的备份单独制定数据库恢复方案。

## 6. 验证

```bash
./source-deploy.sh status
curl --noproxy '*' -fsS http://127.0.0.1:18002/healthz
curl --noproxy '*' -fsS http://127.0.0.1:18002/xiaozhi/user/pub-config
```

如果使用默认端口，把 `18002` 改为 `8002`。正式 Web 镜像同时包含 React 智控台、Java `manager-api`、设备主题生成器、用户协议和隐私政策页面；`/xiaozhi/` 仍保持原有 API 前缀。
