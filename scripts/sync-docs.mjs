import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const sourcePath = new URL("../README.md", import.meta.url);
const targetPath = new URL("../packages/core/README.md", import.meta.url);
const checkOnly = process.argv.includes("--check");
const [source, target] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readFile(targetPath, "utf8").catch(() => "")
]);

if (source === target) {
  console.log("Package README is synchronized.");
} else if (checkOnly) {
  console.error("packages/core/README.md is outdated. Run pnpm docs:sync.");
  process.exitCode = 1;
} else {
  await writeFile(targetPath, source);
  console.log("Synchronized README.md to packages/core/README.md.");
}