import type {
  FeatureMenu,
  ParamValueType,
  ReplacementValidationError,
} from "@/features/admin/types";

const SENSITIVE_PARAM_NAMES = new Set([
  "access_key_secret",
  "access_token",
  "api_key",
  "mqtt_signature_key",
  "password",
  "personal_access_token",
  "private_key",
  "secret",
  "secret_key",
  "token",
]);

const SPECIAL_REPLACEMENT_CHARACTER = /[!@#$%^&*()_+=[\]{};':"\\<>?/`~]/;

export const FEATURE_GROUP_IDS = {
  featureManagement: [
    "voiceprintRecognition",
    "voiceClone",
    "knowledgeBase",
    "mcpAccessPoint",
    "addressBook",
  ],
  voiceManagement: ["vad", "asr"],
} as const;

export const FEATURE_IDS = [
  ...FEATURE_GROUP_IDS.featureManagement,
  ...FEATURE_GROUP_IDS.voiceManagement,
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

function normalizedParamCode(value: string): string {
  return value.trim().toLowerCase().replace(/[.-]+/g, "_");
}

export function isSensitiveParamCode(value: string): boolean {
  const normalized = normalizedParamCode(value);
  return [...SENSITIVE_PARAM_NAMES].some(
    (name) => normalized === name || normalized.endsWith(`_${name}`),
  );
}

export function maskSensitiveValue(value: string): string {
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

export function normalizeParamValueType(value?: string): ParamValueType {
  return value === "array" ||
    value === "boolean" ||
    value === "json" ||
    value === "number"
    ? value
    : "string";
}

export function formatParamValue(value: string, type: ParamValueType): string {
  if (type === "array") {
    return value
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(";\n");
  }
  if (type === "json") {
    try {
      return JSON.stringify(JSON.parse(value) as unknown, null, 2);
    } catch {
      return value;
    }
  }
  return value;
}

export function serializeParamValue(
  value: string,
  type: ParamValueType,
): string {
  const trimmed = value.trim();
  if (type === "array") {
    return trimmed
      .split(/[;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(";");
  }
  if (type === "boolean") {
    if (trimmed !== "true" && trimmed !== "false") {
      throw new Error("invalidBoolean");
    }
    return trimmed;
  }
  if (type === "number") {
    if (!trimmed || !Number.isFinite(Number(trimmed))) {
      throw new Error("invalidNumber");
    }
    return String(Number(trimmed));
  }
  if (type === "json") {
    return JSON.stringify(JSON.parse(trimmed) as unknown);
  }
  return trimmed;
}

export function replacementLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateReplacementContent(
  content: string,
  maxWordCount = 4_000,
): ReplacementValidationError | null {
  const lines = replacementLines(content);
  if (!lines.length) return { key: "requiredContent" };
  if (lines.length > maxWordCount) {
    return { key: "maxWordCountExceeded", values: { max: maxWordCount } };
  }

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if ((line.match(/\|/g) || []).length !== 1) {
      return { key: "invalidPipeCount", values: { line: lineNumber } };
    }
    const [source, target] = line.split("|").map((part) => part.trim());
    if (!source) return { key: "emptyOriginal", values: { line: lineNumber } };
    if (!target) return { key: "emptyReplacement", values: { line: lineNumber } };
    if (SPECIAL_REPLACEMENT_CHARACTER.test(source)) {
      return { key: "invalidOriginalChar", values: { line: lineNumber } };
    }
    if (SPECIAL_REPLACEMENT_CHARACTER.test(target)) {
      return { key: "invalidReplacementChar", values: { line: lineNumber } };
    }
  }
  return null;
}

export function utf8Size(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function replacementDownloadName(fileName?: string): string {
  const safeName = [...(fileName || "replacement-words")]
    .map((character) =>
      character.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(character)
        ? "_"
        : character,
    )
    .join("")
    .trim();
  return /\.txt$/i.test(safeName) ? safeName : `${safeName || "replacement-words"}.txt`;
}

function defaultFeature(id: FeatureId) {
  return {
    description: `feature.${id}.description`,
    enabled: false,
    name: `feature.${id}.name`,
  };
}

export function buildFeatureMenu(
  current: FeatureMenu,
  enabled: Partial<Record<FeatureId, boolean>>,
): FeatureMenu {
  const features = { ...current.features };
  for (const id of FEATURE_IDS) {
    features[id] = {
      ...defaultFeature(id),
      ...features[id],
      enabled: enabled[id] ?? features[id]?.enabled ?? false,
    };
  }
  return {
    features,
    groups: {
      ...current.groups,
      featureManagement: [...FEATURE_GROUP_IDS.featureManagement],
      voiceManagement: [...FEATURE_GROUP_IDS.voiceManagement],
    },
  };
}

export function resetFeatureMenu(current: FeatureMenu): FeatureMenu {
  return buildFeatureMenu(
    current,
    Object.fromEntries(FEATURE_IDS.map((id) => [id, false])),
  );
}
