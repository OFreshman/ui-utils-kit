import { describe, expect, it } from "vitest";
import * as business from "../packages/core/src/business";
import * as common from "../packages/core/src/common";
import * as root from "../packages/core/src/index";
import * as tree from "../packages/core/src/tree-operations";

const businessExports = ["captureElementAsImage"];
const commonExports = [
  "Mutex",
  "createSelfCorrectingClock",
  "createSelfCorrectingCountdown",
  "desensitize",
  "safeJsonParse"
];
const treeExports = [
  "CheckStatus",
  "buildTree",
  "mergeTrees",
  "removeNodesFromTree",
  "searchTreeWithRelations",
  "selectRelatedNodes",
  "treeToArr",
  "updateTreeCheckStatus",
  "updateTreeCheckStatusFlat"
];

function sortedKeys(value: object): string[] {
  return Object.keys(value).sort();
}

describe("public exports", () => {
  it("keeps subpath entry points explicit", () => {
    expect(sortedKeys(common)).toEqual(commonExports);
    expect(sortedKeys(tree)).toEqual(treeExports);
    expect(sortedKeys(business)).toEqual(businessExports);
  });

  it("re-exports every runtime API and namespace from the root", () => {
    expect(sortedKeys(root)).toEqual([
      ...businessExports,
      ...commonExports,
      ...treeExports,
      "business",
      "common",
      "tree"
    ].sort());

    expect(root.common).toEqual(common);
    expect(root.tree).toEqual(tree);
    expect(root.business).toEqual(business);
  });
});