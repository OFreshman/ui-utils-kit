---
layout: home

hero:
  name: ui-utils-kit
  text: 前端工具，边界清晰
  tagline: 树数据处理、通用异步工具与 DOM 截图能力，支持 TypeScript、ESM 和 CommonJS
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api/tree
    - theme: alt
      text: GitHub
      link: https://github.com/OFreshman/ui-utils-kit

features:
  - icon: 🌲
    title: 树数据处理
    details: 构建、扁平化、勾选联动、搜索、删除、合并与关联选择，明确顺序和原地修改行为。
  - icon: 🔒
    title: 通用异步工具
    details: 安全 JSON 解析、常见信息脱敏、Promise 互斥锁以及减少累计漂移的计时工具。
  - icon: 🖼️
    title: DOM 截图
    details: 按需输出 Canvas、Data URL 或 Blob；截图依赖作为可选 peer 延迟加载。
  - icon: 📦
    title: 按需导入
    details: 提供 common、tree、business 子路径，纯工具使用者无需承担浏览器截图依赖。
  - icon: 🧭
    title: 边界可预期
    details: 文档明确输入是否被修改、重复和异常树节点如何处理，以及浏览器运行要求。
  - icon: ✅
    title: 自动化验证
    details: 单元测试覆盖核心行为，CI 校验类型、构建、文档站和实际发布包导出。
---