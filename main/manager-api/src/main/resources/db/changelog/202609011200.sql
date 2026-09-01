-- Add AnySearch to the native web_search plugin while retaining the existing
-- Metaso/Tavily single-key configuration for backward compatibility.
INSERT INTO `ai_model_provider`
    (`id`, `model_type`, `provider_code`, `name`, `fields`, `sort`, `creator`, `create_date`, `updater`, `update_date`)
VALUES
    (
        'SYSTEM_PLUGIN_WEB_SEARCH',
        'Plugin',
        'web_search',
        '联网搜索（AnySearch）',
        JSON_ARRAY(
            JSON_OBJECT(
                'key', 'provider',
                'type', 'string',
                'label', '搜索源：anysearch / metaso / tavily',
                'default', 'anysearch'
            ),
            JSON_OBJECT(
                'key', 'description',
                'type', 'string',
                'label', '工具描述',
                'default', '联网搜索工具。当用户明确需要联网搜索、查询最新信息或核实网络资料时使用此工具。'
            ),
            JSON_OBJECT(
                'key', 'max_results',
                'type', 'number',
                'label', '返回结果数（1-10）',
                'default', 5
            ),
            JSON_OBJECT(
                'key', 'api_keys',
                'type', 'password_array',
                'label', 'AnySearch API Keys',
                'default', JSON_ARRAY(),
                'remark', '可配置多个；每次请求轮询起始 Key，限流、失效或临时错误时自动切换。'
            ),
            JSON_OBJECT(
                'key', 'api_key',
                'type', 'password',
                'label', '单 API Key（兼容秘塔 / Tavily）',
                'default', ''
            ),
            JSON_OBJECT(
                'key', 'zone',
                'type', 'string',
                'label', 'AnySearch 搜索区域：cn / intl',
                'default', 'cn'
            ),
            JSON_OBJECT(
                'key', 'language',
                'type', 'string',
                'label', 'AnySearch 返回语言',
                'default', 'zh-CN'
            ),
            JSON_OBJECT(
                'key', 'tag',
                'type', 'string',
                'label', 'AnySearch 搜索标签（可选）',
                'default', ''
            )
        ),
        80,
        1,
        NOW(),
        1,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    `model_type` = VALUES(`model_type`),
    `provider_code` = VALUES(`provider_code`),
    `name` = VALUES(`name`),
    `fields` = VALUES(`fields`),
    `sort` = VALUES(`sort`),
    `updater` = VALUES(`updater`),
    `update_date` = VALUES(`update_date`);
