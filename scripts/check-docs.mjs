import { readdir, readFile } from "node:fs/promises";

const rootDirectory = new URL("../", import.meta.url);
const docsDirectory = new URL("../docs/", import.meta.url);
const sourceDirectory = new URL("../packages/core/src/", import.meta.url);
const apiDirectory = new URL("../docs/api/", import.meta.url);
const ignoredMarkdownFiles = new Set(["README.md"]);

async function readText(url) {
  return readFile(url, "utf8");
}

async function collectFiles(directory, suffix) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(new URL(`${entry.name}/`, directory), suffix));
    } else if (entry.name.endsWith(suffix)) {
      files.push(url);
    }
  }
  return files;
}

function collectPublicFunctions(source) {
  return [...source.matchAll(/export (?:async )?function (\w+)\s*[<(]/g)].map((match) => match[1]);
}

function collectPublicClasses(source) {
  return [...source.matchAll(/export class (\w+)\s*/g)].map((match) => match[1]);
}

function collectNamedExports(source, keyword = "") {
  const names = [];
  const pattern = new RegExp(`export ${keyword ? `${keyword} ` : ""}\\{([^}]+)\\}`, "g");
  for (const match of source.matchAll(pattern)) {
    names.push(...match[1]
      .split(",")
      .map((name) => name.trim().split(/\s+as\s+/).at(-1))
      .filter(Boolean));
  }
  return names;
}

const [treeSource, commonSource, businessSource] = await Promise.all([
  readText(new URL("tree-operations.ts", sourceDirectory)),
  readText(new URL("common.ts", sourceDirectory)),
  readText(new URL("business.ts", sourceDirectory))
]);

const expectedByPage = new Map([
  ["tree.md", [
    ...collectPublicFunctions(treeSource),
    ...collectNamedExports(treeSource),
    ...collectNamedExports(treeSource, "type")
  ]],
  ["common.md", [
    ...collectPublicFunctions(commonSource),
    ...collectPublicClasses(commonSource),
    ...collectNamedExports(commonSource, "type")
  ]],
  ["business.md", [
    ...collectPublicFunctions(businessSource),
    ...collectNamedExports(businessSource, "type")
  ]]
].map(([page, apiNames]) => [page, [...new Set(apiNames)]]));

const missingApis = [];
for (const [page, expectedApis] of expectedByPage) {
  const content = await readText(new URL(page, apiDirectory));
  for (const api of expectedApis) {
    if (!content.includes(api)) {
      missingApis.push(`${api} (${page})`);
    }
  }
}
if (missingApis.length > 0) {
  throw new Error(`Public APIs missing from docs: ${missingApis.join(", ")}`);
}

const markdownFiles = (await collectFiles(docsDirectory, ".md"))
  .filter((file) => !ignoredMarkdownFiles.has(decodeURIComponent(file.pathname.slice(docsDirectory.pathname.length))));
const existingRoutes = new Set(markdownFiles.map((file) => {
  const relativePath = decodeURIComponent(file.pathname.slice(docsDirectory.pathname.length));
  return relativePath === "index.md" ? "/" : `/${relativePath.replace(/\.md$/, "")}`;
}));
const brokenLinks = [];
for (const file of markdownFiles) {
  const content = await readText(file);
  for (const match of content.matchAll(/\]\((\/[^)#?]*)(?:[?#][^)]*)?\)/g)) {
    const route = match[1];
    if (!existingRoutes.has(route)) {
      brokenLinks.push(`${decodeURIComponent(file.pathname.slice(rootDirectory.pathname.length))} -> ${route}`);
    }
  }
}
if (brokenLinks.length > 0) {
  throw new Error(`Broken internal documentation links: ${brokenLinks.join(", ")}`);
}

const documentedApiCount = [...expectedByPage.values()]
  .reduce((count, apiNames) => count + apiNames.length, 0);
console.log(`Validated ${markdownFiles.length} documentation pages and ${documentedApiCount} public API references.`);