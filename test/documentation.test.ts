import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import * as business from "../packages/core/src/business";
import * as common from "../packages/core/src/common";
import * as tree from "../packages/core/src/tree-operations";

const documentationPages = {
  business: new URL("../docs/api/business.md", import.meta.url),
  common: new URL("../docs/api/common.md", import.meta.url),
  tree: new URL("../docs/api/tree.md", import.meta.url)
};

describe("public documentation", () => {
  it.each([
    ["business", business],
    ["common", common],
    ["tree", tree]
  ] as const)("documents every runtime export from %s", async (page, module) => {
    const content = await readFile(documentationPages[page], "utf8");

    for (const exportedName of Object.keys(module)) {
      expect(content, `${exportedName} is missing from docs/api/${page}.md`)
        .toContain(exportedName);
    }
  });

  it("keeps the README focused and links to task-oriented docs", async () => {
    const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

    expect(readme).toContain("完整文档");
    expect(readme).toContain("guide/getting-started");
    expect(readme).toContain("api/tree");
    expect(readme).toContain("guide/faq");
  });
});