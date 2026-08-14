package xiaozhi.common.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import cn.hutool.json.JSONObject;

class SensitiveDataUtilsTest {

    @Test
    void recognizesCredentialAliasesWithoutMaskingOrdinaryTokenSettings() {
        assertTrue(SensitiveDataUtils.isSensitiveField("embedding_api_key"));
        assertTrue(SensitiveDataUtils.isSensitiveField("llm_api_key"));
        assertTrue(SensitiveDataUtils.isSensitiveField("api_secret"));
        assertTrue(SensitiveDataUtils.isSensitiveField("api_password"));
        assertTrue(SensitiveDataUtils.isSensitiveField("authorization"));
        assertFalse(SensitiveDataUtils.isSensitiveField("max_tokens"));
    }

    @Test
    void masksAliasesRecursively() {
        JSONObject nested = new JSONObject();
        nested.set("llm_api_key", "sk-1234567890");
        nested.set("max_tokens", 8192);

        JSONObject source = new JSONObject();
        source.set("api_secret", "super-secret-value");
        source.set("options", nested);

        JSONObject masked = SensitiveDataUtils.maskSensitiveFields(source);

        assertEquals("supe**********alue", masked.getStr("api_secret"));
        assertEquals("sk-1*****7890", masked.getJSONObject("options").getStr("llm_api_key"));
        assertEquals(8192, masked.getJSONObject("options").getInt("max_tokens"));
    }

    @Test
    void comparesEverySupportedCredentialAliasAtItsNestedPath() {
        JSONObject originalNested = new JSONObject();
        originalNested.set("embedding_api_key", "secret-one");
        JSONObject updatedNested = new JSONObject();
        updatedNested.set("embedding_api_key", "secret-one");

        JSONObject original = new JSONObject();
        original.set("api_password", "secret-two");
        original.set("nested", originalNested);
        JSONObject updated = new JSONObject();
        updated.set("api_password", "secret-two");
        updated.set("nested", updatedNested);

        assertTrue(SensitiveDataUtils.isSensitiveDataEqual(original, updated));
        updatedNested.set("embedding_api_key", "changed");
        assertFalse(SensitiveDataUtils.isSensitiveDataEqual(original, updated));
    }
}
