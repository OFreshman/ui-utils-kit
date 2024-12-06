<div align="center">
  <h1>ui-utils-kit</h1>
  <span>ui-utils-kit 是一个高效的偏业务前端工具函数库</span>
</div>

<br>

# UI Utils Kit

## 简介

`ui-utils-kit` 是一个包含常用树形数据操作和管理工具的前端库。它提供了多种功能，包括构建树形结构、扁平化树结构、更新节点选中状态、查找相关节点等，帮助开发者更高效地操作树形数据。

## 安装

通过 npm 安装：

```bash
npm install ui-utils-kit
```

或通过 yarn 安装：

```bash
yarn add ui-utils-kit
```

## 使用方法

### 1. 构建树形结构

`buildTree` 用于根据给定的节点数据构建树形结构。

#### 参数

- `nodes`（`Array<TreeNode>`）：节点数据数组，每个节点包含 `id` 和 `pid` 等属性。
- `preserveChildren`（`boolean`，可选）：是否保留原节点的 `children` 属性。

#### 示例

```typescript
import { buildTree } from 'ui-utils-kit';

const nodes = [
  { id: 1, pid: null, name: 'Root' },
  { id: 2, pid: 1, name: 'Child 1' },
  { id: 3, pid: 1, name: 'Child 2' },
];

const tree = buildTree(nodes);
console.log(tree);
```

### 2. 将树形结构转换为扁平化数组

`treeToArr` 将树形数据扁平化为数组，便于操作。

#### 参数

- `data`（`Array<TreeNode>`）：树形数据，包含 `id`, `name` 和可选的 `children` 属性。

#### 示例

```typescript
import { treeToArr } from 'ui-utils-kit';

const tree = [
  { id: 1, pid: null, name: 'Root', children: [{ id: 2, pid: 1, name: 'Child 1' }] },
];

const flatArray = treeToArr(tree);
console.log(flatArray);
```

### 3. 更新树节点选中状态

`updateTreeCheckStatus` 用于更新树形结构中节点的选中状态，包括子节点和父节点的状态。

#### 参数

- `tree`（`Array<TreeNode>`）：树形结构的节点数组。
- `selectedNodes`（`Array<TreeNode>`）：选中的节点数组。

#### 示例

```typescript
import { updateTreeCheckStatus } from 'ui-utils-kit';

const tree = [
  { id: 1, pid: null, name: 'Root', check: 'Unchecked', children: [{ id: 2, pid: 1, name: 'Child 1', check: 'Unchecked' }] },
];

const selectedNodes = [{ id: 2, pid: 1, name: 'Child 1', check: 'Checked' }];

const updatedTree = updateTreeCheckStatus(tree, selectedNodes);
console.log(updatedTree);
```

### 4. 查找相关节点

`searchTreeWithRelations` 根据关键词查找相关节点，并返回匹配的节点及其父子节点。

#### 参数

- `treeArr`（`Array<TreeNode>`）：树形数据数组。
- `keywords`（`string`）：用于查找的关键词，匹配节点的 `name` 属性。
- `mark`（`boolean`，可选）：是否标记匹配的节点。

#### 示例

```typescript
import { searchTreeWithRelations } from 'ui-utils-kit';

const tree = [
  { id: 1, pid: null, name: 'Root' },
  { id: 2, pid: 1, name: 'Child 1' },
  { id: 3, pid: 1, name: 'Child 2' },
];

const results = searchTreeWithRelations(tree, 'Child 1');
console.log(results);
```

### 5. 从树形结构中移除指定节点

`removeNodesFromTree` 用于从树形数据中移除指定的节点及其子节点。

#### 参数

- `treeArr`（`Array<TreeNode>`）：树形结构数组。
- `selectedNodes`（`Array<TreeNode>`）：要移除的节点数组。

#### 示例

```typescript
import { removeNodesFromTree } from 'ui-utils-kit';

const tree = [
  { id: 1, pid: null, name: 'Root' },
  { id: 2, pid: 1, name: 'Child 1' },
  { id: 3, pid: 1, name: 'Child 2' },
];

const nodesToRemove = [{ id: 2, pid: 1, name: 'Child 1' }];
const filteredTree = removeNodesFromTree(tree, nodesToRemove);
console.log(filteredTree);
```

### 6. 合并节点到树形结构

`mergeTrees` 将新的节点合并到现有的树形结构中。

#### 参数

- `treeArr`（`Array<TreeNode>`）：现有的树形结构数组。
- `nodes`（`Array<TreeNode>`）：要合并的节点数组。

#### 示例

```typescript
import { mergeTrees } from 'ui-utils-kit';

const tree = [
  { id: 1, pid: null, name: 'Root' },
];

const newNodes = [
  { id: 2, pid: 1, name: 'Child 1' },
];

const mergedTree = mergeTrees(tree, newNodes);
console.log(mergedTree);
```

### 7. 选择相关节点

`selectRelatedNodes` 用于选择与选中节点相关的父节点和子节点。

#### 参数

- `treeData`（`Array<TreeNode>`）：树形结构数组。
- `selectedNodes`（`Array<TreeNode>`）：选中的节点数组。

#### 示例

```typescript
import { selectRelatedNodes } from 'ui-utils-kit';

const tree = [
  { id: 1, pid: null, name: 'Root' },
  { id: 2, pid: 1, name: 'Child 1' },
  { id: 3, pid: 1, name: 'Child 2' },
];

const selectedNodes = [{ id: 2, pid: 1, name: 'Child 1' }];
const relatedNodes = selectRelatedNodes(tree, selectedNodes);
console.log(relatedNodes);
```

## 类型

### `TreeNode` 类型

每个节点对象都应该包含以下属性：

- `id` (`string | number`)：节点的唯一标识符。
- `pid` (`string | number | null`)：节点的父节点标识符。根节点的 `pid` 为 `null`。
- `name` (`string`)：节点的名称。
- `children` (`TreeNode[]`)：子节点数组，仅对树形结构有效。
- `check` (`CheckStatus`)：节点的选中状态，可选值为 `'Checked' | 'Unchecked' | 'HalfChecked'`。

### `CheckStatus` 枚举

- `Checked`：已选中。
- `Unchecked`：未选中。
- `HalfChecked`：半选中。



### 🏆 License

- MIT [LICENSE](./LICENSE)
