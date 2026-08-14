package xiaozhi.modules.device.dto;

import java.io.Serializable;

import lombok.Data;

@Data
public class WebChatTicketPayload implements Serializable {
    private String sessionId;
    private String deviceId;
    private String deviceMac;
    private String agentId;
    private Long userId;
    private String clientId;
    private String origin;
    private Long issuedAt;
    private Long expiresAt;
}
