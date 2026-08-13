# 行为与边界

工具函数看似简单，真正容易产生误解的是“是否修改输入”“异常数据如何处理”和“能在哪个运行环境调用”。本页集中说明这些约定。

## 可变性速查

| API | 是否修改输入 | 关键行为 |
| --- | --- | --- |
| `buildTree` | 是 | 重置首个唯一节点的 `children`，再建立父子关系 |
| `treeToArr` | 否 | 返回不含 `children` 的新节点对象 |
| `updateTreeCheckStatus` | 是 | 重算嵌套树中所有已访问节点的 `check` |
| `updateTreeCheckStatusFlat` | 是 | 重算扁平树中所有节点的 `check` |
| `searchTreeWithRelations` | 否 | 开启标记时，仅直接匹配节点会被浅拷贝 |
| `removeNodesFromTree` | 否 | 返回过滤后的新数组，节点对象仍复用输入引用 |
| `mergeTrees` | 是 | 把有效节点原地追加到目标数组 |
| `selectRelatedNodes` | 否 | 返回新数组，节点对象仍复用输入引用 |

::: tip 为什么不统一改成不可变 API？
这些行为属于已发布 API 的兼容约定。文档优先把现状写清楚，避免为了“看起来统一”而静默改变使用者代码的内存与性能特征。
:::

## 树数据约定

- 节点 ID 支持 `string | number`，在比较时不会把字符串 `"1"` 与数字 `1` 视为同一个 ID。
- `pid` 为 `null` 或 `undefined` 时视为根节点。
- `buildTree` 遇到重复 ID 时保留第一个节点；孤儿节点和成环节点不会进入结果。
- 搜索、删除和关联选择按输入数组顺序返回结果，不会额外按名称或 ID 排序。
- `mergeTrees` 会优先追加父节点，再追加依赖它的子节点；依赖层级相同时保持待合并数组中的相对顺序。
- 除 `buildTree` 明确保留首个重复 ID 外，其他树 API 也会使用 ID 建立映射或集合。请把 ID 唯一作为正常输入约束，避免重复 ID 被合并为同一逻辑节点。
- 选择类 API 接受节点 ID 或完整节点对象；对象参数只读取 `id`。

## 勾选状态约定

`CheckStatus` 的运行时值是字符串，而不是枚举名称：

```ts
const CheckStatus = {
  Unchecked: "0",
  HalfChecked: "1",
  Checked: "2"
} as const;
```

更新勾选状态时会先清空历史状态，然后根据本次 `selectedNodes` 重算：选中节点的后代全部选中，祖先根据直接子节点变为全选、半选或未选。

## 搜索约定

`searchTreeWithRelations` 使用区分大小写的 `String.prototype.includes` 匹配 `name`。因此：

- 空字符串会匹配全部节点。
- 没有 `name` 的节点按空字符串参与匹配。
- `mark: true` 只给直接命中的节点增加 `isMatched: true`，祖先和后代不会被标记。

如果产品希望“空输入不搜索”或忽略大小写，请在调用前做业务层预处理。

## 计时器边界

自校正时钟和倒计时会根据实际触发时间修正下一次延迟，从而减少累计漂移，但不能绕过 JavaScript 事件循环阻塞或浏览器后台节流。它们适合 UI 展示和普通业务计时，不是实时系统时钟。

## Mutex 边界

`Mutex` 只协调共享同一个实例、处于同一 JavaScript 运行上下文的异步任务。它不是跨标签页锁、Worker 锁、进程锁或分布式锁。

## DOM 截图边界

`captureElementAsImage` 的模块可以被服务端代码导入，因为 `html2canvas-pro` 会延迟加载；但实际截图仍要求 DOM、Canvas 及对应浏览器能力。自动下载还要求可用的全局 `document`。
