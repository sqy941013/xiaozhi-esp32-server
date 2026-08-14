import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createModel,
  getModel,
  getProvidersForType,
  updateModel,
} from "@/features/models/model-api";
import {
  buildConfigPayload,
  isMaskedValue,
  isSensitiveField,
  parseStructuredField,
  stringifyStructuredValue,
  validateModelId,
} from "@/features/models/model-utils";
import type {
  JsonRecord,
  ModelConfig,
  ModelMutationInput,
  ModelProvider,
  ModelType,
  ProviderFieldDefinition,
} from "@/features/models/types";

type ModelFormMode = "add" | "duplicate" | "edit";

interface ModelFormDialogProps {
  mode: ModelFormMode;
  model?: ModelConfig | null;
  modelType: ModelType;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

interface FormState {
  configValues: JsonRecord;
  docLink: string;
  enabled: boolean;
  id: string;
  modelCode: string;
  modelName: string;
  providerCode: string;
  remark: string;
  sort: string;
}

const EMPTY_FORM: FormState = {
  configValues: {},
  docLink: "",
  enabled: true,
  id: "",
  modelCode: "",
  modelName: "",
  providerCode: "",
  remark: "",
  sort: "1",
};

function providerValues(
  provider: ModelProvider | undefined,
  config: JsonRecord,
  redactStoredSecrets: boolean,
): JsonRecord {
  if (!provider) return {};
  return Object.fromEntries(
    provider.fields.map((field) => {
      const value = config[field.key] ?? field.default ?? "";
      if (
        redactStoredSecrets &&
        (isSensitiveField(field.key) || field.type === "password") &&
        isMaskedValue(value)
      ) {
        return [field.key, ""];
      }
      if (field.type === "dict" || field.type === "array") {
        return [field.key, stringifyStructuredValue(value)];
      }
      if (field.type === "boolean") {
        return [field.key, value === true || value === "true" || value === 1];
      }
      return [field.key, value === null || value === undefined ? "" : String(value)];
    }),
  );
}

function copySuffix(value: string): string {
  return value ? `${value}_copy` : "";
}

export function ModelFormDialog({
  mode,
  model,
  modelType,
  onOpenChange,
  open,
}: ModelFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initializedKey = useRef("");

  const providersQuery = useQuery({
    enabled: open,
    queryFn: () => getProvidersForType(modelType),
    queryKey: ["model-providers", modelType],
    staleTime: 60_000,
  });
  const detailQuery = useQuery({
    enabled: open && mode !== "add" && Boolean(model?.id),
    queryFn: () => getModel(model?.id || ""),
    queryKey: ["model", model?.id],
  });

  const sourceModel = mode === "add" ? null : detailQuery.data;
  const providers = useMemo(
    () => providersQuery.data || [],
    [providersQuery.data],
  );
  const selectedProvider = providers.find(
    (provider) => provider.providerCode === form.providerCode,
  );

  useEffect(() => {
    if (!open) {
      initializedKey.current = "";
      return;
    }

    if (mode === "add") {
      const key = `add:${modelType}`;
      if (initializedKey.current !== key) {
        setForm(EMPTY_FORM);
        setErrors({});
        initializedKey.current = key;
      }
      return;
    }

    if (!sourceModel) return;
    const providerCode = String(sourceModel.configJson.type || "");
    const provider = providers.find(
      (item) => item.providerCode === providerCode,
    );
    const key = `${mode}:${sourceModel.id}:${providerCode}:${providers.length}`;
    if (initializedKey.current === key) return;

    const duplicate = mode === "duplicate";
    setForm({
      configValues: providerValues(provider, sourceModel.configJson, true),
      docLink: sourceModel.docLink || "",
      enabled: sourceModel.isEnabled === 1,
      id: "",
      modelCode: duplicate
        ? copySuffix(sourceModel.modelCode)
        : sourceModel.modelCode,
      modelName: duplicate
        ? `${sourceModel.modelName} ${t("modelCenter.form.copySuffix")}`
        : sourceModel.modelName,
      providerCode,
      remark: sourceModel.remark || "",
      sort: String(sourceModel.sort),
    });
    setErrors({});
    initializedKey.current = key;
  }, [mode, modelType, open, providers, sourceModel, t]);

  const mutation = useMutation({
    mutationFn: async (input: {
      modelInput: ModelMutationInput;
      providerCode: string;
    }) => {
      if (mode === "edit" && sourceModel) {
        return updateModel(
          modelType,
          input.providerCode,
          sourceModel.id,
          input.modelInput,
        );
      }
      return createModel(modelType, input.providerCode, input.modelInput);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success(
        t(
          mode === "edit"
            ? "modelCenter.feedback.modelUpdated"
            : mode === "duplicate"
              ? "modelCenter.feedback.modelDuplicated"
              : "modelCenter.feedback.modelCreated",
        ),
      );
      onOpenChange(false);
    },
  });

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function updateConfigValue(key: string, value: unknown) {
    setForm((current) => ({
      ...current,
      configValues: { ...current.configValues, [key]: value },
    }));
    setErrors((current) => ({ ...current, [`config.${key}`]: "" }));
  }

  function handleProviderChange(providerCode: string) {
    const provider = providers.find(
      (item) => item.providerCode === providerCode,
    );
    const useOriginal =
      mode === "edit" &&
      sourceModel &&
      sourceModel.configJson.type === providerCode;
    setForm((current) => ({
      ...current,
      configValues: providerValues(
        provider,
        useOriginal ? sourceModel.configJson : {},
        Boolean(useOriginal),
      ),
      providerCode,
    }));
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.modelName.trim()) {
      nextErrors.modelName = t("modelCenter.validation.modelName");
    }
    if (!form.modelCode.trim()) {
      nextErrors.modelCode = t("modelCenter.validation.modelCode");
    }
    if (!form.providerCode || !selectedProvider) {
      nextErrors.providerCode = t("modelCenter.validation.provider");
    }
    if (!validateModelId(form.id.trim())) {
      nextErrors.id = t("modelCenter.validation.modelId");
    }

    const configValues = { ...form.configValues };
    for (const field of selectedProvider?.fields || []) {
      if (field.type !== "array" && field.type !== "dict") continue;
      const value = String(configValues[field.key] || "").trim();
      if (!value) {
        configValues[field.key] = field.type === "array" ? [] : {};
        continue;
      }
      try {
        configValues[field.key] = parseStructuredField(value, field.type);
      } catch {
        nextErrors[`config.${field.key}`] = t(
          field.type === "array"
            ? "modelCenter.validation.jsonArray"
            : "modelCenter.validation.jsonObject",
        );
      }
    }

    if (Object.values(nextErrors).some(Boolean) || !selectedProvider) {
      setErrors(nextErrors);
      return;
    }

    const modelInput: ModelMutationInput = {
      configJson: buildConfigPayload(
        selectedProvider.fields,
        form.providerCode,
        configValues,
        {
          editing: mode === "edit",
          originalConfig: sourceModel?.configJson,
        },
      ),
      docLink: form.docLink.trim(),
      id: mode === "edit" ? sourceModel?.id : form.id.trim(),
      isDefault: mode === "edit" ? sourceModel?.isDefault || 0 : 0,
      isEnabled: form.enabled ? 1 : 0,
      modelCode: form.modelCode.trim(),
      modelName: form.modelName.trim(),
      remark: form.remark.trim(),
      sort: Number(form.sort) || 0,
    };

    try {
      await mutation.mutateAsync({
        modelInput,
        providerCode: form.providerCode,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error, t("modelCenter.feedback.modelSaveFailed")),
      );
    }
  }

  const loading =
    providersQuery.isPending ||
    (mode !== "add" && detailQuery.isPending);
  const loadError = providersQuery.error || detailQuery.error;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t(`modelCenter.form.title.${mode}`)} · {t(`modelCenter.types.${modelType}`)}
          </DialogTitle>
          <DialogDescription>
            {t("modelCenter.form.description")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
            {t("common.loading")}
          </div>
        ) : loadError ? (
          <>
            <div className="px-6 py-4">
              <Alert variant="destructive">
                <AlertTitle>{t("modelCenter.feedback.loadFailed")}</AlertTitle>
                <AlertDescription>
                  {getErrorMessage(
                    loadError,
                    t("modelCenter.feedback.loadFailed"),
                  )}
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)} type="button">
                {t("common.close")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form className="contents" onSubmit={handleSubmit}>
            <div className="max-h-[calc(90vh-11rem)] space-y-6 overflow-y-auto px-6 py-1">
              {mode === "duplicate" ? (
                <Alert>
                  <AlertTitle>{t("modelCenter.form.duplicateSecretsTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("modelCenter.form.duplicateSecretsDescription")}
                  </AlertDescription>
                </Alert>
              ) : null}

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{t("modelCenter.form.basicInfo")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("modelCenter.form.basicInfoDescription")}
                    </p>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-medium">
                    {t("modelCenter.columns.enabled")}
                    <Switch
                      aria-label={t("modelCenter.columns.enabled")}
                      checked={form.enabled}
                      onCheckedChange={(checked) => updateField("enabled", checked)}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {mode !== "edit" ? (
                    <FormField
                      error={errors.id}
                      label={t("modelCenter.form.modelId")}
                    >
                      <Input
                        aria-label={t("modelCenter.form.modelId")}
                        id="model-id"
                        maxLength={32}
                        onChange={(event) => updateField("id", event.target.value)}
                        placeholder={t("modelCenter.form.modelIdPlaceholder")}
                        value={form.id}
                      />
                    </FormField>
                  ) : (
                    <FormField label={t("modelCenter.form.modelId")}>
                      <Input
                        aria-label={t("modelCenter.form.modelId")}
                        disabled
                        value={sourceModel?.id || ""}
                      />
                    </FormField>
                  )}
                  <FormField
                    error={errors.modelName}
                    label={t("modelCenter.columns.name")}
                    required
                  >
                    <Input
                      aria-label={t("modelCenter.columns.name")}
                      id="model-name"
                      onChange={(event) =>
                        updateField("modelName", event.target.value)
                      }
                      value={form.modelName}
                    />
                  </FormField>
                  <FormField
                    error={errors.modelCode}
                    label={t("modelCenter.form.modelCode")}
                    required
                  >
                    <Input
                      aria-label={t("modelCenter.form.modelCode")}
                      id="model-code"
                      onChange={(event) =>
                        updateField("modelCode", event.target.value)
                      }
                      value={form.modelCode}
                    />
                  </FormField>
                  <FormField
                    error={errors.providerCode}
                    label={t("modelCenter.columns.provider")}
                    required
                  >
                    <select
                      aria-label={t("modelCenter.columns.provider")}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      id="model-provider"
                      onChange={(event) => handleProviderChange(event.target.value)}
                      value={form.providerCode}
                    >
                      <option value="">{t("modelCenter.form.selectProvider")}</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.providerCode}>
                          {provider.name} ({provider.providerCode})
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label={t("modelCenter.columns.sort")}>
                    <Input
                      aria-label={t("modelCenter.columns.sort")}
                      id="model-sort"
                      min={0}
                      onChange={(event) => updateField("sort", event.target.value)}
                      type="number"
                      value={form.sort}
                    />
                  </FormField>
                </div>

                <FormField label={t("modelCenter.form.documentation")}>
                  <Input
                    aria-label={t("modelCenter.form.documentation")}
                    id="model-doc-link"
                    onChange={(event) =>
                      updateField("docLink", event.target.value)
                    }
                    placeholder="https://"
                    type="url"
                    value={form.docLink}
                  />
                </FormField>
                <FormField label={t("modelCenter.form.remark")}>
                  <Textarea
                    aria-label={t("modelCenter.form.remark")}
                    id="model-remark"
                    onChange={(event) => updateField("remark", event.target.value)}
                    value={form.remark}
                  />
                </FormField>
              </section>

              <section className="space-y-4 border-t pt-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{t("modelCenter.form.callInfo")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("modelCenter.form.callInfoDescription")}
                    </p>
                  </div>
                </div>

                {selectedProvider?.fields.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedProvider.fields.map((field) => (
                      <DynamicProviderField
                        error={errors[`config.${field.key}`]}
                        field={field}
                        key={field.key}
                        onChange={(value) => updateConfigValue(field.key, value)}
                        storedSecret={
                          mode === "edit" &&
                          isSensitiveField(field.key) &&
                          isMaskedValue(sourceModel?.configJson[field.key])
                        }
                        value={form.configValues[field.key]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {form.providerCode
                      ? t("modelCenter.form.noProviderFields")
                      : t("modelCenter.form.chooseProviderFirst")}
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
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormField({
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

function DynamicProviderField({
  error,
  field,
  onChange,
  storedSecret,
  value,
}: {
  error?: string;
  field: ProviderFieldDefinition;
  onChange: (value: unknown) => void;
  storedSecret: boolean;
  value: unknown;
}) {
  const { t } = useTranslation();
  const sensitive = isSensitiveField(field.key) || field.type === "password";

  if (field.type === "boolean") {
    return (
      <div className="flex min-h-20 items-center justify-between gap-4 rounded-xl border bg-muted/20 px-4 py-3">
        <div>
          <Label>{field.label}</Label>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {field.key}
          </p>
        </div>
        <Switch
          aria-label={field.label}
          checked={Boolean(value)}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (field.options?.length) {
    const currentValue = String(value ?? "");
    const options = field.options.includes(currentValue)
      ? field.options
      : currentValue
        ? [currentValue, ...field.options]
        : field.options;
    return (
      <FormField error={error} label={field.label}>
        <div className="text-xs text-muted-foreground">
          <code>{field.key}</code>
        </div>
        <select
          aria-label={field.label}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => onChange(event.target.value)}
          value={currentValue}
        >
          {!currentValue ? <option value="" /> : null}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FormField>
    );
  }

  return (
    <FormField error={error} label={field.label}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <code>{field.key}</code>
        {sensitive ? (
          <Badge className="gap-1" variant="outline">
            <KeyRound className="size-3" />
            {storedSecret
              ? t("modelCenter.form.secretStored")
              : t("modelCenter.form.sensitive")}
          </Badge>
        ) : null}
      </div>
      {field.type === "dict" || field.type === "array" ? (
        <Textarea
          aria-label={field.label}
          className="min-h-28 font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.type === "dict" ? '{"key":"value"}' : '["value"]'}
          value={String(value || "")}
        />
      ) : (
        <Input
          aria-label={field.label}
          autoComplete={sensitive ? "new-password" : "off"}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            storedSecret ? t("modelCenter.form.secretPlaceholder") : field.key
          }
          step={field.type === "number" ? "any" : undefined}
          type={sensitive ? "password" : field.type === "number" ? "number" : "text"}
          value={String(value ?? "")}
        />
      )}
    </FormField>
  );
}
