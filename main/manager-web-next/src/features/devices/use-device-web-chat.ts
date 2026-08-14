import type { AppendMessage } from "@assistant-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createWebChatSession,
  requestWebChatFinish,
} from "@/features/devices/device-api";
import {
  buildWebChatSocketUrl,
  parseWebChatFrame,
  textFromAssistantMessage,
} from "@/features/devices/device-chat-utils";
import type { WebChatSession } from "@/features/devices/types";

export type WebChatPhase =
  | "connecting"
  | "ready"
  | "finalizing"
  | "finished"
  | "disconnected"
  | "failed";

export interface DeviceChatMessage {
  createdAt: Date;
  id: string;
  role: "assistant" | "user";
  status?: "complete" | "incomplete" | "running";
  text: string;
}

export type WebChatSessionView = Omit<WebChatSession, "ticket">;

interface PendingRun {
  assistantId: string;
  resolve: () => void;
}

interface MemoryReceipt {
  message?: string;
  status: string;
}

function frameString(frame: Record<string, unknown>, key: string): string | undefined {
  return typeof frame[key] === "string" ? frame[key] : undefined;
}

function createMessageId(prefix: string): string {
  const value = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

export function useDeviceWebChat(deviceId: string) {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [memoryReceipt, setMemoryReceipt] = useState<MemoryReceipt>();
  const [memoryRevision, setMemoryRevision] = useState(0);
  const [messages, setMessages] = useState<DeviceChatMessage[]>([]);
  const [phase, setPhase] = useState<WebChatPhase>("connecting");
  const [session, setSession] = useState<WebChatSessionView>();

  const assistantByClientId = useRef(new Map<string, string>());
  const assistantByTurnId = useRef(new Map<string, string>());
  const lastSequenceByTurnId = useRef(new Map<string, number>());
  const pendingRun = useRef<PendingRun | null>(null);
  const phaseRef = useRef<WebChatPhase>("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  const changePhase = useCallback((next: WebChatPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const completePendingRun = useCallback((status: "complete" | "incomplete") => {
    const pending = pendingRun.current;
    if (!pending) return;
    setMessages((current) => current.map((message) =>
      message.id === pending.assistantId
        ? { ...message, status }
        : message,
    ));
    pending.resolve();
    pendingRun.current = null;
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    let disposed = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    void Promise.resolve()
      .then(() => {
        if (disposed) return undefined;
        assistantByClientId.current.clear();
        assistantByTurnId.current.clear();
        lastSequenceByTurnId.current.clear();
        pendingRun.current = null;
        setError(undefined);
        setIsRunning(false);
        setMemoryReceipt(undefined);
        setMessages([]);
        setSession(undefined);
        changePhase("connecting");
        return createWebChatSession(deviceId);
      })
      .then((createdSession) => {
        if (disposed || !createdSession) return;
        const { ticket, ...publicSession } = createdSession;
        setSession(publicSession);

        const socket = new WebSocket(
          buildWebChatSocketUrl(createdSession.websocketPath, ticket),
        );
        socketRef.current = socket;

        socket.addEventListener("open", () => {
          if (disposed) return;
          socket.send(JSON.stringify({
            features: { aec: false, emoji: false, mcp: false },
            transport: "websocket",
            type: "hello",
            version: 1,
          }));
          heartbeat = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "ping" }));
            }
          }, 25_000);
        });

        socket.addEventListener("message", (event) => {
          if (disposed) return;
          const frame = parseWebChatFrame(event.data);
          if (!frame) return;
          const record = frame as Record<string, unknown>;
          if (record.type !== "web_chat") return;

          const eventName = frameString(record, "event");
          if (eventName === "ready") {
            changePhase("ready");
            return;
          }
          if (eventName === "turn_started") {
            const clientMessageId = frameString(record, "client_message_id");
            const turnId = frameString(record, "turn_id");
            if (clientMessageId && turnId) {
              const assistantId = assistantByClientId.current.get(clientMessageId);
              if (assistantId) assistantByTurnId.current.set(turnId, assistantId);
            }
            return;
          }
          if (eventName === "assistant_delta") {
            const clientMessageId = frameString(record, "client_message_id");
            const turnId = frameString(record, "turn_id");
            const delta = frameString(record, "delta");
            const sequence = typeof record.sequence === "number" ? record.sequence : 0;
            if (!turnId || !delta) return;
            const previousSequence = lastSequenceByTurnId.current.get(turnId) || 0;
            if (sequence > 0 && sequence <= previousSequence) return;
            if (sequence > 0) lastSequenceByTurnId.current.set(turnId, sequence);
            const assistantId = assistantByTurnId.current.get(turnId)
              || (clientMessageId
                ? assistantByClientId.current.get(clientMessageId)
                : undefined);
            if (!assistantId) return;
            setMessages((current) => current.map((message) =>
              message.id === assistantId
                ? { ...message, text: `${message.text}${delta}` }
                : message,
            ));
            return;
          }
          if (eventName === "turn_completed") {
            const outcome = frameString(record, "outcome");
            completePendingRun(
              outcome === "error" || outcome === "cancelled"
                ? "incomplete"
                : "complete",
            );
            return;
          }
          if (eventName === "memory_pending") {
            changePhase("finalizing");
            setMemoryReceipt({ status: "PENDING" });
            return;
          }
          if (eventName === "memory_committed" || eventName === "memory_failed") {
            const status = frameString(record, "memory_status") || "UNKNOWN";
            setMemoryReceipt({
              message: frameString(record, "message"),
              status,
            });
            if (eventName === "memory_committed") setMemoryRevision((value) => value + 1);
            changePhase("finished");
            return;
          }
          if (eventName === "session_expired") {
            setError(frameString(record, "message") || "Session expired");
            changePhase("finalizing");
            return;
          }
          if (eventName === "error" || eventName === "finish_rejected") {
            const message = frameString(record, "message") || "Web chat request failed";
            setError(message);
            if (eventName === "finish_rejected") {
              setMemoryReceipt(undefined);
              changePhase("ready");
              return;
            }
            const code = frameString(record, "code");
            if (code === "initialization_failed") changePhase("failed");
            if (pendingRun.current && code !== "turn_active") {
              completePendingRun("incomplete");
            }
          }
        });

        socket.addEventListener("close", () => {
          if (heartbeat) clearInterval(heartbeat);
          if (disposed) return;
          socketRef.current = null;
          if (pendingRun.current) completePendingRun("incomplete");
          if (phaseRef.current === "finished") return;
          if (phaseRef.current === "finalizing") {
            // manager-api remains the source of truth if the final receipt was
            // lost during the closing handshake; the page keeps polling it.
            return;
          } else if (phaseRef.current === "ready") {
            setError((current) => current || "WebSocket disconnected; checking the final session state");
            changePhase("finalizing");
            return;
          } else if (phaseRef.current !== "failed") {
            setError((current) => current || "WebSocket disconnected");
            changePhase("disconnected");
          }
        });

        socket.addEventListener("error", () => {
          if (!disposed) setError("Unable to connect to the WebSocket service");
        });
      })
      .catch((requestError: unknown) => {
        if (disposed) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to create chat session");
        changePhase("failed");
      });

    return () => {
      disposed = true;
      if (heartbeat) clearInterval(heartbeat);
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close(1000, "页面已离开");
      }
    };
  }, [attempt, changePhase, completePendingRun, deviceId]);

  const onNew = useCallback(async (message: AppendMessage) => {
    const text = textFromAssistantMessage(message.content);
    const socket = socketRef.current;
    if (!text || phaseRef.current !== "ready" || !socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error("Web chat is not ready");
    }
    if (pendingRun.current) throw new Error("A response is already running");

    const clientMessageId = createMessageId("message");
    const assistantId = createMessageId("assistant");
    assistantByClientId.current.set(clientMessageId, assistantId);
    setError(undefined);
    setIsRunning(true);
    setMessages((current) => [
      ...current,
      { createdAt: new Date(), id: clientMessageId, role: "user", text },
      {
        createdAt: new Date(),
        id: assistantId,
        role: "assistant",
        status: "running",
        text: "",
      },
    ]);

    return new Promise<void>((resolve) => {
      pendingRun.current = { assistantId, resolve };
      try {
        socket.send(JSON.stringify({
          client_message_id: clientMessageId,
          mode: "manual",
          state: "detect",
          text,
          type: "listen",
        }));
      } catch (sendError) {
        completePendingRun("incomplete");
        setError(sendError instanceof Error ? sendError.message : "Unable to send message");
      }
    });
  }, [completePendingRun]);

  const onCancel = useCallback(async () => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN && pendingRun.current) {
      try {
        socket.send(JSON.stringify({ type: "abort" }));
      } catch (sendError) {
        setError(sendError instanceof Error ? sendError.message : "Unable to cancel the response");
        completePendingRun("incomplete");
      }
    }
  }, [completePendingRun]);

  const finish = useCallback(() => {
    const socket = socketRef.current;
    if (!session || isRunning || phaseRef.current !== "ready") return;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("WebSocket disconnected before the session could finish");
      changePhase("disconnected");
      return;
    }
    try {
      socket.send(JSON.stringify({ action: "finish", type: "session" }));
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to finish the session");
      changePhase("disconnected");
      return;
    }
    changePhase("finalizing");
    setMemoryReceipt({ status: "PENDING" });
    void requestWebChatFinish(deviceId, session.sessionId).catch(() => undefined);
  }, [changePhase, deviceId, isRunning, session]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return {
    error,
    finish,
    isRunning,
    memoryReceipt,
    memoryRevision,
    messages,
    onCancel,
    onNew,
    phase,
    retry,
    session,
  };
}
