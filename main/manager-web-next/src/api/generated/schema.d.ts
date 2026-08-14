// Generated from http://127.0.0.1:18002/xiaozhi/v3/api-docs. Do not edit manually.
export interface paths {
    readonly "/admin/device/all": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查找设备 */
        readonly get: operations["pageDevice"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/data/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取字典数据详情 */
        readonly get: operations["get_4"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/data/delete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 删除字典数据 */
        readonly post: operations["delete_9"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/data/page": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询字典数据 */
        readonly get: operations["page_7"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/data/save": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 新增字典数据 */
        readonly post: operations["save_8"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/data/type/{dictType}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取字典数据列表 */
        readonly get: operations["getDictDataByType"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/data/update": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 修改字典数据 */
        readonly put: operations["update_8"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/type/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取字典类型详情 */
        readonly get: operations["get_3"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/type/delete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 删除字典类型 */
        readonly post: operations["delete_8"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/type/page": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询字典类型 */
        readonly get: operations["page_6"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/type/save": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 保存字典类型 */
        readonly post: operations["save_7"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/dict/type/update": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 修改字典类型 */
        readonly put: operations["update_7"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/params": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 修改 */
        readonly put: operations["update_6"];
        /** 保存 */
        readonly post: operations["save_1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/params/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 信息 */
        readonly get: operations["get_2"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/params/delete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 删除 */
        readonly post: operations["delete_7"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/params/page": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页 */
        readonly get: operations["page_5"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/server/emit-action": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 通知python服务端更新配置 */
        readonly post: operations["emitServerAction"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/server/server-list": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取Ws服务端列表 */
        readonly get: operations["getWsServerList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/users": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查找用户 */
        readonly get: operations["pageUser"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/users/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 重置密码 */
        readonly put: operations["update_5"];
        readonly post?: never;
        /** 用户删除 */
        readonly delete: operations["delete_3"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/admin/users/changeStatus/{status}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 批量修改用户状态 */
        readonly put: operations["changeStatus"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 创建智能体 */
        readonly post: operations["save_6"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{agentId}/snapshots": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体快照列表 */
        readonly get: operations["page_4"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{agentId}/snapshots/{snapshotId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体快照详情 */
        readonly get: operations["getSnapshot"];
        readonly put?: never;
        readonly post?: never;
        /** 删除智能体历史快照 */
        readonly delete: operations["deleteSnapshot"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{agentId}/snapshots/{snapshotId}/restore": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 恢复智能体快照 */
        readonly post: operations["restore"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体详情 */
        readonly get: operations["getAgentById"];
        /** 更新智能体 */
        readonly put: operations["update_3"];
        readonly post?: never;
        /** 删除智能体 */
        readonly delete: operations["delete_2"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{id}/chat-history/{sessionId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体聊天记录 */
        readonly get: operations["getAgentChatHistory"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{id}/chat-history/audio": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取音频内容 */
        readonly get: operations["getContentByAudioId"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{id}/chat-history/user": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体聊天记录（用户） */
        readonly get: operations["getRecentlyFiftyByAgentId"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{id}/sessions": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体会话列表 */
        readonly get: operations["getAgentSessions"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/{id}/tags": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体的标签 */
        readonly get: operations["getAgentTags"];
        /** 保存智能体的标签 */
        readonly put: operations["saveAgentTags"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/all": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 智能体列表（管理员） */
        readonly get: operations["adminAgentList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/audio/{audioId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 获取音频下载ID */
        readonly post: operations["getAudioId_1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/chat-history/download/{uuid}/current": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 下载本会话聊天记录 */
        readonly get: operations["downloadCurrentSession"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/chat-history/download/{uuid}/previous": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 下载本会话及前20条会话聊天记录 */
        readonly get: operations["downloadCurrentSessionWithPrevious"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/chat-history/getDownloadUrl/{agentId}/{sessionId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 获取聊天记录下载链接 */
        readonly post: operations["getDownloadUrl"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/chat-history/report": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 小智服务聊天上报请求 */
        readonly post: operations["uploadFile"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/chat-summary/{sessionId}/save": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 根据会话ID生成聊天记录总结并保存（异步执行） */
        readonly post: operations["generateAndSaveChatSummary"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/chat-title/{sessionId}/generate": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 根据会话ID生成聊天标题 */
        readonly post: operations["generateAndSaveChatTitle"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/list": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取用户智能体列表 */
        readonly get: operations["getUserAgents"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/mcp/address/{agentId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体的Mcp接入点地址 */
        readonly get: operations["getAgentMcpAccessAddress"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/mcp/tools/{agentId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取智能体的Mcp工具列表 */
        readonly get: operations["getAgentMcpToolsList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/play/{uuid}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 播放音频 */
        readonly get: operations["playAudio"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/saveMemory/{macAddress}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 根据设备id更新智能体 */
        readonly put: operations["updateByDeviceId"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/tag": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 创建标签 */
        readonly post: operations["createTag"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/tag/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        /** 删除标签 */
        readonly delete: operations["deleteTag"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/tag/list": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取所有标签列表 */
        readonly get: operations["getAllTags"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/template": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 智能体模板模板列表 */
        readonly get: operations["templateList"];
        /** 更新模板 */
        readonly put: operations["updateAgentTemplate"];
        /** 创建模板 */
        readonly post: operations["createAgentTemplate"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/template/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模板详情 */
        readonly get: operations["getAgentTemplateById"];
        readonly put?: never;
        readonly post?: never;
        /** 删除模板 */
        readonly delete: operations["deleteAgentTemplate"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/template/batch-remove": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 批量删除模板 */
        readonly post: operations["batchRemoveAgentTemplates"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/template/page": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模板分页列表 */
        readonly get: operations["getAgentTemplatesPage"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/voice-print": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 更新智能体的对应声纹 */
        readonly put: operations["update_4"];
        /** 创建智能体的声纹 */
        readonly post: operations["save"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/voice-print/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        /** 删除智能体对应声纹 */
        readonly delete: operations["delete_11"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/agent/voice-print/list/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取用户指定智能体声纹列表 */
        readonly get: operations["list"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/config/agent-models": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 获取智能体模型 */
        readonly post: operations["getAgentModels"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/config/correct-words": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 获取智能体替换词 */
        readonly post: operations["getCorrectWords"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/config/server-base": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 服务端获取配置接口 */
        readonly post: operations["getConfig"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/correct-word/file": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 创建替换词文件 */
        readonly post: operations["createFile"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/correct-word/file/{fileId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 修改替换词文件 */
        readonly put: operations["updateFile"];
        readonly post?: never;
        /** 删除替换词文件 */
        readonly delete: operations["deleteFile"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/correct-word/file/batch-delete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 批量删除替换词文件 */
        readonly post: operations["batchDeleteFiles"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/correct-word/file/download/{fileId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 下载替换词文件 */
        readonly get: operations["downloadFile"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/correct-word/file/list": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页获取当前用户替换词文件列表 */
        readonly get: operations["listFiles"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/correct-word/file/select": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 智能体获取当前用户替换词文件列表 */
        readonly get: operations["listAllFiles"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询知识库列表 */
        readonly get: operations["getPageList"];
        readonly put?: never;
        /** 创建知识库 */
        readonly post: operations["save_5"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 根据知识库ID获取知识库详情 */
        readonly get: operations["getByDatasetId"];
        /** 更新知识库 */
        readonly put: operations["update_2"];
        readonly post?: never;
        /** 删除单个知识库 */
        readonly delete: operations["delete_1"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}/chunks": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 解析文档（切块） */
        readonly post: operations["parseDocuments"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}/documents": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询文档列表 */
        readonly get: operations["getPageList_1"];
        readonly put?: never;
        /** 上传文档到知识库 */
        readonly post: operations["uploadDocument"];
        /** 批量删除文档 */
        readonly delete: operations["delete_6"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}/documents/{document_id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        /** 删除单个文档 */
        readonly delete: operations["deleteSingle"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}/documents/{document_id}/chunks": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 列出指定文档的切片 */
        readonly get: operations["listChunks"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}/documents/status/{status}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 根据状态分页查询文档列表 */
        readonly get: operations["getPageListByStatus"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/{dataset_id}/retrieval-test": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 召回测试 */
        readonly post: operations["retrievalTest"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/batch": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        /** 批量删除知识库 */
        readonly delete: operations["deleteBatch"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/datasets/rag-models": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取RAG模型列表 */
        readonly get: operations["getRAGModels"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/address-book/{macAddress}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取设备通讯录 */
        readonly get: operations["getAddressBook"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/address-book/alias": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 更新设备通讯录别名 */
        readonly put: operations["updateAlias"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/address-book/call": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 根据昵称发起呼叫 */
        readonly get: operations["callByNickname"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/address-book/permission": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 更新设备通讯录权限 */
        readonly put: operations["updatePermission"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/bind/{agentId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取已绑定设备 */
        readonly get: operations["getUserDevices"];
        readonly put?: never;
        /** 设备在线接口 */
        readonly post: operations["forwardToMqttGateway"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/bind/{agentId}/{deviceCode}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 绑定设备 */
        readonly post: operations["bindDevice"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/manual-add": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 手动添加设备 */
        readonly post: operations["manualAddDevice"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/register": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 注册设备 */
        readonly post: operations["registerDevice"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/tools/call/{deviceId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 调用设备工具 */
        readonly post: operations["callDeviceTool"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/tools/list/{deviceId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 获取设备工具列表 */
        readonly post: operations["getDeviceTools"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/unbind": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 解绑设备 */
        readonly post: operations["unbindDevice"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/device/update/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 更新设备信息 */
        readonly put: operations["updateDeviceInfo"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模型配置 */
        readonly get: operations["getModelConfig"];
        readonly put?: never;
        readonly post?: never;
        /** 删除模型配置 */
        readonly delete: operations["deleteModelConfig"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/{modelId}/voices": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模型音色 */
        readonly get: operations["getVoiceList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/{modelType}/{provideCode}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 新增模型配置 */
        readonly post: operations["addModelConfig"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/{modelType}/{provideCode}/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 编辑模型配置 */
        readonly put: operations["editModelConfig"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/{modelType}/provideTypes": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模型供应器列表 */
        readonly get: operations["getModelProviderList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/default/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 设置默认模型 */
        readonly put: operations["setDefaultModel"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/enable/{id}/{status}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 启用/关闭模型配置 */
        readonly put: operations["enableModelConfig"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/list": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模型配置列表 */
        readonly get: operations["getModelConfigList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/llm/names": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取LLM模型信息 */
        readonly get: operations["getLlmModelCodeList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/names": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取所有模型名称 */
        readonly get: operations["getModelNames"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/provider": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取模型供应器列表 */
        readonly get: operations["getListPage"];
        /** 修改模型供应器 */
        readonly put: operations["edit"];
        /** 新增模型供应器 */
        readonly post: operations["add"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/provider/delete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 删除模型供应器 */
        readonly post: operations["delete_5"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/models/provider/plugin/names": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getPluginNameList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/ota/": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** OTA版本和设备激活状态检查 */
        readonly post: operations["checkOTAVersion"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/ota/activate": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 设备快速检查激活状态 */
        readonly post: operations["activateDevice"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/otaMag": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询 OTA 固件信息 */
        readonly get: operations["page_2"];
        readonly put?: never;
        /** 保存 OTA 固件信息 */
        readonly post: operations["save_4"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/otaMag/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 信息 OTA 固件信息 */
        readonly get: operations["get"];
        /** 修改 OTA 固件信息 */
        readonly put: operations["update_1"];
        readonly post?: never;
        /** OTA 删除 */
        readonly delete: operations["delete"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/otaMag/download/{uuid}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 下载固件文件 */
        readonly get: operations["downloadFirmware"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/otaMag/getDownloadUrl/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取 OTA 固件下载链接 */
        readonly get: operations["getDownloadUrl_1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/otaMag/upload": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 上传固件文件 */
        readonly post: operations["uploadFirmware"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/otaMag/uploadAssetsBin": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 上传资源固件文件 */
        readonly post: operations["uploadAssetsBin"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/ttsVoice": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查找 */
        readonly get: operations["page_1"];
        readonly put?: never;
        /** 音色保存 */
        readonly post: operations["save_3"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/ttsVoice/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 音色修改 */
        readonly put: operations["update"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/ttsVoice/delete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 音色删除 */
        readonly post: operations["delete_4"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/captcha": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 验证码 */
        readonly get: operations["captcha"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/change-password": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 修改用户密码 */
        readonly put: operations["changePassword"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/info": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 用户信息获取 */
        readonly get: operations["info"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/login": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 登录 */
        readonly post: operations["login"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/pub-config": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 公共配置 */
        readonly get: operations["pubConfig"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/register": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 注册 */
        readonly post: operations["register"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/retrieve-password": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        /** 找回密码 */
        readonly put: operations["retrievePassword"];
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/user/smsVerification": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 短信验证码 */
        readonly post: operations["smsVerification"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceClone": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询音色资源 */
        readonly get: operations["page_3"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceClone/audio/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 获取音频下载ID */
        readonly post: operations["getAudioId"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceClone/cloneAudio": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 复刻音频 */
        readonly post: operations["cloneAudio"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceClone/play/{uuid}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 播放音频 */
        readonly get: operations["playVoice"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceClone/updateName": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 更新声音克隆名称 */
        readonly post: operations["updateName"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceClone/upload": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** 上传音频进行声音克隆 */
        readonly post: operations["uploadVoice"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceResource": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 分页查询音色资源 */
        readonly get: operations["page"];
        readonly put?: never;
        /** 新增音色资源 */
        readonly post: operations["save_2"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceResource/{id}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取音色资源详情 */
        readonly get: operations["get_1"];
        readonly put?: never;
        readonly post?: never;
        /** 删除音色资源 */
        readonly delete: operations["delete_10"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceResource/ttsPlatforms": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 获取TTS平台列表 */
        readonly get: operations["getTtsPlatformList"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/voiceResource/user/{userId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** 根据用户ID获取音色资源列表 */
        readonly get: operations["getByUserId"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        readonly AdminPageUserVO: {
            /**
             * Format: date-time
             * @description 注册时间
             */
            readonly createDate?: string;
            /** @description 设备数量 */
            readonly deviceCount?: string;
            /** @description 手机号码 */
            readonly mobile?: string;
            /**
             * Format: int32
             * @description 状态
             */
            readonly status?: number;
            /** @description 用户id */
            readonly userid?: string;
        };
        /** @description 智能体聊天记录 */
        readonly AgentChatHistoryDTO: {
            /** @description 音频ID */
            readonly audioId?: string;
            /**
             * Format: byte
             * @description 消息类型: 1-用户, 2-智能体
             */
            readonly chatType?: string;
            /** @description 聊天内容 */
            readonly content?: string;
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /** @description MAC地址 */
            readonly macAddress?: string;
        };
        /** @description 小智设备聊天上报请求 */
        readonly AgentChatHistoryReportDTO: {
            /** @description base64编码的opus音频数据 */
            readonly audioBase64?: string;
            /**
             * Format: byte
             * @description 消息类型: 1-用户, 2-智能体
             * @example 1
             */
            readonly chatType: string;
            /**
             * @description 聊天内容
             * @example 你好呀
             */
            readonly content: string;
            /**
             * @description MAC地址
             * @example 00:11:22:33:44:55
             */
            readonly macAddress: string;
            /**
             * Format: int64
             * @description 上报时间，十位时间戳，空时默认使用当前时间
             * @example 1745657732
             */
            readonly reportTime?: number;
            /**
             * @description 会话ID
             * @example 79578c31-f1fb-426a-900e-1e934215f05a
             */
            readonly sessionId: string;
        };
        readonly AgentChatHistoryUserVO: {
            /** @description 音频ID */
            readonly audioId?: string;
            /** @description 聊天内容 */
            readonly content?: string;
        };
        readonly AgentChatSessionDTO: {
            /** Format: int32 */
            readonly chatCount?: number;
            /** Format: date-time */
            readonly createdAt?: string;
            readonly sessionId?: string;
            readonly title?: string;
        };
        /** @description 智能体创建对象 */
        readonly AgentCreateDTO: {
            /**
             * @description 智能体名称
             * @example 客服助手
             */
            readonly agentName: string;
        };
        /** @description 智能体对象 */
        readonly AgentDTO: {
            /**
             * @description 智能体名称
             * @example 客服助手
             */
            readonly agentName?: string;
            /**
             * Format: int32
             * @description 设备数量
             * @example 10
             */
            readonly deviceCount?: number;
            /**
             * @description 智能体编码
             * @example AGT_1234567890
             */
            readonly id?: string;
            /**
             * Format: date-time
             * @description 最后连接时间
             * @example 2024-03-20 10:00:00
             */
            readonly lastConnectedAt?: string;
            /**
             * @description 大语言模型名称
             * @example llm_model_01
             */
            readonly llmModelName?: string;
            /**
             * @description 记忆模型ID
             * @example mem_model_01
             */
            readonly memModelId?: string;
            /**
             * @description 总结记忆
             * @example 构建可生长的动态记忆网络，在有限空间内保留关键信息的同时，智能维护信息演变轨迹
             *     根据对话记录，总结user的重要信息，以便在未来的对话中提供更个性化的服务
             */
            readonly summaryMemory?: string;
            /**
             * @description 角色设定参数
             * @example 你是一个专业的客服助手，负责回答用户问题并提供帮助
             */
            readonly systemPrompt?: string;
            /** @description 标签列表 */
            readonly tags?: readonly components["schemas"]["AgentTagDTO"][];
            /**
             * @description 语音合成模型名称
             * @example tts_model_01
             */
            readonly ttsModelName?: string;
            /**
             * @description 音色名称
             * @example voice_01
             */
            readonly ttsVoiceName?: string;
            /**
             * @description 视觉模型名称
             * @example vllm_model_01
             */
            readonly vllmModelName?: string;
        };
        /** @description 智能体信息 */
        readonly AgentEntity: {
            /** @description 智能体编码 */
            readonly agentCode?: string;
            /** @description 智能体名称 */
            readonly agentName?: string;
            /** @description 语音识别模型标识 */
            readonly asrModelId?: string;
            /**
             * Format: int32
             * @description 聊天记录配置（0不记录 1仅记录文本 2记录文本和语音）
             */
            readonly chatHistoryConf?: number;
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 智能体唯一标识 */
            readonly id?: string;
            /** @description 意图模型标识 */
            readonly intentModelId?: string;
            /** @description 语言编码 */
            readonly langCode?: string;
            /** @description 交互语种 */
            readonly language?: string;
            /** @description 大语言模型标识 */
            readonly llmModelId?: string;
            /** @description 记忆模型标识 */
            readonly memModelId?: string;
            /** @description 小模型标识 */
            readonly slmModelId?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * @description 总结记忆
             * @example 构建可生长的动态记忆网络，在有限空间内保留关键信息的同时，智能维护信息演变轨迹
             *     根据对话记录，总结user的重要信息，以便在未来的对话中提供更个性化的服务
             */
            readonly summaryMemory?: string;
            /** @description 角色设定参数 */
            readonly systemPrompt?: string;
            /** @description 音色语言 */
            readonly ttsLanguage?: string;
            /** @description 语音合成模型标识 */
            readonly ttsModelId?: string;
            /**
             * Format: int32
             * @description TTS音调
             */
            readonly ttsPitch?: number;
            /**
             * Format: int32
             * @description TTS语速
             */
            readonly ttsRate?: number;
            /** @description 音色标识 */
            readonly ttsVoiceId?: string;
            /**
             * Format: int32
             * @description TTS音量
             */
            readonly ttsVolume?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updatedAt?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
            /**
             * Format: int64
             * @description 所属用户ID
             */
            readonly userId?: number;
            /** @description 语音活动检测标识 */
            readonly vadModelId?: string;
            /** @description VLLM模型标识 */
            readonly vllmModelId?: string;
        };
        readonly AgentInfoVO: {
            /** @description 智能体编码 */
            readonly agentCode?: string;
            /** @description 智能体名称 */
            readonly agentName?: string;
            /** @description 语音识别模型标识 */
            readonly asrModelId?: string;
            /**
             * Format: int32
             * @description 聊天记录配置（0不记录 1仅记录文本 2记录文本和语音）
             */
            readonly chatHistoryConf?: number;
            /** @description 上下文源配置 */
            readonly contextProviders?: readonly components["schemas"]["ContextProviderDTO"][];
            /** @description 替换词文件ID列表 */
            readonly correctWordFileIds?: readonly string[];
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /**
             * Format: int32
             * @description 当前配置版本号
             */
            readonly currentVersionNo?: number;
            /** @description 插件列表Id */
            readonly functions?: readonly components["schemas"]["AgentPluginMapping"][];
            /** @description 智能体唯一标识 */
            readonly id?: string;
            /** @description 意图模型标识 */
            readonly intentModelId?: string;
            /** @description 语言编码 */
            readonly langCode?: string;
            /** @description 交互语种 */
            readonly language?: string;
            /** @description 大语言模型标识 */
            readonly llmModelId?: string;
            /** @description 记忆模型标识 */
            readonly memModelId?: string;
            /** @description 小模型标识 */
            readonly slmModelId?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * @description 总结记忆
             * @example 构建可生长的动态记忆网络，在有限空间内保留关键信息的同时，智能维护信息演变轨迹
             *     根据对话记录，总结user的重要信息，以便在未来的对话中提供更个性化的服务
             */
            readonly summaryMemory?: string;
            /** @description 角色设定参数 */
            readonly systemPrompt?: string;
            /** @description 音色语言 */
            readonly ttsLanguage?: string;
            /** @description 语音合成模型标识 */
            readonly ttsModelId?: string;
            /**
             * Format: int32
             * @description TTS音调
             */
            readonly ttsPitch?: number;
            /**
             * Format: int32
             * @description TTS语速
             */
            readonly ttsRate?: number;
            /** @description 音色标识 */
            readonly ttsVoiceId?: string;
            /**
             * Format: int32
             * @description TTS音量
             */
            readonly ttsVolume?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updatedAt?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
            /**
             * Format: int64
             * @description 所属用户ID
             */
            readonly userId?: number;
            /** @description 语音活动检测标识 */
            readonly vadModelId?: string;
            /** @description VLLM模型标识 */
            readonly vllmModelId?: string;
        };
        /** @description 智能体记忆更新对象 */
        readonly AgentMemoryDTO: {
            /**
             * @description 总结记忆
             * @example 构建可生长的动态记忆网络，在有限空间内保留关键信息的同时，智能维护信息演变轨迹
             *     根据对话记录，总结user的重要信息，以便在未来的对话中提供更个性化的服务
             */
            readonly summaryMemory?: string;
        };
        /** @description 获取智能体模型配置DTO */
        readonly AgentModelsDTO: {
            /** @description 客户端ID */
            readonly clientId: string;
            /** @description 设备MAC地址 */
            readonly macAddress: string;
            /** @description 客户端已实例化的模型 */
            readonly selectedModule: {
                readonly [key: string]: string;
            };
        };
        /** @description Agent与插件的唯一映射表 */
        readonly AgentPluginMapping: {
            /** @description 智能体ID */
            readonly agentId?: string;
            /**
             * Format: int64
             * @description 映射信息主键ID
             */
            readonly id?: number;
            /** @description 插件参数(Json)格式 */
            readonly paramInfo?: string;
            /** @description 插件ID */
            readonly pluginId?: string;
            /** @description 插件provider_code, 对应表ai_model_provider */
            readonly providerCode?: string;
        };
        /** @description 智能体快照数据 */
        readonly AgentSnapshotDataDTO: {
            readonly agentCode?: string;
            readonly agentName?: string;
            readonly asrModelId?: string;
            /** Format: int32 */
            readonly chatHistoryConf?: number;
            readonly contextProviders?: readonly components["schemas"]["ContextProviderDTO"][];
            readonly correctWordFileIds?: readonly string[];
            readonly functions?: readonly components["schemas"]["FunctionInfo"][];
            readonly intentModelId?: string;
            readonly langCode?: string;
            readonly language?: string;
            readonly llmModelId?: string;
            readonly memModelId?: string;
            readonly slmModelId?: string;
            /** Format: int32 */
            readonly sort?: number;
            readonly summaryMemory?: string;
            readonly systemPrompt?: string;
            readonly tagNames?: readonly string[];
            readonly tags?: readonly components["schemas"]["AgentSnapshotTagDTO"][];
            readonly ttsLanguage?: string;
            readonly ttsModelId?: string;
            /** Format: int32 */
            readonly ttsPitch?: number;
            /** Format: int32 */
            readonly ttsRate?: number;
            readonly ttsVoiceId?: string;
            /** Format: int32 */
            readonly ttsVolume?: number;
            readonly vadModelId?: string;
            readonly vllmModelId?: string;
        };
        /** @description 智能体快照恢复请求 */
        readonly AgentSnapshotRestoreDTO: {
            /** @description 预览时由服务端生成的当前配置状态指纹 */
            readonly currentStateToken: string;
        };
        /** @description 智能体快照标签 */
        readonly AgentSnapshotTagDTO: {
            readonly id?: string;
            /** Format: int32 */
            readonly sort?: number;
            readonly tagName?: string;
        };
        /** @description 智能体配置快照 */
        readonly AgentSnapshotVO: {
            readonly afterSnapshotData?: components["schemas"]["AgentSnapshotDataDTO"];
            readonly agentId?: string;
            readonly changedFields?: readonly string[];
            /** Format: date-time */
            readonly createdAt?: string;
            /**
             * Format: int64
             * @description 创建者，表示触发本次快照写入的操作人
             */
            readonly creator?: number;
            /** @description 恢复预览对应的脱敏当前配置，仅详情接口有值 */
            readonly currentSnapshotData?: components["schemas"]["AgentSnapshotDataDTO"];
            /** @description 恢复预览对应的当前配置状态指纹，仅详情接口有值 */
            readonly currentStateToken?: string;
            readonly fieldOrder?: readonly string[];
            readonly id?: string;
            /** @description 恢复来源快照ID，仅恢复结果版本有值 */
            readonly restoreFromSnapshotId?: string;
            /**
             * Format: int32
             * @description 恢复来源版本号，仅恢复结果版本有值
             */
            readonly restoreFromVersionNo?: number;
            readonly snapshotData?: components["schemas"]["AgentSnapshotDataDTO"];
            readonly source?: string;
            /**
             * Format: int64
             * @description 所属用户ID，表示该快照归属的智能体所有者
             */
            readonly userId?: number;
            /** Format: int32 */
            readonly versionNo?: number;
        };
        /** @description 智能体标签DTO */
        readonly AgentTagDTO: {
            /** @description 标签ID */
            readonly id?: string;
            /** @description 标签名称 */
            readonly tagName?: string;
        };
        /** @description 智能体标签 */
        readonly AgentTagEntity: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /**
             * Format: int32
             * @description 删除标记
             */
            readonly deleted?: number;
            /** @description 主键 */
            readonly id?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /** @description 标签名称 */
            readonly tagName?: string;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updatedAt?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
        };
        readonly AgentTemplateEntity: {
            readonly agentCode?: string;
            readonly agentName?: string;
            readonly asrModelId?: string;
            /** Format: int32 */
            readonly chatHistoryConf?: number;
            /** Format: date-time */
            readonly createdAt?: string;
            /** Format: int64 */
            readonly creator?: number;
            readonly id?: string;
            readonly intentModelId?: string;
            readonly langCode?: string;
            readonly language?: string;
            readonly llmModelId?: string;
            readonly memModelId?: string;
            /** Format: int32 */
            readonly sort?: number;
            readonly summaryMemory?: string;
            readonly systemPrompt?: string;
            readonly ttsLanguage?: string;
            readonly ttsModelId?: string;
            /** Format: int32 */
            readonly ttsPitch?: number;
            /** Format: int32 */
            readonly ttsRate?: number;
            readonly ttsVoiceId?: string;
            /** Format: int32 */
            readonly ttsVolume?: number;
            /** Format: date-time */
            readonly updatedAt?: string;
            /** Format: int64 */
            readonly updater?: number;
            readonly vadModelId?: string;
            readonly vllmModelId?: string;
        };
        readonly AgentTemplateVO: {
            readonly agentCode?: string;
            readonly agentName?: string;
            readonly asrModelId?: string;
            /** Format: int32 */
            readonly chatHistoryConf?: number;
            /** Format: date-time */
            readonly createdAt?: string;
            /** Format: int64 */
            readonly creator?: number;
            readonly id?: string;
            readonly intentModelId?: string;
            readonly langCode?: string;
            readonly language?: string;
            readonly llmModelId?: string;
            readonly llmModelName?: string;
            readonly memModelId?: string;
            /** Format: int32 */
            readonly sort?: number;
            readonly summaryMemory?: string;
            readonly systemPrompt?: string;
            readonly ttsLanguage?: string;
            readonly ttsModelId?: string;
            readonly ttsModelName?: string;
            /** Format: int32 */
            readonly ttsPitch?: number;
            /** Format: int32 */
            readonly ttsRate?: number;
            readonly ttsVoiceId?: string;
            /** Format: int32 */
            readonly ttsVolume?: number;
            /** Format: date-time */
            readonly updatedAt?: string;
            /** Format: int64 */
            readonly updater?: number;
            readonly vadModelId?: string;
            readonly vllmModelId?: string;
        };
        /** @description 智能体更新对象 */
        readonly AgentUpdateDTO: {
            /**
             * @description 智能体编码
             * @example AGT_1234567890
             */
            readonly agentCode?: string;
            /**
             * @description 智能体名称
             * @example 客服助手
             */
            readonly agentName?: string;
            /**
             * @description 语音识别模型标识
             * @example asr_model_02
             */
            readonly asrModelId?: string;
            /**
             * Format: int32
             * @description 聊天记录配置（0不记录 1仅记录文本 2记录文本和语音）
             * @example 3
             */
            readonly chatHistoryConf?: number;
            /** @description 上下文源配置 */
            readonly contextProviders?: readonly components["schemas"]["ContextProviderDTO"][];
            /** @description 替换词文件ID列表 */
            readonly correctWordFileIds?: readonly string[];
            /** @description 插件函数信息 */
            readonly functions?: readonly components["schemas"]["FunctionInfo"][];
            /**
             * @description 意图模型标识
             * @example intent_model_02
             */
            readonly intentModelId?: string;
            /**
             * @description 语言编码
             * @example zh_CN
             */
            readonly langCode?: string;
            /**
             * @description 交互语种
             * @example 中文
             */
            readonly language?: string;
            /**
             * @description 大语言模型标识
             * @example llm_model_02
             */
            readonly llmModelId?: string;
            /**
             * @description 记忆模型标识
             * @example mem_model_02
             */
            readonly memModelId?: string;
            /**
             * @description 小模型标识
             * @example slm_model_02
             */
            readonly slmModelId?: string;
            /**
             * Format: int32
             * @description 排序
             * @example 1
             */
            readonly sort?: number;
            /**
             * @description 总结记忆
             * @example 构建可生长的动态记忆网络，在有限空间内保留关键信息的同时，智能维护信息演变轨迹
             *     根据对话记录，总结user的重要信息，以便在未来的对话中提供更个性化的服务
             */
            readonly summaryMemory?: string;
            /**
             * @description 角色设定参数
             * @example 你是一个专业的客服助手，负责回答用户问题并提供帮助
             */
            readonly systemPrompt?: string;
            /** @description 标签ID列表 */
            readonly tagIds?: readonly string[];
            /** @description 标签名称列表 */
            readonly tagNames?: readonly string[];
            /**
             * @description 音色语言
             * @example 普通话
             */
            readonly ttsLanguage?: string;
            /**
             * @description 语音合成模型标识
             * @example tts_model_02
             */
            readonly ttsModelId?: string;
            /**
             * Format: int32
             * @description TTS音调
             * @example 50
             */
            readonly ttsPitch?: number;
            /**
             * Format: int32
             * @description TTS语速
             * @example 50
             */
            readonly ttsRate?: number;
            /**
             * @description 音色标识
             * @example voice_02
             */
            readonly ttsVoiceId?: string;
            /**
             * Format: int32
             * @description TTS音量
             * @example 50
             */
            readonly ttsVolume?: number;
            /**
             * @description 语音活动检测标识
             * @example vad_model_02
             */
            readonly vadModelId?: string;
            /**
             * @description VLLM模型标识
             * @example vllm_model_02
             */
            readonly vllmModelId?: string;
        };
        readonly AgentVoicePrintSaveDTO: {
            readonly agentId?: string;
            readonly audioId?: string;
            readonly introduce?: string;
            readonly sourceName?: string;
        };
        readonly AgentVoicePrintUpdateDTO: {
            readonly audioId?: string;
            readonly id?: string;
            readonly introduce?: string;
            readonly sourceName?: string;
        };
        readonly AgentVoicePrintVO: {
            readonly audioId?: string;
            /** Format: date-time */
            readonly createDate?: string;
            readonly id?: string;
            readonly introduce?: string;
            readonly sourceName?: string;
        };
        /** @description 板子编译信息 */
        readonly Application: {
            /** @description 编译时间（UTC ISO格式） */
            readonly compile_time?: string;
            /** @description ELF 文件 SHA256 校验 */
            readonly elf_sha256?: string;
            /** @description ESP-IDF 版本号 */
            readonly idf_version?: string;
            /** @description 名称 */
            readonly name?: string;
            /** @description 应用版本号 */
            readonly version?: string;
        };
        /** @description 批量文档操作请求参数 */
        readonly BatchIdReq: {
            /** @description 文档 ID 列表 */
            readonly ids: readonly string[];
        };
        /** @description 板子连接和网络信息 */
        readonly BoardInfo: {
            /**
             * Format: int32
             * @description Wi-Fi 信道
             */
            readonly channel?: number;
            /** @description IP 地址 */
            readonly ip?: string;
            /** @description MAC 地址 */
            readonly mac?: string;
            /**
             * Format: int32
             * @description Wi-Fi 信号强度（RSSI）
             */
            readonly rssi?: number;
            /** @description 连接的 Wi-Fi SSID */
            readonly ssid?: string;
            /** @description 板子类型 */
            readonly type?: string;
        };
        /** @description 芯片信息 */
        readonly ChipInfo: {
            /**
             * Format: int32
             * @description 核心数
             */
            readonly cores?: number;
            /**
             * Format: int32
             * @description 芯片功能标志位
             */
            readonly features?: number;
            /**
             * Format: int32
             * @description 芯片模型代码
             */
            readonly model?: number;
            /**
             * Format: int32
             * @description 硬件修订版本
             */
            readonly revision?: number;
        };
        /** @description 上下文源配置DTO */
        readonly ContextProviderDTO: {
            /** @description 请求头 */
            readonly headers?: {
                readonly [key: string]: unknown;
            };
            /** @description URL地址 */
            readonly url?: string;
        };
        /** @description 创建替换词文件DTO */
        readonly CorrectWordFileCreateDTO: {
            /** @description 替换词内容，每条格式：原词|替换词 */
            readonly content: readonly string[];
            /** @description 文件名 */
            readonly fileName: string;
            /**
             * Format: int64
             * @description 文件大小（字节），不能超过1MB
             */
            readonly fileSize?: number;
        };
        /** @description 替换词文件列表VO */
        readonly CorrectWordFileVO: {
            /** @description 替换词内容，每行一条 */
            readonly content?: readonly string[];
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /** @description 原始文件名 */
            readonly fileName?: string;
            /** @description 替换词文件ID */
            readonly id?: string;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updatedAt?: string;
            /**
             * Format: int32
             * @description 替换词数量
             */
            readonly wordCount?: number;
        };
        /** @description 获取智能体替换词DTO */
        readonly CorrectWordsDTO: {
            /** @description 设备MAC地址 */
            readonly macAddress: string;
        };
        /** @description 更新设备通讯录别名 */
        readonly DeviceAddressBookAliasDTO: {
            /** @description 我对对方的称呼 */
            readonly alias?: string;
            /** @description 本设备MAC地址 */
            readonly macAddress: string;
            /** @description 对方设备MAC地址 */
            readonly targetMac: string;
        };
        /** @description 更新设备通讯录权限 */
        readonly DeviceAddressBookPermissionDTO: {
            /** @description 是否有权限呼叫 */
            readonly hasPermission?: boolean;
            /** @description 本设备MAC地址 */
            readonly macAddress: string;
            /** @description 对方设备MAC地址 */
            readonly targetMac: string;
        };
        readonly DeviceManualAddDTO: {
            readonly agentId?: string;
            readonly appVersion?: string;
            readonly board?: string;
            readonly macAddress?: string;
        };
        /** @description 设备注册头信息 */
        readonly DeviceRegisterDTO: {
            /** @description mac地址 */
            readonly macAddress?: string;
        };
        /** @description 设备固件信息上报求请求体 */
        readonly DeviceReportReqDTO: {
            /** @description 应用程序信息 */
            readonly application?: components["schemas"]["Application"];
            /** @description 板子配置信息 */
            readonly board?: components["schemas"]["BoardInfo"];
            /** @description 芯片详细信息 */
            readonly chip_info?: components["schemas"]["ChipInfo"];
            /** @description 芯片型号名称 */
            readonly chip_model_name?: string;
            /**
             * Format: int32
             * @description 闪存大小（单位：字节）
             */
            readonly flash_size?: number;
            /** @description 设备 MAC 地址 */
            readonly mac_address?: string;
            /**
             * Format: int32
             * @description 最小空闲堆内存（字节）
             */
            readonly minimum_free_heap_size?: number;
            /** @description 当前运行的 OTA 分区信息 */
            readonly ota?: components["schemas"]["OtaInfo"];
            /** @description 分区表列表 */
            readonly partition_table?: readonly components["schemas"]["Partition"][];
            /** @description 设备唯一标识 UUID */
            readonly uuid?: string;
            /**
             * Format: int32
             * @description 板子固件版本号
             */
            readonly version?: number;
        };
        readonly DeviceToolsCallReqDTO: {
            readonly arguments?: {
                readonly [key: string]: unknown;
            };
            readonly name: string;
        };
        /** @description 设备解绑表单 */
        readonly DeviceUnBindDTO: {
            /** @description 设备ID */
            readonly deviceId: string;
        };
        readonly DeviceUpdateDTO: {
            readonly alias?: string;
            /** Format: int32 */
            readonly autoUpdate?: number;
        };
        /** @description 文档聚合信息 */
        readonly DocAggVO: {
            /**
             * Format: int32
             * @description 数量
             */
            readonly count?: number;
            /** @description 文档 ID */
            readonly doc_id?: string;
            /** @description 文档名称 */
            readonly doc_name?: string;
        };
        readonly EmitSeverActionDTO: {
            /**
             * @description 指定操作
             * @enum {string}
             */
            readonly action: "restart" | "update_config";
            /** @description 目标ws地址 */
            readonly targetWs: string;
        };
        /** @description 插件函数信息 */
        readonly FunctionInfo: {
            /** @description 函数参数信息 */
            readonly paramInfo?: {
                readonly [key: string]: unknown;
            };
            /**
             * @description 插件ID
             * @example plugin_01
             */
            readonly pluginId?: string;
        };
        /** @description GraphRAG (图增强检索) 配置 */
        readonly GraphRagConfig: {
            /** @description 是否启用 GraphRAG 索引 */
            readonly use_graphrag?: boolean;
        };
        /** @description 检索命中切片详情 */
        readonly HitVO: {
            /** @description 切片内容 */
            readonly content: string;
            /** @description 所属知识库 ID */
            readonly dataset_id?: string;
            /** @description 所属文档 ID */
            readonly document_id: string;
            /** @description 文档关键词 */
            readonly document_keyword?: string;
            /** @description 文档名称 */
            readonly document_name?: string;
            /** @description 高亮内容 */
            readonly highlight?: string;
            /** @description 切片 ID */
            readonly id: string;
            /** @description 图片 ID */
            readonly image_id?: string;
            /** @description 重要关键词列表 */
            readonly important_keywords?: readonly string[];
            /**
             * Format: int32
             * @description 索引位置
             */
            readonly index?: number;
            /** @description 位置索引 (RAGFlow返回嵌套数组, 如 [[start, end, filename]]) */
            readonly positions?: unknown;
            /** @description 预设问题列表 */
            readonly questions?: readonly string[];
            /**
             * Format: float
             * @description 综合相似度
             */
            readonly similarity: number;
            /**
             * Format: float
             * @description 关键词相似度
             */
            readonly term_similarity?: number;
            /**
             * Format: float
             * @description 向量相似度
             */
            readonly vector_similarity?: number;
        };
        /** @description 知识库文档信息 */
        readonly InfoVO: {
            /**
             * Format: int64
             * @description 包含的切片 (Chunk) 总数
             */
            readonly chunk_count?: number;
            /**
             * @description 文档解析方法 (决定了文档如何被切片)
             * @enum {string}
             */
            readonly chunk_method?: "naive" | "manual" | "qa" | "table" | "paper" | "book" | "laws" | "presentation" | "picture" | "one" | "knowledge_graph" | "email";
            /** @description 创建日期 (RAGFlow返回RFC1123格式) */
            readonly create_date?: string;
            /**
             * Format: int64
             * @description 创建时间 (时间戳, 毫秒)
             */
            readonly create_time: number;
            /** @description 创建者用户 ID */
            readonly created_by?: string;
            /** @description 所属知识库 ID */
            readonly dataset_id: string;
            /** @description 文档 ID (唯一标识) */
            readonly id: string;
            /** @description 文件存储路径或位置标识 */
            readonly location?: string;
            /** @description 自定义元数据字段 (Key-Value 键值对) */
            readonly meta_fields?: {
                readonly [key: string]: unknown;
            };
            /** @description 文档名称 (包含扩展名) */
            readonly name: string;
            /** @description 文档解析器的详细配置 */
            readonly parser_config?: components["schemas"]["ParserConfig"];
            /** @description 关联的 ETL Pipeline ID (如有) */
            readonly pipeline_id?: string;
            /** @description 开始处理的时间戳 (RAGFlow返回RFC1123格式) */
            readonly process_begin_at?: string;
            /**
             * Format: double
             * @description 处理总耗时 (单位: 秒)
             */
            readonly process_duration?: number;
            /**
             * Format: double
             * @description 解析进度 (0.0 ~ 1.0, 1.0 表示完成)
             */
            readonly progress?: number;
            /** @description 当前进度描述或错误信息 */
            readonly progress_msg?: string;
            /**
             * @description 文档解析运行状态
             * @enum {string}
             */
            readonly run?: "UNSTART" | "RUNNING" | "CANCEL" | "DONE" | "FAIL";
            /**
             * Format: int64
             * @description 文件大小 (单位: Bytes)
             */
            readonly size?: number;
            /** @description 来源类型 (如 local, s3, url 等) */
            readonly source_type?: string;
            /** @description 文档可用状态 (1: 启用/正常, 0: 禁用/失效) */
            readonly status: string;
            /** @description 文件后缀名 (不含点) */
            readonly suffix?: string;
            /** @description 文档缩略图 URL (Base64 或 链接) */
            readonly thumbnail?: string;
            /**
             * Format: int64
             * @description 包含的 Token 总数 (解析后统计)
             */
            readonly token_count?: number;
            /** @description 文档文件类型 (如 pdf, docx, txt) */
            readonly type: string;
            /** @description 最后更新日期 (RAGFlow返回RFC1123格式) */
            readonly update_date?: string;
            /**
             * Format: int64
             * @description 最后更新时间 (时间戳, 毫秒)
             */
            readonly update_time?: number;
        };
        readonly JSONConfig: {
            readonly checkDuplicate?: boolean;
            readonly dateFormat?: string;
            readonly ignoreCase?: boolean;
            readonly ignoreError?: boolean;
            readonly ignoreNullValue?: boolean;
            readonly keyComparator?: unknown;
            /** @deprecated */
            readonly order?: boolean;
            readonly stripTrailingZeros?: boolean;
            readonly transientSupport?: boolean;
            readonly writeLongAsString?: boolean;
        };
        readonly JSONObject: {
            readonly config?: components["schemas"]["JSONConfig"];
            readonly empty?: boolean;
            readonly raw?: {
                readonly [key: string]: unknown;
            };
        } & {
            readonly [key: string]: unknown;
        };
        /** @description 知识库知识库 */
        readonly KnowledgeBaseDTO: {
            /** @description 知识库头像(Base64) */
            readonly avatar?: string;
            /**
             * Format: int64
             * @description 分块总数
             */
            readonly chunkCount?: number;
            /** @description 分块方法 */
            readonly chunkMethod?: string;
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 知识库ID */
            readonly datasetId?: string;
            /** @description 知识库描述 */
            readonly description?: string;
            /**
             * Format: int32
             * @description 文档数量
             */
            readonly documentCount?: number;
            /** @description 嵌入模型名称 */
            readonly embeddingModel?: string;
            /** @description 异常提示 */
            readonly errorMessage?: string;
            /** @description 唯一标识 */
            readonly id?: string;
            /** @description 知识库名称 */
            readonly name?: string;
            /** @description 解析器配置(JSON String) */
            readonly parserConfig?: string;
            /** @description 权限设置: me/team */
            readonly permission?: string;
            /** @description RAG模型配置ID */
            readonly ragModelId?: string;
            /**
             * Format: int32
             * @description 状态(0:禁用 1:启用)
             */
            readonly status?: number;
            /**
             * Format: int64
             * @description 总Token数
             */
            readonly tokenNum?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updatedAt?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
        };
        /** @description 知识库文档 */
        readonly KnowledgeFilesDTO: {
            /**
             * Format: int32
             * @description 分块数量
             */
            readonly chunkCount?: number;
            /** @description 分块方法 */
            readonly chunkMethod?: string;
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createdAt?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 知识库ID */
            readonly datasetId?: string;
            /** @description 文档ID */
            readonly documentId?: string;
            /** @description 解析错误信息 */
            readonly error?: string;
            /** @description 文件路径 */
            readonly filePath?: string;
            /**
             * Format: int64
             * @description 文件大小（字节）
             */
            readonly fileSize?: number;
            /** @description 文档类型 */
            readonly fileType?: string;
            /** @description 唯一标识 */
            readonly id?: string;
            /** @description 元数据字段 (Map 格式) */
            readonly metaFields?: {
                readonly [key: string]: unknown;
            };
            /** @description 文档名称 */
            readonly name?: string;
            /** @description 解析器配置 */
            readonly parserConfig?: {
                readonly [key: string]: unknown;
            };
            /** Format: int32 */
            readonly parseStatusCode?: number;
            /**
             * Format: double
             * @description 解析耗时 (单位: 秒)
             */
            readonly processDuration?: number;
            /**
             * Format: double
             * @description 解析进度 (0.0 ~ 1.0)
             */
            readonly progress?: number;
            /** @description 运行状态 (UNSTART/RUNNING/CANCEL/DONE/FAIL) */
            readonly run?: string;
            /** @description 来源类型 (local, s3, url 等) */
            readonly sourceType?: string;
            /** @description 可用状态 (1: 启用/正常, 0: 禁用/失效) */
            readonly status?: string;
            /** @description 缩略图 (Base64 或 URL) */
            readonly thumbnail?: string;
            /**
             * Format: int64
             * @description Token数量
             */
            readonly tokenCount?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updatedAt?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
        };
        /** @description 分片列表聚合响应 */
        readonly ListVO: {
            /** @description 切片信息列表 */
            readonly chunks?: readonly components["schemas"]["InfoVO"][];
            /** @description 关联的文档详细信息 */
            readonly doc?: components["schemas"]["InfoVO"];
            /**
             * Format: int64
             * @description 总记录数
             */
            readonly total?: number;
        };
        readonly LlmModelBasicInfoDTO: {
            readonly id?: string;
            readonly modelName?: string;
            readonly type?: string;
        };
        /** @description 登录表单 */
        readonly LoginDTO: {
            /** @description 唯一标识 */
            readonly captchaId: string;
            /** @description 手机验证码 */
            readonly mobileCaptcha?: string;
            /** @description 密码 */
            readonly password: string;
            /** @description 手机号码 */
            readonly username: string;
        };
        readonly ModelBasicInfoDTO: {
            readonly id?: string;
            readonly modelName?: string;
        };
        /** @description 模型供应器/商 */
        readonly ModelConfigBodyDTO: {
            /** @description 模型配置(JSON格式) */
            readonly configJson?: {
                readonly config?: components["schemas"]["JSONConfig"];
                readonly empty?: boolean;
                readonly raw?: {
                    readonly [key: string]: unknown;
                };
            } & {
                readonly [key: string]: unknown;
            };
            /** @description 官方文档链接 */
            readonly docLink?: string;
            /** @description 模型ID,未填写将自动生成 */
            readonly id?: string;
            /**
             * Format: int32
             * @description 是否默认配置(0否 1是)
             */
            readonly isDefault?: number;
            /**
             * Format: int32
             * @description 是否启用
             */
            readonly isEnabled?: number;
            /** @description 模型编码(如AliLLM、DoubaoTTS) */
            readonly modelCode?: string;
            /** @description 模型名称 */
            readonly modelName?: string;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
        };
        /** @description 模型供应器/商 */
        readonly ModelConfigDTO: {
            /** @description 模型配置(JSON格式) */
            readonly configJson?: {
                readonly config?: components["schemas"]["JSONConfig"];
                readonly empty?: boolean;
                readonly raw?: {
                    readonly [key: string]: unknown;
                };
            } & {
                readonly [key: string]: unknown;
            };
            /** @description 官方文档链接 */
            readonly docLink?: string;
            /** @description 主键 */
            readonly id?: string;
            /**
             * Format: int32
             * @description 是否默认配置(0否 1是)
             */
            readonly isDefault?: number;
            /**
             * Format: int32
             * @description 是否启用
             */
            readonly isEnabled?: number;
            /** @description 模型编码(如AliLLM、DoubaoTTS) */
            readonly modelCode?: string;
            /** @description 模型名称 */
            readonly modelName?: string;
            /** @description 模型类型(Memory/ASR/VAD/LLM/TTS) */
            readonly modelType?: string;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
        };
        /** @description 模型配置表 */
        readonly ModelConfigEntity: {
            /** @description 模型配置(JSON格式) */
            readonly configJson?: components["schemas"]["JSONObject"];
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 官方文档链接 */
            readonly docLink?: string;
            /** @description 主键 */
            readonly id?: string;
            /**
             * Format: int32
             * @description 是否默认配置(0否 1是)
             */
            readonly isDefault?: number;
            /**
             * Format: int32
             * @description 是否启用
             */
            readonly isEnabled?: number;
            /** @description 模型编码(如AliLLM、DoubaoTTS) */
            readonly modelCode?: string;
            /** @description 模型名称 */
            readonly modelName?: string;
            /** @description 模型类型(Memory/ASR/VAD/LLM/TTS) */
            readonly modelType?: string;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
        };
        /** @description 模型供应器/商 */
        readonly ModelProviderDTO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 供应器字段列表(JSON格式) */
            readonly fields: string;
            /** @description 主键 */
            readonly id: string;
            /** @description 模型类型(Memory/ASR/VAD/LLM/TTS) */
            readonly modelType: string;
            /** @description 供应器名称 */
            readonly name: string;
            /** @description 供应器类型 */
            readonly providerCode: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
        };
        /** @description 固件信息 */
        readonly OtaEntity: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 固件名称 */
            readonly firmwareName?: string;
            /** @description 固件路径 */
            readonly firmwarePath?: string;
            /** @description ID */
            readonly id?: string;
            /** @description 备注/说明 */
            readonly remark?: string;
            /**
             * Format: int64
             * @description 文件大小(字节)
             */
            readonly size?: number;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /** @description 固件类型 */
            readonly type?: string;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
            /** @description 版本号 */
            readonly version?: string;
        };
        /** @description OTA信息 */
        readonly OtaInfo: {
            /** @description 当前OTA标签 */
            readonly label?: string;
        };
        /** @description 分页数据 */
        readonly PageDataAdminPageUserVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["AdminPageUserVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataAgentChatSessionDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["AgentChatSessionDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataAgentEntity: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["AgentEntity"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataAgentSnapshotVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["AgentSnapshotVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataAgentTemplateVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["AgentTemplateVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataCorrectWordFileVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["CorrectWordFileVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataKnowledgeBaseDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["KnowledgeBaseDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataKnowledgeFilesDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["KnowledgeFilesDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataModelConfigDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["ModelConfigDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataModelProviderDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["ModelProviderDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataOtaEntity: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["OtaEntity"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataSysDictDataVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["SysDictDataVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataSysDictTypeVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["SysDictTypeVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataSysParamsDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["SysParamsDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataTimbreDetailsVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["TimbreDetailsVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataUserShowDeviceListVO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["UserShowDeviceListVO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 分页数据 */
        readonly PageDataVoiceCloneResponseDTO: {
            /** @description 列表数据 */
            readonly list?: readonly components["schemas"]["VoiceCloneResponseDTO"][];
            /**
             * Format: int32
             * @description 总记录数
             */
            readonly total?: number;
        };
        /** @description 文档解析器参数配置 */
        readonly ParserConfig: {
            /**
             * Format: int32
             * @description 自动提取关键词数量 (0 表示不提取)
             */
            readonly auto_keywords?: number;
            /**
             * Format: int32
             * @description 自动生成问题数量 (0 表示不生成)
             */
            readonly auto_questions?: number;
            /**
             * Format: int32
             * @description 切片最大 Token 数 (建议值: 512, 1024, 2048)
             */
            readonly chunk_token_num?: number;
            /** @description 分段分隔符 (支持转义字符, 如 \n) */
            readonly delimiter?: string;
            /** @description GraphRAG 知识图谱配置 */
            readonly graphrag?: components["schemas"]["GraphRagConfig"];
            /** @description 是否将 Excel 转换为 HTML 表格 */
            readonly html4excel?: boolean;
            /**
             * @description 布局识别模型 (DeepDOC/Simple)
             * @enum {string}
             */
            readonly layout_recognize?: "DeepDOC" | "Simple";
            /** @description RAPTOR 高级索引配置 */
            readonly raptor?: components["schemas"]["RaptorConfig"];
            /**
             * Format: int32
             * @description 自动生成标签数量
             */
            readonly topn_tags?: number;
        };
        /** @description 分区信息 */
        readonly Partition: {
            /**
             * Format: int32
             * @description 起始地址
             */
            readonly address?: number;
            /** @description 分区标签名 */
            readonly label?: string;
            /**
             * Format: int32
             * @description 分区大小
             */
            readonly size?: number;
            /**
             * Format: int32
             * @description 子类型
             */
            readonly subtype?: number;
            /**
             * Format: int32
             * @description 分区类型
             */
            readonly type?: number;
        };
        /** @description 修改密码 */
        readonly PasswordDTO: {
            /** @description 新密码 */
            readonly newPassword: string;
            /** @description 原密码 */
            readonly password: string;
        };
        /** @description RAPTOR (递归摘要索引) 配置 */
        readonly RaptorConfig: {
            /** @description 是否启用 RAPTOR 索引 */
            readonly use_raptor?: boolean;
        };
        /** @description 响应 */
        readonly ResultAgentInfoVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["AgentInfoVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultAgentSnapshotVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["AgentSnapshotVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultAgentTagEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["AgentTagEntity"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultAgentTemplateEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["AgentTemplateEntity"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultAgentTemplateVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["AgentTemplateVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultBoolean: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: boolean;
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultCorrectWordFileVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["CorrectWordFileVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultKnowledgeBaseDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["KnowledgeBaseDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultKnowledgeFilesDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["KnowledgeFilesDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListAgentChatHistoryDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["AgentChatHistoryDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListAgentChatHistoryUserVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["AgentChatHistoryUserVO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListAgentDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["AgentDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListAgentTagDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["AgentTagDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListAgentTemplateEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["AgentTemplateEntity"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListAgentVoicePrintVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["AgentVoicePrintVO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListCorrectWordFileVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["CorrectWordFileVO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListLlmModelBasicInfoDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["LlmModelBasicInfoDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListMapStringObject: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly {
                readonly [key: string]: unknown;
            }[];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListModelBasicInfoDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["ModelBasicInfoDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListModelConfigEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["ModelConfigEntity"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListModelProviderDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["ModelProviderDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListString: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly string[];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListSysDictDataItem: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["SysDictDataItem"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListUserShowDeviceListVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["UserShowDeviceListVO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["ListVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListVoiceCloneResponseDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["VoiceCloneResponseDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultListVoiceDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: readonly components["schemas"]["VoiceDTO"][];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultMapStringObject: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: {
                readonly [key: string]: unknown;
            };
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultModelConfigDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["ModelConfigDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultModelProviderDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["ModelProviderDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultObject: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: unknown;
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultOtaEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["OtaEntity"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataAdminPageUserVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataAdminPageUserVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataAgentChatSessionDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataAgentChatSessionDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataAgentEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataAgentEntity"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataAgentSnapshotVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataAgentSnapshotVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataAgentTemplateVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataAgentTemplateVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataCorrectWordFileVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataCorrectWordFileVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataKnowledgeBaseDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataKnowledgeBaseDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataKnowledgeFilesDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataKnowledgeFilesDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataModelConfigDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataModelConfigDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataModelProviderDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataModelProviderDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataOtaEntity: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataOtaEntity"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataSysDictDataVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataSysDictDataVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataSysDictTypeVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataSysDictTypeVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataSysParamsDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataSysParamsDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataTimbreDetailsVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataTimbreDetailsVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataUserShowDeviceListVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataUserShowDeviceListVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultPageDataVoiceCloneResponseDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["PageDataVoiceCloneResponseDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultResultVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["ResultVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultString: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: string;
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultSysDictDataVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["SysDictDataVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultSysDictTypeVO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["SysDictTypeVO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultSysParamsDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["SysParamsDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultTokenDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["TokenDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultUserDetail: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["UserDetail"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 召回测试结果聚合响应 */
        readonly ResultVO: {
            /** @description 检索命中的切片列表 */
            readonly chunks?: readonly components["schemas"]["HitVO"][];
            /** @description 文档分布统计 */
            readonly doc_aggs?: readonly components["schemas"]["DocAggVO"][];
            /**
             * Format: int64
             * @description 总命中记录数
             */
            readonly total?: number;
        };
        /** @description 响应 */
        readonly ResultVoiceCloneResponseDTO: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: components["schemas"]["VoiceCloneResponseDTO"];
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 响应 */
        readonly ResultVoid: {
            /**
             * Format: int32
             * @description 编码：0表示成功，其他值表示失败
             */
            readonly code?: number;
            /** @description 响应数据 */
            readonly data?: unknown;
            /** @description 消息内容 */
            readonly msg?: string;
        };
        /** @description 找回密码 */
        readonly RetrievePasswordDTO: {
            /** @description 图形验证码ID */
            readonly captchaId: string;
            /** @description 验证码 */
            readonly code: string;
            /** @description 新密码 */
            readonly password: string;
            /** @description 手机号码 */
            readonly phone: string;
        };
        /** @description 短信验证码请求 */
        readonly SmsVerificationDTO: {
            /** @description 验证码 */
            readonly captcha: string;
            /** @description 唯一标识 */
            readonly captchaId: string;
            /** @description 手机号码 */
            readonly phone: string;
        };
        /** @description 字典数据 */
        readonly SysDictDataDTO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /** @description 字典标签 */
            readonly dictLabel?: string;
            /**
             * Format: int64
             * @description 字典类型ID
             */
            readonly dictTypeId?: number;
            /** @description 字典值 */
            readonly dictValue?: string;
            /**
             * Format: int64
             * @description id
             */
            readonly id?: number;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
        };
        /** @description 字典数据项 */
        readonly SysDictDataItem: {
            /** @description 字典值 */
            readonly key?: string;
            /** @description 字典标签 */
            readonly name?: string;
        };
        /** @description 字典数据VO */
        readonly SysDictDataVO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 创建者名称 */
            readonly creatorName?: string;
            /** @description 字典标签 */
            readonly dictLabel?: string;
            /**
             * Format: int64
             * @description 字典类型ID
             */
            readonly dictTypeId?: number;
            /** @description 字典值 */
            readonly dictValue?: string;
            /**
             * Format: int64
             * @description 主键
             */
            readonly id?: number;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
            /** @description 更新者名称 */
            readonly updaterName?: string;
        };
        /** @description 字典类型 */
        readonly SysDictTypeDTO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /** @description 字典名称 */
            readonly dictName?: string;
            /** @description 字典类型 */
            readonly dictType?: string;
            /**
             * Format: int64
             * @description id
             */
            readonly id?: number;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
        };
        /** @description 字典类型VO */
        readonly SysDictTypeVO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /**
             * Format: int64
             * @description 创建者
             */
            readonly creator?: number;
            /** @description 创建者名称 */
            readonly creatorName?: string;
            /** @description 字典名称 */
            readonly dictName?: string;
            /** @description 字典类型 */
            readonly dictType?: string;
            /**
             * Format: int64
             * @description 主键
             */
            readonly id?: number;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int32
             * @description 排序
             */
            readonly sort?: number;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
            /**
             * Format: int64
             * @description 更新者
             */
            readonly updater?: number;
            /** @description 更新者名称 */
            readonly updaterName?: string;
        };
        /** @description 参数管理 */
        readonly SysParamsDTO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /**
             * Format: int64
             * @description id
             */
            readonly id?: number;
            /** @description 参数编码 */
            readonly paramCode?: string;
            /** @description 参数值 */
            readonly paramValue?: string;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: date-time
             * @description 更新时间
             */
            readonly updateDate?: string;
            /** @description 值类型 */
            readonly valueType?: string;
        };
        /** @description 检索测试请求参数 */
        readonly TestReq: {
            /** @description 跨语言翻译列表 (可选) */
            readonly cross_languages?: readonly string[];
            /** @description 知识库 ID 列表 */
            readonly dataset_ids: readonly string[];
            /** @description 文档 ID 列表 (可选，用于限定检索范围) */
            readonly document_ids?: readonly string[];
            /** @description 是否高亮关键词 */
            readonly highlight?: boolean;
            /** @description 是否启用关键词检索 */
            readonly keyword?: boolean;
            /** @description 元数据过滤条件 (JSON 对象) */
            readonly metadata_condition?: {
                readonly [key: string]: unknown;
            };
            /**
             * Format: int32
             * @description 页码 (默认 1)
             */
            readonly page?: number;
            /**
             * Format: int32
             * @description 每页数量 (默认 10)
             */
            readonly page_size?: number;
            /** @description 检索问题 */
            readonly question: string;
            /** @description 重排序模型 ID */
            readonly rerank_id?: string;
            /**
             * Format: float
             * @description 相似度阈值 (默认 0.2)
             */
            readonly similarity_threshold?: number;
            /**
             * Format: int32
             * @description 返回 Top K 切片 (默认 1024)
             */
            readonly top_k?: number;
            /**
             * Format: float
             * @description 向量相似度权重 (默认 0.3)
             */
            readonly vector_similarity_weight?: number;
        };
        /** @description 音色表信息 */
        readonly TimbreDataDTO: {
            /** @description 语言 */
            readonly languages: string;
            /** @description 音色名称 */
            readonly name: string;
            /** @description 参考音频路径 */
            readonly referenceAudio?: string;
            /** @description 參考文本 */
            readonly referenceText?: string;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int64
             * @description 排序
             */
            readonly sort?: number;
            /** @description 对应 TTS 模型主键 */
            readonly ttsModelId: string;
            /** @description 音色编码 */
            readonly ttsVoice: string;
            /** @description 音频播放地址 */
            readonly voiceDemo?: string;
        };
        readonly TimbreDetailsVO: {
            /** @description 音色id */
            readonly id?: string;
            /** @description 语言 */
            readonly languages?: string;
            /** @description 音色名称 */
            readonly name?: string;
            /** @description 参考音频路径 */
            readonly referenceAudio?: string;
            /** @description 參考文本 */
            readonly referenceText?: string;
            /** @description 备注 */
            readonly remark?: string;
            /**
             * Format: int64
             * @description 排序
             */
            readonly sort?: number;
            /** @description 对应 TTS 模型主键 */
            readonly ttsModelId?: string;
            /** @description 音色编码 */
            readonly ttsVoice?: string;
            /** @description 音频播放地址 */
            readonly voiceDemo?: string;
        };
        /** @description 令牌信息 */
        readonly TokenDTO: {
            /** @description 客户端指纹 */
            readonly clientHash?: string;
            /**
             * Format: int32
             * @description 过期时间
             */
            readonly expire?: number;
            /** @description 密码 */
            readonly token?: string;
        };
        readonly UserDetail: {
            /** Format: int64 */
            readonly id?: number;
            /** Format: int32 */
            readonly status?: number;
            /** Format: int32 */
            readonly superAdmin?: number;
            readonly token?: string;
            readonly username?: string;
        };
        /** @description 用户显示设备列表VO */
        readonly UserShowDeviceListVO: {
            /** @description 设备别名 */
            readonly alias?: string;
            /** @description app版本 */
            readonly appVersion?: string;
            /**
             * Format: int32
             * @description 自动更新开关(0关闭/1开启)
             */
            readonly autoUpdate?: number;
            /** @description 绑定用户名称 */
            readonly bindUserName?: string;
            /** @description 设备型号(board) */
            readonly board?: string;
            /**
             * Format: date-time
             * @deprecated
             * @description 绑定时间（兼容字段，请使用 createDateTimestamp）
             */
            readonly createDate?: string;
            /**
             * @description 绑定时间戳（毫秒）
             * @example 1783689702000
             */
            readonly createDateTimestamp?: string;
            /** @description 设备型号 */
            readonly deviceType?: string;
            /** @description 设备唯一标识符 */
            readonly id?: string;
            /**
             * @description 最后连接时间戳（毫秒）
             * @example 1783689702000
             */
            readonly lastConnectedAtTimestamp?: string;
            /** @description mac地址 */
            readonly macAddress?: string;
            /** @description 最近对话时间 */
            readonly recentChatTime?: string;
        };
        /** @description 声音克隆DTO */
        readonly VoiceCloneDTO: {
            /** @description 语言 */
            readonly languages?: string;
            /** @description 模型ID */
            readonly modelId?: string;
            /**
             * Format: int64
             * @description 用户ID
             */
            readonly userId?: number;
            /** @description 音色ID列表 */
            readonly voiceIds?: readonly string[];
        };
        /** @description 声音克隆响应DTO */
        readonly VoiceCloneResponseDTO: {
            /**
             * Format: date-time
             * @description 创建时间
             */
            readonly createDate?: string;
            /** @description 是否有音频数据 */
            readonly hasVoice?: boolean;
            /** @description 唯一标识 */
            readonly id?: string;
            /** @description 语言 */
            readonly languages?: string;
            /** @description 模型id */
            readonly modelId?: string;
            /** @description 模型名称 */
            readonly modelName?: string;
            /** @description 声音名称 */
            readonly name?: string;
            /** @description 训练错误原因 */
            readonly trainError?: string;
            /**
             * Format: int32
             * @description 训练状态：0待训练 1训练中 2训练成功 3训练失败
             */
            readonly trainStatus?: number;
            /**
             * Format: int64
             * @description 用户ID（关联用户表）
             */
            readonly userId?: number;
            /** @description 用户名称 */
            readonly userName?: string;
            /** @description 声音id */
            readonly voiceId?: string;
        };
        /** @description 音色信息 */
        readonly VoiceDTO: {
            /** @description 音色ID */
            readonly id?: string;
            /** @description 是否为克隆音色 */
            readonly isClone?: boolean;
            /** @description 语言类型 */
            readonly languages?: string;
            /** @description 音色名称 */
            readonly name?: string;
            /** @description 音频播放地址 */
            readonly voiceDemo?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    readonly pageDevice: {
        readonly parameters: {
            readonly query: {
                /** @description 设备关键词 */
                readonly keywords?: string;
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataUserShowDeviceListVO"];
                };
            };
        };
    };
    readonly get_4: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultSysDictDataVO"];
                };
            };
        };
    };
    readonly delete_9: {
        readonly parameters: {
            readonly query: {
                /** @description ID数组 */
                readonly ids: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly number[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly page_7: {
        readonly parameters: {
            readonly query: {
                /** @description 数据标签 */
                readonly dictLabel?: string;
                /** @description 字典类型ID */
                readonly dictTypeId: string;
                /** @description 数据值 */
                readonly dictValue?: string;
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataSysDictDataVO"];
                };
            };
        };
    };
    readonly save_8: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SysDictDataDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getDictDataByType: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dictType: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListSysDictDataItem"];
                };
            };
        };
    };
    readonly update_8: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SysDictDataDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly get_3: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultSysDictTypeVO"];
                };
            };
        };
    };
    readonly delete_8: {
        readonly parameters: {
            readonly query: {
                /** @description ID数组 */
                readonly ids: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly number[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly page_6: {
        readonly parameters: {
            readonly query: {
                /** @description 字典类型名称 */
                readonly dictName?: string;
                /** @description 字典类型编码 */
                readonly dictType?: string;
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataSysDictTypeVO"];
                };
            };
        };
    };
    readonly save_7: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SysDictTypeDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly update_7: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SysDictTypeDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly update_6: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SysParamsDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly save_1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SysParamsDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly get_2: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultSysParamsDTO"];
                };
            };
        };
    };
    readonly delete_7: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly string[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly page_5: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: number;
                /** @description 排序方式，可选值(asc、desc) */
                readonly order?: string;
                /** @description 排序字段 */
                readonly orderField?: string;
                /** @description 当前页码，从1开始 */
                readonly page: number;
                /** @description 参数编码或参数备注 */
                readonly paramCode?: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataSysParamsDTO"];
                };
            };
        };
    };
    readonly emitServerAction: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["EmitSeverActionDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultBoolean"];
                };
            };
        };
    };
    readonly getWsServerList: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListString"];
                };
            };
        };
    };
    readonly pageUser: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 用户手机号码 */
                readonly mobile?: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataAdminPageUserVO"];
                };
            };
        };
    };
    readonly update_5: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly delete_3: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly changeStatus: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                /** @description 用户状态 */
                readonly status: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly string[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly save_6: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentCreateDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly page_4: {
        readonly parameters: {
            readonly query?: {
                /**
                 * @description 每页数量
                 * @example 10
                 */
                readonly limit?: number;
                /**
                 * @description 版本锚点，只查询小于等于该版本号的历史快照
                 * @example 20
                 */
                readonly maxVersionNo?: number;
                /**
                 * @description 当前页码，从1开始
                 * @example 1
                 */
                readonly page?: number;
            };
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataAgentSnapshotVO"];
                };
            };
        };
    };
    readonly getSnapshot: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
                readonly snapshotId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultAgentSnapshotVO"];
                };
            };
        };
    };
    readonly deleteSnapshot: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
                readonly snapshotId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly restore: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
                readonly snapshotId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentSnapshotRestoreDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getAgentById: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultAgentInfoVO"];
                };
            };
        };
    };
    readonly update_3: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentUpdateDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly delete_2: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getAgentChatHistory: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
                readonly sessionId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentChatHistoryDTO"];
                };
            };
        };
    };
    readonly getContentByAudioId: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly getRecentlyFiftyByAgentId: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentChatHistoryUserVO"];
                };
            };
        };
    };
    readonly getAgentSessions: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataAgentChatSessionDTO"];
                };
            };
        };
    };
    readonly getAgentTags: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentTagDTO"];
                };
            };
        };
    };
    readonly saveAgentTags: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly [key: string]: unknown;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly adminAgentList: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataAgentEntity"];
                };
            };
        };
    };
    readonly getAudioId_1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly audioId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly downloadCurrentSession: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly uuid: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    readonly downloadCurrentSessionWithPrevious: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly uuid: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    readonly getDownloadUrl: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
                readonly sessionId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly uploadFile: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentChatHistoryReportDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultBoolean"];
                };
            };
        };
    };
    readonly generateAndSaveChatSummary: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly sessionId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly generateAndSaveChatTitle: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly sessionId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getUserAgents: {
        readonly parameters: {
            readonly query?: {
                readonly keyword?: string;
                readonly searchType?: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentDTO"];
                };
            };
        };
    };
    readonly getAgentMcpAccessAddress: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly getAgentMcpToolsList: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListString"];
                };
            };
        };
    };
    readonly playAudio: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly uuid: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": string;
                };
            };
        };
    };
    readonly updateByDeviceId: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly macAddress: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentMemoryDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly createTag: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly [key: string]: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultAgentTagEntity"];
                };
            };
        };
    };
    readonly deleteTag: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getAllTags: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentTagDTO"];
                };
            };
        };
    };
    readonly templateList: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentTemplateEntity"];
                };
            };
        };
    };
    readonly updateAgentTemplate: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentTemplateEntity"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultAgentTemplateEntity"];
                };
            };
        };
    };
    readonly createAgentTemplate: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentTemplateEntity"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultAgentTemplateEntity"];
                };
            };
        };
    };
    readonly getAgentTemplateById: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultAgentTemplateVO"];
                };
            };
        };
    };
    readonly deleteAgentTemplate: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly batchRemoveAgentTemplates: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly string[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly getAgentTemplatesPage: {
        readonly parameters: {
            readonly query: {
                /** @description 模板名称，模糊查询 */
                readonly agentName?: string;
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataAgentTemplateVO"];
                };
            };
        };
    };
    readonly update_4: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentVoicePrintUpdateDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly save: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentVoicePrintSaveDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly delete_11: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly list: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListAgentVoicePrintVO"];
                };
            };
        };
    };
    readonly getAgentModels: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentModelsDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly getCorrectWords: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["CorrectWordsDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly getConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly createFile: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["CorrectWordFileCreateDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultCorrectWordFileVO"];
                };
            };
        };
    };
    readonly updateFile: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly fileId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["CorrectWordFileCreateDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly deleteFile: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly fileId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly batchDeleteFiles: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly string[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly downloadFile: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly fileId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": string;
                };
            };
        };
    };
    readonly listFiles: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataCorrectWordFileVO"];
                };
            };
        };
    };
    readonly listAllFiles: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListCorrectWordFileVO"];
                };
            };
        };
    };
    readonly getPageList: {
        readonly parameters: {
            readonly query?: {
                readonly name?: string;
                readonly page?: number;
                readonly page_size?: number;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataKnowledgeBaseDTO"];
                };
            };
        };
    };
    readonly save_5: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["KnowledgeBaseDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultKnowledgeBaseDTO"];
                };
            };
        };
    };
    readonly getByDatasetId: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultKnowledgeBaseDTO"];
                };
            };
        };
    };
    readonly update_2: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["KnowledgeBaseDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultKnowledgeBaseDTO"];
                };
            };
        };
    };
    readonly delete_1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                /** @description 知识库ID */
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly parseDocuments: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly [key: string]: readonly string[];
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getPageList_1: {
        readonly parameters: {
            readonly query?: {
                readonly name?: string;
                readonly page?: number;
                readonly page_size?: number;
                readonly status?: string;
            };
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataKnowledgeFilesDTO"];
                };
            };
        };
    };
    readonly uploadDocument: {
        readonly parameters: {
            readonly query?: {
                readonly chunkMethod?: string;
                readonly metaFields?: string;
                readonly name?: string;
                readonly parserConfig?: string;
            };
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: {
            readonly content: {
                readonly "application/json": {
                    /** Format: binary */
                    readonly file: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultKnowledgeFilesDTO"];
                };
            };
        };
    };
    readonly delete_6: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["BatchIdReq"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly deleteSingle: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
                readonly document_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly listChunks: {
        readonly parameters: {
            readonly query?: {
                readonly id?: string;
                readonly keywords?: string;
                readonly page?: number;
                readonly page_size?: number;
            };
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
                readonly document_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListVO"];
                };
            };
        };
    };
    readonly getPageListByStatus: {
        readonly parameters: {
            readonly query?: {
                readonly page?: number;
                readonly page_size?: number;
            };
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
                readonly status: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataKnowledgeFilesDTO"];
                };
            };
        };
    };
    readonly retrievalTest: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly dataset_id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["TestReq"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultResultVO"];
                };
            };
        };
    };
    readonly deleteBatch: {
        readonly parameters: {
            readonly query: {
                /** @description 知识库ID列表，用逗号分隔 */
                readonly ids: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getRAGModels: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListModelConfigEntity"];
                };
            };
        };
    };
    readonly getAddressBook: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly macAddress: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly updateAlias: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceAddressBookAliasDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly callByNickname: {
        readonly parameters: {
            readonly query: {
                readonly answer?: boolean;
                readonly callerMac: string;
                readonly nickname: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultMapStringObject"];
                };
            };
        };
    };
    readonly updatePermission: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceAddressBookPermissionDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getUserDevices: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListUserShowDeviceListVO"];
                };
            };
        };
    };
    readonly forwardToMqttGateway: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": string;
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly bindDevice: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly agentId: string;
                readonly deviceCode: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly manualAddDevice: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceManualAddDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly registerDevice: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceRegisterDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly callDeviceTool: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly deviceId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceToolsCallReqDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly getDeviceTools: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly deviceId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly unbindDevice: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceUnBindDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly updateDeviceInfo: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceUpdateDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getModelConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultModelConfigDTO"];
                };
            };
        };
    };
    readonly deleteModelConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getVoiceList: {
        readonly parameters: {
            readonly query?: {
                readonly voiceName?: string;
            };
            readonly header?: never;
            readonly path: {
                readonly modelId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListVoiceDTO"];
                };
            };
        };
    };
    readonly addModelConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly modelType: string;
                readonly provideCode: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["ModelConfigBodyDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultModelConfigDTO"];
                };
            };
        };
    };
    readonly editModelConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
                readonly modelType: string;
                readonly provideCode: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["ModelConfigBodyDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultModelConfigDTO"];
                };
            };
        };
    };
    readonly getModelProviderList: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly modelType: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListModelProviderDTO"];
                };
            };
        };
    };
    readonly setDefaultModel: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly enableModelConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
                readonly status: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getModelConfigList: {
        readonly parameters: {
            readonly query: {
                readonly limit?: string;
                readonly modelName?: string;
                readonly modelType: string;
                readonly page?: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataModelConfigDTO"];
                };
            };
        };
    };
    readonly getLlmModelCodeList: {
        readonly parameters: {
            readonly query?: {
                readonly modelName?: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListLlmModelBasicInfoDTO"];
                };
            };
        };
    };
    readonly getModelNames: {
        readonly parameters: {
            readonly query: {
                readonly modelName?: string;
                readonly modelType: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListModelBasicInfoDTO"];
                };
            };
        };
    };
    readonly getListPage: {
        readonly parameters: {
            readonly query: {
                readonly limit?: string;
                readonly modelProviderDTO: components["schemas"]["ModelProviderDTO"];
                readonly page?: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataModelProviderDTO"];
                };
            };
        };
    };
    readonly edit: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["ModelProviderDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultModelProviderDTO"];
                };
            };
        };
    };
    readonly add: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["ModelProviderDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultModelProviderDTO"];
                };
            };
        };
    };
    readonly delete_5: {
        readonly parameters: {
            readonly query: {
                /** @description ID数组 */
                readonly ids: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly string[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getPluginNameList: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListModelProviderDTO"];
                };
            };
        };
    };
    readonly checkOTAVersion: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                /** @description 客户端标识 */
                readonly "Client-Id"?: string;
                /** @description 设备唯一标识 */
                readonly "Device-Id": string;
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["DeviceReportReqDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": string;
                };
            };
        };
    };
    readonly activateDevice: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                /** @description 客户端标识 */
                readonly "Client-Id"?: string;
                /** @description 设备唯一标识 */
                readonly "Device-Id": string;
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": string;
                };
            };
        };
    };
    readonly page_2: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataOtaEntity"];
                };
            };
        };
    };
    readonly save_4: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["OtaEntity"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly get: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultOtaEntity"];
                };
            };
        };
    };
    readonly update_1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["OtaEntity"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly delete: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: readonly string[];
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly downloadFirmware: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly uuid: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": string;
                };
            };
        };
    };
    readonly getDownloadUrl_1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly uploadFirmware: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: {
            readonly content: {
                readonly "application/json": {
                    /** Format: binary */
                    readonly file: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly uploadAssetsBin: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: {
            readonly content: {
                readonly "application/json": {
                    /** Format: binary */
                    readonly file: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly page_1: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 音色名称 */
                readonly name?: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
                /** @description 对应 TTS 模型主键 */
                readonly ttsModelId: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataTimbreDetailsVO"];
                };
            };
        };
    };
    readonly save_3: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["TimbreDataDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly update: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["TimbreDataDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly delete_4: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": readonly string[];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly captcha: {
        readonly parameters: {
            readonly query: {
                readonly uuid: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    readonly changePassword: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["PasswordDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly info: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultUserDetail"];
                };
            };
        };
    };
    readonly login: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["LoginDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultTokenDTO"];
                };
            };
        };
    };
    readonly pubConfig: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultMapStringObject"];
                };
            };
        };
    };
    readonly register: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["LoginDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly retrievePassword: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["RetrievePasswordDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultObject"];
                };
            };
        };
    };
    readonly smsVerification: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SmsVerificationDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly page_3: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataVoiceCloneResponseDTO"];
                };
            };
        };
    };
    readonly getAudioId: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly cloneAudio: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly [key: string]: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly playVoice: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly uuid: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    readonly updateName: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly [key: string]: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly uploadVoice: {
        readonly parameters: {
            readonly query: {
                /** @description 声音克隆记录ID */
                readonly id: string;
                /** @description 音频文件 */
                readonly voiceFile: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: {
            readonly content: {
                readonly "application/json": {
                    /**
                     * Format: binary
                     * @description 音频文件
                     */
                    readonly voiceFile: string;
                };
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultString"];
                };
            };
        };
    };
    readonly page: {
        readonly parameters: {
            readonly query: {
                /** @description 每页显示记录数 */
                readonly limit: string;
                /** @description 当前页码，从1开始 */
                readonly page: string;
            };
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultPageDataVoiceCloneResponseDTO"];
                };
            };
        };
    };
    readonly save_2: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["VoiceCloneDTO"];
            };
        };
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly get_1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoiceCloneResponseDTO"];
                };
            };
        };
    };
    readonly delete_10: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly id: readonly string[];
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultVoid"];
                };
            };
        };
    };
    readonly getTtsPlatformList: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListMapStringObject"];
                };
            };
        };
    };
    readonly getByUserId: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly userId: number;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description OK */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "*/*": components["schemas"]["ResultListVoiceCloneResponseDTO"];
                };
            };
        };
    };
}
