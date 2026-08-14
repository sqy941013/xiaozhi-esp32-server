import { LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
import { KNOWLEDGE_NAME_PATTERN } from "@/features/media/media-utils";
import type {
  KnowledgeBase,
  KnowledgeBaseInput,
  RagModel,
} from "@/features/media/types";

interface KnowledgeBaseDialogProps {
  knowledgeBase: KnowledgeBase | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: KnowledgeBaseInput) => void | Promise<void>;
  open: boolean;
  pending: boolean;
  ragModels: readonly RagModel[];
  ragModelsPending: boolean;
}

export function KnowledgeBaseDialog({
  knowledgeBase,
  onOpenChange,
  onSubmit,
  open,
  pending,
  ragModels,
  ragModelsPending,
}: KnowledgeBaseDialogProps) {
  if (!open) return null;
  return (
    <OpenKnowledgeBaseDialog
      knowledgeBase={knowledgeBase}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      pending={pending}
      ragModels={ragModels}
      ragModelsPending={ragModelsPending}
    />
  );
}

function OpenKnowledgeBaseDialog({
  knowledgeBase,
  onOpenChange,
  onSubmit,
  pending,
  ragModels,
  ragModelsPending,
}: Omit<KnowledgeBaseDialogProps, "open">) {
  const { t } = useTranslation();
  const [form, setForm] = useState<KnowledgeBaseInput>(() => ({
    description: knowledgeBase?.description || "",
    name: knowledgeBase?.name || "",
    ragModelId: knowledgeBase?.ragModelId || "",
    status: knowledgeBase?.status === 0 ? 0 : 1,
  }));
  const [submitted, setSubmitted] = useState(false);
  const selectedRagModelId = form.ragModelId || ragModels[0]?.id || "";

  const errors = useMemo(() => ({
    description: !form.description.trim()
      ? t("mediaCenter.knowledgeBaseDialog.descriptionRequired")
      : form.description.trim().length > 300
        ? t("mediaCenter.knowledgeBaseDialog.descriptionLength")
        : "",
    name: !form.name.trim()
      ? t("mediaCenter.knowledgeBaseDialog.nameRequired")
      : form.name.trim().length > 50
        ? t("mediaCenter.knowledgeBaseDialog.nameLength")
        : !KNOWLEDGE_NAME_PATTERN.test(form.name.trim())
          ? t("mediaCenter.knowledgeBaseDialog.namePattern")
          : "",
    ragModelId: selectedRagModelId ? "" : t("mediaCenter.knowledgeBaseDialog.ragModelRequired"),
  }), [form, selectedRagModelId, t]);
  const valid = !errors.description && !errors.name && !errors.ragModelId;

  async function submit() {
    setSubmitted(true);
    if (!valid) return;
    await onSubmit({
      ...form,
      description: form.description.trim(),
      name: form.name.trim(),
      ragModelId: selectedRagModelId,
    });
  }

  return (
    <Dialog onOpenChange={(next) => !pending && onOpenChange(next)} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(knowledgeBase
              ? "mediaCenter.knowledgeBaseManagement.editKnowledgeBase"
              : "mediaCenter.knowledgeBaseManagement.addKnowledgeBase")}
          </DialogTitle>
          <DialogDescription>
            {t("mediaCenter.knowledgeBaseDialog.descriptionPlaceholder")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 overflow-y-auto px-6 py-1">
          <div className="grid gap-2">
            <Label htmlFor="knowledge-name">{t("mediaCenter.knowledgeBaseDialog.name")}</Label>
            <Input
              aria-invalid={Boolean(submitted && errors.name)}
              id="knowledge-name"
              maxLength={50}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={t("mediaCenter.knowledgeBaseDialog.namePlaceholder")}
              value={form.name}
            />
            {submitted && errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="knowledge-description">{t("mediaCenter.knowledgeBaseDialog.description")}</Label>
            <Textarea
              aria-invalid={Boolean(submitted && errors.description)}
              id="knowledge-description"
              maxLength={300}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder={t("mediaCenter.knowledgeBaseDialog.descriptionPlaceholder")}
              rows={5}
              value={form.description}
            />
            <div className="flex justify-between gap-3 text-xs text-muted-foreground">
              <span className="text-destructive">{submitted ? errors.description : ""}</span>
              <span>{form.description.length}/300</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="knowledge-rag">{t("mediaCenter.knowledgeBaseDialog.ragModel")}</Label>
            <select
              aria-invalid={Boolean(submitted && errors.ragModelId)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              disabled={ragModelsPending}
              id="knowledge-rag"
              onChange={(event) => setForm((current) => ({ ...current, ragModelId: event.target.value }))}
              value={selectedRagModelId}
            >
              <option value="">{t("mediaCenter.knowledgeBaseDialog.ragModelPlaceholder")}</option>
              {ragModels.map((model) => model.id ? (
                <option key={model.id} value={model.id}>{model.modelName || model.id}</option>
              ) : null)}
            </select>
            {submitted && errors.ragModelId ? <p className="text-xs text-destructive">{errors.ragModelId}</p> : null}
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
            <div>
              <Label htmlFor="knowledge-status">{t("mediaCenter.knowledgeBaseDialog.status")}</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(form.status === 1
                  ? "mediaCenter.knowledgeBaseDialog.statusEnabled"
                  : "mediaCenter.knowledgeBaseDialog.statusDisabled")}
              </p>
            </div>
            <Switch
              checked={form.status === 1}
              id="knowledge-status"
              onCheckedChange={(checked) => setForm((current) => ({ ...current, status: checked ? 1 : 0 }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={pending} onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t("mediaCenter.knowledgeBaseDialog.cancel")}
          </Button>
          <Button disabled={pending || ragModelsPending} onClick={() => void submit()} type="button">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {t("mediaCenter.knowledgeBaseDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
