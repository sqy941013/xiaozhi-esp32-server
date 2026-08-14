package xiaozhi.modules.device.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WebChatMemoryCreateDTO {
    @NotBlank
    @Size(max = 1000)
    private String content;
}
