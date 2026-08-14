import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  ChevronDown,
  KeyRound,
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
import { PageHeading } from "@/components/page-heading";
import { Pagination } from "@/components/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deleteProviders,
  getProviderPage,
} from "@/features/models/model-api";
import { isSensitiveField } from "@/features/models/model-utils";
import { ProviderFormDialog } from "@/features/models/provider-form-dialog";
import {
  PROVIDER_MODEL_TYPES,
  type ModelProvider,
  type ProviderModelType,
} from "@/features/models/types";

export function ProviderManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modelType, setModelType] = useState<"" | ProviderModelType>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingProvider, setEditingProvider] = useState<ModelProvider | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const providersQuery = useQuery({
    queryFn: () =>
      getProviderPage({ limit: pageSize, modelType, name: search, page }),
    queryKey: ["providers", { modelType, page, pageSize, search }],
  });
  const providers = providersQuery.data?.list || [];
  const total = providersQuery.data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteProviders,
    onSuccess: async () => {
      setSelectedIds(new Set());
      setDeleteIds([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["model-providers"] }),
      ]);
      toast.success(t("modelCenter.feedback.providersDeleted"));
    },
  });

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(providers.map((provider) => provider.id)) : new Set());
  }

  async function confirmDelete() {
    try {
      await deleteMutation.mutateAsync(deleteIds);
    } catch (error) {
      toast.error(
        getErrorMessage(error, t("modelCenter.feedback.providerDeleteFailed")),
      );
    }
  }

  const allSelected =
    providers.length > 0 && providers.every((provider) => selectedIds.has(provider.id));

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeading
        actions={
          <Button
            onClick={() => {
              setEditingProvider(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t("modelCenter.actions.addProvider")}
          </Button>
        }
        description={t("modelCenter.providers.description")}
        eyebrow={t("modelCenter.eyebrow")}
        title={t("modelCenter.providers.title")}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <form className="flex flex-1 flex-col gap-2 sm:flex-row" onSubmit={submitSearch}>
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={t("modelCenter.providers.searchPlaceholder")}
                className="pl-9"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("modelCenter.providers.searchPlaceholder")}
                value={searchInput}
              />
            </div>
            <select
              aria-label={t("modelCenter.providers.typeFilter")}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => {
                setModelType(event.target.value as "" | ProviderModelType);
                setPage(1);
                setSelectedIds(new Set());
              }}
              value={modelType}
            >
              <option value="">{t("modelCenter.types.all")}</option>
              {PROVIDER_MODEL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`modelCenter.types.${type}`)}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              <Search className="size-4" />
              {t("modelCenter.actions.search")}
            </Button>
          </form>
          <Button
            disabled={selectedIds.size === 0}
            onClick={() => setDeleteIds([...selectedIds])}
            type="button"
            variant="outline"
          >
            <Trash2 className="size-4" />
            {t("modelCenter.actions.deleteSelected", { count: selectedIds.size })}
          </Button>
        </div>

        {providersQuery.isError ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTitle>{t("modelCenter.feedback.loadFailed")}</AlertTitle>
              <AlertDescription>
                {getErrorMessage(
                  providersQuery.error,
                  t("modelCenter.feedback.loadFailed"),
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b bg-muted/35 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    aria-label={t("modelCenter.actions.selectAll")}
                    checked={allSelected}
                    onChange={(event) => toggleAll(event.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">{t("modelCenter.columns.type")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.providerCode")}</th>
                <th className="px-4 py-3">{t("modelCenter.providers.name")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.fields")}</th>
                <th className="px-4 py-3">{t("modelCenter.columns.sort")}</th>
                <th className="px-4 py-3 text-right">{t("modelCenter.columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {providersQuery.isPending ? (
                <tr>
                  <td className="h-52 text-center text-muted-foreground" colSpan={7}>
                    <LoaderCircle className="mx-auto mb-2 size-5 animate-spin" />
                    {t("common.loading")}
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td className="h-52 text-center text-muted-foreground" colSpan={7}>
                    <Boxes className="mx-auto mb-3 size-9 opacity-40" />
                    {t("modelCenter.providers.empty")}
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr className="transition-colors hover:bg-muted/25" key={provider.id}>
                    <td className="px-4 py-3">
                      <Checkbox
                        aria-label={provider.name}
                        checked={selectedIds.has(provider.id)}
                        onChange={(event) =>
                          toggleSelected(provider.id, event.target.checked)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {t(`modelCenter.types.${provider.modelType}`, {
                          defaultValue: provider.modelType,
                        })}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {provider.providerCode}
                    </td>
                    <td className="px-4 py-3 font-medium">{provider.name}</td>
                    <td className="px-4 py-3">
                      <details className="group">
                        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-primary hover:underline">
                          {t("modelCenter.providers.viewFields", {
                            count: provider.fields.length,
                          })}
                          <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="mt-2 w-80 rounded-xl border bg-card p-3 shadow-sm">
                          {provider.fields.length ? (
                            <div className="max-h-64 space-y-2 overflow-y-auto">
                              {provider.fields.map((field) => (
                                <div
                                  className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"
                                  key={field.key}
                                >
                                  <div className="min-w-0">
                                    <p className="truncate font-medium">{field.label}</p>
                                    <p className="truncate font-mono text-xs text-muted-foreground">
                                      {field.key}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {isSensitiveField(field.key) || field.type === "password" ? (
                                      <KeyRound className="size-3.5 text-amber-600" />
                                    ) : null}
                                    <Badge variant="outline">{field.type}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t("modelCenter.providerForm.noFields")}
                            </p>
                          )}
                        </div>
                      </details>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{provider.sort}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={t("modelCenter.actions.editProvider")}
                          onClick={() => {
                            setEditingProvider(provider);
                            setFormOpen(true);
                          }}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          aria-label={t("modelCenter.actions.deleteProvider")}
                          onClick={() => setDeleteIds([provider.id])}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          label={t("modelCenter.pagination.summary")}
          nextLabel={t("modelCenter.pagination.next")}
          onPageChange={(nextPage) => {
            setPage(nextPage);
            setSelectedIds(new Set());
          }}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
            setSelectedIds(new Set());
          }}
          page={page}
          pageSize={pageSize}
          pageSizeLabel={t("modelCenter.pagination.pageSize")}
          previousLabel={t("modelCenter.pagination.previous")}
          total={total}
        />
      </Card>

      {formOpen ? (
        <ProviderFormDialog
          key={editingProvider?.id || "new"}
          onOpenChange={setFormOpen}
          open
          provider={editingProvider}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={t("modelCenter.actions.confirmDelete")}
        description={t("modelCenter.providers.deleteDescription", {
          count: deleteIds.length,
        })}
        onConfirm={confirmDelete}
        onOpenChange={(open) => !open && setDeleteIds([])}
        open={deleteIds.length > 0}
        pending={deleteMutation.isPending}
        title={t("modelCenter.providers.deleteTitle")}
        variant="destructive"
      />
    </div>
  );
}
