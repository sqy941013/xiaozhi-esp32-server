import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  Boxes,
  Copy,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading } from "@/components/page-heading";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  deleteModel,
  getModelPage,
  setDefaultModel,
  setModelEnabled,
} from "@/features/models/model-api";
import { ModelFormDialog } from "@/features/models/model-form-dialog";
import { safeExternalUrl } from "@/features/models/model-utils";
import { TimbreDialog } from "@/features/models/timbre-dialog";
import {
  MODEL_TYPES,
  type ModelConfig,
  type ModelType,
} from "@/features/models/types";
import { cn } from "@/lib/utils";

type ModelDialogState =
  | { mode: "add"; model: null }
  | { mode: "duplicate" | "edit"; model: ModelConfig };

function validModelType(value: string | null): ModelType {
  return MODEL_TYPES.includes(value as ModelType) ? (value as ModelType) : "LLM";
}

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function ModelConfigPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const modelType = validModelType(searchParams.get("type"));
  const page = positiveInteger(searchParams.get("page"), 1);
  const pageSize = positiveInteger(searchParams.get("limit"), 10);
  const search = searchParams.get("search") || "";
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<ModelDialogState | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [defaultCandidate, setDefaultCandidate] = useState<ModelConfig | null>(null);
  const [voiceModel, setVoiceModel] = useState<ModelConfig | null>(null);

  const modelsQuery = useQuery({
    queryFn: () =>
      getModelPage({ limit: pageSize, modelName: search, modelType, page }),
    queryKey: ["models", { modelType, page, pageSize, search }],
  });
  const models = modelsQuery.data?.list || [];
  const total = modelsQuery.data?.total || 0;

  function updateQuery(
    patch: Partial<{
      limit: number;
      page: number;
      search: string;
      type: ModelType;
    }>,
  ) {
    setSelectedIds(new Set());
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (patch.type !== undefined) next.set("type", patch.type);
      if (patch.page !== undefined) next.set("page", String(patch.page));
      if (patch.limit !== undefined) next.set("limit", String(patch.limit));
      if (patch.search !== undefined) {
        if (patch.search) next.set("search", patch.search);
        else next.delete("search");
      }
      return next;
    });
  }

  const statusMutation = useMutation({
    mutationFn: ({ enabled, id }: { enabled: boolean; id: string }) =>
      setModelEnabled(id, enabled),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success(
        t(
          variables.enabled
            ? "modelCenter.feedback.modelEnabled"
            : "modelCenter.feedback.modelDisabled",
        ),
      );
    },
  });
  const defaultMutation = useMutation({
    mutationFn: setDefaultModel,
    onSuccess: async () => {
      setDefaultCandidate(null);
      await queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success(t("modelCenter.feedback.defaultUpdated"));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => deleteModel(id)));
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          t("modelCenter.feedback.partialDeleteFailed", {
            count: failures.length,
          }),
        );
      }
    },
    onSuccess: async () => {
      setDeleteIds([]);
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success(t("modelCenter.feedback.modelsDeleted"));
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
        getErrorMessage(error, t("modelCenter.feedback.modelDeleteFailed")),
      );
    }
  }

  async function confirmDefault() {
    if (!defaultCandidate) return;
    try {
      await defaultMutation.mutateAsync(defaultCandidate.id);
    } catch (error) {
      toast.error(
        getErrorMessage(error, t("modelCenter.feedback.defaultUpdateFailed")),
      );
    }
  }

  const selectableModels = models.filter((model) => model.isDefault !== 1);
  const allSelected =
    selectableModels.length > 0 &&
    selectableModels.every((model) => selectedIds.has(model.id));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/provider-management">
                <Boxes className="size-4" />
                {t("modelCenter.actions.manageProviders")}
              </Link>
            </Button>
            <Button onClick={() => setDialogState({ mode: "add", model: null })}>
              <Plus className="size-4" />
              {t("modelCenter.actions.addModel")}
            </Button>
          </>
        }
        description={t("modelCenter.models.description")}
        eyebrow={t("modelCenter.eyebrow")}
        title={t("modelCenter.models.title")}
      />

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/15 p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MODEL_TYPES.map((type) => (
              <button
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
                  type === modelType &&
                    "bg-background text-primary shadow-sm ring-1 ring-border",
                )}
                key={type}
                onClick={() => {
                  updateQuery({ page: 1, type });
                  setSelectedIds(new Set());
                }}
                type="button"
              >
                {t(`modelCenter.types.${type}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            className="flex min-w-0 flex-1 gap-2"
            key={search}
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateQuery({
                page: 1,
                search: String(formData.get("modelSearch") || "").trim(),
              });
            }}
          >
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={t("modelCenter.models.searchPlaceholder")}
                className="pl-9"
                defaultValue={search}
                name="modelSearch"
                placeholder={t("modelCenter.models.searchPlaceholder")}
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="size-4" />
              {t("modelCenter.actions.search")}
            </Button>
          </form>
          <div className="flex items-center gap-3">
            {modelsQuery.isFetching && !modelsQuery.isPending ? (
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
            ) : null}
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
          </div>
        </div>

        {modelsQuery.isError ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTitle>{t("modelCenter.feedback.loadFailed")}</AlertTitle>
              <AlertDescription>
                {getErrorMessage(
                  modelsQuery.error,
                  t("modelCenter.feedback.loadFailed"),
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    aria-label={t("modelCenter.actions.selectAll")}
                    checked={allSelected}
                    onChange={(event) =>
                      setSelectedIds(
                        event.target.checked
                          ? new Set(selectableModels.map((model) => model.id))
                          : new Set(),
                      )
                    }
                  />
                </th>
                <th className="px-4 py-3">{t("modelCenter.columns.id")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.name")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.provider")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.enabled")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.default")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.sort")}</th>
                <th className="px-4 py-3 text-right">{t("modelCenter.columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {modelsQuery.isPending ? (
                <tr>
                  <td className="h-56 text-center text-muted-foreground" colSpan={8}>
                    <LoaderCircle className="mx-auto mb-2 size-5 animate-spin" />
                    {t("common.loading")}
                  </td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td className="h-56 text-center text-muted-foreground" colSpan={8}>
                    <Boxes className="mx-auto mb-3 size-9 opacity-40" />
                    {t("modelCenter.models.empty")}
                  </td>
                </tr>
              ) : (
                models.map((model) => {
                  const isDefault = model.isDefault === 1;
                  const documentationUrl = safeExternalUrl(model.docLink);
                  const statusPending =
                    statusMutation.isPending && statusMutation.variables?.id === model.id;
                  return (
                    <tr className="transition-colors hover:bg-muted/25" key={model.id}>
                      <td className="px-4 py-3">
                        <Checkbox
                          aria-label={model.modelName}
                          checked={selectedIds.has(model.id)}
                          disabled={isDefault}
                          onChange={(event) =>
                            toggleSelected(model.id, event.target.checked)
                          }
                          title={
                            isDefault
                              ? t("modelCenter.models.defaultCannotDelete")
                              : undefined
                          }
                        />
                      </td>
                      <td className="max-w-52 truncate px-4 py-3 font-mono text-xs" title={model.id}>
                        {model.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{model.modelName}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{model.modelCode}</span>
                          {documentationUrl ? (
                            <a
                              aria-label={t("modelCenter.form.documentation")}
                              href={documentationUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {String(model.configJson.type || t("modelCenter.models.unknown"))}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {statusPending ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Switch
                              aria-label={t("modelCenter.columns.enabled")}
                              checked={model.isEnabled === 1}
                              disabled={statusMutation.isPending || isDefault}
                              onCheckedChange={async (enabled) => {
                                try {
                                  await statusMutation.mutateAsync({
                                    enabled,
                                    id: model.id,
                                  });
                                } catch (error) {
                                  toast.error(
                                    getErrorMessage(
                                      error,
                                      t("modelCenter.feedback.statusUpdateFailed"),
                                    ),
                                  );
                                }
                              }}
                              title={
                                isDefault
                                  ? t("modelCenter.models.defaultCannotDisable")
                                  : undefined
                              }
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isDefault ? (
                          <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Star className="size-3 fill-current" />
                            {t("modelCenter.models.defaultBadge")}
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => setDefaultCandidate(model)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <Star className="size-4" />
                            {t("modelCenter.actions.setDefault")}
                          </Button>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{model.sort}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {modelType === "TTS" ? (
                            <Button
                              aria-label={t("modelCenter.actions.manageVoices")}
                              onClick={() => setVoiceModel(model)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <AudioLines className="size-4" />
                            </Button>
                          ) : null}
                          <Button
                            aria-label={t("modelCenter.actions.editModel")}
                            onClick={() => setDialogState({ mode: "edit", model })}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            aria-label={t("modelCenter.actions.duplicateModel")}
                            onClick={() => setDialogState({ mode: "duplicate", model })}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            aria-label={t("modelCenter.actions.deleteModel")}
                            disabled={isDefault}
                            onClick={() => setDeleteIds([model.id])}
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

        <Pagination
          label={t("modelCenter.pagination.summary")}
          nextLabel={t("modelCenter.pagination.next")}
          onPageChange={(nextPage) => updateQuery({ page: nextPage })}
          onPageSizeChange={(limit) => updateQuery({ limit, page: 1 })}
          page={page}
          pageSize={pageSize}
          pageSizeLabel={t("modelCenter.pagination.pageSize")}
          previousLabel={t("modelCenter.pagination.previous")}
          total={total}
        />
      </Card>

      {dialogState ? (
        <ModelFormDialog
          mode={dialogState.mode}
          model={dialogState.model}
          modelType={modelType}
          onOpenChange={(open) => !open && setDialogState(null)}
          open
        />
      ) : null}
      <TimbreDialog
        key={voiceModel?.id || "closed"}
        model={voiceModel}
        onOpenChange={(open) => !open && setVoiceModel(null)}
        open={Boolean(voiceModel)}
      />
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("modelCenter.actions.confirmDelete")}
        description={t("modelCenter.models.deleteDescription", {
          count: deleteIds.length,
        })}
        onConfirm={confirmDelete}
        onOpenChange={(open) => !open && setDeleteIds([])}
        open={deleteIds.length > 0}
        pending={deleteMutation.isPending}
        title={t("modelCenter.models.deleteTitle")}
        variant="destructive"
      />
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("modelCenter.actions.confirmDefault")}
        description={t("modelCenter.models.defaultDescription", {
          name: defaultCandidate?.modelName || "",
        })}
        onConfirm={confirmDefault}
        onOpenChange={(open) => !open && setDefaultCandidate(null)}
        open={Boolean(defaultCandidate)}
        pending={defaultMutation.isPending}
        title={t("modelCenter.models.defaultTitle")}
      />
    </div>
  );
}
