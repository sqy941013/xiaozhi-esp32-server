import { useQuery } from "@tanstack/react-query";
import { Bot, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getAgents } from "@/features/agents/agent-api";

interface AgentSelectProps {
  label?: string;
  onChange: (agentId: string) => void;
  value: string;
}

export function AgentSelect({ label, onChange, value }: AgentSelectProps) {
  const { t } = useTranslation();
  const agentsQuery = useQuery({
    queryFn: () => getAgents(),
    queryKey: ["agents", "selector"],
  });
  const agents = agentsQuery.data || [];

  return (
    <label className="flex min-w-0 items-center gap-2 text-sm font-medium">
      <Bot className="size-4 shrink-0 text-primary" />
      <span className="shrink-0">
        {label || t("agentCenter.addressBookManagement.selectAgent")}
      </span>
      {agentsQuery.isPending ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <select
          aria-label={label || t("agentCenter.addressBookManagement.selectAgent")}
          className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{t("agentCenter.roleConfig.pleaseSelect")}</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.agentName || agent.id}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}
