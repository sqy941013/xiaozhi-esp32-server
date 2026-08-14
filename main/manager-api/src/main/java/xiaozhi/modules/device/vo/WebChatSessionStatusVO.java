package xiaozhi.modules.device.vo;

import java.io.Serializable;

import lombok.Data;

@Data
public class WebChatSessionStatusVO implements Serializable {
    private String sessionId;
    private String deviceId;
    private String deviceAlias;
    private String deviceMac;
    private String agentId;
    private Long userId;
    private String status;
    private String memoryStatus;
    private String message;
    private Long createdAt;
    private Long updatedAt;
    private Long expiresAt;
}
