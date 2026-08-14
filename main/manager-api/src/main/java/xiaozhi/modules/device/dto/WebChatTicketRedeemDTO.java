package xiaozhi.modules.device.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WebChatTicketRedeemDTO {
    @NotBlank
    private String ticket;

    private String origin;
}
