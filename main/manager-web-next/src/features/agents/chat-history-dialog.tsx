import { useQuery } from "@tanstack/react-query";
import { Bot, Download, LoaderCircle, Play, UserRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { apiResourceUrl, getErrorMessage } from "@/api/client";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createAudioPlayToken,
  createHistoryDownloadToken,
  getChatHistory,
  getChatSessions,
} from "@/features/agents/agent-api";
import { cn } from "@/lib/utils";

interface ChatHistoryDialogProps {
  agentId: string;
  agentName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ChatHistoryDialog({
  agentId,
  agentName,
  onOpenChange,
  open,
}: ChatHistoryDialogProps) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [sessionId, setSessionId] = useState("");
  const sessionsQuery = useQuery({
    enabled: open,
    queryFn: () => getChatSessions(agentId, { limit: 20, page }),
    queryKey: ["agent-chat-sessions", agentId, page],
  });
  const effectiveSessionId = sessionId || sessionsQuery.data?.list[0]?.sessionId || "";
  const messagesQuery = useQuery({
    enabled: open && Boolean(effectiveSessionId),
    queryFn: () => getChatHistory(agentId, effectiveSessionId),
    queryKey: ["agent-chat-history", agentId, effectiveSessionId],
  });

  async function play(audioId: string) {
    try {
      const token = await createAudioPlayToken(audioId);
      const audio = new Audio(apiResourceUrl(`/agent/play/${encodeURIComponent(token)}`));
      await audio.play();
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.roleConfig.audioPlayFailed")));
    }
  }

  async function download(scope: "current" | "previous") {
    if (!effectiveSessionId) return;
    try {
      const token = await createHistoryDownloadToken(agentId, effectiveSessionId);
      window.open(
        apiResourceUrl(`/agent/chat-history/download/${encodeURIComponent(token)}/${scope}`),
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.chatHistory.downloadLinkFailed")));
    }
  }

  return (
    <Dialog onOpenChange={(next) => {
      if (!next) {
        setPage(1);
        setSessionId("");
      }
      onOpenChange(next);
    }} open={open}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("agentCenter.chatHistory.dialogTitle", { agentName })}</DialogTitle>
          <DialogDescription>{agentName}</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-[520px] max-h-[70vh] overflow-hidden lg:grid-cols-[320px_1fr]">
          <aside className="flex min-h-0 flex-col border-r">
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {sessionsQuery.isPending ? (
                <LoaderCircle className="mx-auto mt-16 size-5 animate-spin" />
              ) : (sessionsQuery.data?.list || []).length === 0 ? (
                <p className="mt-16 text-center text-sm text-muted-foreground">
                  {t("agentCenter.chatHistory.noMoreRecords")}
                </p>
              ) : (sessionsQuery.data?.list || []).map((session) => (
                <button
                  className={cn(
                    "mb-2 w-full rounded-lg border px-3 py-3 text-left transition hover:bg-muted",
                    session.sessionId === effectiveSessionId && "border-primary/30 bg-primary/5",
                  )}
                  key={session.sessionId}
                  onClick={() => setSessionId(session.sessionId || "")}
                  type="button"
                >
                  <p className="truncate text-sm font-medium">{session.title || session.sessionId}</p>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{session.chatCount || 0}</span>
                    <span>{session.createdAt ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(new Date(session.createdAt)) : ""}</span>
                  </div>
                </button>
              ))}
            </div>
            <Pagination
              label="{{page}} / {{pages}} · {{total}}"
              nextLabel={t("common.next")}
              onPageChange={(next) => { setPage(next); setSessionId(""); }}
              onPageSizeChange={() => undefined}
              page={page}
              pageSize={20}
              pageSizeLabel={t("common.pageSize")}
              previousLabel={t("common.previous")}
              showPageSize={false}
              total={sessionsQuery.data?.total || 0}
            />
          </aside>
          <section className="flex min-h-0 flex-col">
            <div className="flex flex-wrap justify-end gap-2 border-b p-3">
              <Button disabled={!effectiveSessionId} onClick={() => void download("current")} size="sm" type="button" variant="outline">
                <Download className="size-4" />
                {t("agentCenter.chatHistory.downloadCurrentSession")}
              </Button>
              <Button disabled={!effectiveSessionId} onClick={() => void download("previous")} size="sm" type="button" variant="outline">
                <Download className="size-4" />
                {t("agentCenter.chatHistory.downloadCurrentWithPreviousSessions")}
              </Button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/15 p-4 sm:p-6">
              {!effectiveSessionId ? (
                <p className="mt-20 text-center text-sm text-muted-foreground">{t("agentCenter.chatHistory.selectSession")}</p>
              ) : messagesQuery.isPending ? (
                <LoaderCircle className="mx-auto mt-20 size-5 animate-spin" />
              ) : (messagesQuery.data || []).map((message, index) => {
                const user = String(message.chatType) === "1";
                return (
                  <div className={cn("flex gap-3", !user && "flex-row-reverse")} key={`${message.createdAt}-${index}`}>
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", user ? "bg-slate-200" : "bg-primary text-primary-foreground")}>
                      {user ? <UserRound className="size-4" /> : <Bot className="size-4" />}
                    </div>
                    <div className={cn("max-w-[80%] rounded-2xl border bg-background px-4 py-3 shadow-sm", !user && "bg-primary/5")}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                      <div className="mt-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                        <span>{message.createdAt ? new Intl.DateTimeFormat(i18n.language, { timeStyle: "short" }).format(new Date(message.createdAt)) : ""}</span>
                        {message.audioId ? (
                          <Button aria-label={t("agentCenter.voicePrintDialog.voicePrintVector")} onClick={() => void play(message.audioId || "")} size="icon" type="button" variant="ghost">
                            <Play className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
