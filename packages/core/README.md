
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
> 如果截图元素中存在图片且图片源未设置允许跨域，那么需要后端提供图片转译服务（ 代码可参考https://github.com/OFreshman/html2canvas-proxy ）
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

### 1. safeJsonParse<T>(jsonString: string, defaultValue: T): [Error \| null, T]

**功能描述：**
安全地解析 JSON 字符串，如果解析出错则返回默认值和错误对象。

```typescript
export function safeJsonParse<T>(jsonString: string, defaultValue: T): [Error | null, T] {
  try {
    const parsed = JSON.parse(jsonString) as T;
    return [null, parsed];
  } catch (error) {
    console.error("JSON 解析错误:", error);
    return [error instanceof Error ? error : new Error(String(error)), defaultValue];
  }
}
```
**参数**
- `jsonString: string` — 要解析的 JSON 格式字符串。

- `defaultValue: T` — 当解析失败时返回的默认值，类型与期待的解析结果相同。

**返回值**
`[Error | null, T]` — 一个元组：

- 示例
```typescript
const [err, data] = safeJsonParse('{"foo": 42}', { foo: 0 });
if (err) {
  // 处理解析错误
} else {
  console.log(data.foo); // 42
}
```
### 2. desensitize(value: string, type: "mobile" | "idcard"): string
功能描述：对敏感信息（手机号或身份证号）进行脱敏处理，隐藏中间部分。

**参数**
- `value: string` — 原始字符串，如手机号或身份证号。

- `type: "mobile" \| "idcard"` — 数据类型，"mobile" 脱敏手机号，"idcard" 脱敏身份证号。

**返回值**
string — 脱敏后字符串，如果输入非字符串则返回空字符串。
- 示例
```typescript
console.log(desensitize('13812345678', 'mobile'));  // 输出：138****5678
console.log(desensitize('110105199001011234', 'idcard')); // 输出：110105********1234
```

### 3. Mutex 类
功能描述：模拟互斥锁机制，用于控制异步操作对共享资源的访问，确保同一时刻只有一个操作进入临界区。
- 示例

```typescript
import Mutex from './Mutex';

const mutex = new Mutex();

// 初始状态
console.log('初始状态', mutex.isLocked(), mutex.queueLength()); // 初始状态 false 0

// 获取锁
await mutex.lock();
console.log('获取锁后', mutex.isLocked(), mutex.queueLength()); // 获取锁后 true 0

// 第二次请求锁，不会立即获取，加入队列
const pending = mutex.lock().then(() => {
  console.log('第二次获取锁', mutex.isLocked(), mutex.queueLength());
});
console.log('请求队列长度', mutex.queueLength()); // 请求队列长度 1

// 执行临界区代码
// ...

// 释放锁，自动唤醒队列中的下一个请求
mutex.unlock();
console.log('释放锁后', mutex.isLocked(), mutex.queueLength()); // 释放锁后 true 0

await pending; // 等待第二个请求获取锁
// 最后释放锁
mutex.unlock();
console.log('全部完成', mutex.isLocked(), mutex.queueLength()); // 全部完成 false 0
```

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
