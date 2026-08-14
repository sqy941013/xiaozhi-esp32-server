package xiaozhi.common.utils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;

import cn.hutool.json.JSONObject;

/**
 * 敏感数据处理工具类
 */
public class SensitiveDataUtils {

    // 敏感字段列表
    private static final Set<String> SENSITIVE_FIELDS = new HashSet<>(Arrays.asList(
            "api_key", "personal_access_token", "access_token", "token",
            "secret", "access_key_secret", "secret_key", "api_secret",
            "appkey", "authorization", "credential", "credentials", "password",
            "private_key", "secret_id"));

    /**
     * 检查字段是否为敏感字段
     */
    public static boolean isSensitiveField(String fieldName) {
        if (StringUtils.isBlank(fieldName)) {
            return false;
        }
        String normalized = fieldName.trim().toLowerCase();
        return SENSITIVE_FIELDS.contains(normalized)
                || normalized.endsWith("_api_key")
                || normalized.endsWith("_password")
                || normalized.endsWith("_secret")
                || normalized.endsWith("_token");
    }

    /**
     * 隐藏字符串中间部分
     */
    public static String maskMiddle(String value) {
        if (StringUtils.isBlank(value) || value.length() == 1) {
            return value;
        }

        int length = value.length();
        if (length <= 8) {
            // 短字符串保留前2后2
            return value.substring(0, 2) + "****" + value.substring(length - 2);
        } else {
            // 长字符串保留前4后4
            int maskLength = length - 8;
            StringBuilder maskBuilder = new StringBuilder();
            for (int i = 0; i < maskLength; i++) {
                maskBuilder.append('*');
            }
            return value.substring(0, 4) + maskBuilder.toString() + value.substring(length - 4);
        }
    }

    /**
     * 判断字符串是否是被掩码处理过的值
     */
    public static boolean isMaskedValue(String value) {
        if (StringUtils.isBlank(value)) {
            return false;
        }
        // 掩码值至少包含4个连续的*
        return value.contains("****");
    }

    /**
     * 处理JSONObject中的敏感字段
     */
    public static JSONObject maskSensitiveFields(JSONObject jsonObject) {
        if (jsonObject == null) {
            return null;
        }

        JSONObject result = new JSONObject();

        for (String key : jsonObject.keySet()) {
            Object value = jsonObject.get(key);

            if (isSensitiveField(key) && value instanceof String) {
                result.set(key, maskMiddle((String) value));
            } else if (value instanceof JSONObject) {
                result.set(key, maskSensitiveFields((JSONObject) value));
            } else {
                result.set(key, value);
            }
        }

        return result;
    }

    /**
     * 比较两个JSONObject的敏感字段是否相同
     * 特别针对api_key等敏感字段进行单独比较
     */
    public static boolean isSensitiveDataEqual(JSONObject original, JSONObject updated) {
        if (original == null && updated == null) {
            return true;
        }
        if (original == null || updated == null) {
            return false;
        }

        Map<String, String> originalFields = new HashMap<>();
        Map<String, String> updatedFields = new HashMap<>();
        extractSensitiveFields(original, originalFields, "");
        extractSensitiveFields(updated, updatedFields, "");
        return originalFields.equals(updatedFields);
    }

    /**
     * 递归提取全部敏感字段，使用完整路径区分嵌套对象中的同名字段。
     */
    private static void extractSensitiveFields(JSONObject jsonObject, Map<String, String> fieldsMap,
            String parentPath) {
        if (jsonObject == null) {
            return;
        }

        for (String key : jsonObject.keySet()) {
            String fullPath = parentPath.isEmpty() ? key : parentPath + "." + key;
            Object value = jsonObject.get(key);

            if (value instanceof JSONObject) {
                extractSensitiveFields((JSONObject) value, fieldsMap, fullPath);
            } else if (value instanceof String && isSensitiveField(key)) {
                fieldsMap.put(fullPath, (String) value);
            }
        }
    }
}
