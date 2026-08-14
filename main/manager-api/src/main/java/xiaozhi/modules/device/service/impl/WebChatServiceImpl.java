package xiaozhi.modules.device.service.impl;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import cn.hutool.json.JSONObject;
import lombok.RequiredArgsConstructor;
import xiaozhi.common.exception.ErrorCode;
import xiaozhi.common.exception.RenException;
import xiaozhi.common.redis.RedisKeys;
import xiaozhi.common.redis.RedisUtils;
import xiaozhi.modules.agent.service.AgentService;
import xiaozhi.modules.agent.vo.AgentInfoVO;
import xiaozhi.modules.device.dto.WebChatMemoryCreateDTO;
import xiaozhi.modules.device.dto.WebChatSessionUpdateDTO;
import xiaozhi.modules.device.dto.WebChatTicketPayload;
import xiaozhi.modules.device.entity.DeviceEntity;
import xiaozhi.modules.device.service.DeviceService;
import xiaozhi.modules.device.service.WebChatService;
import xiaozhi.modules.device.vo.WebChatSessionCreateVO;
import xiaozhi.modules.device.vo.WebChatSessionStatusVO;
import xiaozhi.modules.model.entity.ModelConfigEntity;
import xiaozhi.modules.model.service.ModelConfigService;

@Service
@RequiredArgsConstructor
public class WebChatServiceImpl implements WebChatService {
    static final int TICKET_TTL_SECONDS = 60;
    static final int MAX_SESSION_SECONDS = 15 * 60;
    static final int SESSION_TTL_SECONDS = 24 * 60 * 60;
    static final int RATE_LIMIT_PER_MINUTE = 10;
    static final String WEBSOCKET_PATH = "/xiaozhi-ws/xiaozhi/v1/web-chat";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();
    private static final Set<String> SESSION_STATUSES = Set.of(
            "ISSUED", "CONNECTED", "READY", "ACTIVE", "FINISH_REQUESTED",
            "FINISHING", "CLOSED", "FAILED", "REJECTED");
    private static final Set<String> MEMORY_STATUSES = Set.of(
            "IDLE", "PENDING", "COMMITTED", "NO_CHANGE", "FAILED", "SKIPPED");
    private static final Set<String> TERMINAL_STATUSES = Set.of("CLOSED", "FAILED", "REJECTED");
    private static final Map<String, Set<String>> SESSION_TRANSITIONS = Map.of(
            "ISSUED", Set.of("CONNECTED", "FINISH_REQUESTED", "FAILED", "REJECTED"),
            "CONNECTED", Set.of("READY", "FINISH_REQUESTED", "FINISHING", "CLOSED", "FAILED", "REJECTED"),
            "READY", Set.of("ACTIVE", "FINISH_REQUESTED", "FINISHING", "CLOSED", "FAILED"),
            "ACTIVE", Set.of("READY", "FINISH_REQUESTED", "FINISHING", "CLOSED", "FAILED"),
            "FINISH_REQUESTED", Set.of("FINISHING", "CLOSED", "FAILED"),
            "FINISHING", Set.of("CLOSED", "FAILED"));

    private final DeviceService deviceService;
    private final AgentService agentService;
    private final ModelConfigService modelConfigService;
    private final RedisUtils redisUtils;
    private final ObjectMapper objectMapper;

    @Override
    public WebChatSessionCreateVO createSession(String deviceId, Long userId, String origin) {
        DeviceEntity device = getOwnedDevice(deviceId, userId);
        enforceRateLimit(userId);

        long now = System.currentTimeMillis();
        String sessionId = UUID.randomUUID().toString();
        String clientId = "web-" + UUID.randomUUID();
        String ticket = randomTicket();

        WebChatTicketPayload payload = new WebChatTicketPayload();
        payload.setSessionId(sessionId);
        payload.setDeviceId(device.getId());
        payload.setDeviceMac(device.getMacAddress());
        payload.setAgentId(device.getAgentId());
        payload.setUserId(userId);
        payload.setClientId(clientId);
        payload.setOrigin(normalizeOrigin(origin));
        payload.setIssuedAt(now);
        payload.setExpiresAt(now + TICKET_TTL_SECONDS * 1000L);
        redisUtils.set(ticketKey(ticket), payload, TICKET_TTL_SECONDS);

        WebChatSessionStatusVO session = new WebChatSessionStatusVO();
        session.setSessionId(sessionId);
        session.setDeviceId(device.getId());
        session.setDeviceAlias(device.getAlias());
        session.setDeviceMac(device.getMacAddress());
        session.setAgentId(device.getAgentId());
        session.setUserId(userId);
        session.setStatus("ISSUED");
        session.setMemoryStatus("IDLE");
        session.setCreatedAt(now);
        session.setUpdatedAt(now);
        session.setExpiresAt(now + MAX_SESSION_SECONDS * 1000L);
        saveSession(session);

        WebChatSessionCreateVO result = new WebChatSessionCreateVO();
        result.setSessionId(sessionId);
        result.setDeviceId(device.getId());
        result.setDeviceAlias(device.getAlias());
        result.setDeviceMac(maskMac(device.getMacAddress()));
        result.setAgentId(device.getAgentId());
        result.setClientId(clientId);
        result.setWebsocketPath(WEBSOCKET_PATH);
        result.setTicket(ticket);
        result.setTicketExpiresAt(payload.getExpiresAt());
        result.setMaxSessionSeconds(MAX_SESSION_SECONDS);
        return result;
    }

    @Override
    public WebChatTicketPayload redeemTicket(String ticket, String origin) {
        if (StringUtils.isBlank(ticket) || ticket.length() > 128) {
            throw new RenException(ErrorCode.UNAUTHORIZED);
        }
        Object raw = redisUtils.getAndDelete(ticketKey(ticket));
        if (raw == null) {
            throw new RenException(ErrorCode.UNAUTHORIZED);
        }
        WebChatTicketPayload payload = objectMapper.convertValue(raw, WebChatTicketPayload.class);
        long now = System.currentTimeMillis();
        if (payload.getExpiresAt() == null || payload.getExpiresAt() < now) {
            rejectSession(payload.getSessionId(), "网页会话凭证已过期");
            throw new RenException(ErrorCode.UNAUTHORIZED);
        }

        String expectedOrigin;
        String actualOrigin;
        try {
            expectedOrigin = normalizeOrigin(payload.getOrigin());
            actualOrigin = normalizeOrigin(origin);
        } catch (RenException e) {
            rejectSession(payload.getSessionId(), "网页会话来源校验失败");
            throw e;
        }
        if (!expectedOrigin.equals(actualOrigin)) {
            rejectSession(payload.getSessionId(), "网页会话来源校验失败");
            throw new RenException(ErrorCode.UNAUTHORIZED);
        }

        DeviceEntity current;
        try {
            current = getOwnedDevice(payload.getDeviceId(), payload.getUserId());
        } catch (RenException e) {
            rejectSession(payload.getSessionId(), "设备绑定关系已经变化");
            throw e;
        }
        if (current.getMacAddress() == null
                || !current.getMacAddress().equalsIgnoreCase(payload.getDeviceMac())
                || !Objects.equals(current.getAgentId(), payload.getAgentId())) {
            rejectSession(payload.getSessionId(), "设备绑定关系已经变化");
            throw new RenException(ErrorCode.NO_PERMISSION);
        }

        return withSessionLock(payload.getSessionId(), () -> {
            WebChatSessionStatusVO session = readSession(payload.getSessionId());
            if (!"ISSUED".equals(session.getStatus())
                    || session.getExpiresAt() == null
                    || session.getExpiresAt() < now
                    || !Objects.equals(payload.getDeviceId(), session.getDeviceId())
                    || payload.getDeviceMac() == null
                    || !payload.getDeviceMac().equalsIgnoreCase(session.getDeviceMac())
                    || !Objects.equals(payload.getAgentId(), session.getAgentId())
                    || !Objects.equals(payload.getUserId(), session.getUserId())) {
                rejectSessionUnlocked(payload.getSessionId(), "网页会话状态或身份无效");
                throw new RenException(ErrorCode.UNAUTHORIZED);
            }

            boolean locked = redisUtils.setIfAbsent(
                    RedisKeys.getWebChatDeviceLockKey(payload.getDeviceId()),
                    payload.getSessionId(), MAX_SESSION_SECONDS + 60L);
            if (!locked) {
                rejectSessionUnlocked(payload.getSessionId(), "该设备已有网页会话正在进行");
                throw new RenException("该设备已有网页会话正在进行");
            }

            try {
                session.setStatus("CONNECTED");
                session.setUpdatedAt(now);
                saveSession(session);
            } catch (RuntimeException e) {
                redisUtils.compareAndDelete(
                        RedisKeys.getWebChatDeviceLockKey(payload.getDeviceId()),
                        payload.getSessionId());
                throw e;
            }
            return payload;
        });
    }

    @Override
    public WebChatSessionStatusVO getSession(String deviceId, String sessionId, Long userId) {
        return publicSession(getOwnedSession(deviceId, sessionId, userId));
    }

    @Override
    public WebChatSessionStatusVO requestFinish(String deviceId, String sessionId, Long userId) {
        // Keep the internal, unmasked session in Redis. getSession() returns a
        // public copy with the MAC masked and userId removed.
        getOwnedDevice(deviceId, userId);
        return publicSession(withSessionLock(sessionId, () -> {
            WebChatSessionStatusVO session = readSession(sessionId);
            if (!deviceId.equals(session.getDeviceId()) || !userId.equals(session.getUserId())) {
                throw new RenException(ErrorCode.NO_PERMISSION);
            }
            if (!TERMINAL_STATUSES.contains(session.getStatus())
                    && !"FINISH_REQUESTED".equals(session.getStatus())
                    && !"FINISHING".equals(session.getStatus())) {
                session.setStatus("FINISH_REQUESTED");
                session.setUpdatedAt(System.currentTimeMillis());
                saveSession(session);
            }
            return session;
        }));
    }

    @Override
    public WebChatSessionStatusVO updateSession(String sessionId, WebChatSessionUpdateDTO update) {
        String status = update.getStatus().trim().toUpperCase();
        String memoryStatus = update.getMemoryStatus().trim().toUpperCase();
        if (!SESSION_STATUSES.contains(status) || !MEMORY_STATUSES.contains(memoryStatus)) {
            throw new RenException(ErrorCode.PARAMS_GET_ERROR);
        }
        return withSessionLock(sessionId, () -> {
            WebChatSessionStatusVO session = readSession(sessionId);
            if (TERMINAL_STATUSES.contains(session.getStatus())
                    || !isAllowedTransition(session.getStatus(), status)) {
                return session;
            }
            session.setStatus(status);
            session.setMemoryStatus(memoryStatus);
            session.setMessage(StringUtils.trimToNull(update.getMessage()));
            session.setUpdatedAt(System.currentTimeMillis());
            saveSession(session);
            // FINISHING sessions no longer accept turns. Release only this
            // session's lock before memory persistence so an immediate browser
            // refresh can establish the replacement session.
            if ("FINISHING".equals(status) || TERMINAL_STATUSES.contains(status)) {
                redisUtils.compareAndDelete(
                        RedisKeys.getWebChatDeviceLockKey(session.getDeviceId()), sessionId);
            }
            return session;
        });
    }

    @Override
    public JsonNode getMemories(String deviceId, Long userId) {
        DeviceEntity device = getOwnedDevice(deviceId, userId);
        MemoryEndpoint endpoint = getMemoryEndpoint(device);
        String query = "user_id=" + URLEncoder.encode(device.getMacAddress(), StandardCharsets.UTF_8)
                + "&top_k=100";
        return callMem0(endpoint, "GET", "/memories?" + query, null);
    }

    @Override
    public JsonNode createMemory(String deviceId, Long userId, WebChatMemoryCreateDTO input) {
        DeviceEntity device = getOwnedDevice(deviceId, userId);
        MemoryEndpoint endpoint = getMemoryEndpoint(device);
        Map<String, Object> body = Map.of(
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", input.getContent().trim())),
                "user_id", device.getMacAddress(),
                "infer", false,
                "memory_type", "core",
                "metadata", Map.of(
                        "source", "manager-web",
                        "device_id", device.getId(),
                        "agent_id", device.getAgentId()));
        return callMem0(endpoint, "POST", "/memories", body);
    }

    private DeviceEntity getOwnedDevice(String deviceId, Long userId) {
        if (StringUtils.isBlank(deviceId) || userId == null) {
            throw new RenException(ErrorCode.NO_PERMISSION);
        }
        DeviceEntity device = deviceService.selectById(deviceId);
        if (device == null || !userId.equals(device.getUserId())
                || !agentService.checkAgentPermission(device.getAgentId(), userId)) {
            throw new RenException(ErrorCode.NO_PERMISSION);
        }
        return device;
    }

    private WebChatSessionStatusVO getOwnedSession(
            String deviceId, String sessionId, Long userId) {
        getOwnedDevice(deviceId, userId);
        WebChatSessionStatusVO session = readSession(sessionId);
        if (!deviceId.equals(session.getDeviceId()) || !userId.equals(session.getUserId())) {
            throw new RenException(ErrorCode.NO_PERMISSION);
        }
        return session;
    }

    private void enforceRateLimit(Long userId) {
        Long count = redisUtils.increment(
                RedisKeys.getWebChatRateLimitKey(userId), 60L);
        if (count != null && count > RATE_LIMIT_PER_MINUTE) {
            throw new RenException("网页会话创建过于频繁，请稍后再试");
        }
    }

    private boolean isAllowedTransition(String currentStatus, String nextStatus) {
        if (Objects.equals(currentStatus, nextStatus)) {
            return true;
        }
        return SESSION_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(nextStatus);
    }

    private <T> T withSessionLock(String sessionId, Supplier<T> action) {
        String key = RedisKeys.getWebChatSessionMutexKey(sessionId);
        String owner = UUID.randomUUID().toString();
        for (int attempt = 0; attempt < 20; attempt++) {
            if (redisUtils.setIfAbsent(key, owner, 5L)) {
                try {
                    return action.get();
                } finally {
                    redisUtils.compareAndDelete(key, owner);
                }
            }
            try {
                Thread.sleep(25L);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RenException("网页会话状态更新被中断", e);
            }
        }
        throw new RenException("网页会话状态繁忙，请重试");
    }

    private String randomTicket() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String ticketKey(String ticket) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(ticket.getBytes(StandardCharsets.UTF_8));
            return RedisKeys.getWebChatTicketKey(HexFormat.of().formatHex(digest));
        } catch (Exception e) {
            throw new RenException("无法创建网页会话凭证", e);
        }
    }

    private void saveSession(WebChatSessionStatusVO session) {
        redisUtils.set(
                RedisKeys.getWebChatSessionKey(session.getSessionId()),
                session, SESSION_TTL_SECONDS);
    }

    private WebChatSessionStatusVO readSession(String sessionId) {
        Object raw = redisUtils.get(RedisKeys.getWebChatSessionKey(sessionId));
        if (raw == null) {
            throw new RenException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        return objectMapper.convertValue(raw, WebChatSessionStatusVO.class);
    }

    private void rejectSession(String sessionId, String message) {
        try {
            withSessionLock(sessionId, () -> {
                rejectSessionUnlocked(sessionId, message);
                return null;
            });
        } catch (Exception ignored) {
            // A failed ticket redemption must not expose secondary cache errors.
        }
    }

    private void rejectSessionUnlocked(String sessionId, String message) {
        WebChatSessionStatusVO session = readSession(sessionId);
        if (TERMINAL_STATUSES.contains(session.getStatus())) {
            return;
        }
        session.setStatus("REJECTED");
        session.setMemoryStatus("SKIPPED");
        session.setMessage(message);
        session.setUpdatedAt(System.currentTimeMillis());
        saveSession(session);
    }

    private WebChatSessionStatusVO publicSession(WebChatSessionStatusVO session) {
        WebChatSessionStatusVO result = objectMapper.convertValue(session, WebChatSessionStatusVO.class);
        result.setDeviceMac(maskMac(result.getDeviceMac()));
        result.setUserId(null);
        return result;
    }

    private String normalizeOrigin(String origin) {
        if (StringUtils.isBlank(origin)) {
            throw new RenException("网页会话来源无效");
        }
        try {
            URI uri = URI.create(origin.trim());
            if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    || StringUtils.isBlank(uri.getHost())
                    || uri.getRawUserInfo() != null
                    || uri.getRawQuery() != null
                    || uri.getRawFragment() != null
                    || (StringUtils.isNotBlank(uri.getRawPath()) && !"/".equals(uri.getRawPath()))) {
                throw new IllegalArgumentException("invalid origin");
            }
            return uri.getScheme().toLowerCase() + "://" + uri.getRawAuthority().toLowerCase();
        } catch (Exception e) {
            throw new RenException("网页会话来源无效");
        }
    }

    private String maskMac(String mac) {
        if (StringUtils.isBlank(mac) || mac.length() < 8) {
            return mac;
        }
        return mac.substring(0, 5) + ":**:**:" + mac.substring(mac.length() - 5);
    }

    private MemoryEndpoint getMemoryEndpoint(DeviceEntity device) {
        AgentInfoVO agent = agentService.getAgentById(device.getAgentId());
        if (agent == null || StringUtils.isBlank(agent.getMemModelId())) {
            throw new RenException("该智能体未配置记忆模型");
        }
        ModelConfigEntity model = modelConfigService.getModelByIdFromCache(agent.getMemModelId());
        JSONObject config = model == null ? null : model.getConfigJson();
        if (config == null || !"mem0ai".equalsIgnoreCase(config.getStr("type"))) {
            throw new RenException("当前记忆模型不是 Mem0");
        }
        String baseUrl = config.getStr("base_url", "");
        while (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String apiKey = config.getStr("api_key", "");
        if (StringUtils.isBlank(baseUrl) || StringUtils.isBlank(apiKey)) {
            throw new RenException("自托管 Mem0 的基础 URL 或 API 密钥未配置");
        }
        try {
            URI uri = URI.create(baseUrl);
            if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    || StringUtils.isBlank(uri.getHost())
                    || uri.getRawUserInfo() != null
                    || uri.getRawQuery() != null
                    || uri.getRawFragment() != null) {
                throw new IllegalArgumentException("unsupported scheme");
            }
        } catch (Exception e) {
            throw new RenException("自托管 Mem0 基础 URL 无效");
        }
        return new MemoryEndpoint(baseUrl, apiKey);
    }

    private JsonNode callMem0(MemoryEndpoint endpoint, String method, String path, Object body) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(endpoint.baseUrl() + path))
                    .timeout(Duration.ofSeconds(30))
                    .header("Accept", "application/json")
                    .header("X-API-Key", endpoint.apiKey());
            if ("POST".equals(method)) {
                builder.header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
            } else {
                builder.GET();
            }
            HttpResponse<String> response = HTTP_CLIENT.send(
                    builder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RenException("Mem0 请求失败（HTTP " + response.statusCode() + "）");
            }
            return objectMapper.readTree(response.body());
        } catch (RenException e) {
            throw e;
        } catch (Exception e) {
            throw new RenException("无法连接自托管 Mem0 服务", e);
        }
    }

    private record MemoryEndpoint(String baseUrl, String apiKey) {
    }
}
