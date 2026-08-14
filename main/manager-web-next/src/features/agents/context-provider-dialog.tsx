import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { isHttpUrl } from "@/features/agents/agent-utils";
import type { ContextProvider } from "@/features/agents/types";

interface HeaderDraft {
  key: string;
  value: string;
}

interface ProviderDraft {
  headers: HeaderDraft[];
  url: string;
}

interface ContextProviderDialogProps {
  onOpenChange: (open: boolean) => void;
  onSave: (providers: ContextProvider[]) => void;
  open: boolean;
  providers: readonly ContextProvider[];
}

function toDraft(provider: ContextProvider): ProviderDraft {
  return {
    headers: Object.entries(provider.headers || {}).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value),
    })),
    url: provider.url,
  };
}

function emptyProvider(): ProviderDraft {
  return { headers: [{ key: "", value: "" }], url: "" };
}

export function ContextProviderDialog({
  onOpenChange,
  onSave,
  open,
  providers,
}: ContextProviderDialogProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<ProviderDraft[]>(() =>
    providers.length ? providers.map(toDraft) : [emptyProvider()],
  );

  function updateProvider(index: number, patch: Partial<ProviderDraft>) {
    setDrafts((current) => current.map((draft, draftIndex) =>
      draftIndex === index ? { ...draft, ...patch } : draft));
  }

  function save() {
    const nonEmpty = drafts.filter((draft) => draft.url.trim());
    if (nonEmpty.some((draft) => !isHttpUrl(draft.url.trim()))) {
      toast.error(t("agentCenter.contextProviderDialog.apiUrlPlaceholder"));
      return;
    }
    onSave(nonEmpty.map((draft) => ({
      headers: Object.fromEntries(
        draft.headers
          .filter((header) => header.key.trim())
          .map((header) => [header.key.trim(), header.value]),
      ),
      url: draft.url.trim(),
    })));
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("agentCenter.contextProviderDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("agentCenter.roleConfig.tooltip.contextProvider")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[62vh] space-y-4 overflow-y-auto px-6 py-2">
          {drafts.map((draft, providerIndex) => (
            <div className="space-y-4 rounded-xl border bg-muted/10 p-4" key={providerIndex}>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor={`context-url-${providerIndex}`}>
                    {t("agentCenter.contextProviderDialog.apiUrl")}
                  </Label>
                  <Input
                    id={`context-url-${providerIndex}`}
                    onChange={(event) => updateProvider(providerIndex, { url: event.target.value })}
                    placeholder={t("agentCenter.contextProviderDialog.apiUrlPlaceholder")}
                    value={draft.url}
                  />
                </div>
                <Button
                  aria-label="remove context provider"
                  onClick={() => setDrafts((current) => current.filter((_, index) => index !== providerIndex))}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Minus className="size-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{t("agentCenter.contextProviderDialog.requestHeaders")}</Label>
                {draft.headers.map((header, headerIndex) => (
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" key={headerIndex}>
                    <Input
                      aria-label={t("agentCenter.contextProviderDialog.headerKeyPlaceholder")}
                      onChange={(event) => updateProvider(providerIndex, {
                        headers: draft.headers.map((item, index) => index === headerIndex
                          ? { ...item, key: event.target.value }
                          : item),
                      })}
                      placeholder={t("agentCenter.contextProviderDialog.headerKeyPlaceholder")}
                      value={header.key}
                    />
                    <Input
                      aria-label={t("agentCenter.contextProviderDialog.headerValuePlaceholder")}
                      onChange={(event) => updateProvider(providerIndex, {
                        headers: draft.headers.map((item, index) => index === headerIndex
                          ? { ...item, value: event.target.value }
                          : item),
                      })}
                      placeholder={t("agentCenter.contextProviderDialog.headerValuePlaceholder")}
                      value={header.value}
                    />
                    <Button
                      aria-label="remove header"
                      onClick={() => updateProvider(providerIndex, {
                        headers: draft.headers.filter((_, index) => index !== headerIndex),
                      })}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Minus className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => updateProvider(providerIndex, {
                    headers: [...draft.headers, { key: "", value: "" }],
                  })}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Plus className="size-4" />
                  {t("agentCenter.contextProviderDialog.addHeader")}
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={() => setDrafts((current) => [...current, emptyProvider()])} type="button" variant="outline">
            <Plus className="size-4" />
            {t("agentCenter.contextProviderDialog.add")}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t("agentCenter.contextProviderDialog.cancel")}
          </Button>
          <Button onClick={save} type="button">
            {t("agentCenter.contextProviderDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
