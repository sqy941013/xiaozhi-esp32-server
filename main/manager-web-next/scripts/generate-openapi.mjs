import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const outputPath = path.join(
  projectDirectory,
  "src/api/generated/schema.d.ts",
);
const schemaUrl =
  process.env.OPENAPI_URL ??
  "http://127.0.0.1:18002/xiaozhi/v3/api-docs";

const response = await fetch(schemaUrl);
if (!response.ok) {
  throw new Error(`OpenAPI request failed: ${response.status} ${response.statusText}`);
}

const document = await response.json();
const declaredParameters = document.components?.parameters ?? {};

// Older manager-api builds emitted primitive parameter references without
// declaring them under components.parameters. Normalize those references so
// the migration client can also target servers that predate the annotation fix.
for (const pathItem of Object.values(document.paths ?? {})) {
  for (const operation of Object.values(pathItem ?? {})) {
    if (!operation || typeof operation !== "object") continue;
    for (const parameter of operation.parameters ?? []) {
      const reference = parameter?.$ref;
      if (typeof reference !== "string") continue;
      const prefix = "#/components/parameters/";
      if (!reference.startsWith(prefix)) continue;

      const parameterName = reference.slice(prefix.length);
      if (declaredParameters[parameterName]) continue;

      delete parameter.$ref;
      parameter.schema =
        parameterName.toLowerCase() === "int"
          ? { type: "integer", format: "int32" }
          : { type: "string" };
    }
  }
}

const schema = await openapiTS(document, {
  alphabetize: true,
  immutable: true,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `// Generated from ${schemaUrl}. Do not edit manually.\n${astToString(schema)}`,
  "utf8",
);

process.stdout.write(`Generated OpenAPI types at ${outputPath}\n`);
