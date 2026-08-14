package xiaozhi.modules.model.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import cn.hutool.json.JSONObject;
import xiaozhi.common.redis.RedisUtils;
import xiaozhi.modules.agent.dao.AgentDao;
import xiaozhi.modules.model.dao.ModelConfigDao;
import xiaozhi.modules.model.dto.ModelConfigBodyDTO;
import xiaozhi.modules.model.dto.ModelProviderDTO;
import xiaozhi.modules.model.entity.ModelConfigEntity;
import xiaozhi.modules.model.service.ModelProviderService;

class ModelConfigServiceImplTest {

    @Test
    void editingUpdatesPublicMetadataAndPreservesAnUnchangedMaskedSecret() {
        Fixture fixture = fixture("openai", "real-secret");
        ModelConfigBodyDTO body = body("openai");
        body.setModelCode("new-code");
        body.setDocLink("https://example.com/docs");
        body.getConfigJson().set("api_key", "real****cret");

        fixture.service.edit("LLM", "openai", "LLM_1", body);

        ModelConfigEntity updated = fixture.updatedEntity();
        assertEquals("new-code", updated.getModelCode());
        assertEquals("https://example.com/docs", updated.getDocLink());
        assertEquals("real-secret", updated.getConfigJson().getStr("api_key"));
    }

    @Test
    void changingProviderDoesNotCarryCredentialsFromThePreviousProvider() {
        Fixture fixture = fixture("openai", "real-secret");
        ModelConfigBodyDTO body = body("ollama");
        body.getConfigJson().set("host", "http://ollama:11434");

        fixture.service.edit("LLM", "ollama", "LLM_1", body);

        JSONObject updated = fixture.updatedEntity().getConfigJson();
        assertEquals("ollama", updated.getStr("type"));
        assertEquals("http://ollama:11434", updated.getStr("host"));
        assertFalse(updated.containsKey("api_key"));
        assertFalse(updated.containsKey("base_url"));
    }

    private static Fixture fixture(String provider, String secret) {
        ModelConfigDao dao = mock(ModelConfigDao.class);
        ModelProviderService providerService = mock(ModelProviderService.class);
        RedisUtils redisUtils = mock(RedisUtils.class);
        AgentDao agentDao = mock(AgentDao.class);

        ModelConfigEntity original = new ModelConfigEntity();
        original.setId("LLM_1");
        original.setModelType("LLM");
        original.setModelCode("old-code");
        original.setModelName("Old model");
        original.setDocLink("https://old.example.com");
        original.setIsEnabled(1);
        original.setIsDefault(0);
        original.setSort(1);
        JSONObject config = new JSONObject();
        config.set("type", provider);
        config.set("api_key", secret);
        config.set("base_url", "https://old-provider.example.com/v1");
        original.setConfigJson(config);

        when(dao.selectById("LLM_1")).thenReturn(original);
        when(providerService.getList(eq("LLM"), any(String.class)))
                .thenReturn(List.of(new ModelProviderDTO()));

        return new Fixture(
                dao,
                new ModelConfigServiceImpl(dao, providerService, redisUtils, agentDao));
    }

    private static ModelConfigBodyDTO body(String provider) {
        ModelConfigBodyDTO body = new ModelConfigBodyDTO();
        body.setModelCode("code");
        body.setModelName("Model");
        body.setDocLink("https://example.com");
        body.setIsEnabled(1);
        body.setIsDefault(0);
        body.setSort(1);
        JSONObject config = new JSONObject();
        config.set("type", provider);
        body.setConfigJson(config);
        return body;
    }

    private record Fixture(ModelConfigDao dao, ModelConfigServiceImpl service) {
        ModelConfigEntity updatedEntity() {
            ArgumentCaptor<ModelConfigEntity> captor = ArgumentCaptor.forClass(ModelConfigEntity.class);
            verify(dao).updateById(captor.capture());
            return captor.getValue();
        }
    }
}
