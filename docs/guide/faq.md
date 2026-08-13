# 常见问题

## 为什么增加独立文档站，而不是继续扩充 README？

README 适合回答“这是什么、怎么安装、如何完成第一个示例”。当树操作的可变性、异常数据处理、截图运行环境和完整签名都堆在一个页面时，读者很难快速定位信息。

独立文档站把内容拆成指南、行为边界和 API 参考，并提供本地搜索。它只存在于开发工作区，**不会进入 `ui-utils-kit` 的 npm 发布文件，也不会增加使用者的运行时体积**。代价是仓库多一套文档构建依赖和维护入口，因此 CI 会构建文档并用测试检查公开 API 是否都有对应说明。

## 为什么推荐子路径导入？

`ui-utils-kit/common`、`ui-utils-kit/tree` 和 `ui-utils-kit/business` 能直接表达依赖边界。尤其是只使用纯工具时，从 `common` 或 `tree` 导入更容易确认代码不依赖 DOM 截图能力。

根入口仍然可用，也导出 `common`、`tree`、`business` 命名空间。

## `buildTree` 为什么修改了原节点的 `children`？

这是现有 API 的兼容行为：函数会重置首个唯一节点的 `children`，再建立新的父子关系。如果需要保留原对象，请在调用前按业务字段深度复制节点。

## 搜索空字符串为什么返回全部节点？

`searchTreeWithRelations` 使用 `name.includes(keywords)`，而任何字符串都包含空字符串。通常可以在 UI 层处理：

```ts
const result = keyword
  ? searchTreeWithRelations(nodes, keyword)
  : [];
```

## `CheckStatus` 为什么是 `"0" | "1" | "2"`？

这是已发布的数据约定：

- `"0"`：未选中
- `"1"`：半选中
- `"2"`：选中

请使用 `CheckStatus.Unchecked`、`CheckStatus.HalfChecked` 和 `CheckStatus.Checked`，避免在业务代码中散落魔法字符串。

## Mutex 能用于多个浏览器标签页吗？

不能。`Mutex` 只协调共享同一个实例的异步任务。跨标签页可以按业务选择 Web Locks API、BroadcastChannel 配合持久化状态，或服务端并发控制；这些机制不由本库封装。

## 自校正计时器能保证绝对准时吗？

不能。它通过调整下一次延迟减少累计漂移，但事件循环阻塞和浏览器后台节流仍会推迟更新。关键业务截止时间应始终以目标时间戳或服务端时间为准。

## 截图中的跨域图片为什么丢失？

浏览器 Canvas 受同源策略约束。优先让图片服务器返回正确的 CORS 响应并设置 `useCORS: true`；无法控制资源端时，可以配置你自己的 `proxy`。本库不内置公共代理，也不保证第三方代理的稳定性或隐私安全。

## 为什么服务端能导入 `business`，却不能截图？

`html2canvas-pro` 是延迟加载的，所以导入模块本身不会立即访问 DOM；实际调用仍需要 `HTMLElement`、Canvas 和浏览器能力。默认下载还需要 `document`。

## 如何报告问题？

提交 Issue 时请附上：

1. 最小复现代码和数据样例。
2. 运行环境、浏览器或 Node.js 版本。
3. 期望行为和实际行为。
4. 涉及树操作时，说明输入顺序以及是否允许原地修改。
