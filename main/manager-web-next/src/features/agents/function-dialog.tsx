import { useQuery } from "@tanstack/react-query";
import { Check, Copy, LoaderCircle, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getMcpAddress,
  getMcpTools,
  getPluginDefinitions,
} from "@/features/agents/agent-api";
import type {
  AgentFunction,
  PluginDefinition,
  PluginField,
} from "@/features/agents/types";
import { useAuth } from "@/features/auth/use-auth";
import { isFeatureEnabled } from "@/features/auth/auth-api";
import { cn } from "@/lib/utils";

interface FunctionDialogProps {
  agentId: string;
  functions: readonly AgentFunction[];
  onOpenChange: (open: boolean) => void;
  onSave: (functions: AgentFunction[]) => void;
  open: boolean;
}

function defaultParams(plugin: PluginDefinition): Record<string, unknown> {
  return Object.fromEntries(plugin.fields.map((field) => [field.key, field.default]));
}

function ParamField({
  field,
  onChange,
  value,
}: {
  field: PluginField;
  onChange: (value: unknown) => void;
  value: unknown;
}) {
  const { t } = useTranslation();
  const structured = field.type === "array" || field.type === "json";
  const [text, setText] = useState(() => field.type === "array"
    ? (Array.isArray(value) ? value.join("\n") : String(value || ""))
    : field.type === "json"
      ? JSON.stringify(value ?? {}, null, 2)
      : "");
  const [password, setPassword] = useState("");

  if (field.type === "boolean" || field.type === "bool") {
    return (
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <Label>{field.label}</Label>
        <Switch
          aria-label={field.label}
          checked={value === true}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (structured) {
    return (
      <div className="space-y-2">
        <Label htmlFor={`plugin-field-${field.key}`}>{field.label}</Label>
        <Textarea
          id={`plugin-field-${field.key}`}
          onBlur={() => {
            if (field.type === "array") {
              onChange(text.split("\n").map((item) => item.trim()).filter(Boolean));
              return;
            }
            try {
              onChange(JSON.parse(text) as unknown);
            } catch {
              toast.error(t("agentCenter.functionDialog.jsonFormatError"));
            }
          }}
          onChange={(event) => setText(event.target.value)}
          rows={field.type === "json" ? 6 : 3}
          value={text}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`plugin-field-${field.key}`}>{field.label}</Label>
      <Input
        id={`plugin-field-${field.key}`}
        onChange={(event) => {
          if (field.type === "password") setPassword(event.target.value);
          onChange(
            field.type === "number" ? Number(event.target.value) : event.target.value,
          );
        }}
        placeholder={field.remark}
        type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
        value={field.type === "password" ? password : String(value ?? "")}
      />
    </div>
  );
}

export function FunctionDialog({
  agentId,
  functions,
  onOpenChange,
  onSave,
  open,
}: FunctionDialogProps) {
  const { t } = useTranslation();
  const { publicConfig } = useAuth();
  const [drafts, setDrafts] = useState<AgentFunction[]>(() => functions.map((item) => ({
    paramInfo: { ...item.paramInfo },
    pluginId: item.pluginId,
  })));
  const [activeId, setActiveId] = useState(() => functions[0]?.pluginId || "");
  const pluginsQuery = useQuery({
    enabled: open,
    queryFn: getPluginDefinitions,
    queryKey: ["agent-plugin-definitions"],
    staleTime: 60_000,
  });
  const mcpEnabled = isFeatureEnabled(publicConfig, "mcpAccessPoint");
  const mcpQuery = useQuery({
    enabled: open && mcpEnabled,
    queryFn: async () => ({
      address: await getMcpAddress(agentId),
      tools: await getMcpTools(agentId),
    }),
    queryKey: ["agent-mcp", agentId],
    retry: false,
  });

  const plugins = useMemo(() => {
    const values = pluginsQuery.data || [];
    return isFeatureEnabled(publicConfig, "addressBook")
      ? values
      : values.filter((plugin) => plugin.providerCode !== "call_device");
  }, [pluginsQuery.data, publicConfig]);
  const selectedIds = new Set(drafts.map((draft) => draft.pluginId));
  const activePlugin = plugins.find((plugin) => plugin.id === activeId);
  const activeDraft = drafts.find((draft) => draft.pluginId === activeId);

  function toggle(plugin: PluginDefinition) {
    setDrafts((current) => selectedIds.has(plugin.id)
      ? current.filter((item) => item.pluginId !== plugin.id)
      : [...current, { paramInfo: defaultParams(plugin), pluginId: plugin.id }]);
    setActiveId(plugin.id);
  }

  function updateParam(field: PluginField, nextValue: unknown) {
    setDrafts((current) => current.map((draft) => draft.pluginId === activeId
      ? {
          ...draft,
          paramInfo: {
            ...draft.paramInfo,
            [field.key]: field.type === "password" && nextValue === ""
              ? draft.paramInfo[field.key]
              : nextValue,
          },
        }
      : draft));
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("agentCenter.functionDialog.title")}</DialogTitle>
          <DialogDescription>{t("agentCenter.roleConfig.tooltip.intent")}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[68vh] min-h-[420px] overflow-hidden lg:grid-cols-[minmax(220px,.8fr)_minmax(280px,1.2fr)]">
          <div className="overflow-y-auto border-r p-4">
            {pluginsQuery.isPending ? (
              <LoaderCircle className="mx-auto mt-12 size-5 animate-spin" />
            ) : (
              <div className="space-y-2">
                {plugins.map((plugin) => {
                  const selected = selectedIds.has(plugin.id);
                  return (
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition hover:bg-muted",
                        activeId === plugin.id && "border-primary/40 bg-primary/5",
                      )}
                      key={plugin.id}
                      onClick={() => {
                        if (!selected) toggle(plugin);
                        else setActiveId(plugin.id);
                      }}
                      type="button"
                    >
                      <span className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border",
                        selected && "border-primary bg-primary text-primary-foreground",
                      )}>
                        {selected ? <Check className="size-3.5" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{plugin.name}</span>
                      {selected ? (
                        <span
                          className="text-xs text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggle(plugin);
                          }}
                          role="button"
                          tabIndex={0}
                        >×</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="overflow-y-auto p-5">
            {activePlugin && activeDraft ? (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold">{activePlugin.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activePlugin.fields.length
                      ? t("agentCenter.functionDialog.paramConfig")
                      : t("agentCenter.functionDialog.noNeedToConfig")}
                  </p>
                </div>
                {activePlugin.fields.map((field) => (
                  <ParamField
                    field={field}
                    key={`${activeId}-${field.key}`}
                    onChange={(next) => updateParam(field, next)}
                    value={activeDraft.paramInfo[field.key]}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                {t("agentCenter.functionDialog.pleaseSelectFunctionForParam")}
              </div>
            )}

            {mcpEnabled ? (
              <div className="mt-8 space-y-3 rounded-xl border bg-muted/15 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t("agentCenter.functionDialog.mcpAccessPoint")}</h3>
                  <Button onClick={() => void mcpQuery.refetch()} size="icon" type="button" variant="ghost">
                    <RefreshCcw className={cn("size-4", mcpQuery.isFetching && "animate-spin")} />
                  </Button>
                </div>
                {mcpQuery.isError ? (
                  <p className="text-sm text-muted-foreground">
                    {getErrorMessage(mcpQuery.error, t("agentCenter.functionDialog.disconnected"))}
                  </p>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input readOnly value={mcpQuery.data?.address || ""} />
                      <Button
                        disabled={!mcpQuery.data?.address}
                        onClick={async () => {
                          await navigator.clipboard.writeText(mcpQuery.data?.address || "");
                          toast.success(t("agentCenter.functionDialog.copiedToClipboard"));
                        }}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(mcpQuery.data?.tools || []).map((tool) => (
                        <span className="rounded-full border bg-background px-2.5 py-1 text-xs" key={tool}>{tool}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t("agentCenter.functionDialog.cancel")}
          </Button>
          <Button onClick={() => { onSave(drafts); onOpenChange(false); }} type="button">
            {t("agentCenter.functionDialog.saveConfig")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
