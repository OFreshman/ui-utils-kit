
# ui-utils-kit

ui-utils-kit 是一个高效的偏业务前端工具函数库。

[![GitHub Stars](https://img.shields.io/github/stars/OFreshman/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669&logo=GitHub)](https://github.com/OFreshman/ui-utils-kit)
[![NPM Version](https://img.shields.io/npm/v/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669)](https://npmjs.com/package/ui-utils-kit)
[![NPM Downloads](https://img.shields.io/npm/dm/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669)](https://npmjs.com/package/ui-utils-kit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669&label=minzip)](https://bundlephobia.com/result?p=ui-utils-kit)
[![JSDocs](https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669)](https://www.jsdocs.io/package/ui-utils-kit)
[![License](https://img.shields.io/github/license/OFreshman/ui-utils-kit.svg?style=flat&colorA=080f12&colorB=1fa669)](https://github.com/OFreshman/ui-utils-kit/blob/main/LICENSE)

---

## 📌 简介

`ui-utils-kit` 提供两大类常用功能：

- **树形数据操作**
  构建树形结构、扁平化树、更新选中状态、查找相关节点等，帮助你高效管理和操作树状数据。

- **海报制作**
  将 DOM 元素转换为图片（canvas），支持自动下载或返回 Blob 格式数据。
  > 针对跨域图片问题，内置 `html2canvas` proxy 解决方案。

---

## 📦 安装

使用 npm 安装：
```bash
npm install ui-utils-kit
```
使用 yarn 安装：
```bash
yarn add ui-utils-kit
```

---

## 🚀 使用方式

ui-utils-kit 的工具函数分为三大类：`tree`、`business`、`common`，支持两种导入方式：

**方式一：**
```javascript
import { tree } from "ui-utils-kit";
const result = tree.buildTree(nodes);
```

**方式二：**
```javascript
import { buildTree } from "ui-utils-kit";
const result = buildTree(nodes);
```

---

## 🔹 树形数据操作 (tree)

### 1. 构建树形结构

**`tree.buildTree`** 根据节点数据构建树形结构。

- **参数：**
  - `nodes` (`Array<TreeNode>`)：包含 `id` 与 `pid` 的节点数据数组。
  - `preserveChildren` (`boolean`，可选)：是否保留原 `children` 属性。

- **示例：**
  ```typescript
  import { buildTree } from 'ui-utils-kit';

  const nodes = [
    { id: 1, pid: null, name: 'Root' },
    { id: 2, pid: 1, name: 'Child 1' },
  ];

  const tree = buildTree(nodes);
  console.log(tree);
  ```

### 2. 扁平化树形结构

**`tree.treeToArr`** 将树形数据转换为扁平化数组，便于遍历与处理。

- **示例：**
  ```typescript
  import { treeToArr } from 'ui-utils-kit';

  const tree = [{ id: 1, name: 'Root', children: [{ id: 2, name: 'Child 1' }] }];
  const flatArray = treeToArr(tree);
  console.log(flatArray);
  ```

### 3. 更新树节点选中状态

**`tree.updateTreeCheckStatus`** 更新树中节点的选中状态（含子节点与父节点联动）。

- **示例：**
  ```typescript
  import { updateTreeCheckStatus } from 'ui-utils-kit';

  const tree = [
    { id: 1, name: 'Root', check: 'Unchecked', children: [{ id: 2, name: 'Child 1', check: 'Unchecked' }] }
  ];
  const selectedNodes = [{ id: 2, name: 'Child 1', check: 'Checked' }];

  const updatedTree = updateTreeCheckStatus(tree, selectedNodes);
  console.log(updatedTree);
  ```

### 4. 查找相关节点

**`tree.searchTreeWithRelations`** 根据关键词查找匹配节点，同时返回相关的父子关系。

- **示例：**
  ```typescript
  import { searchTreeWithRelations } from 'ui-utils-kit';

  const tree = [
    { id: 1, name: 'Root' },
    { id: 2, name: 'Child 1' },
  ];

  const results = searchTreeWithRelations(tree, 'Child 1');
  console.log(results);
  ```

---

## 🎨 业务函数 (business)

### 1. DOM 转图片

**`captureElementAsImage`** 将 DOM 元素转换为图片（canvas），支持自动下载或返回 Blob 格式数据。
> **⚠️ 注意**
>
> 如果截图元素中存在图片且图片源未设置允许跨域，那么需要后端提供图片转译服务（代码可参考https://github.com/OFreshman/html2canvas-proxy）
>
>虽然个人提供了 `https://h2c-proxy.netlify.app/api/` 服务（使用的是nitro + netlify)去测试处理跨域图片，但流量有限，谨慎使用！！！另外**配置了proxy
> 必须设置`useCORS：false`**，这两个属性时互斥的。
> ```javascript
> captureElementAsImage(element, {
>   proxy: "后端的处理图片服务",
>   useCORS: false
> })
>```

- **方法说明：**

  - **参数：**
    - `element` (`HTMLElement | null`)：目标 DOM 元素。
    - `canvasConfig` (`Partial<Html2canvasOptions>`，可选)：配置项，如 `scale`、`backgroundColor` 等。
    - `outputOptions` (`OutputOptions`，可选)：输出设置，默认为自动下载图片。

  - **示例：**
    ```typescript
    import { captureElementAsImage } from 'ui-utils-kit';

    const element = document.getElementById('capture-area');

    captureElementAsImage(element, { scale: 2 }, { download: true, downloadName: 'screenshot' })
      .then(({ canvas, dataUrl, blob }) => {
        console.log('Canvas:', canvas);
        console.log('Data URL:', dataUrl);
        console.log('Blob:', blob);
      })
      .catch(err => console.error(err));
    ```

---

## 🎨 公共通用函数 (common)

> 当前暂无公共通用函数，后续版本将持续更新。

---

## 📜 类型定义

### `TreeNode` 类型
```typescript
type TreeNode = {
  id: string | number;
  pid: string | number | null;
  name: string;
  children?: TreeNode[];
  check?: 'Checked' | 'Unchecked' | 'HalfChecked';
};
```

### `CheckStatus` 枚举
```typescript
enum CheckStatus {
  Checked = 'Checked',
  Unchecked = 'Unchecked',
  HalfChecked = 'HalfChecked',
}
```

---

## 📜 许可证

- MIT [LICENSE](https://github.com/OFreshman/ui-utils-kit/blob/main/LICENSE)
