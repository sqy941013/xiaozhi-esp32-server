package xiaozhi.modules.device.controller;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.device.dto.WebChatMemoryCreateDTO;
import xiaozhi.modules.device.dto.WebChatSessionUpdateDTO;
import xiaozhi.modules.device.dto.WebChatTicketPayload;
import xiaozhi.modules.device.dto.WebChatTicketRedeemDTO;
import xiaozhi.modules.device.service.WebChatService;
import xiaozhi.modules.device.vo.WebChatSessionCreateVO;
import xiaozhi.modules.device.vo.WebChatSessionStatusVO;
import xiaozhi.modules.security.user.SecurityUser;

@Tag(name = "设备网页对话")
@RestController
@RequestMapping("/device")
@RequiredArgsConstructor
public class WebChatController {
    private final WebChatService webChatService;

    @PostMapping("/{deviceId}/web-chat/sessions")
    @Operation(summary = "创建一次性网页对话会话")
    @RequiresPermissions("sys:role:normal")
    public Result<WebChatSessionCreateVO> createSession(
            @PathVariable String deviceId, HttpServletRequest request) {
        WebChatSessionCreateVO session = webChatService.createSession(
                deviceId, SecurityUser.getUserId(), request.getHeader("Origin"));
        return new Result<WebChatSessionCreateVO>().ok(session);
    }

    @GetMapping("/{deviceId}/web-chat/sessions/{sessionId}")
    @Operation(summary = "查询网页对话及记忆保存状态")
    @RequiresPermissions("sys:role:normal")
    public Result<WebChatSessionStatusVO> getSession(
            @PathVariable String deviceId, @PathVariable String sessionId) {
        return new Result<WebChatSessionStatusVO>().ok(
                webChatService.getSession(deviceId, sessionId, SecurityUser.getUserId()));
    }

    @PostMapping("/{deviceId}/web-chat/sessions/{sessionId}/finish")
    @Operation(summary = "请求结束网页对话")
    @RequiresPermissions("sys:role:normal")
    public Result<WebChatSessionStatusVO> finishSession(
            @PathVariable String deviceId, @PathVariable String sessionId) {
        return new Result<WebChatSessionStatusVO>().ok(
                webChatService.requestFinish(deviceId, sessionId, SecurityUser.getUserId()));
    }

    @GetMapping("/{deviceId}/memories")
    @Operation(summary = "查看设备的 Mem0 记忆")
    @RequiresPermissions("sys:role:normal")
    public Result<JsonNode> getMemories(@PathVariable String deviceId) {
        return new Result<JsonNode>().ok(
                webChatService.getMemories(deviceId, SecurityUser.getUserId()));
    }

    @PostMapping("/{deviceId}/memories")
    @Operation(summary = "为设备固定一条 Mem0 事实")
    @RequiresPermissions("sys:role:normal")
    public Result<JsonNode> createMemory(
            @PathVariable String deviceId,
            @Valid @RequestBody WebChatMemoryCreateDTO input) {
        return new Result<JsonNode>().ok(
                webChatService.createMemory(deviceId, SecurityUser.getUserId(), input));
    }

    @PostMapping("/web-chat/internal/tickets/redeem")
    @Operation(summary = "服务端兑换一次性网页会话凭证")
    public Result<WebChatTicketPayload> redeemTicket(
            @Valid @RequestBody WebChatTicketRedeemDTO input) {
        return new Result<WebChatTicketPayload>().ok(
                webChatService.redeemTicket(input.getTicket(), input.getOrigin()));
    }

    @PostMapping("/web-chat/internal/sessions/{sessionId}/status")
    @Operation(summary = "服务端更新网页会话状态")
    public Result<WebChatSessionStatusVO> updateSession(
            @PathVariable String sessionId,
            @Valid @RequestBody WebChatSessionUpdateDTO input) {
        return new Result<WebChatSessionStatusVO>().ok(
                webChatService.updateSession(sessionId, input));
    }
}
