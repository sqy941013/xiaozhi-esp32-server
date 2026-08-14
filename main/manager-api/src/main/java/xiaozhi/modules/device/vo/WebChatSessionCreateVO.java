package xiaozhi.modules.device.vo;

import lombok.Data;

@Data
public class WebChatSessionCreateVO {
    private String sessionId;
    private String deviceId;
    private String deviceAlias;
    private String deviceMac;
    private String agentId;
    private String clientId;
    private String websocketPath;
    private String ticket;
    private Long ticketExpiresAt;
    private Integer maxSessionSeconds;
}
