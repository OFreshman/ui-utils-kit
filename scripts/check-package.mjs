import { access, readFile } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootPackagePath = new URL("../package.json", import.meta.url);
const corePackagePath = new URL("../packages/core/package.json", import.meta.url);
const coreDirectory = new URL("../packages/core/", import.meta.url);
const [rootPackage, corePackage] = await Promise.all([
  readFile(rootPackagePath, "utf8").then(JSON.parse),
  readFile(corePackagePath, "utf8").then(JSON.parse)
]);

if (rootPackage.version !== corePackage.version) {
  throw new Error(`Version mismatch: root=${rootPackage.version}, core=${corePackage.version}`);
}
if (corePackage.private === true) {
  throw new Error("packages/core must remain publishable (private cannot be true)");
}

function collectExportTargets(value, targets = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("./dist/")) {
      targets.add(value);
    }
    return targets;
  }
  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      collectExportTargets(nestedValue, targets);
    }
  }
  return targets;
}

const exportTargets = collectExportTargets(corePackage.exports);
if (exportTargets.size === 0) {
  throw new Error("packages/core exports do not contain any dist targets");
}
for (const target of exportTargets) {
  await access(new URL(target.slice(2), coreDirectory));
}

if (process.argv.includes("--release")) {
  const tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : undefined;
  if (!tag) {
    throw new Error("Release validation requires a GitHub tag context");
  }
  const expectedTag = `v${corePackage.version}`;
  if (tag !== expectedTag) {
    throw new Error(`Tag mismatch: expected ${expectedTag}, received ${tag}`);
  }
}

console.log(
  `Validated ui-utils-kit@${corePackage.version} with ${exportTargets.size} built export targets in ${fileURLToPath(coreDirectory)}`
);