package xiaozhi.common.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;

import cn.hutool.json.JSONArray;
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
            "private_key", "secret_id", "api_keys"));

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
                || normalized.endsWith("_token")
                || normalized.endsWith("_api_keys");
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

            if (isSensitiveField(key)) {
                result.set(key, maskSensitiveValue(value));
            } else if (value instanceof JSONObject) {
                result.set(key, maskSensitiveFields((JSONObject) value));
            } else {
                result.set(key, value);
            }
        }

        return result;
    }

    private static Object maskSensitiveValue(Object value) {
        if (value instanceof String stringValue) {
            return maskMiddle(stringValue);
        }
        if (value instanceof Iterable<?> values) {
            JSONArray masked = new JSONArray();
            for (Object item : values) {
                masked.add(item instanceof String ? maskMiddle((String) item) : item);
            }
            return masked;
        }
        return value;
    }

    /**
     * Merge a browser-submitted object with the stored object, restoring masked
     * credentials while still allowing explicit replacement, reordering or removal.
     */
    public static JSONObject restoreMaskedSensitiveFields(JSONObject original, JSONObject updated) {
        JSONObject originalValue = original == null ? new JSONObject() : original;
        JSONObject updatedValue = updated == null ? new JSONObject() : updated;
        JSONObject result = new JSONObject();

        for (String key : updatedValue.keySet()) {
            Object next = updatedValue.get(key);
            Object previous = originalValue.get(key);
            if (isSensitiveField(key)) {
                result.set(key, restoreMaskedSensitiveValue(previous, next));
            } else if (previous instanceof JSONObject && next instanceof JSONObject) {
                result.set(key, restoreMaskedSensitiveFields((JSONObject) previous, (JSONObject) next));
            } else {
                result.set(key, next);
            }
        }

        // An omitted sensitive field means "unchanged". An explicit empty value
        // remains empty and therefore still lets an administrator clear it.
        for (String key : originalValue.keySet()) {
            if (!updatedValue.containsKey(key) && isSensitiveField(key)) {
                result.set(key, originalValue.get(key));
            }
        }
        return result;
    }

    private static Object restoreMaskedSensitiveValue(Object original, Object updated) {
        if (updated instanceof String stringValue) {
            if (isMaskedValue(stringValue) && original instanceof String) {
                return original;
            }
            return updated;
        }
        if (updated instanceof Iterable<?> updatedValues) {
            List<String> originalValuesList = new ArrayList<>();
            if (original instanceof Iterable<?> originalValues) {
                for (Object item : originalValues) {
                    if (item instanceof String stringItem) {
                        originalValuesList.add(stringItem);
                    }
                }
            }

            JSONArray restored = new JSONArray();
            Set<Integer> restoredIndexes = new HashSet<>();
            int updatedIndex = 0;
            for (Object item : updatedValues) {
                if (item instanceof String stringItem && isMaskedValue(stringItem)) {
                    int originalIndex = findOriginalValueIndex(
                            originalValuesList, restoredIndexes, stringItem, updatedIndex);
                    if (originalIndex >= 0) {
                        restored.add(originalValuesList.get(originalIndex));
                        restoredIndexes.add(originalIndex);
                    }
                } else {
                    restored.add(item);
                }
                updatedIndex++;
            }
            return restored;
        }
        return updated;
    }

    private static int findOriginalValueIndex(List<String> originals, Set<Integer> usedIndexes,
            String maskedValue, int preferredIndex) {
        if (preferredIndex < originals.size()
                && !usedIndexes.contains(preferredIndex)
                && maskMiddle(originals.get(preferredIndex)).equals(maskedValue)) {
            return preferredIndex;
        }
        for (int index = 0; index < originals.size(); index++) {
            if (!usedIndexes.contains(index) && maskMiddle(originals.get(index)).equals(maskedValue)) {
                return index;
            }
        }
        return -1;
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
