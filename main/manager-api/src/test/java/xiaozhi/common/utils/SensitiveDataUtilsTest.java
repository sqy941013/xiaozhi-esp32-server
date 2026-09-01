package xiaozhi.common.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

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
        assertTrue(SensitiveDataUtils.isSensitiveField("api_keys"));
        assertTrue(SensitiveDataUtils.isSensitiveField("search_api_keys"));
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

    @Test
    void masksAndRestoresApiKeyArraysWithoutPersistingMaskText() {
        JSONObject original = new JSONObject();
        original.set("api_key", "single-secret-key");
        original.set("api_keys", List.of("first-secret-key", "second-secret-key"));
        original.set("zone", "cn");

        JSONObject masked = SensitiveDataUtils.maskSensitiveFields(original);
        assertEquals("sing*********-key", masked.getStr("api_key"));
        assertEquals("firs********-key", masked.getJSONArray("api_keys").getStr(0));
        assertEquals("seco*********-key", masked.getJSONArray("api_keys").getStr(1));

        JSONObject submitted = new JSONObject();
        submitted.set("api_key", masked.getStr("api_key"));
        submitted.set("api_keys", List.of(
                masked.getJSONArray("api_keys").getStr(1),
                "replacement-secret-key"));
        submitted.set("zone", "intl");

        JSONObject restored = SensitiveDataUtils.restoreMaskedSensitiveFields(original, submitted);
        assertEquals("single-secret-key", restored.getStr("api_key"));
        assertEquals("second-secret-key", restored.getJSONArray("api_keys").getStr(0));
        assertEquals("replacement-secret-key", restored.getJSONArray("api_keys").getStr(1));
        assertEquals("intl", restored.getStr("zone"));
    }

    @Test
    void omittedSecretStaysUnchangedButExplicitEmptyArrayClearsIt() {
        JSONObject original = new JSONObject();
        original.set("api_keys", List.of("first-secret-key"));

        JSONObject omitted = SensitiveDataUtils.restoreMaskedSensitiveFields(
                original, new JSONObject().set("zone", "cn"));
        assertEquals("first-secret-key", omitted.getJSONArray("api_keys").getStr(0));

        JSONObject cleared = SensitiveDataUtils.restoreMaskedSensitiveFields(
                original, new JSONObject().set("api_keys", List.of()));
        assertTrue(cleared.getJSONArray("api_keys").isEmpty());
    }

    @Test
    void restoresDistinctKeysThatProduceTheSamePublicMask() {
        JSONObject original = new JSONObject();
        original.set("api_keys", List.of("abcd1111wxyz", "abcd2222wxyz"));
        JSONObject masked = SensitiveDataUtils.maskSensitiveFields(original);

        JSONObject restored = SensitiveDataUtils.restoreMaskedSensitiveFields(original, masked);

        assertEquals("abcd1111wxyz", restored.getJSONArray("api_keys").getStr(0));
        assertEquals("abcd2222wxyz", restored.getJSONArray("api_keys").getStr(1));
    }
}
