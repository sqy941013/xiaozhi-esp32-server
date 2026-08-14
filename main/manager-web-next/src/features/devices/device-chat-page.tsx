import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Database,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Send,
  Square,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  createDeviceMemory,
  getDeviceMemories,
  getWebChatSession,
} from "@/features/devices/device-api";
import { normalizeDeviceMemories } from "@/features/devices/device-chat-utils";
import {
  type DeviceChatMessage,
  useDeviceWebChat,
  type WebChatPhase,
} from "@/features/devices/use-device-web-chat";
import { cn } from "@/lib/utils";

function messageStatus(message: DeviceChatMessage) {
  if (message.role !== "assistant") return undefined;
  if (message.status === "running") return { type: "running" as const };
  if (message.status === "incomplete") {
    return { type: "incomplete" as const, reason: "error" as const };
  }
  return { type: "complete" as const, reason: "stop" as const };
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="mx-auto flex w-full max-w-3xl justify-end gap-3 px-4 py-3 sm:px-6">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-7 text-primary-foreground shadow-sm">
        <MessagePrimitive.Parts />
      </div>
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserRound className="size-4" />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  const running = useAuiState((state) => state.message.status?.type === "running");
  const hasContent = useAuiState((state) => state.message.parts.length > 0);
  return (
    <MessagePrimitive.Root className="mx-auto flex w-full max-w-3xl gap-3 px-4 py-3 sm:px-6">
      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm">
        <Bot className="size-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-sm leading-7 shadow-sm">
        <MessagePrimitive.Parts />
        {running && !hasContent ? (
          <span className="flex items-center gap-2 text-muted-foreground" role="status">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
          </span>
        ) : null}
      </div>
    </MessagePrimitive.Root>
  );
}

function ChatThread({ phase }: { phase: WebChatPhase }) {
  const { t } = useTranslation();
  const suggestions = [
    t("deviceChat.suggestionPreference"),
    t("deviceChat.suggestionIdentity"),
    t("deviceChat.suggestionRecall"),
  ];

  return (
    <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
      <ThreadPrimitive.Viewport className="relative flex min-h-0 flex-1 flex-col overflow-y-auto scroll-smooth bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_8%,transparent),_transparent_42%)]">
        <ThreadPrimitive.Empty>
          <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-primary/15">
              <Bot className="size-7" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{t("deviceChat.emptyTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("deviceChat.emptyDescription")}</p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
              {suggestions.map((suggestion) => (
                <ThreadPrimitive.Suggestion asChild key={suggestion} prompt={suggestion} send>
                  <button className="rounded-xl border bg-card/80 px-3 py-3 text-left text-xs leading-5 shadow-sm transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {suggestion}
                  </button>
                </ThreadPrimitive.Suggestion>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages components={{
          AssistantMessage,
          UserMessage,
        }} />

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 z-10 mx-auto mt-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-6">
          <ThreadPrimitive.ScrollToBottom asChild>
            <Button
              aria-label={t("deviceChat.scrollToBottom")}
              className="absolute -top-3 left-1/2 size-9 -translate-x-1/2 rounded-full bg-card shadow-md"
              size="icon"
              variant="outline"
            >
              <ArrowDown className="size-4" />
            </Button>
          </ThreadPrimitive.ScrollToBottom>
          <ComposerPrimitive.Root className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-lg shadow-foreground/5 focus-within:ring-2 focus-within:ring-ring/40">
            <ComposerPrimitive.Input
              aria-label={t("deviceChat.composerLabel")}
              autoFocus
              className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              maxLength={4000}
              placeholder={phase === "ready" ? t("deviceChat.composerPlaceholder") : t("deviceChat.composerWaiting")}
              rows={1}
            />
            <ThreadPrimitive.If running={false}>
              <ComposerPrimitive.Send asChild>
                <Button aria-label={t("deviceChat.send")} className="shrink-0 rounded-xl" size="icon">
                  <Send className="size-4" />
                </Button>
              </ComposerPrimitive.Send>
            </ThreadPrimitive.If>
            <ThreadPrimitive.If running>
              <ComposerPrimitive.Cancel asChild>
                <Button aria-label={t("deviceChat.stop")} className="shrink-0 rounded-xl" size="icon" variant="destructive">
                  <Square className="size-4 fill-current" />
                </Button>
              </ComposerPrimitive.Cancel>
            </ThreadPrimitive.If>
          </ComposerPrimitive.Root>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("deviceChat.saveNotice")}</p>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

const terminalSessionStatuses = new Set(["CLOSED", "FAILED", "REJECTED"]);

function formatMemoryDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function DeviceChatPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const deviceId = searchParams.get("deviceId") || "";
  const agentId = searchParams.get("agentId") || "";
  const [newMemory, setNewMemory] = useState("");
  const chat = useDeviceWebChat(deviceId);

  const runtime = useExternalStoreRuntime({
    convertMessage: (message: DeviceChatMessage) => ({
      content: message.text,
      createdAt: message.createdAt,
      id: message.id,
      role: message.role,
      status: messageStatus(message),
    }),
    isRunning: chat.isRunning,
    isSendDisabled: chat.phase !== "ready" || chat.isRunning,
    messages: chat.messages,
    onCancel: chat.onCancel,
    onNew: chat.onNew,
  });

  const memoriesQuery = useQuery({
    enabled: Boolean(deviceId),
    queryFn: () => getDeviceMemories(deviceId),
    queryKey: ["device-memories", deviceId, chat.memoryRevision],
    select: normalizeDeviceMemories,
  });
  const sessionStatusQuery = useQuery({
    enabled: Boolean(deviceId && chat.session?.sessionId),
    queryFn: () => getWebChatSession(deviceId, chat.session?.sessionId || ""),
    queryKey: ["web-chat-session", deviceId, chat.session?.sessionId],
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return chat.phase === "finalizing"
        && (!status || !terminalSessionStatuses.has(status))
        ? 2_000
        : false;
    },
  });
  const memoryMutation = useMutation({
    mutationFn: (content: string) => createDeviceMemory(deviceId, content),
    onSuccess: async () => {
      setNewMemory("");
      await queryClient.invalidateQueries({ queryKey: ["device-memories", deviceId] });
      toast.success(t("deviceChat.memoryAdded"));
    },
  });

  useEffect(() => {
    if (sessionStatusQuery.data && terminalSessionStatuses.has(sessionStatusQuery.data.status)) {
      void queryClient.invalidateQueries({ queryKey: ["device-memories", deviceId] });
    }
  }, [deviceId, queryClient, sessionStatusQuery.data]);

  const serverStatus = sessionStatusQuery.data?.status;
  const effectivePhase = serverStatus === "CLOSED"
    ? "finished"
    : serverStatus === "FAILED" || serverStatus === "REJECTED"
      ? "failed"
      : chat.phase;
  const deviceName = chat.session?.deviceAlias || t("deviceChat.deviceFallback");
  const memoryStatus = chat.memoryReceipt?.status || sessionStatusQuery.data?.memoryStatus;
  const backPath = agentId
    ? `/device-management?agentId=${encodeURIComponent(agentId)}`
    : "/device-management";
  const phaseLabel = t(`deviceChat.phase.${effectivePhase}`);
  const connectionReady = effectivePhase === "ready";
  const memoryItems = memoriesQuery.data || [];
  const canAddMemory = newMemory.trim().length > 0 && newMemory.trim().length <= 1000;

  const formattedExpiry = useMemo(() => {
    if (!chat.session?.maxSessionSeconds) return undefined;
    return Math.ceil(chat.session.maxSessionSeconds / 60);
  }, [chat.session?.maxSessionSeconds]);

  if (!deviceId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("deviceChat.missingDeviceTitle")}</AlertTitle>
          <AlertDescription>{t("deviceChat.missingDeviceDescription")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6 lg:h-[calc(100dvh-2rem)] lg:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild size="icon" variant="outline">
              <Link aria-label={t("deviceChat.backToDevices")} to={backPath}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{t("deviceChat.title")}</h1>
                <Badge variant={connectionReady ? "default" : "secondary"}>
                  {connectionReady ? <Wifi className="mr-1 size-3" /> : <WifiOff className="mr-1 size-3" />}
                  {phaseLabel}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {deviceName}{chat.session?.deviceMac ? ` · ${chat.session.deviceMac}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(chat.phase === "failed" || chat.phase === "disconnected") ? (
              <Button onClick={chat.retry} variant="outline">
                <RefreshCcw className="size-4" />{t("common.retry")}
              </Button>
            ) : null}
            <Button
              disabled={chat.phase !== "ready" || chat.isRunning}
              onClick={chat.finish}
              variant="outline"
            >
              {chat.phase === "finalizing" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {t("deviceChat.finish")}
            </Button>
          </div>
        </header>

        {chat.error ? (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>{t("deviceChat.connectionIssue")}</AlertTitle>
            <AlertDescription>{chat.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="flex min-h-[680px] min-w-0 flex-col overflow-hidden lg:min-h-0">
            <ChatThread phase={chat.phase} />
          </Card>

          <aside className="flex min-h-0 flex-col gap-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  {connectionReady ? <Wifi className="size-4 text-emerald-500" /> : <LoaderCircle className={cn("size-4", chat.phase === "connecting" && "animate-spin")} />}
                  {t("deviceChat.sessionTitle")}
                </CardTitle>
                <CardDescription>{t("deviceChat.sessionDescription", { minutes: formattedExpiry || 15 })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("deviceChat.sessionState")}</span>
                  <span className="font-medium">{serverStatus || phaseLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("deviceChat.memoryState")}</span>
                  <Badge variant={memoryStatus === "FAILED" ? "destructive" : "secondary"}>{memoryStatus || "IDLE"}</Badge>
                </div>
                {(chat.memoryReceipt?.message || sessionStatusQuery.data?.message) ? (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    {chat.memoryReceipt?.message || sessionStatusQuery.data?.message}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="flex min-h-[420px] flex-1 flex-col overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="size-4 text-primary" />{t("deviceChat.memoriesTitle")}
                    </CardTitle>
                    <CardDescription className="mt-1">{t("deviceChat.memoriesDescription")}</CardDescription>
                  </div>
                  <Button
                    aria-label={t("deviceChat.refreshMemories")}
                    disabled={memoriesQuery.isFetching}
                    onClick={() => void memoriesQuery.refetch()}
                    size="icon"
                    variant="ghost"
                  >
                    <RefreshCcw className={cn("size-4", memoriesQuery.isFetching && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="space-y-2">
                  <Textarea
                    aria-label={t("deviceChat.addMemoryLabel")}
                    maxLength={1000}
                    onChange={(event) => setNewMemory(event.target.value)}
                    placeholder={t("deviceChat.addMemoryPlaceholder")}
                    rows={3}
                    value={newMemory}
                  />
                  <Button
                    className="w-full"
                    disabled={!canAddMemory || memoryMutation.isPending}
                    onClick={async () => {
                      try {
                        await memoryMutation.mutateAsync(newMemory.trim());
                      } catch (mutationError) {
                        toast.error(getErrorMessage(mutationError, t("deviceChat.memoryAddFailed")));
                      }
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    {memoryMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    {t("deviceChat.addMemory")}
                  </Button>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {memoriesQuery.isPending ? (
                    <div className="flex h-28 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-muted-foreground" /></div>
                  ) : memoriesQuery.isError ? (
                    <Alert variant="destructive">
                      <AlertTitle>{t("deviceChat.memoriesUnavailable")}</AlertTitle>
                      <AlertDescription>{getErrorMessage(memoriesQuery.error, t("deviceChat.memoriesUnavailable"))}</AlertDescription>
                    </Alert>
                  ) : memoryItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-5 text-center text-xs leading-5 text-muted-foreground">{t("deviceChat.noMemories")}</div>
                  ) : memoryItems.map((memory) => {
                    const date = memory.updatedAt || memory.createdAt;
                    return (
                      <div className="rounded-xl border bg-muted/25 p-3" key={memory.id}>
                        <p className="text-sm leading-6">{memory.memory}</p>
                        {date ? (
                          <time className="mt-2 block text-[11px] text-muted-foreground">
                            {formatMemoryDate(date, i18n.language)}
                          </time>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
