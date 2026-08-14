package xiaozhi.modules.device.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WebChatSessionUpdateDTO {
    @NotBlank
    private String status;

    @NotBlank
    private String memoryStatus;

    @Size(max = 500)
    private String message;
}
