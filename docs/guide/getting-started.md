# 快速上手

## 安装

```bash
pnpm add ui-utils-kit
```

使用 npm 或 Yarn：

```bash
npm install ui-utils-kit
# 或
yarn add ui-utils-kit
```

仅在使用 DOM 截图时安装可选 peer：

```bash
pnpm add html2canvas-pro
```

## 选择入口

推荐从子路径导入，依赖边界更直观：

```ts
import { Mutex } from "ui-utils-kit/common";
import { buildTree, CheckStatus } from "ui-utils-kit/tree";
import { captureElementAsImage } from "ui-utils-kit/business";
```

| 入口 | 适合场景 | 环境 |
| --- | --- | --- |
| `ui-utils-kit/common` | JSON、脱敏、互斥锁、计时 | Node.js / 浏览器 |
| `ui-utils-kit/tree` | 纯树数据转换和选择联动 | Node.js / 浏览器 |
| `ui-utils-kit/business` | 将 DOM 渲染为图片 | 浏览器 DOM 环境 |
| `ui-utils-kit` | 希望从一个入口访问全部 API | 取决于实际调用的 API |

## 最小树示例

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

::: warning 注意可变操作
`buildTree`、`updateTreeCheckStatus`、`updateTreeCheckStatusFlat` 和 `mergeTrees` 会修改输入。需要保留原数据时，请先按业务要求复制节点。详见[行为与边界](/guide/behavior)。
:::

## 串行执行异步任务

```ts
import { Mutex } from "ui-utils-kit/common";

const saveMutex = new Mutex();

async function save(): Promise<void> {
  await saveMutex.runExclusive(async () => {
    await persistChanges();
  });
}
```

`runExclusive` 会在任务成功或抛错后释放锁。只有确实需要手动控制时才使用 `lock()` / `unlock()`，并始终在 `finally` 中解锁。

## 截图但不下载

```ts
import { captureElementAsImage } from "ui-utils-kit/business";

const element = document.querySelector<HTMLElement>("#poster");
const { dataUrl, blob } = await captureElementAsImage(
  element,
  { scale: 2, useCORS: true },
  { download: false, dataUrl: true, blob: true }
);
```

`download` 默认是 `true`。只需要程序内结果时，请显式设置 `download: false`。

## 下一步

- 先阅读[行为与边界](/guide/behavior)，了解哪些 API 会修改输入。
- 在 [Tree API](/api/tree)、[Common API](/api/common) 和 [Business API](/api/business) 中查看完整签名。
- 遇到跨域图片、空搜索词等问题时，查看[常见问题](/guide/faq)。
