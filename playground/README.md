# ui-utils-kit Playground

这是 `ui-utils-kit` 的 Vue 3 + Vite 手工演示项目，用于在真实浏览器环境中验证 DOM 截图等能力，**不属于 npm 发布包**。

## 启动

先在仓库根目录安装依赖，然后启动 Playground：

```bash
pnpm install
pnpm play
```

也可以直接运行子项目命令：

```bash
pnpm --dir playground dev
```

## 当前演示

当前页面通过 `src/components/html2canvas.vue` 演示 `captureElementAsImage`：

- 将指定 DOM 元素渲染为 Canvas。
- 验证自动下载、Data URL 和 Blob 输出。
- 手工检查图片清晰度、样式还原和浏览器兼容性。

DOM 截图依赖可选 peer `html2canvas-pro`。根工作区已将它作为开发依赖安装；在外部项目使用该功能时，需要额外安装：

```bash
pnpm add ui-utils-kit html2canvas-pro
```

## 约束

- 保持 Vue 3 Composition API 与 `<script setup lang="ts">`。
- Playground 只保留最小可复现场景，不在这里复制包的完整 API 文档。
- 公共 API、类型和行为约定以仓库根目录 `README.md` 为准。
