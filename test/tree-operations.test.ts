import { describe, expect, it } from "vitest";
import {
  buildTree,
  mergeTrees,
  removeNodesFromTree,
  searchTreeWithRelations,
  selectRelatedNodes,
  treeToArr,
  updateTreeCheckStatus,
  updateTreeCheckStatusFlat
} from "../packages/core/src/tree-operations";
import { CheckStatus } from "../packages/core/src/types/tree-operations-type";
import type { TreeNode } from "../packages/core/src/types/tree-operations-type";

type NamedNode = TreeNode<{ name: string; label?: string }>;

function node(id: string, pid: string | null, name: string): NamedNode {
  return { id, pid, name };
}

describe("tree operations", () => {
  it("使用字符串 ID 构树，并忽略重复、孤儿和成环节点", () => {
    const root = node("root", null, "Root");
    const child = node("child", "root", "Child");
    const duplicate = node("child", null, "Duplicate");
    const orphan = node("orphan", "missing", "Orphan");
    const cycleA = node("cycle-a", "cycle-b", "Cycle A");
    const cycleB = node("cycle-b", "cycle-a", "Cycle B");

    const tree = buildTree([root, child, duplicate, orphan, cycleA, cycleB]);

    expect(tree).toEqual([root]);
    expect(root.children).toEqual([child]);
    expect(root.children?.[0]?.id).toBe("child");
  });

  it("以前序顺序扁平化，并保留扩展字段", () => {
    const tree: NamedNode[] = [{
      id: "root",
      pid: null,
      name: "Root",
      label: "root-label",
      children: [{ id: "child", name: "Child", label: "child-label" }]
    }];

    expect(treeToArr(tree)).toEqual([
      { id: "root", pid: null, name: "Root", label: "root-label", check: CheckStatus.Unchecked },
      { id: "child", pid: "root", name: "Child", label: "child-label", check: CheckStatus.Unchecked }
    ]);
  });

  it("根据选中节点重算嵌套树和扁平树状态", () => {
    const nested: NamedNode[] = [{
      ...node("root", null, "Root"),
      check: CheckStatus.Checked,
      children: [
        { ...node("a", "root", "A"), check: CheckStatus.Checked },
        { ...node("b", "root", "B"), check: CheckStatus.Checked }
      ]
    }];

    updateTreeCheckStatus(nested, [node("a", "root", "A")]);
    expect(nested[0]?.check).toBe(CheckStatus.HalfChecked);
    expect(nested[0]?.children?.map((item) => item.check)).toEqual([
      CheckStatus.Checked,
      CheckStatus.Unchecked
    ]);

    const flat = [
      { ...node("root", null, "Root"), check: CheckStatus.Checked },
      { ...node("a", "root", "A"), check: CheckStatus.Checked },
      { ...node("b", "root", "B"), check: CheckStatus.Checked }
    ];
    updateTreeCheckStatusFlat(flat, [node("b", "root", "B")]);
    expect(flat.map((item) => item.check)).toEqual([
      CheckStatus.HalfChecked,
      CheckStatus.Unchecked,
      CheckStatus.Checked
    ]);
  });

  it("搜索时包含祖先和后代，只标记直接匹配节点", () => {
    const flat = [
      node("root", null, "Root"),
      node("target", "root", "Target"),
      node("child", "target", "Child"),
      node("other", null, "Other")
    ];

    const result = searchTreeWithRelations(flat, "Target");
    expect(result.map((item) => item.id)).toEqual(["root", "target", "child"]);
    expect(result.find((item) => item.id === "target")?.isMatched).toBe(true);
    expect(result.find((item) => item.id === "root")?.isMatched).toBeUndefined();
  });

  it("递归移除后代，并支持乱序合并", () => {
    const flat = [
      node("root", null, "Root"),
      node("child", "root", "Child"),
      node("grandchild", "child", "Grandchild"),
      node("other", null, "Other")
    ];

    expect(removeNodesFromTree(flat, [node("child", "root", "Child")]).map((item) => item.id))
      .toEqual(["root", "other"]);

    const target = [node("root", null, "Root")];
    mergeTrees(target, [
      node("grandchild", "child", "Grandchild"),
      node("child", "root", "Child"),
      node("orphan", "missing", "Orphan")
    ]);
    expect(target.map((item) => item.id)).toEqual(["root", "child", "grandchild"]);
  });

  it("选择节点时返回其祖先和全部后代", () => {
    const flat = [
      node("root", null, "Root"),
      node("target", "root", "Target"),
      node("child", "target", "Child"),
      node("other", null, "Other")
    ];

    expect(selectRelatedNodes(flat, [node("target", "root", "Target")]).map((item) => item.id))
      .toEqual(["root", "target", "child"]);
  });
});