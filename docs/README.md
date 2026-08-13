# ui-utils-kit 文档站

本目录是项目的 VitePress 文档源文件，属于开发和维护工具，不会进入 `packages/core` 发布的 npm 包。

## 本地运行

在仓库根目录执行：

```bash
pnpm docs
```

构建与预览：

```bash
pnpm docs:build
pnpm docs:preview
```

## 内容结构

```text
index.md          # 文档站首页
guide/            # 上手、行为边界和 FAQ
api/              # 按公开子路径拆分的 API 参考
public/            # Logo、llms.txt 等静态文件
.vitepress/        # 导航、侧边栏和主题配置
```

## 维护约定

- README 保持“项目简介 + 最小上手”，详细说明放在文档站，避免单页过长。
- 新增或重命名公共 API 时，同步更新对应 `docs/api/*.md`。
- 修改内部文档链接后运行 `pnpm docs:check`。
- 交付前运行 `pnpm check`，其中包含文档校验和 VitePress 构建。
- GitHub Pages 工作流只部署 `main` 分支上的文档；合并前可以在 `develop` 分支本地预览。
