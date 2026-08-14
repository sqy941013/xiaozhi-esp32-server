import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createTimbre,
  deleteTimbres,
  getTimbrePage,
  updateTimbre,
} from "@/features/models/model-api";
import { safeMediaUrl } from "@/features/models/model-utils";
import type {
  ModelConfig,
  Timbre,
  TimbreMutationInput,
} from "@/features/models/types";

interface TimbreDialogProps {
  model: ModelConfig | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const REFERENCE_PROVIDERS = new Set([
  "fishspeech",
  "gpt_sovits_v2",
  "gpt_sovits_v3",
]);

export function TimbreDialog({ model, onOpenChange, open }: TimbreDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTimbre, setEditingTimbre] = useState<Timbre | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const modelId = model?.id || "";
  const showReferenceFields = REFERENCE_PROVIDERS.has(
    String(model?.configJson.type || ""),
  );

  const timbresQuery = useQuery({
    enabled: open && Boolean(modelId),
    queryFn: () =>
      getTimbrePage({ limit: 10_000, name: search, page: 1, ttsModelId: modelId }),
    queryKey: ["timbres", modelId, search],
  });
  const timbres = timbresQuery.data?.list || [];

  const deleteMutation = useMutation({
    mutationFn: deleteTimbres,
    onSuccess: async () => {
      setDeleteIds([]);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["timbres", modelId] });
      toast.success(t("modelCenter.feedback.voicesDeleted"));
    },
  });

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function confirmDelete() {
    try {
      await deleteMutation.mutateAsync(deleteIds);
    } catch (error) {
      toast.error(
        getErrorMessage(error, t("modelCenter.feedback.voiceDeleteFailed")),
      );
    }
  }

  const allSelected =
    timbres.length > 0 && timbres.every((timbre) => selectedIds.has(timbre.id));

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-[min(96rem,calc(100%-2rem))]">
          <DialogHeader>
            <DialogTitle>
              {t("modelCenter.voices.title")} · {model?.modelName}
            </DialogTitle>
            <DialogDescription>
              {t("modelCenter.voices.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(90vh-10rem)] overflow-y-auto px-6">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearch(searchInput.trim());
                  setSelectedIds(new Set());
                }}
              >
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label={t("modelCenter.voices.searchPlaceholder")}
                    className="pl-9"
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={t("modelCenter.voices.searchPlaceholder")}
                    value={searchInput}
                  />
                </div>
                <Button type="submit" variant="secondary">
                  {t("modelCenter.actions.search")}
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={selectedIds.size === 0}
                  onClick={() => setDeleteIds([...selectedIds])}
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="size-4" />
                  {t("modelCenter.actions.deleteSelected", {
                    count: selectedIds.size,
                  })}
                </Button>
                <Button
                  onClick={() => {
                    setEditingTimbre(null);
                    setFormOpen(true);
                  }}
                  type="button"
                >
                  <Plus className="size-4" />
                  {t("modelCenter.actions.addVoice")}
                </Button>
              </div>
            </div>

            {timbresQuery.isError ? (
              <Alert className="mb-4" variant="destructive">
                <AlertTitle>{t("modelCenter.feedback.loadFailed")}</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(
                    timbresQuery.error,
                    t("modelCenter.feedback.loadFailed"),
                  )}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        aria-label={t("modelCenter.actions.selectAll")}
                        checked={allSelected}
                        onChange={(event) =>
                          setSelectedIds(
                            event.target.checked
                              ? new Set(timbres.map((timbre) => timbre.id))
                              : new Set(),
                          )
                        }
                      />
                    </th>
                    <th className="px-4 py-3">{t("modelCenter.voices.code")}</th>
                    <th className="px-4 py-3">{t("modelCenter.voices.name")}</th>
                    <th className="px-4 py-3">{t("modelCenter.voices.language")}</th>
                    {showReferenceFields ? (
                      <>
                        <th className="px-4 py-3">{t("modelCenter.voices.referenceAudio")}</th>
                        <th className="px-4 py-3">{t("modelCenter.voices.referenceText")}</th>
                      </>
                    ) : (
                      <th className="px-4 py-3">{t("modelCenter.voices.preview")}</th>
                    )}
                    <th className="px-4 py-3">{t("modelCenter.columns.sort")}</th>
                    <th className="px-4 py-3 text-right">{t("modelCenter.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {timbresQuery.isPending ? (
                    <tr>
                      <td
                        className="h-52 text-center text-muted-foreground"
                        colSpan={showReferenceFields ? 8 : 7}
                      >
                        <LoaderCircle className="mx-auto mb-2 size-5 animate-spin" />
                        {t("common.loading")}
                      </td>
                    </tr>
                  ) : timbres.length === 0 ? (
                    <tr>
                      <td
                        className="h-52 text-center text-muted-foreground"
                        colSpan={showReferenceFields ? 8 : 7}
                      >
                        <AudioLines className="mx-auto mb-3 size-9 opacity-40" />
                        {t("modelCenter.voices.empty")}
                      </td>
                    </tr>
                  ) : (
                    timbres.map((timbre) => {
                      const previewUrl = safeMediaUrl(timbre.voiceDemo);
                      return (
                        <tr className="hover:bg-muted/25" key={timbre.id}>
                        <td className="px-4 py-3">
                          <Checkbox
                            aria-label={timbre.name}
                            checked={selectedIds.has(timbre.id)}
                            onChange={(event) =>
                              toggleSelected(timbre.id, event.target.checked)
                            }
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{timbre.ttsVoice}</td>
                        <td className="px-4 py-3 font-medium">{timbre.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{timbre.languages}</Badge>
                        </td>
                        {showReferenceFields ? (
                          <>
                            <td className="max-w-56 truncate px-4 py-3" title={timbre.referenceAudio}>
                              {timbre.referenceAudio || "—"}
                            </td>
                            <td className="max-w-64 truncate px-4 py-3" title={timbre.referenceText}>
                              {timbre.referenceText || "—"}
                            </td>
                          </>
                        ) : (
                          <td className="px-4 py-3">
                            {previewUrl ? (
                              <audio
                                className="h-8 w-56"
                                controls
                                controlsList="nodownload"
                                preload="none"
                                src={previewUrl}
                              />
                            ) : (
                              "—"
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 tabular-nums">{timbre.sort}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              aria-label={t("modelCenter.actions.editVoice")}
                              onClick={() => {
                                setEditingTimbre(timbre);
                                setFormOpen(true);
                              }}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              aria-label={t("modelCenter.actions.deleteVoice")}
                              onClick={() => setDeleteIds([timbre.id])}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <p className="mr-auto text-sm text-muted-foreground">
              {t("modelCenter.voices.total", {
                total: timbresQuery.data?.total || 0,
              })}
            </p>
            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {formOpen ? (
        <TimbreFormDialog
          key={editingTimbre?.id || "new"}
          modelId={modelId}
          onOpenChange={setFormOpen}
          open
          showReferenceFields={showReferenceFields}
          timbre={editingTimbre}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("modelCenter.actions.confirmDelete")}
        description={t("modelCenter.voices.deleteDescription", {
          count: deleteIds.length,
        })}
        onConfirm={confirmDelete}
        onOpenChange={(next) => !next && setDeleteIds([])}
        open={deleteIds.length > 0}
        pending={deleteMutation.isPending}
        title={t("modelCenter.voices.deleteTitle")}
        variant="destructive"
      />
    </>
  );
}

function TimbreFormDialog({
  modelId,
  onOpenChange,
  open,
  showReferenceFields,
  timbre,
}: {
  modelId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  showReferenceFields: boolean;
  timbre: Timbre | null;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    languages: timbre?.languages || "zh-CN",
    name: timbre?.name || "",
    referenceAudio: timbre?.referenceAudio || "",
    referenceText: timbre?.referenceText || "",
    remark: timbre?.remark || "",
    sort: String(timbre?.sort || 0),
    ttsVoice: timbre?.ttsVoice || "",
    voiceDemo: timbre?.voiceDemo || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (input: TimbreMutationInput) =>
      timbre?.id ? updateTimbre(timbre.id, input) : createTimbre(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["timbres", modelId] });
      toast.success(
        t(
          timbre?.id
            ? "modelCenter.feedback.voiceUpdated"
            : "modelCenter.feedback.voiceCreated",
        ),
      );
      onOpenChange(false);
    },
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.ttsVoice.trim()) nextErrors.ttsVoice = t("modelCenter.validation.voiceCode");
    if (!form.name.trim()) nextErrors.name = t("modelCenter.validation.voiceName");
    if (!form.languages.trim()) nextErrors.languages = t("modelCenter.validation.voiceLanguage");
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }
    try {
      await mutation.mutateAsync({
        languages: form.languages.trim(),
        name: form.name.trim(),
        referenceAudio: form.referenceAudio.trim(),
        referenceText: form.referenceText.trim(),
        remark: form.remark.trim(),
        sort: Number(form.sort) || 0,
        ttsModelId: modelId,
        ttsVoice: form.ttsVoice.trim(),
        voiceDemo: form.voiceDemo.trim(),
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error, t("modelCenter.feedback.voiceSaveFailed")),
      );
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(
              timbre?.id
                ? "modelCenter.voices.editTitle"
                : "modelCenter.voices.addTitle",
            )}
          </DialogTitle>
          <DialogDescription>{t("modelCenter.voices.formDescription")}</DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={submit}>
          <div className="grid max-h-[calc(90vh-11rem)] gap-4 overflow-y-auto px-6 sm:grid-cols-2">
            <VoiceField error={errors.ttsVoice} label={t("modelCenter.voices.code")}>
              <Input
                aria-label={t("modelCenter.voices.code")}
                onChange={(event) => update("ttsVoice", event.target.value)}
                value={form.ttsVoice}
              />
            </VoiceField>
            <VoiceField error={errors.name} label={t("modelCenter.voices.name")}>
              <Input
                aria-label={t("modelCenter.voices.name")}
                onChange={(event) => update("name", event.target.value)}
                value={form.name}
              />
            </VoiceField>
            <VoiceField error={errors.languages} label={t("modelCenter.voices.language")}>
              <Input
                aria-label={t("modelCenter.voices.language")}
                onChange={(event) => update("languages", event.target.value)}
                value={form.languages}
              />
            </VoiceField>
            <VoiceField label={t("modelCenter.columns.sort")}>
              <Input
                aria-label={t("modelCenter.columns.sort")}
                min={0}
                onChange={(event) => update("sort", event.target.value)}
                type="number"
                value={form.sort}
              />
            </VoiceField>
            {!showReferenceFields ? (
              <VoiceField label={t("modelCenter.voices.previewUrl")}>
                <Input
                  aria-label={t("modelCenter.voices.previewUrl")}
                  onChange={(event) => update("voiceDemo", event.target.value)}
                  placeholder="https://"
                  type="url"
                  value={form.voiceDemo}
                />
              </VoiceField>
            ) : (
              <>
                <VoiceField label={t("modelCenter.voices.referenceAudio")}>
                  <Input
                    aria-label={t("modelCenter.voices.referenceAudio")}
                    onChange={(event) => update("referenceAudio", event.target.value)}
                    value={form.referenceAudio}
                  />
                </VoiceField>
                <VoiceField label={t("modelCenter.voices.referenceText")}>
                  <Input
                    aria-label={t("modelCenter.voices.referenceText")}
                    onChange={(event) => update("referenceText", event.target.value)}
                    value={form.referenceText}
                  />
                </VoiceField>
              </>
            )}
            <div className="sm:col-span-2">
              <VoiceField label={t("modelCenter.form.remark")}>
                <Textarea
                  aria-label={t("modelCenter.form.remark")}
                  onChange={(event) => update("remark", event.target.value)}
                  value={form.remark}
                />
              </VoiceField>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {t("common.cancel")}
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VoiceField({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
