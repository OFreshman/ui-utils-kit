# AGENTS.md

供在本仓库工作的 AI agent 快速了解项目与协作约束。

## 项目概览

- 这是一个 Node 20、pnpm 10 的 TypeScript 工具库 monorepo。
- `packages/core`：实际发布的 `ui-utils-kit`，使用 unbuild 产出 ESM、CJS 和类型声明。
- `playground`：Vue 3 + Vite 手工演示项目，不属于发布包。
- `test`：Vitest 单元测试。
- 核心 API 分为 `common`、`tree-operations`、`business`；`business` 依赖浏览器 DOM 和可选 peer `html2canvas-pro`。

## 常用命令

```bash
pnpm install
pnpm play
pnpm lint
pnpm lint:type
pnpm test:run
pnpm build
pnpm docs:sync
```

## 修改约束

- 使用 TypeScript、双引号、2 空格缩进和 LF 行尾，遵循现有 ESLint 配置。
- 新增公共 API 时，同步更新入口、类型、测试和根 README，随后运行 `pnpm docs:sync`。
- 树节点 ID 支持 `string | number`；树操作的顺序、原地修改等行为应保持明确并由测试覆盖。
- 浏览器相关逻辑只放在 `business`；纯工具函数不要引入 DOM 或 `html2canvas-pro`。
- Playground 保持 Vue 3 Composition API 与 `<script setup lang="ts">`，只用于最小可复现场景。
- 不提交 `node_modules`、`dist`、coverage 或 IDE 文件。

## 交付前验证

```bash
pnpm lint
pnpm lint:type
pnpm test:run
pnpm build
git diff --check
```
