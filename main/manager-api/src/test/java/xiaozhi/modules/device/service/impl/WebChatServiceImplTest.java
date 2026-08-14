package xiaozhi.modules.device.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.StaticMessageSource;

import com.fasterxml.jackson.databind.ObjectMapper;

import xiaozhi.common.exception.RenException;
import xiaozhi.common.redis.RedisKeys;
import xiaozhi.common.redis.RedisUtils;
import xiaozhi.common.utils.SpringContextUtils;
import xiaozhi.modules.agent.service.AgentService;
import xiaozhi.modules.device.dto.WebChatSessionUpdateDTO;
import xiaozhi.modules.device.entity.DeviceEntity;
import xiaozhi.modules.device.service.DeviceService;
import xiaozhi.modules.device.vo.WebChatSessionCreateVO;
import xiaozhi.modules.device.vo.WebChatSessionStatusVO;
import xiaozhi.modules.model.service.ModelConfigService;

class WebChatServiceImplTest {
    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RedisUtils redisUtils = mock(RedisUtils.class);
    private final DeviceService deviceService = mock(DeviceService.class);
    private final AgentService agentService = mock(AgentService.class);
    private final ModelConfigService modelConfigService = mock(ModelConfigService.class);
    private WebChatServiceImpl service;

    @BeforeEach
    void setUp() {
        StaticMessageSource messageSource = new StaticMessageSource();
        messageSource.addMessage("401", Locale.getDefault(), "Unauthorized");
        ApplicationContext applicationContext = mock(ApplicationContext.class);
        when(applicationContext.getBean("messageSource")).thenReturn(messageSource);
        SpringContextUtils.applicationContext = applicationContext;

        DeviceEntity device = new DeviceEntity();
        device.setId("device-1");
        device.setUserId(42L);
        device.setMacAddress("AA:BB:CC:DD:EE:FF");
        device.setAlias("desk");
        device.setAgentId("agent-1");
        when(deviceService.selectById("device-1")).thenReturn(device);
        when(agentService.checkAgentPermission("agent-1", 42L)).thenReturn(true);
        when(redisUtils.increment(anyString(), anyLong())).thenReturn(1L);
        when(redisUtils.setIfAbsent(anyString(), any(), anyLong())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            Object value = invocation.getArgument(1);
            return cache.putIfAbsent(key, value) == null;
        });
        doAnswer(invocation -> {
            cache.put(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(redisUtils).set(anyString(), any(), anyLong());
        when(redisUtils.get(anyString())).thenAnswer(
                invocation -> cache.get(invocation.getArgument(0)));
        when(redisUtils.getAndDelete(anyString())).thenAnswer(
                invocation -> cache.remove(invocation.getArgument(0)));
        when(redisUtils.compareAndDelete(anyString(), anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            String expected = invocation.getArgument(1);
            return cache.remove(key, expected);
        });

        service = new WebChatServiceImpl(
                deviceService, agentService, modelConfigService, redisUtils, objectMapper);
    }

    @Test
    void ticketIsOpaqueSingleUseAndOriginBound() {
        WebChatSessionCreateVO created = service.createSession(
                "device-1", 42L, "https://CONSOLE.example.test/");

        assertNotNull(created.getTicket());
        assertEquals(43, created.getTicket().length());
        assertFalse(cache.keySet().stream().anyMatch(key -> key.contains(created.getTicket())));
        assertEquals("AA:BB:**:**:EE:FF", created.getDeviceMac());

        assertEquals("device-1", service.redeemTicket(
                created.getTicket(), "https://console.example.test").getDeviceId());
        assertThrows(RenException.class, () -> service.redeemTicket(
                created.getTicket(), "https://console.example.test"));
    }

    @Test
    void missingOrNonOriginValuesAreRejected() {
        assertThrows(RenException.class, () -> service.createSession(
                "device-1", 42L, null));
        assertThrows(RenException.class, () -> service.createSession(
                "device-1", 42L, "https://console.example.test/not-an-origin"));
        assertThrows(RenException.class, () -> service.createSession(
                "device-1", 42L, "https://user@console.example.test"));
    }

    @Test
    void finishBeforeRedemptionRejectsWithoutTakingDeviceLock() {
        WebChatSessionCreateVO created = service.createSession(
                "device-1", 42L, "https://console.example.test");
        service.requestFinish("device-1", created.getSessionId(), 42L);

        assertThrows(RenException.class, () -> service.redeemTicket(
                created.getTicket(), "https://console.example.test"));
        verify(redisUtils, never()).setIfAbsent(
                eq(RedisKeys.getWebChatDeviceLockKey("device-1")), any(), anyLong());
        assertEquals("REJECTED", service.getSession(
                "device-1", created.getSessionId(), 42L).getStatus());
    }

    @Test
    void mismatchedOriginConsumesAndRejectsTicket() {
        WebChatSessionCreateVO created = service.createSession(
                "device-1", 42L, "https://console.example.test");

        assertThrows(RenException.class, () -> service.redeemTicket(
                created.getTicket(), "https://evil.example.test"));
        WebChatSessionStatusVO status = service.getSession(
                "device-1", created.getSessionId(), 42L);
        assertEquals("REJECTED", status.getStatus());
        assertEquals("SKIPPED", status.getMemoryStatus());
    }

    @Test
    void finishRequestPreservesPrivateSessionIdentity() {
        WebChatSessionCreateVO created = service.createSession(
                "device-1", 42L, "https://console.example.test");

        WebChatSessionStatusVO response = service.requestFinish(
                "device-1", created.getSessionId(), 42L);
        WebChatSessionStatusVO stored = objectMapper.convertValue(
                cache.get(RedisKeys.getWebChatSessionKey(created.getSessionId())),
                WebChatSessionStatusVO.class);

        assertEquals("FINISH_REQUESTED", response.getStatus());
        assertEquals("AA:BB:**:**:EE:FF", response.getDeviceMac());
        assertEquals(null, response.getUserId());
        assertEquals("AA:BB:CC:DD:EE:FF", stored.getDeviceMac());
        assertEquals(42L, stored.getUserId());
    }

    @Test
    void terminalSessionCannotBeReopenedByLateStatusUpdate() {
        WebChatSessionCreateVO created = service.createSession(
                "device-1", 42L, "https://console.example.test");
        service.redeemTicket(created.getTicket(), "https://console.example.test");

        WebChatSessionUpdateDTO closed = update("CLOSED", "COMMITTED");
        assertEquals("CLOSED", service.updateSession(created.getSessionId(), closed).getStatus());
        verify(redisUtils).compareAndDelete(
                RedisKeys.getWebChatDeviceLockKey("device-1"), created.getSessionId());

        WebChatSessionUpdateDTO stale = update("READY", "IDLE");
        WebChatSessionStatusVO result = service.updateSession(created.getSessionId(), stale);
        assertEquals("CLOSED", result.getStatus());
        assertEquals("COMMITTED", result.getMemoryStatus());
    }

    @Test
    void finishRequestCannotBeRegressedByLateReadyUpdate() {
        WebChatSessionCreateVO created = service.createSession(
                "device-1", 42L, "https://console.example.test");
        service.redeemTicket(created.getTicket(), "https://console.example.test");
        service.requestFinish("device-1", created.getSessionId(), 42L);

        WebChatSessionStatusVO result = service.updateSession(
                created.getSessionId(), update("READY", "IDLE"));

        assertEquals("FINISH_REQUESTED", result.getStatus());
    }

    @Test
    void deviceLockRejectsOverlapAndIsReleasedOnlyByItsOwner() {
        WebChatSessionCreateVO first = service.createSession(
                "device-1", 42L, "https://console.example.test");
        service.redeemTicket(first.getTicket(), "https://console.example.test");

        WebChatSessionCreateVO overlapping = service.createSession(
                "device-1", 42L, "https://console.example.test");
        assertThrows(RenException.class, () -> service.redeemTicket(
                overlapping.getTicket(), "https://console.example.test"));
        assertEquals("REJECTED", service.getSession(
                "device-1", overlapping.getSessionId(), 42L).getStatus());

        service.updateSession(first.getSessionId(), update("FINISHING", "PENDING"));
        service.updateSession(first.getSessionId(), update("CLOSED", "NO_CHANGE"));

        WebChatSessionCreateVO next = service.createSession(
                "device-1", 42L, "https://console.example.test");
        assertEquals("device-1", service.redeemTicket(
                next.getTicket(), "https://console.example.test").getDeviceId());
    }

    private WebChatSessionUpdateDTO update(String status, String memoryStatus) {
        WebChatSessionUpdateDTO update = new WebChatSessionUpdateDTO();
        update.setStatus(status);
        update.setMemoryStatus(memoryStatus);
        return update;
    }
}
