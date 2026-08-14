import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Cpu,
  History,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Search,
  Settings2,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { PageHeading } from "@/components/page-heading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAgent,
  deleteAgent,
  getAgents,
} from "@/features/agents/agent-api";
import { ChatHistoryDialog } from "@/features/agents/chat-history-dialog";
import type { AgentSummary } from "@/features/agents/types";
import { isFeatureEnabled } from "@/features/auth/auth-api";
import { useAuth } from "@/features/auth/use-auth";
import { MAC_ADDRESS_PATTERN } from "@/features/devices/device-utils";

export function AgentsPage() {
  const { t, i18n } = useTranslation();
  const { publicConfig, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AgentSummary | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [historyAgent, setHistoryAgent] = useState<AgentSummary | null>(null);

  const agentsQuery = useQuery({
    queryFn: () => getAgents(activeSearch ? {
      keyword: activeSearch,
      searchType: MAC_ADDRESS_PATTERN.test(activeSearch) ? "mac" : "name",
    } : {}),
    queryKey: ["agents", { search: activeSearch }],
  });
  const agents = agentsQuery.data || [];
  const totalDevices = agents.reduce((sum, agent) => sum + (agent.deviceCount || 0), 0);

  const createMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: async (agentId) => {
      setCreateOpen(false);
      setNewName("");
      await queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(t("agentCenter.addAgentDialog.addSuccess"));
      void navigate(`/role-config?agentId=${encodeURIComponent(agentId)}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: async () => {
      setDeleteTarget(null);
      setDeleteText("");
      await queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(t("agentCenter.home.deleteSuccess"));
    },
  });

  async function submitCreate() {
    const name = newName.trim();
    if (!name) return;
    try {
      await createMutation.mutateAsync(name);
    } catch (error) {
      toast.error(getErrorMessage(error, t("dashboard.addAgentFailed")));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id || deleteText !== deleteTarget.agentName) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } catch (error) {
      toast.error(getErrorMessage(error, t("agentCenter.home.deleteFailed")));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-3xl border bg-slate-950 text-white shadow-sm">
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,.34),transparent_38%)]" />
          <div className="relative">
            <Badge className="border-white/10 bg-white/10 text-sky-100">{t("dashboard.badge")}</Badge>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("dashboard.welcome", { name: user?.username || t("dashboard.user") })}
            </h1>
            <p className="mt-3 text-slate-300">{t("agentCenter.home.wish")}</p>
          </div>
          <div className="relative grid grid-cols-2 gap-3 self-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><p className="text-2xl font-semibold">{agents.length}</p><p className="text-xs text-slate-400">{t("nav.agents")}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><p className="text-2xl font-semibold">{totalDevices}</p><p className="text-xs text-slate-400">{t("nav.devices")}</p></div>
          </div>
        </div>
      </section>

      <PageHeading
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />{t("agentCenter.home.addAgent")}</Button>}
        description={t("dashboard.moduleAccessDescription")}
        title={t("nav.agents")}
      />

      <form
        className="flex max-w-xl gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setActiveSearch(search.trim());
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={t("agentCenter.device.searchPlaceholder")}
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("agentCenter.device.searchPlaceholder")}
            value={search}
          />
        </div>
        <Button type="submit" variant="secondary"><Search className="size-4" />{t("agentCenter.device.search")}</Button>
      </form>

      {agentsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("agentCenter.roleConfig.fetchConfigFailed")}</AlertTitle>
          <AlertDescription>{getErrorMessage(agentsQuery.error, t("agentCenter.roleConfig.fetchConfigFailed"))}</AlertDescription>
        </Alert>
      ) : null}

      {agentsQuery.isPending ? (
        <div className="flex h-64 items-center justify-center"><LoaderCircle className="size-6 animate-spin text-primary" /></div>
      ) : agents.length === 0 ? (
        <Card><CardContent className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"><Bot className="size-10 opacity-40" /><p>{t("dashboard.noAgents")}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md" key={agent.id}>
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Bot className="size-6" /></div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">{agent.agentName || agent.id}</CardTitle>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{agent.id}</p>
                </div>
                <Badge variant="outline"><Cpu className="mr-1 size-3" />{agent.deviceCount || 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3 text-xs">
                  <div><p className="text-muted-foreground">{t("agentCenter.home.languageModel")}</p><p className="mt-1 truncate font-medium">{agent.llmModelName || "—"}</p></div>
                  <div><p className="text-muted-foreground">{t("agentCenter.home.voiceModel")}</p><p className="mt-1 truncate font-medium">{agent.ttsVoiceName || agent.ttsModelName || "—"}</p></div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><History className="size-3.5" />{t("agentCenter.home.lastConversation")}</span>
                  <span>{agent.lastConnectedAt ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeStyle: "short" }).format(new Date(agent.lastConnectedAt)) : t("agentCenter.home.noConversation")}</span>
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button asChild size="sm"><Link to={`/role-config?agentId=${encodeURIComponent(agent.id || "")}`}><Settings2 className="size-4" />{t("agentCenter.home.configureRole")}</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link to={`/device-management?agentId=${encodeURIComponent(agent.id || "")}`}><Cpu className="size-4" />{t("agentCenter.home.deviceManagement")}</Link></Button>
                  <Button aria-label={t("agentCenter.home.chatHistory")} onClick={() => setHistoryAgent(agent)} size="icon" type="button" variant="ghost"><MessageSquareText className="size-4" /></Button>
                  {isFeatureEnabled(publicConfig, "voiceprintRecognition") ? (
                    <Button asChild size="icon" variant="ghost"><Link aria-label={t("agentCenter.home.voiceprintRecognition")} to={`/voice-print?agentId=${encodeURIComponent(agent.id || "")}`}><UsersRound className="size-4" /></Link></Button>
                  ) : null}
                  <Button aria-label={t("agentCenter.home.deleteConfirmTitle")} className="ml-auto" onClick={() => { setDeleteTarget(agent); setDeleteText(""); }} size="icon" type="button" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog onOpenChange={(open) => !createMutation.isPending && setCreateOpen(open)} open={createOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("agentCenter.addAgentDialog.title")}</DialogTitle><DialogDescription>{t("agentCenter.addAgentDialog.placeholder")}</DialogDescription></DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void submitCreate(); }}>
            <div className="space-y-2 px-6 py-4">
              <Label htmlFor="new-agent-name">{t("agentCenter.addAgentDialog.agentName")}</Label>
              <Input autoFocus id="new-agent-name" maxLength={64} onChange={(event) => setNewName(event.target.value)} placeholder={t("agentCenter.addAgentDialog.placeholder")} value={newName} />
            </div>
            <DialogFooter>
              <Button disabled={createMutation.isPending} onClick={() => setCreateOpen(false)} type="button" variant="outline">{t("agentCenter.addAgentDialog.cancel")}</Button>
              <Button disabled={!newName.trim() || createMutation.isPending} type="submit">{createMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}{t("agentCenter.addAgentDialog.confirm")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !deleteMutation.isPending && !open && setDeleteTarget(null)} open={Boolean(deleteTarget)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("agentCenter.home.deleteConfirmTitle")}</DialogTitle><DialogDescription>{t("agentCenter.home.confirmDeleteAgent", { agentName: deleteTarget?.agentName || "" })}</DialogDescription></DialogHeader>
          <div className="space-y-3 px-6 py-3">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">{deleteTarget?.agentName}</div>
            <Input
              aria-label={t("agentCenter.home.deleteAgentNamePlaceholder")}
              autoComplete="off"
              onChange={(event) => setDeleteText(event.target.value)}
              onPaste={(event) => { event.preventDefault(); toast.warning(t("agentCenter.home.deleteAgentPasteForbidden")); }}
              placeholder={t("agentCenter.home.deleteAgentNamePlaceholder")}
              value={deleteText}
            />
            {deleteText && deleteText !== deleteTarget?.agentName ? <p className="text-xs text-destructive">{t("agentCenter.home.deleteAgentNameMismatch")}</p> : null}
          </div>
          <DialogFooter>
            <Button disabled={deleteMutation.isPending} onClick={() => setDeleteTarget(null)} type="button" variant="outline">{t("common.cancel")}</Button>
            <Button disabled={deleteText !== deleteTarget?.agentName || deleteMutation.isPending} onClick={() => void confirmDelete()} type="button" variant="destructive">{deleteMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{t("agentCenter.home.deleteConfirmTitle")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {historyAgent?.id ? (
        <ChatHistoryDialog
          agentId={historyAgent.id}
          agentName={historyAgent.agentName || ""}
          onOpenChange={(open) => !open && setHistoryAgent(null)}
          open
        />
      ) : null}
    </div>
  );
}
