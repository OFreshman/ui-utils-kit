# Tree API

从 `ui-utils-kit/tree` 导入树操作和类型：

```ts
import { buildTree, CheckStatus } from "ui-utils-kit/tree";
import type { TreeNode, TreeNodeSelection } from "ui-utils-kit/tree";
```

## 类型

```ts
export type TreeNodeId = string | number;

export const CheckStatus = {
  Unchecked: "0",
  HalfChecked: "1",
  Checked: "2"
} as const;

export type CheckStatusType = "0" | "1" | "2";

export type TreeNode<TExtra extends object = Record<never, never>> = {
  id: TreeNodeId;
  pid?: TreeNodeId | null;
  name?: string;
  check?: CheckStatusType;
  children?: Array<TreeNode<TExtra>>;
  isMatched?: boolean;
} & TExtra;

export type TreeNodeSelection<TExtra extends object = Record<never, never>> =
  | TreeNodeId
  | TreeNode<TExtra>;
```


## `buildTree`

```ts
function buildTree<TExtra extends object>(
  nodes: Array<TreeNode<TExtra>>
): Array<TreeNode<TExtra>>;
```

把扁平节点数组构建为嵌套树。函数会重置首个唯一节点的 `children`；重复 ID 保留第一个，孤儿和成环节点不进入结果。

```ts
const tree = buildTree([
  { id: 1, pid: null, name: "根节点" },
  { id: 2, pid: 1, name: "子节点" }
]);
```

## `treeToArr`

```ts
function treeToArr<TExtra extends object>(
  data: Array<TreeNode<TExtra>>
): Array<TreeNode<TExtra>>;
```

以前序顺序扁平化树，不修改输入。输出会重新计算 `pid`、移除 `children`，并为缺少状态的节点补上 `CheckStatus.Unchecked`。同一个节点对象只访问一次，可避免对象循环导致无限遍历。

## `updateTreeCheckStatus`

```ts
function updateTreeCheckStatus<TExtra extends object>(
  tree: Array<TreeNode<TExtra>>,
  selectedNodes: ReadonlyArray<TreeNodeSelection<TExtra>>
): Array<TreeNode<TExtra>>;
```

原地重算嵌套树的勾选状态。选中节点及全部后代变为选中，祖先根据直接子节点状态变为全选、半选或未选。

## `updateTreeCheckStatusFlat`

```ts
function updateTreeCheckStatusFlat<TExtra extends object>(
  tree: Array<TreeNode<TExtra>>,
  selectedNodes: ReadonlyArray<TreeNodeSelection<TExtra>>
): Array<TreeNode<TExtra>>;
```

与 `updateTreeCheckStatus` 规则一致，但输入是使用 `id` / `pid` 表达层级的扁平数组。函数原地修改 `check`。

## `searchTreeWithRelations`

```ts
function searchTreeWithRelations<TExtra extends object>(
  treeArr?: Array<TreeNode<TExtra>>,
  keywords?: string,
  mark?: boolean
): Array<TreeNode<TExtra>>;
```

返回直接匹配节点、全部祖先和全部后代，并保持输入顺序。默认 `mark = true`，直接匹配节点会以浅拷贝形式增加 `isMatched: true`。

::: info 匹配规则
使用区分大小写的 `name.includes(keywords)`。空字符串会匹配全部节点。
:::

## `removeNodesFromTree`

```ts
function removeNodesFromTree<TExtra extends object>(
  treeArr?: Array<TreeNode<TExtra>>,
  selectedNodes?: ReadonlyArray<TreeNodeSelection<TExtra>>
): Array<TreeNode<TExtra>>;
```

返回移除所选节点及全部后代后的新数组。输入数组不变，保留下来的节点对象仍与输入共享引用。

## `mergeTrees`

```ts
function mergeTrees<TExtra extends object>(
  treeArr?: Array<TreeNode<TExtra>>,
  nodes?: Array<TreeNode<TExtra>>
): Array<TreeNode<TExtra>>;
```

把有效节点原地追加到目标扁平数组。待合并节点可以乱序，函数会确保父节点先于依赖它的子节点加入；已存在 ID、批次内重复 ID、孤儿和成环节点会被忽略。

## `selectRelatedNodes`

```ts
function selectRelatedNodes<TExtra extends object>(
  treeData: Array<TreeNode<TExtra>>,
  selectedNodes?: ReadonlyArray<TreeNodeSelection<TExtra>>
): Array<TreeNode<TExtra>>;
```

返回所选节点、全部祖先和全部后代，结果保持输入顺序。`selectedNodes` 可以混合传入 ID 与节点对象。
