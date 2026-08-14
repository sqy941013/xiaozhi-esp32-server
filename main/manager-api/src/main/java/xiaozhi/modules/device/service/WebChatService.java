package xiaozhi.modules.device.service;

import com.fasterxml.jackson.databind.JsonNode;

import xiaozhi.modules.device.dto.WebChatMemoryCreateDTO;
import xiaozhi.modules.device.dto.WebChatSessionUpdateDTO;
import xiaozhi.modules.device.dto.WebChatTicketPayload;
import xiaozhi.modules.device.vo.WebChatSessionCreateVO;
import xiaozhi.modules.device.vo.WebChatSessionStatusVO;

public interface WebChatService {
    WebChatSessionCreateVO createSession(String deviceId, Long userId, String origin);

    WebChatTicketPayload redeemTicket(String ticket, String origin);

    WebChatSessionStatusVO getSession(String deviceId, String sessionId, Long userId);

    WebChatSessionStatusVO requestFinish(String deviceId, String sessionId, Long userId);

    WebChatSessionStatusVO updateSession(String sessionId, WebChatSessionUpdateDTO update);

    JsonNode getMemories(String deviceId, Long userId);

    JsonNode createMemory(String deviceId, Long userId, WebChatMemoryCreateDTO input);
}
