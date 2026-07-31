
# ui-utils-kit

**ui-utils-kit** 是一个偏业务的前端工具函数库。

[![GitHub Stars](https://img.shields.io/github/stars/OFreshman/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669&logo=GitHub)](https://github.com/OFreshman/ui-utils-kit)
[![NPM Version](https://img.shields.io/npm/v/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669)](https://npmjs.com/package/ui-utils-kit)
[![NPM Downloads](https://img.shields.io/npm/dm/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669)](https://npmjs.com/package/ui-utils-kit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669&label=minzip)](https://bundlephobia.com/result?p=ui-utils-kit)
[![JSDocs](https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669)](https://www.jsdocs.io/package/ui-utils-kit)
[![License](https://img.shields.io/github/license/OFreshman/ui-utils-kit.svg?style=flat&colorA=080f12&colorB=1fa669)](https://github.com/OFreshman/ui-utils-kit/blob/main/LICENSE)

---
## 📝 changelogs
### TodoList
- `business.captureElementAsImage` 是否增加 html-to-image 可选实现？
---
- 2024-12-06
  - 新增 `tree` 模块，提供树形数据操作的工具函数。
  - 新增 `business` 模块，提供 DOM 转图片的工具函数。
  - 新增 `common` 模块，提供一些常用的业务工具函数。
  - 完善文档说明。
- 2025-04-24
  - 新增 `common.createSelfCorrectingClock` 创建零漂移的自校正实时时钟。
  - 新增 `common.createSelfCorrectingCountdown` 创建零漂移的自校正倒计时器。
  - 完善文档说明。
- 2025-05-08
  - 依赖集中在 `pnpm-workspace.yaml - catalogs` 统一管理。
  - 完善文档说明。
- 2025-05-23
  - 增强脱敏函数（`desensitize`），支持邮箱、银行卡号、姓名。
  - 完善文档说明。
- 2026-07-31
  - 优化 `buildTree`、`mergeTrees` 与 `Mutex` 等深层或大批量场景的处理性能。
  - 树选择类 API 支持直接传入节点 ID；`Mutex` 新增自动释放锁的 `runExclusive`。
  - DOM 截图支持不下载时单独返回 Data URL，并补充非浏览器下载边界提示。
  - CI 增加文档同步、发布包导出检查与跨平台验证；发布流程增加版本和标签一致性检查。

## 📌 简介

`ui-utils-kit` 提供三类常用功能：

- **树形数据操作**
  构建树形结构、扁平化树、更新选中状态、查找相关节点等，帮助你高效管理和操作树状数据。

- **海报制作**
  将 DOM 元素转换为图片（canvas），支持自动下载或返回 Blob 格式数据。
  > 针对跨域图片问题，可传入 `html2canvas` 的 `proxy` 配置。

- **业务工具类函数**
  提供一些常用的业务工具函数，如 JSON 安全解析、敏感信息脱敏等。

---

## 📦 安装

```bash
npm install ui-utils-kit
# 或
yarn add ui-utils-kit
# 或
pnpm add ui-utils-kit
```

如需使用 `business.captureElementAsImage`（DOM 截图），还需安装可选 peer 依赖：

```bash
npm install html2canvas-pro
```

---

## 🚀 使用方式

`ui-utils-kit` 的工具函数分为 `tree`、`business`、`common` 三类，支持根入口和按模块子路径导入：

```typescript
import { buildTree } from "ui-utils-kit";
// 纯工具场景也可以使用子路径，减少无关模块解析：
import { safeJsonParse } from "ui-utils-kit/common";
import { searchTreeWithRelations } from "ui-utils-kit/tree";
// DOM 截图能力：
import { captureElementAsImage } from "ui-utils-kit/business";
```

### 行为约定

- 树节点 ID 支持 `string | number`，不会进行隐式数字转换。
- 勾选、关联选择和移除 API 均可传入节点对象或节点 ID，例如 `[node]`、`["node-id"]`。
- `buildTree`、`mergeTrees` 和勾选状态更新函数会原地修改输入；筛选、搜索和删除函数返回新数组。
- 扁平化、搜索和关联选择结果保持父节点优先的输入顺序；重复 ID 保留首个节点。
- `html2canvas-pro` 是可选 peer，仅在调用 DOM 截图能力时延迟加载。

---

## 🔹 树形数据操作 (tree)

### 1. 构建树形结构

**`tree.buildTree`** 根据节点数据构建树形结构。

- **参数：**
  - `nodes` (`Array<TreeNode>`)：包含 `id` 与 `pid` 的节点数据数组。

- **返回值：**
  - `Array<TreeNode>`：构建后的树形结构数据。

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

**`tree.treeToArr`** 将树形数据转换为扁平化数组，便于遍历与处理。不修改输入。

- **参数：**
  - `data` (`Array<TreeNode>`)：嵌套树结构数据，节点包含 `id` 与可选的 `children`。

- **返回值：**
  - `Array<TreeNode>`：扁平化后的新数组，前序排列。每个节点重新计算 `pid`（根节点为 `null`），不包含 `children`；未设置 `check` 的节点默认为 `"0"`（未选中）。

- **示例：**
  ```typescript
  import { treeToArr } from 'ui-utils-kit';

  const tree = [{ id: 1, name: 'Root', children: [{ id: 2, name: 'Child 1' }] }];
  const flatArray = treeToArr(tree);
  console.log(flatArray);
  ```

### 3. 更新树节点选中状态

**`tree.updateTreeCheckStatus`** 更新嵌套树中节点的选中状态（含子节点与父节点联动）。选中节点的后代全部选中，父节点按子节点状态自动更新为选中 / 半选 / 未选中。会原地修改 `tree`。

- **参数：**
  - `tree` (`Array<TreeNode>`)：嵌套树结构数据。
  - `selectedNodes` (`ReadonlyArray<TreeNode | TreeNodeId>`)：当前选中的节点或节点 ID。

- **返回值：**
  - `Array<TreeNode>`：更新后的树（与输入同一引用）。

- **示例：**
  ```typescript
  import { CheckStatus, updateTreeCheckStatus } from 'ui-utils-kit';

  const tree = [
    {
      id: 1,
      name: 'Root',
      check: CheckStatus.Unchecked,
      children: [{ id: 2, name: 'Child 1', check: CheckStatus.Unchecked }]
    }
  ];
  const selectedNodes = [2];

  const updatedTree = updateTreeCheckStatus(tree, selectedNodes);
  console.log(updatedTree);
  ```

### 4. 更新扁平树的选中状态

**`tree.updateTreeCheckStatusFlat`** 与 `updateTreeCheckStatus` 行为一致，但输入为扁平数组（节点通过 `pid` 关联）。会原地修改 `tree`。

- **参数：**
  - `tree` (`Array<TreeNode>`)：扁平树结构数组，节点包含 `id` 与 `pid`。
  - `selectedNodes` (`ReadonlyArray<TreeNode | TreeNodeId>`)：当前选中的节点或节点 ID。

- **返回值：**
  - `Array<TreeNode>`：更新后的扁平数组（与输入同一引用）。

### 5. 查找相关节点

**`tree.searchTreeWithRelations`** 在扁平树数组中按关键词模糊匹配节点 `name`（`includes`），返回匹配节点及其全部祖先与后代。不修改输入。

- **参数：**
  - `treeArr` (`Array<TreeNode>`)：扁平树结构数组，节点至少包含 `id`、`pid`、`name`。
  - `keywords` (`string`)：用于匹配节点名称的关键词。
  - `mark` (`boolean`，可选)：是否在直接匹配的节点副本上添加 `isMatched: true` 标记，默认 `true`。

- **返回值：**
  - `Array<TreeNode>`：匹配结果数组，包含名称匹配的节点、匹配节点的所有父节点与所有子节点，顺序与原数组一致。

- **示例：**
  ```typescript
  import { searchTreeWithRelations } from 'ui-utils-kit';

  const tree = [
    { id: 1, pid: null, name: 'Root' },
    { id: 2, pid: 1, name: 'Child 1' },
  ];

  const results = searchTreeWithRelations(tree, 'Child 1');
  console.log(results);
  ```

### 6. 关联选择节点

**`tree.selectRelatedNodes`** 从扁平树数组中筛选出选中节点及其全部祖先与后代。不修改输入。

- **参数：**
  - `treeData` (`Array<TreeNode>`)：扁平树结构数组。
  - `selectedNodes` (`ReadonlyArray<TreeNode | TreeNodeId>`)：选中的节点或节点 ID。

- **返回值：**
  - `Array<TreeNode>`：筛选结果数组，顺序与原数组一致。

### 7. 移除节点

**`tree.removeNodesFromTree`** 从扁平树数组中移除指定节点及其全部后代。不修改输入。

- **参数：**
  - `treeArr` (`Array<TreeNode>`)：扁平树结构数组。
  - `selectedNodes` (`ReadonlyArray<TreeNode | TreeNodeId>`)：要移除的节点或节点 ID。

- **返回值：**
  - `Array<TreeNode>`：移除后的新数组，顺序与原数组一致。

### 8. 合并节点

**`tree.mergeTrees`** 将新节点合并到已有的扁平树数组中，支持乱序输入；重复 ID、孤儿节点和成环节点会被忽略。会原地追加到 `treeArr`。

- **参数：**
  - `treeArr` (`Array<TreeNode>`)：现有的扁平树结构数组。
  - `nodes` (`Array<TreeNode>`)：待合并的节点数组。

- **返回值：**
  - `Array<TreeNode>`：合并后的数组（与 `treeArr` 同一引用）。

---

## 🎨 业务函数 (business)

### 1. DOM 转图片（例如生成海报）

**`captureElementAsImage`** 将 DOM 元素转换为图片（canvas），支持自动下载、返回 Blob 或 Data URL。可选 peer 依赖 `html2canvas-pro` 仅在调用本函数时延迟加载。

> 自动下载依赖浏览器 `document`。SSR、Node.js 或 Worker 环境应设置 `download: false`，并按需启用 `blob` / `dataUrl`。

> **⚠️ 跨域图片注意事项**
>
> 如果截图元素中包含未允许跨域的图片，需要后端提供图片转译服务（实现可参考 [html2canvas-proxy](https://github.com/OFreshman/html2canvas-proxy)）。
>
> 作者提供了一个测试用代理 `https://h2c-proxy.netlify.app/api/`（nitro + netlify 部署），流量有限，请勿在生产环境使用。
>
> **配置了 `proxy` 时必须设置 `useCORS: false`**，两者互斥：
>
> ```javascript
> captureElementAsImage(element, {
>   proxy: "https://your-proxy.example.com/api/",
>   useCORS: false
> });
> ```

- **方法说明：**

  - **参数：**
    - `element` (`HTMLElement | null`)：目标 DOM 元素。
    - `canvasConfig` (`CaptureCanvasOptions`，可选)：配置项，如 `scale`、`backgroundColor` 等。
    - `outputOptions` (`OutputOptions`，可选)：输出设置，默认为自动下载图片；可通过 `blob: true` 或 `dataUrl: true` 请求对应数据。

  - **示例：**
    ```typescript
    import { captureElementAsImage } from 'ui-utils-kit';

    const element = document.getElementById('capture-area');

    captureElementAsImage(element, { scale: 2 }, { download: false, dataUrl: true })
      .then(({ canvas, dataUrl, blob }) => {
        console.log('Canvas:', canvas);
        console.log('Data URL:', dataUrl);
        console.log('Blob:', blob);
      })
      .catch(err => console.error(err));
    ```

> 💡 小程序场景建议直接使用 canvas 绘制，再结合 `uni.canvasToTempFilePath` 转图片，自定义程度更高。

---

## 🔧 公共通用函数 (common)

### 1. safeJsonParse<T>(jsonString: string, defaultValue: T): [Error \| null, T]

**功能描述：** 安全地解析 JSON 字符串，如果解析出错则返回默认值和错误对象。

**参数**
- `jsonString: string` — 要解析的 JSON 格式字符串。

- `defaultValue: T` — 当解析失败时返回的默认值，类型与期待的解析结果相同。

**返回值**
  `[Error | null, T]` — 一个元组：第一个元素为错误对象（解析成功时为 `null`），第二个元素为解析结果（解析失败时为 `defaultValue`）。

- 示例
```typescript
import { safeJsonParse } from 'ui-utils-kit';

const [err, data] = safeJsonParse('{"foo": 42}', { foo: 0 });
if (err) {
  // 处理解析错误
} else {
  console.log(data.foo); // 42
}
```

### 2. desensitize(value: string, type: "mobile" | "idcard" | "email" | "bankcard" | "name"): string
**功能描述**：对手机号、身份证号、邮箱、银行卡号、姓名等敏感信息进行脱敏处理，隐藏中间部分。

**参数**
- `value: string` — 原始字符串，如手机号或身份证号。
- `type: "mobile" | "idcard" | "email" | "bankcard" | "name"`
  - 默认保留首尾，中间脱敏部分
  - `"mobile"`：脱敏手机号
  - `"idcard"`：脱敏身份证号
  - `"email"`：脱敏电子邮箱
  - `"bankcard"`：脱敏银行卡号
  - `"name"`：脱敏姓名

**返回值**
`string` — 脱敏后的字符串；输入非字符串时原样返回。

- 示例
```typescript
import { desensitize } from 'ui-utils-kit';

desensitize('13812345678', 'mobile');  // 输出：138****5678
desensitize('110105199001011234', 'idcard'); // 输出：110105******1234

desensitize("ethan.yin@openai.com", "email"); // => "e********@openai.com"
desensitize("a@domain.cn", "email"); // => "a@domain.cn"   // 本地部分仅一个字符，无需替换

desensitize("6227001234567890", "bankcard"); // => "**** **** **** 7890"
desensitize("6227 0012 3456 7890", "bankcard"); // => "**** **** **** 7890"

desensitize("张三", "name"); // => "张*"
desensitize("张三丰", "name"); // => "张*丰"

// 英文名（按单词脱敏）
//   - “John Doe” => “J**n D*e”
//   - “Al Li”   => “A* L*”
desensitize("John Doe", "name"); // 输出: J**n D*e
desensitize("Al Li", "name"); // 输出: A* L*

```

### 3. Mutex 类
功能描述：模拟互斥锁机制，用于控制异步操作对共享资源的访问，确保同一时刻只有一个操作进入临界区。优先使用 `runExclusive(task)`，它会在任务完成或抛错后自动释放锁；需要跨多个调用手动控制时再使用 `lock()` / `unlock()`。
> ##### 以下是一些应用场景
> - 防止按钮重复点击：避免用户多次点击同一按钮导致重复网络请求或状态混乱。
> - 强制 API 调用顺序：确保一组异步接口按预期顺序依次执行，防止乱序带来的逻辑错误。
> - 多标签页 localStorage 访问：在多个浏览器标签或窗口同时操作同一 localStorage 时，避免数据竞争和丢失。
> - 分片上传（Chunked Upload）：在大文件上传时，按顺序上传每个分片，确保断点续传或失败重试时不会错乱。
> - Web Worker 任务同步：在主线程与 Worker 线程之间同步访问共享内存（如 SharedArrayBuffer ）时，保证原子性。

- 示例

```vue
<template>
  <view>
    <button @click="onSubmit" :disabled="isSubmitting">
      {{ isSubmitting ? '提交中...' : '提交' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Mutex } from 'ui-utils-kit'

const isSubmitting = ref(false)
// 创建一个互斥锁实例
const submitMutex = new Mutex()

// 点击处理函数
const onSubmit = async () => {
  await submitMutex.runExclusive(async () => {
    isSubmitting.value = true
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1500))
      uni.showToast({ title: '提交成功' })
    } finally {
      isSubmitting.value = false
    }
  })
}
</script>
```

### 4. `createSelfCorrectingClock(interval?: number): SelfCorrectingClock`

**功能描述：**
创建一个“零漂移”（self-correcting）实时时钟管理器。该管理器内部通过动态调节 `setTimeout` 延迟来消除长时间运行中的累积误差，并在浏览器标签切换或后台恢复后依然保持准确。

**参数**
- `interval?: number` — 更新间隔（毫秒），可选，默认值为 `1000`。

**返回值**
`SelfCorrectingClock` — 一个对象，包含：
```ts
interface SelfCorrectingClock {
  /** 获取最新的当前时间戳（毫秒） */
  getCurrentTime(): number;
  /** 停止内部定时器，释放资源 */
  stop(): void;
}
```
- 示例
```typescript
import { createSelfCorrectingClock } from 'ui-utils-kit';

// 创建一个每秒更新一次的自校正时钟
const clock = createSelfCorrectingClock(1000);
// 每 5 秒读取并打印一次当前时间戳
const logger = setInterval(() => {
  console.log('当前时间戳：', clock.getCurrentTime());
}, 5000);

// …需要停止时，调用 stop() 并清理外部 logger
setTimeout(() => {
  clock.stop();
  clearInterval(logger);
  console.log('时钟已停止');
}, 30_000);
```

### 5. `createSelfCorrectingCountdown(targetTimestamp: number, interval?: number): SelfCorrectingCountdown`

**功能描述：** 创建一个“零漂移”自校正倒计时管理器。内部同样通过校正机制消除误差，到达目标时间时自动停止，并允许手动停止。

**参数**
- `targetTimestamp: number` — 倒计时结束的目标时间戳（毫秒）。

- `interval?: number` — 更新间隔（毫秒），可选，默认值为 1000。

**返回值**
`SelfCorrectingCountdown` — 一个对象，包含：
```ts
interface SelfCorrectingCountdown {
  /** 获取最新的剩余时间（毫秒） */
  getRemainingTime(): number;
  /** 停止内部定时器，释放资源 */
  stop(): void;
}
```
- 示例
```typescript
import { createSelfCorrectingCountdown } from 'ui-utils-kit';

// 目标时间为当前时间后 10 秒
const target = Date.now() + 10_000;
const countdown = createSelfCorrectingCountdown(target, 1000);

// 每秒读取并打印一次剩余时间
const logger = setInterval(() => {
  const left = countdown.getRemainingTime();
  console.log('剩余时间（毫秒）：', left);
  if (left === 0) {
    clearInterval(logger);
    console.log('倒计时结束');
  }
}, 1000);

// 如需提前取消倒计时
// setTimeout(() => {
//   countdown.stop();
//   clearInterval(logger);
//   console.log('倒计时已手动停止');
// }, 5000);

```

---

## 📜 类型定义

### `TreeNode` 类型
```typescript
type TreeNodeId = string | number;

type TreeNode<TExtra extends object = Record<never, never>> = {
  id: TreeNodeId;
  pid?: TreeNodeId | null;
  name?: string;
  check?: "0" | "1" | "2"; // "0"：未选中，"1"：半选中，"2"：选中
  children?: Array<TreeNode<TExtra>>;
  isMatched?: boolean;
} & TExtra;

type TreeNodeSelection<TExtra extends object = Record<never, never>> =
  | TreeNodeId
  | TreeNode<TExtra>;
```

> `TExtra` 用于保留业务扩展字段。例如节点带 `label` 字段时，`TreeNode<{ label: string }>` 可以在不放宽类型的情况下通过类型检查。

### `CheckStatus` 枚举
```typescript
export const CheckStatus = {
  Unchecked: "0",
  HalfChecked: "1",
  Checked: "2"
} as const;

export type CheckStatusType = "0" | "1" | "2";
```

---

## 🛠️ 开发与发布校验

```bash
# lint、类型、测试、构建、文档同步状态和发布包导出检查
pnpm check

# 修改根 README 后同步 npm 包内文档
pnpm docs:sync
```

CI 会在 Linux 上执行完整校验，并在 Windows、macOS 上额外执行构建与测试。发布仅由 `v*` 标签触发；标签必须严格等于 `v<packages/core version>`，例如包版本为 `1.4.0` 时应使用 `v1.4.0`。

---

## 📜 许可证

- MIT [LICENSE](https://github.com/OFreshman/ui-utils-kit/blob/main/LICENSE)
