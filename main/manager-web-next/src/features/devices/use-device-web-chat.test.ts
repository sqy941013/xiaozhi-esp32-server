import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createWebChatSession,
  requestWebChatFinish,
} from "@/features/devices/device-api";
import { useDeviceWebChat } from "@/features/devices/use-device-web-chat";

vi.mock("@/features/devices/device-api", () => ({
  createWebChatSession: vi.fn(),
  requestWebChatFinish: vi.fn(),
}));

const createSessionMock = vi.mocked(createWebChatSession);
const requestFinishMock = vi.mocked(requestWebChatFinish);

class FakeWebSocket extends EventTarget {
  static readonly CLOSED = 3;
  static readonly CLOSING = 2;
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static instances: FakeWebSocket[] = [];

  readonly sent: string[] = [];
  readyState = FakeWebSocket.CONNECTING;

  constructor(readonly url: string) {
    super();
    FakeWebSocket.instances.push(this);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  receive(frame: Record<string, unknown>) {
    this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(frame) }));
  }

  serverClose() {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close", { code: 1006 }));
  }

  send(data: string) {
    this.sent.push(data);
  }
}

const session = {
  agentId: "agent-1",
  clientId: "web-client-1",
  deviceAlias: "书房小智",
  deviceId: "device-1",
  deviceMac: "AA:BB:**:**:EE:FF",
  maxSessionSeconds: 900,
  sessionId: "session-1",
  ticket: "single-use-ticket",
  ticketExpiresAt: Date.now() + 60_000,
  websocketPath: "/xiaozhi-ws/xiaozhi/v1/web-chat",
};

async function connectHook() {
  const rendered = renderHook(() => useDeviceWebChat("device-1"));
  await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
  const socket = FakeWebSocket.instances[0];
  if (!socket) throw new Error("WebSocket was not created");
  act(() => socket.open());
  act(() => socket.receive({ event: "ready", type: "web_chat" }));
  await waitFor(() => expect(rendered.result.current.phase).toBe("ready"));
  return { ...rendered, socket };
}

describe("useDeviceWebChat", () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    createSessionMock.mockReset().mockResolvedValue(session);
    requestFinishMock.mockReset().mockResolvedValue({
      deviceId: "device-1",
      memoryStatus: "PENDING",
      sessionId: "session-1",
      status: "FINISH_REQUESTED",
    });
    vi.stubGlobal("WebSocket", FakeWebSocket);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("streams one correlated assistant turn and resolves cancellation", async () => {
    const { result, socket } = await connectHook();
    expect(socket.url).toContain("ticket=single-use-ticket");
    expect(result.current.session).not.toHaveProperty("ticket");
    expect(JSON.parse(socket.sent[0] || "{}")).toMatchObject({
      transport: "websocket",
      type: "hello",
    });

    let completion: Promise<void> | undefined;
    act(() => {
      completion = result.current.onNew({
        attachments: [],
        content: [{ text: "请记住我喜欢无糖咖啡", type: "text" }],
        createdAt: new Date(),
        metadata: { custom: {} },
        parentId: null,
        role: "user",
        runConfig: {},
        sourceId: null,
      });
    });
    await waitFor(() => expect(result.current.isRunning).toBe(true));
    const listen = JSON.parse(socket.sent.at(-1) || "{}");
    expect(listen).toMatchObject({
      mode: "manual",
      state: "detect",
      text: "请记住我喜欢无糖咖啡",
      type: "listen",
    });

    act(() => socket.receive({
      client_message_id: listen.client_message_id,
      event: "turn_started",
      turn_id: "turn-1",
      type: "web_chat",
    }));
    act(() => socket.receive({
      delta: "好的，",
      event: "assistant_delta",
      sequence: 1,
      turn_id: "turn-1",
      type: "web_chat",
    }));
    act(() => socket.receive({
      delta: "我记住了。",
      event: "assistant_delta",
      sequence: 2,
      turn_id: "turn-1",
      type: "web_chat",
    }));
    await waitFor(() => expect(result.current.messages[1]?.text).toBe("好的，我记住了。"));

    await act(async () => result.current.onCancel());
    expect(JSON.parse(socket.sent.at(-1) || "{}")).toEqual({ type: "abort" });
    act(() => socket.receive({
      event: "turn_completed",
      outcome: "cancelled",
      turn_id: "turn-1",
      type: "web_chat",
    }));
    await completion;
    await waitFor(() => {
      expect(result.current.isRunning).toBe(false);
      expect(result.current.messages[1]?.status).toBe("incomplete");
    });
  });

  it("finishes through both WebSocket and REST and records the memory receipt", async () => {
    const { result, socket } = await connectHook();

    act(() => result.current.finish());
    expect(JSON.parse(socket.sent.at(-1) || "{}")).toEqual({
      action: "finish",
      type: "session",
    });
    expect(requestFinishMock).toHaveBeenCalledWith("device-1", "session-1");
    expect(result.current.phase).toBe("finalizing");

    act(() => socket.receive({
      event: "memory_committed",
      memory_status: "COMMITTED",
      message: "记忆已经保存",
      type: "web_chat",
    }));
    await waitFor(() => {
      expect(result.current.phase).toBe("finished");
      expect(result.current.memoryReceipt).toEqual({
        message: "记忆已经保存",
        status: "COMMITTED",
      });
      expect(result.current.memoryRevision).toBe(1);
    });
  });

  it("polls the manager state after an unexpected ready-session disconnect", async () => {
    const { result, socket } = await connectHook();

    act(() => socket.serverClose());

    await waitFor(() => {
      expect(result.current.phase).toBe("finalizing");
      expect(result.current.error).toContain("checking the final session state");
    });
  });

  it("retries a transient disconnect while the initial connection is starting", async () => {
    const rendered = renderHook(() => useDeviceWebChat("device-1"));
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    const firstSocket = FakeWebSocket.instances[0];
    if (!firstSocket) throw new Error("First WebSocket was not created");
    act(() => firstSocket.serverClose());

    expect(rendered.result.current.phase).toBe("connecting");
    expect(rendered.result.current.error).toBeUndefined();
    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(2), {
      timeout: 1_500,
    });

    const replacementSocket = FakeWebSocket.instances[1];
    if (!replacementSocket) throw new Error("Replacement WebSocket was not created");
    act(() => replacementSocket.open());
    act(() => replacementSocket.receive({ event: "ready", type: "web_chat" }));

    await waitFor(() => expect(rendered.result.current.phase).toBe("ready"));
    expect(createSessionMock).toHaveBeenCalledTimes(2);
    expect(rendered.result.current.error).toBeUndefined();
  });
});
