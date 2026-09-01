-- FireRedASR2-AED self-hosted REST provider and model preset.
INSERT INTO `ai_model_provider`
    (`id`, `model_type`, `provider_code`, `name`, `fields`, `sort`, `creator`, `create_date`, `updater`, `update_date`)
VALUES
    (
        'SYSTEM_ASR_FireRedASR2',
        'ASR',
        'firered_asr2',
        'FireRedASR2-AED语音识别',
        '[{"key":"base_url","label":"服务地址","type":"string"},{"key":"api_key","label":"API密钥（可选）","type":"string"},{"key":"return_timestamp","label":"返回时间戳","type":"boolean"},{"key":"connect_timeout","label":"连接超时（秒）","type":"number"},{"key":"request_timeout","label":"请求超时（秒）","type":"number"},{"key":"output_dir","label":"输出目录","type":"string"}]',
        2,
        1,
        NOW(),
        1,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    `provider_code` = VALUES(`provider_code`),
    `name` = VALUES(`name`),
    `fields` = VALUES(`fields`),
    `sort` = VALUES(`sort`),
    `updater` = VALUES(`updater`),
    `update_date` = VALUES(`update_date`);
INSERT INTO `ai_model_config`
    (`id`, `model_type`, `model_code`, `model_name`, `is_default`, `is_enabled`, `config_json`, `doc_link`, `remark`, `sort`, `creator`, `create_date`, `updater`, `update_date`)
VALUES
    (
        'ASR_FireRedASR2',
        'ASR',
        'FireRedASR2',
        'FireRedASR2-AED语音识别',
        0,
        1,
        '{"type":"firered_asr2","base_url":"http://127.0.0.1:8002","api_key":"","return_timestamp":false,"connect_timeout":3,"request_timeout":30,"output_dir":"tmp/"}',
        'https://github.com/FireRedTeam/FireRedASR2S',
        '连接自托管 FireRedASR2-AED REST 服务，使用 /v1/audio/transcriptions 上传整句 WAV 音频。支持可选 API Key、置信度、RTF 和字级时间戳。',
        2,
        1,
        NOW(),
        1,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    `model_code` = VALUES(`model_code`),
    `model_name` = VALUES(`model_name`),
    `is_enabled` = VALUES(`is_enabled`),
    `doc_link` = VALUES(`doc_link`),
    `remark` = VALUES(`remark`),
    `sort` = VALUES(`sort`),
    `updater` = VALUES(`updater`),
    `update_date` = VALUES(`update_date`);
