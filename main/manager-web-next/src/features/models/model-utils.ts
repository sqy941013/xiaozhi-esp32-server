import type {
  JsonRecord,
  ModelConfig,
  ProviderFieldDefinition,
  ProviderFieldType,
} from "@/features/models/types";

const SENSITIVE_FIELD_NAMES = new Set([
  "access_key_secret",
  "access_token",
  "api_key",
  "api_secret",
  "appkey",
  "authorization",
  "credential",
  "credentials",
  "password",
  "personal_access_token",
  "private_key",
  "secret",
  "secret_id",
  "secret_key",
  "token",
]);

const PROVIDER_FIELD_TYPES = new Set<ProviderFieldType>([
  "array",
  "boolean",
  "dict",
  "number",
  "password",
  "RAG",
  "string",
]);

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSensitiveField(fieldName: string): boolean {
  const normalized = fieldName.trim().toLowerCase();
  return (
    SENSITIVE_FIELD_NAMES.has(normalized) ||
    normalized.endsWith("_api_key") ||
    normalized.endsWith("_password") ||
    normalized.endsWith("_secret") ||
    normalized.endsWith("_token")
  );
}

export function isMaskedValue(value: unknown): value is string {
  return typeof value === "string" && /\*{4,}/.test(value);
}

function normalizeFieldType(type: unknown): ProviderFieldType {
  if (type === "float" || type === "int" || type === "integer") {
    return "number";
  }
  return typeof type === "string" && PROVIDER_FIELD_TYPES.has(type as ProviderFieldType)
    ? (type as ProviderFieldType)
    : "string";
}

export function parseProviderFields(value: unknown): ProviderFieldDefinition[] {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    if (!isRecord(item)) return [];
    const key = typeof item.key === "string" ? item.key.trim() : "";
    if (!key) return [];
    const options = Array.isArray(item.options)
      ? item.options
          .filter(
            (option): option is number | string =>
              typeof option === "number" || typeof option === "string",
          )
          .map(String)
      : [];
    return [
      {
        key,
        label:
          typeof item.label === "string" && item.label.trim()
            ? item.label.trim()
            : key,
        type: normalizeFieldType(item.type),
        ...(item.default !== undefined ? { default: item.default } : {}),
        ...(typeof item.dict_name === "string"
          ? { dict_name: item.dict_name }
          : {}),
        ...(options.length ? { options } : {}),
      },
    ];
  });
}

export function normalizeConfigJson(value: unknown): JsonRecord {
  if (isRecord(value)) {
    if (isRecord(value.raw)) return { ...value.raw };
    return { ...value };
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function normalizeModelConfig(
  model: Partial<ModelConfig> & { configJson?: unknown },
): ModelConfig {
  return {
    ...model,
    configJson: normalizeConfigJson(model.configJson),
    id: model.id || "",
    isDefault: Number(model.isDefault) === 1 ? 1 : 0,
    isEnabled: Number(model.isEnabled) === 1 ? 1 : 0,
    modelCode: model.modelCode || "",
    modelName: model.modelName || "",
    modelType: model.modelType || "",
    sort: Number(model.sort) || 0,
  };
}

export function stringifyStructuredValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function parseStructuredField(
  value: string,
  type: "array" | "dict",
): unknown {
  const parsed: unknown = JSON.parse(value);
  if (type === "array" && Array.isArray(parsed)) return parsed;
  if (type === "dict" && isRecord(parsed)) return parsed;
  throw new Error(type === "array" ? "expectedArray" : "expectedObject");
}

export function coerceProviderValue(
  value: unknown,
  field: ProviderFieldDefinition,
): unknown {
  if (field.type === "boolean") return Boolean(value);
  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) return "";
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : value;
  }
  return value;
}

export function buildConfigPayload(
  fields: ProviderFieldDefinition[],
  providerCode: string,
  values: JsonRecord,
  options: { editing: boolean; originalConfig?: JsonRecord },
): JsonRecord {
  const result: JsonRecord = { type: providerCode };

  for (const field of fields) {
    const value = values[field.key];
    const originalValue = options.originalConfig?.[field.key];

    if (
      options.editing &&
      (isSensitiveField(field.key) || field.type === "password") &&
      (value === "" || value === undefined || isMaskedValue(value)) &&
      isMaskedValue(originalValue)
    ) {
      continue;
    }

    result[field.key] = coerceProviderValue(
      value === undefined ? field.default ?? "" : value,
      field,
    );
  }

  return result;
}

export function validateModelId(value: string): boolean {
  return value === "" || /^[A-Za-z0-9_-]{1,32}$/.test(value);
}

export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function safeMediaUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  return safeExternalUrl(trimmed);
}
