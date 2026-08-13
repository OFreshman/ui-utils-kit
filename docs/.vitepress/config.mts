import process from "node:process";
import { defineConfig } from "vitepress";

const siteBase = process.env.DOCS_BASE ?? "/ui-utils-kit/";

export default defineConfig({
  title: "ui-utils-kit",
  description: "面向前端业务场景的 TypeScript 工具库",
  lang: "zh-CN",
  base: siteBase,
  srcExclude: ["README.md"],
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: `${siteBase}logo.svg` }],
    ["meta", { name: "theme-color", content: "#1fa669" }]
  ],
  themeConfig: {
    logo: { src: "/logo.svg", alt: "ui-utils-kit Logo" },
    nav: [
      { text: "指南", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "API", link: "/api/tree", activeMatch: "/api/" },
      { text: "常见问题", link: "/guide/faq" }
    ],
    sidebar: [
      {
        text: "指南",
        items: [
          { text: "快速上手", link: "/guide/getting-started" },
          { text: "行为与边界", link: "/guide/behavior" },
          { text: "常见问题", link: "/guide/faq" }
        ]
      },
      {
        text: "API 参考",
        items: [
          { text: "Tree", link: "/api/tree" },
          { text: "Common", link: "/api/common" },
          { text: "Business", link: "/api/business" }
        ]
      }
    ],
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档"
          },
          modal: {
            displayDetails: "显示详细列表",
            resetButtonTitle: "清除查询条件",
            backButtonTitle: "关闭搜索",
            noResultsText: "没有找到相关结果",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭"
            }
          }
        }
      }
    },
    outline: {
      level: [2, 3],
      label: "本页目录"
    },
    editLink: {
      pattern: "https://github.com/OFreshman/ui-utils-kit/edit/develop/docs/:path",
      text: "在 GitHub 上编辑此页"
    },
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
        forceLocale: true
      }
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/OFreshman/ui-utils-kit" }
    ],
    footer: {
      message: "基于 MIT 许可证发布",
      copyright: "Copyright © 2026 OFreshman"
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    externalLinkIcon: true,
    notFound: {
      title: "页面不存在",
      quote: "链接可能已变更，也可以尝试使用右上角搜索。",
      linkLabel: "返回文档首页",
      linkText: "返回首页"
    },
    returnToTopLabel: "返回顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    skipToContentLabel: "跳转到正文"
  }
});