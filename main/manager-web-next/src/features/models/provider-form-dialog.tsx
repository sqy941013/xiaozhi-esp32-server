import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  KeyRound,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getErrorMessage } from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  createProvider,
  updateProvider,
} from "@/features/models/model-api";
import { isSensitiveField } from "@/features/models/model-utils";
import {
  PROVIDER_MODEL_TYPES,
  type ModelProvider,
  type ProviderFieldDefinition,
  type ProviderFieldType,
  type ProviderModelType,
} from "@/features/models/types";

interface EditableField extends ProviderFieldDefinition {
  clientId: string;
}

interface ProviderFormDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  provider?: ModelProvider | null;
}

const FIELD_TYPES: ProviderFieldType[] = [
  "string",
  "password",
  "number",
  "boolean",
  "dict",
  "array",
  "RAG",
];

export function ProviderFormDialog({
  onOpenChange,
  open,
  provider,
}: ProviderFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const nextFieldId = useRef(1);
  const [modelType, setModelType] = useState<ProviderModelType>(
    (provider?.modelType as ProviderModelType) || "LLM",
  );
  const [providerCode, setProviderCode] = useState(provider?.providerCode || "");
  const [name, setName] = useState(provider?.name || "");
  const [sort, setSort] = useState(String(provider?.sort || 0));
  const [fields, setFields] = useState<EditableField[]>(() =>
    (provider?.fields || []).map((field, index) => ({
      ...field,
      clientId: `${provider?.id || "new"}:${index}:${field.key}`,
    })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const editing = Boolean(provider?.id);

  const mutation = useMutation({
    mutationFn: async () => {
      const normalizedFields = fields.map((field) => ({
        default: field.default ?? "",
        key: field.key.trim(),
        label: field.label.trim(),
        type: field.type,
        ...(field.dict_name ? { dict_name: field.dict_name } : {}),
        ...(field.options?.length ? { options: field.options } : {}),
      }));
      const input = {
        fields: normalizedFields,
        modelType,
        name: name.trim(),
        providerCode: providerCode.trim(),
        sort: Number(sort) || 0,
      };
      return editing && provider
        ? updateProvider({ ...input, id: provider.id })
        : createProvider(input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["model-providers"] }),
      ]);
      toast.success(
        t(
          editing
            ? "modelCenter.feedback.providerUpdated"
            : "modelCenter.feedback.providerCreated",
        ),
      );
      onOpenChange(false);
    },
  });

  function addField() {
    setFields((current) => [
      ...current,
      {
        clientId: `new:${nextFieldId.current++}`,
        default: "",
        key: "",
        label: "",
        type: "string",
      },
    ]);
  }

  function updateField(
    clientId: string,
    patch: Partial<ProviderFieldDefinition>,
  ) {
    setFields((current) =>
      current.map((field) =>
        field.clientId === clientId ? { ...field, ...patch } : field,
      ),
    );
    setErrors((current) => ({ ...current, [`field.${clientId}`]: "" }));
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    setFields((current) => {
      const next = [...current];
      const first = next[index];
      const second = next[target];
      if (!first || !second) return current;
      next[index] = second;
      next[target] = first;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!providerCode.trim()) {
      nextErrors.providerCode = t("modelCenter.validation.providerCode");
    }
    if (!name.trim()) nextErrors.name = t("modelCenter.validation.providerName");

    const seenKeys = new Set<string>();
    for (const field of fields) {
      const normalizedKey = field.key.trim();
      if (!normalizedKey || !field.label.trim()) {
        nextErrors[`field.${field.clientId}`] = t(
          "modelCenter.validation.providerField",
        );
      } else if (seenKeys.has(normalizedKey)) {
        nextErrors[`field.${field.clientId}`] = t(
          "modelCenter.validation.duplicateField",
        );
      }
      seenKeys.add(normalizedKey);
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    try {
      await mutation.mutateAsync();
    } catch (error) {
      toast.error(
        getErrorMessage(error, t("modelCenter.feedback.providerSaveFailed")),
      );
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t(
              editing
                ? "modelCenter.providerForm.editTitle"
                : "modelCenter.providerForm.addTitle",
            )}
          </DialogTitle>
          <DialogDescription>
            {t("modelCenter.providerForm.description")}
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-11rem)] space-y-6 overflow-y-auto px-6 py-1">
            {editing ? (
              <Alert>
                <AlertTitle>{t("modelCenter.providerForm.identityLocked")}</AlertTitle>
                <AlertDescription>
                  {t("modelCenter.providerForm.identityLockedDescription")}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("modelCenter.columns.type")}>
                <select
                  aria-label={t("modelCenter.columns.type")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  disabled={editing}
                  onChange={(event) =>
                    setModelType(event.target.value as ProviderModelType)
                  }
                  value={modelType}
                >
                  {PROVIDER_MODEL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`modelCenter.types.${type}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                error={errors.providerCode}
                label={t("modelCenter.columns.providerCode")}
                required
              >
                <Input
                  aria-label={t("modelCenter.columns.providerCode")}
                  disabled={editing}
                  onChange={(event) => setProviderCode(event.target.value)}
                  value={providerCode}
                />
              </Field>
              <Field
                error={errors.name}
                label={t("modelCenter.providerForm.name")}
                required
              >
                <Input
                  aria-label={t("modelCenter.providerForm.name")}
                  onChange={(event) => setName(event.target.value)}
                  value={name}
                />
              </Field>
              <Field label={t("modelCenter.columns.sort")}>
                <Input
                  aria-label={t("modelCenter.columns.sort")}
                  min={0}
                  onChange={(event) => setSort(event.target.value)}
                  type="number"
                  value={sort}
                />
              </Field>
            </div>

            <section className="space-y-4 border-t pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    {t("modelCenter.providerForm.fieldsTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("modelCenter.providerForm.fieldsDescription")}
                  </p>
                </div>
                <Button onClick={addField} size="sm" type="button" variant="outline">
                  <Plus className="size-4" />
                  {t("modelCenter.actions.addField")}
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {t("modelCenter.providerForm.noFields")}
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      className="rounded-xl border bg-muted/15 p-4"
                      key={field.clientId}
                    >
                      <div className="grid gap-3 lg:grid-cols-[1.1fr_1.1fr_0.8fr_1fr_auto] lg:items-end">
                        <Field label={t("modelCenter.providerForm.fieldKey")}>
                          <Input
                            aria-label={t("modelCenter.providerForm.fieldKey")}
                            onChange={(event) =>
                              updateField(field.clientId, { key: event.target.value })
                            }
                            value={field.key}
                          />
                        </Field>
                        <Field label={t("modelCenter.providerForm.fieldLabel")}>
                          <Input
                            aria-label={t("modelCenter.providerForm.fieldLabel")}
                            onChange={(event) =>
                              updateField(field.clientId, { label: event.target.value })
                            }
                            value={field.label}
                          />
                        </Field>
                        <Field label={t("modelCenter.providerForm.fieldType")}>
                          <select
                            aria-label={t("modelCenter.providerForm.fieldType")}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onChange={(event) =>
                              updateField(field.clientId, {
                                type: event.target.value as ProviderFieldType,
                              })
                            }
                            value={field.type}
                          >
                            {FIELD_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {t(`modelCenter.fieldTypes.${type}`)}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label={t("modelCenter.providerForm.defaultValue")}>
                          <Input
                            aria-label={t("modelCenter.providerForm.defaultValue")}
                            onChange={(event) =>
                              updateField(field.clientId, {
                                default: event.target.value,
                              })
                            }
                            value={String(field.default ?? "")}
                          />
                        </Field>
                        <div className="flex items-center gap-1">
                          <Button
                            aria-label={t("modelCenter.actions.moveUp")}
                            disabled={index === 0}
                            onClick={() => moveField(index, -1)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            aria-label={t("modelCenter.actions.moveDown")}
                            disabled={index === fields.length - 1}
                            onClick={() => moveField(index, 1)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            aria-label={t("modelCenter.actions.deleteField")}
                            onClick={() =>
                              setFields((current) =>
                                current.filter(
                                  (item) => item.clientId !== field.clientId,
                                ),
                              )
                            }
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 max-w-xl">
                        <Field label={t("modelCenter.providerForm.fieldOptions")}>
                          <Input
                            aria-label={t("modelCenter.providerForm.fieldOptions")}
                            onChange={(event) =>
                              updateField(field.clientId, {
                                options: event.target.value
                                  .split(",")
                                  .map((option) => option.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="websocket, http"
                            value={(field.options || []).join(", ")}
                          />
                        </Field>
                      </div>
                      <div className="mt-2 flex min-h-5 items-center gap-2">
                        {isSensitiveField(field.key) || field.type === "password" ? (
                          <Badge className="gap-1" variant="outline">
                            <KeyRound className="size-3" />
                            {t("modelCenter.form.sensitive")}
                          </Badge>
                        ) : null}
                        {errors[`field.${field.clientId}`] ? (
                          <p className="text-xs text-destructive">
                            {errors[`field.${field.clientId}`]}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
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
              {mutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  children,
  error,
  label,
  required = false,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
