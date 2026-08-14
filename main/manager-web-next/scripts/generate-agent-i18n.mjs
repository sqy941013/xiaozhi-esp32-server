import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyRoot = path.resolve(projectRoot, "../manager-web/src/i18n");
const outputFile = path.resolve(
  projectRoot,
  "src/i18n/legacy-agent-resources.generated.ts",
);

const locales = {
  de: "de.js",
  en: "en.js",
  ptBR: "pt_BR.js",
  vi: "vi.js",
  zhCN: "zh_CN.js",
  zhTW: "zh_TW.js",
};

const prefixes = [
  "addAgentDialog.",
  "addressBookDialog.",
  "addressBookManagement.",
  "agentSnapshot.",
  "agentTemplateManagement.",
  "chatHistory.",
  "contextProviderDialog.",
  "device.",
  "deviceManagement.",
  "functionDialog.",
  "home.",
  "manualAddDeviceDialog.",
  "roleConfig.",
  "templateQuickConfig.",
  "voicePrint.",
  "voicePrintDialog.",
];

function loadLegacyLocale(filename) {
  const source = fs
    .readFileSync(path.resolve(legacyRoot, filename), "utf8")
    .replace(/^\s*export\s+default\s+/, "");
  return vm.runInNewContext(`(${source})`, Object.create(null));
}

function assignNested(target, dottedKey, value) {
  const parts = dottedKey.split(".");
  let current = target;
  for (const part of parts.slice(0, -1)) {
    if (typeof current[part] !== "object" || current[part] === null) {
      current[part] = current[part] === undefined
        ? {}
        : { $value: current[part] };
    }
    current = current[part];
  }
  const leaf = parts.at(-1);
  if (typeof current[leaf] === "object" && current[leaf] !== null) {
    current[leaf].$value = value;
  } else {
    current[leaf] = value;
  }
}

function convertInterpolation(value) {
  return typeof value === "string"
    ? value.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, "{{$1}}")
    : value;
}

const resources = {};
for (const [locale, filename] of Object.entries(locales)) {
  const legacy = loadLegacyLocale(filename);
  const selected = {};
  for (const [key, value] of Object.entries(legacy)) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      assignNested(selected, key, convertInterpolation(value));
    }
  }
  resources[locale] = selected;
}

const output = `// Generated from the legacy Vue locale files. Run pnpm i18n:agent:generate after locale changes.\nexport const legacyAgentResources = ${JSON.stringify(resources, null, 2)} as const;\n`;
fs.writeFileSync(outputFile, output);
