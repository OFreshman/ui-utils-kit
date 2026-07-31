<div align="center">

# ui-utils-kit

面向前端业务场景的 TypeScript 工具库，提供树数据处理、通用异步工具和 DOM 截图能力。

[![GitHub Stars](https://img.shields.io/github/stars/OFreshman/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669&logo=GitHub)](https://github.com/OFreshman/ui-utils-kit)
[![NPM Version](https://img.shields.io/npm/v/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669)](https://npmjs.com/package/ui-utils-kit)
[![NPM Downloads](https://img.shields.io/npm/dm/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669)](https://npmjs.com/package/ui-utils-kit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ui-utils-kit?style=flat&colorA=080f12&colorB=1fa669&label=minzip)](https://bundlephobia.com/result?p=ui-utils-kit)
[![License](https://img.shields.io/github/license/OFreshman/ui-utils-kit.svg?style=flat&colorA=080f12&colorB=1fa669)](https://github.com/OFreshman/ui-utils-kit/blob/main/LICENSE)

</div>

## 特性

- **树数据处理**：构建、扁平化、勾选联动、搜索、删除、合并和关联选择。
- **类型安全**：使用 TypeScript 编写，树节点 ID 同时支持 `string` 和 `number`。
- **按需导入**：提供根入口及 `common`、`tree`、`business` 子路径。
- **多模块格式**：发布 ESM、CommonJS 和类型声明。
- **清晰的运行边界**：纯工具不依赖 DOM；截图能力单独放在 `business`，并延迟加载可选 peer。

> [!IMPORTANT]
> `common` 和 `tree` 可用于 Node.js 或浏览器环境。`captureElementAsImage` 需要 DOM、Canvas 和浏览器相关能力，仅导入 `business` 模块不会立即加载 `html2canvas-pro`。

## 安装

```bash
pnpm add ui-utils-kit
```

也可以使用 npm 或 Yarn：

```bash
npm install ui-utils-kit
# 或

yarn add ui-utils-kit
```

只有使用 DOM 截图功能时，才需要安装可选 peer：

```bash
pnpm add html2canvas-pro
```

## 导入方式

推荐从子路径按需导入：

```ts
import { Mutex } from "ui-utils-kit/common";
import { buildTree, CheckStatus } from "ui-utils-kit/tree";
import { captureElementAsImage } from "ui-utils-kit/business";
```

也可以从根入口导入单个 API 或命名空间：

```ts
import { buildTree, common, tree } from "ui-utils-kit";

buildTree([]);
common.safeJsonParse("{}", {});
tree.selectRelatedNodes([], []);
```

可用导出路径：

| 导出路径 | 内容 | 运行环境 |
| --- | --- | --- |
| `ui-utils-kit` | 全部 API 与 `common`、`tree`、`business` 命名空间 | 取决于实际调用的 API |
| `ui-utils-kit/common` | JSON、脱敏、互斥锁、自校正计时工具 | Node.js / 浏览器 |
| `ui-utils-kit/tree` | 树数据操作和相关类型 | Node.js / 浏览器 |
| `ui-utils-kit/business` | DOM 截图 | 浏览器 DOM 环境 |

## 快速开始

```ts
import {
  buildTree,
  CheckStatus,
  treeToArr,
  updateTreeCheckStatus
} from "ui-utils-kit/tree";
import type { TreeNode } from "ui-utils-kit/tree";

type MenuExtra = {
  path: string;
};

const nodes: Array<TreeNode<MenuExtra>> = [
  { id: 1, pid: null, name: "系统管理", path: "/system" },
  { id: 2, pid: 1, name: "用户管理", path: "/system/users" }
];

const tree = buildTree(nodes);
updateTreeCheckStatus(tree, [2]);

console.log(tree[0]?.check === CheckStatus.Checked); // true
console.log(treeToArr(tree));
```

## Tree API

### API 一览

| API | 作用 | 是否修改输入 |
| --- | --- | --- |
| `buildTree(nodes)` | 将扁平数组构建为嵌套树 | **是**，重置首个唯一节点的 `children` |
| `treeToArr(tree)` | 以前序遍历将嵌套树转换为扁平数组 | 否，返回不含 `children` 的新节点对象 |
| `updateTreeCheckStatus(tree, selectedNodes)` | 更新嵌套树的父子勾选状态 | **是**，更新节点 `check` |
| `updateTreeCheckStatusFlat(tree, selectedNodes)` | 更新扁平树的父子勾选状态 | **是**，更新节点 `check` |
| `searchTreeWithRelations(tree, keywords, mark?)` | 返回直接匹配节点及其祖先和后代 | 不修改原数组；开启标记时复制直接匹配节点 |
| `removeNodesFromTree(tree, selectedNodes)` | 删除选中节点及其全部后代 | 否，返回过滤后的新数组 |
| `mergeTrees(tree, nodes)` | 将有效的新节点追加到扁平树 | **是**，原地追加到 `tree` |
| `selectRelatedNodes(tree, selectedNodes)` | 返回选中节点及其祖先和后代 | 否，返回保持输入顺序的新数组 |

选择类参数 `selectedNodes` 同时接受节点 ID 和完整节点对象：

```ts
selectRelatedNodes(nodes, [2, { id: 3, pid: 1 }]);
```

### 构建与扁平化

```ts
import { buildTree, treeToArr } from "ui-utils-kit/tree";

const flatNodes = [
  { id: "root", pid: null, name: "根节点" },
  { id: "child", pid: "root", name: "子节点" }
];

const nestedTree = buildTree(flatNodes);
const normalizedFlatNodes = treeToArr(nestedTree);
```

行为约定：

- `buildTree` 将 `pid` 为 `null` 或 `undefined` 的节点视为根节点。
- `buildTree` 遇到重复 ID 时保留第一个节点；孤儿节点和成环节点不会进入结果。
- `buildTree` 沿用原有可变 API，会把首个唯一输入节点的 `children` 重置为新数组。
- `treeToArr` 使用前序遍历，保持父节点和兄弟节点的顺序，不修改输入树。
- `treeToArr` 会重新计算 `pid`，将根节点 `pid` 统一为 `null`，并为缺少状态的节点补上 `CheckStatus.Unchecked`。
- `treeToArr` 会跳过已经访问过的同一节点对象，避免循环引用导致无限遍历。

### 勾选联动

```ts
import {
  updateTreeCheckStatus,
  updateTreeCheckStatusFlat
} from "ui-utils-kit/tree";

updateTreeCheckStatus(nestedTree, ["child"]);
updateTreeCheckStatusFlat(flatNodes, ["child"]);
```

两个 API 都会先清空历史勾选状态，再执行以下规则：

1. 选中节点及其全部后代设为 `Checked`。
2. 全部直接子节点选中时，父节点设为 `Checked`。
3. 子节点状态不一致时，父节点设为 `HalfChecked`。
4. 全部直接子节点未选中时，父节点设为 `Unchecked`。

### 搜索、删除与关联选择

```ts
import {
  removeNodesFromTree,
  searchTreeWithRelations,
  selectRelatedNodes
} from "ui-utils-kit/tree";

const searchResult = searchTreeWithRelations(flatNodes, "用户");
const relatedNodes = selectRelatedNodes(flatNodes, ["child"]);
const remainingNodes = removeNodesFromTree(flatNodes, ["child"]);
```

`searchTreeWithRelations` 使用区分大小写的 `String.prototype.includes` 匹配 `name`：

- 返回直接匹配节点、全部祖先和全部后代，并保持输入数组顺序。
- `mark` 默认为 `true`，此时直接匹配节点会以浅拷贝形式增加 `isMatched: true`。
- 空字符串会匹配所有节点；如需“空关键词不搜索”，请在调用前自行判断。

### 合并扁平树

```ts
import { mergeTrees } from "ui-utils-kit/tree";

const target = [{ id: 1, pid: null, name: "根节点" }];

mergeTrees(target, [
  { id: 3, pid: 2, name: "孙节点" },
  { id: 2, pid: 1, name: "子节点" }
]);
```

`mergeTrees` 支持待合并节点乱序，并确保父节点先于依赖它的子节点加入。已存在 ID、待合并列表中的重复 ID、孤儿节点和成环节点会被忽略；同一批重复 ID 保留第一个节点。

## Common API

### `safeJsonParse`

安全解析 JSON，返回 `[error, value]`，避免把解析异常作为控制流抛出。

```ts
import { safeJsonParse } from "ui-utils-kit/common";

const [error, value] = safeJsonParse<{ theme: string }>(
  localStorage.getItem("settings") ?? "",
  { theme: "light" }
);

if (error) {
  console.warn("配置解析失败，已使用默认值", error);
}
```

### `desensitize`

支持 `mobile`、`idcard`、`email`、`bankcard` 和 `name` 五种脱敏类型。

```ts
import { desensitize } from "ui-utils-kit/common";

desensitize("13812345678", "mobile"); // "138****5678"
desensitize("user@example.com", "email"); // "u***@example.com"
desensitize("张三", "name"); // "张*"
```

不符合对应格式的值通常会保持原样；银行卡号会先移除空格，再以每四位一组格式化。

### `Mutex`

`Mutex` 用于同一个 JavaScript 运行上下文内的异步任务串行化。推荐使用 `runExclusive`，它会在任务完成或抛错后自动释放锁：

```ts
import { Mutex } from "ui-utils-kit/common";

const saveMutex = new Mutex();

async function save(): Promise<void> {
  await saveMutex.runExclusive(async () => {
    await persistChanges();
  });
}
```

需要手动控制锁时，必须在 `finally` 中释放：

```ts
await saveMutex.lock();
try {
  await persistChanges();
} finally {
  saveMutex.unlock();
}
```

可用方法：

| 方法 | 说明 |
| --- | --- |
| `lock()` | 获取锁；已锁定时按先进先出顺序等待 |
| `unlock()` | 释放锁，或把执行权交给下一位等待者 |
| `isLocked()` | 返回当前锁状态 |
| `queueLength()` | 返回等待获取锁的任务数量 |
| `runExclusive(task)` | 在锁内执行同步或异步任务并自动释放 |

> [!NOTE]
> `Mutex` 只协调共享同一个实例的任务，不能替代跨标签页、Web Worker、进程或分布式锁。

### 自校正时钟与倒计时

```ts
import {
  createSelfCorrectingClock,
  createSelfCorrectingCountdown
} from "ui-utils-kit/common";

const clock = createSelfCorrectingClock(1000);
console.log(clock.getCurrentTime());
clock.stop();

const countdown = createSelfCorrectingCountdown(Date.now() + 10_000, 1000);
console.log(countdown.getRemainingTime());
countdown.stop();
```

| API | 返回方法 | 说明 |
| --- | --- | --- |
| `createSelfCorrectingClock(interval = 1000)` | `getCurrentTime()`、`stop()` | 根据实际触发时间动态修正下一次延迟，减少累计漂移 |
| `createSelfCorrectingCountdown(targetTimestamp, interval = 1000)` | `getRemainingTime()`、`stop()` | 按目标时间戳重新计算剩余时间，到达目标后停止调度 |

`interval` 必须是大于 `0` 的有限数字，`targetTimestamp` 也必须是有限数字，否则会抛出 `RangeError`。自校正可以减少定时器的累计误差，但事件循环阻塞、浏览器后台节流等仍可能推迟单次更新。

## Business API

### `captureElementAsImage`

将 DOM 元素渲染为 Canvas，并按需自动下载、返回 Data URL 或 Blob。

```ts
import { captureElementAsImage } from "ui-utils-kit/business";

const element = document.querySelector<HTMLElement>("#poster");
const result = await captureElementAsImage(
  element,
  {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  },
  {
    download: false,
    dataUrl: true,
    blob: true
  }
);

console.log(result.canvas, result.dataUrl, result.blob);
```

输出选项：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `download` | `true` | 是否创建临时链接并自动下载 PNG |
| `downloadName` | `"下载图片"` | 下载文件名，不含 `.png` 扩展名 |
| `dataUrl` | `false` | 是否返回 PNG Data URL；下载开启时也会生成 |
| `blob` | `false` | 是否通过 `canvas.toBlob` 返回 PNG Blob |

成功返回时，结果始终包含非空的 `canvas`。`dataUrl` 仅在启用下载或设置 `dataUrl: true` 时非空，`blob` 仅在设置 `blob: true` 时非空。

运行边界与注意事项：

- 传入 `null` 元素会抛出错误。
- 实际截图需要 DOM、Canvas 以及 `html2canvas-pro`；服务端可以导入模块，但不能在纯 Node.js 环境中完成 DOM 截图。
- `download` 默认为 `true`。不需要下载时应显式传入 `{ download: false }`，避免执行依赖 `document` 的下载逻辑。
- 跨域图片需要资源端正确配置 CORS，或通过 `proxy` 指定你自己的代理服务；本库不内置代理。
- `canvasConfig` 支持常用选项及其他 `html2canvas-pro` 同名配置。

## 类型定义

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

其他公开类型包括：

- `ExtractValue<T>`
- `SelfCorrectingClock`
- `SelfCorrectingCountdown`
- `CaptureCanvasOptions`
- `OutputOptions`
- `CaptureResult`

## 本地开发

本仓库使用 Node.js 20、pnpm 10 和 TypeScript，采用 monorepo 结构：

```text
packages/core  # 实际发布的 ui-utils-kit
playground     # Vue 3 + Vite 手工演示项目，不进入发布包
test           # Vitest 单元测试
```

常用命令：

```bash
pnpm install
pnpm play          # 启动 Playground
pnpm test          # 监听模式测试
pnpm test:coverage # 生成覆盖率
pnpm check         # 完整质量与发布包检查
```

修改根 README 后，需要同步 npm 包内文档：

```bash
pnpm docs:sync
pnpm docs:check
```

其他维护命令：

```bash
pnpm package:check # 校验打包产物、导出和依赖边界
pnpm release:check # 在发布前额外校验版本与 Git tag
```

CI 会在 `main`、`develop` 的 push 和 pull request 上执行完整校验，并在 Windows、macOS 上额外构建和测试。推送 `v*` tag 后，Release 工作流会再次校验、生成变更日志并发布 `packages/core`。

## 许可证

[MIT](https://github.com/OFreshman/ui-utils-kit/blob/main/LICENSE)
