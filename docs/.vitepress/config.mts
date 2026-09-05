import { defineConfig } from "vitepress";

const GITHUB = "https://github.com/weimosheng/QookiX-Docs";

/**
 * 「在 GitHub 上编辑此页」的跳转模板。
 * 结构：<仓库>/edit/<分支>/<文档目录>/<文件相对路径>
 *   - main        → 分支名，换了分支就改这里
 *   - docs/       → 文档目录在仓库中的位置，当前仓库根就是项目根
 *   - :path       → VitePress 自动替换为当前页面源文件（如 guide/install.md）
 * 换仓库或分支，只改这一行即可。
 */
const EDIT_LINK = `${GITHUB}/edit/main/docs/:path`;

/**
 * 把主站（Next.js）的主题偏好同步到 VitePress。
 * 主站用 localStorage 的 `qookix-theme` 记录深浅色，这里在渲染前读取并覆盖。
 */
const SYNC_THEME = `(function(){try{var t=localStorage.getItem('qookix-theme');if(t==='dark'||t==='light'){document.documentElement.classList.toggle('dark',t==='dark');localStorage.setItem('vitepress-theme-appearance',t);}}catch(e){}})();`;

export default defineConfig({
  // 文档挂在站点 /docs/ 下，构建产物直接写入 next build 的 out/ 目录，
  // 由同一个 Cloudflare Worker（wrangler [assets]）一并提供，无需额外部署。
  base: "/docs/",
  outDir: "../out/docs",

  lang: "zh-CN",
  title: "QookiX Launcher 文档",
  description:
    "QookiX Launcher 使用文档：下载安装、实例管理、内容中心、皮肤、联机与常见问题。",
  appearance: "dark",
  lastUpdated: true,

  vite: {
    // outDir 位于项目根之外，交给 next build 管理，这里不要清空
    build: { emptyOutDir: false },
    // Windows 下若当前工作目录的盘符大小写与 VitePress 内部路径不一致，
    // 渲染阶段 realpath 归一化后匹配不到页面 chunk 会报错，这里跳过 realpath
    resolve: { preserveSymlinks: true },
  },

  head: [
    ["link", { rel: "icon", type: "image/png", href: "/docs/qookix-icon.png" }],
    ["meta", { name: "theme-color", content: "#0a0a0c" }],
    ["script", {}, SYNC_THEME],
  ],

  themeConfig: {
    logo: "/qookix-icon.png",
    siteTitle: "QookiX Launcher",

    nav: [
      { text: "指南", link: "/guide/", activeMatch: "/guide/" },
      { text: "常见问题", link: "/guide/faq", activeMatch: "/guide/faq" },
    ],

    sidebar: [
      {
        text: "开始使用",
        items: [
          { text: "快速开始", link: "/guide/" },
          { text: "下载与安装", link: "/guide/install" },
          { text: "创建第一个实例", link: "/guide/first-instance" },
        ],
      },
      {
        text: "功能指南",
        items: [
          { text: "多实例管理", link: "/guide/instances" },
          { text: "内容中心", link: "/guide/content" },
          { text: "皮肤中心", link: "/guide/skins" },
          { text: "联机房间", link: "/guide/multiplayer" },
        ],
      },
      {
        text: "进阶",
        items: [
          { text: "设置与调优", link: "/guide/settings" },
          { text: "常见问题", link: "/guide/faq" },
        ],
      },
    ],

    outline: { level: [2, 3], label: "本页目录" },

    socialLinks: [{ icon: "github", link: GITHUB }],

    footer: {
      message: "基于 GPL-3.0 协议开源发布",
      copyright: "Copyright © 2026 QookiX Launcher",
    },

    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                displayDetails: "显示详细信息",
                resetButtonTitle: "清除查询条件",
                backButtonTitle: "返回",
                noResultsText: "没有找到相关内容",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "enter",
                  navigateText: "切换",
                  navigateUpKeyAriaLabel: "↑",
                  navigateDownKeyAriaLabel: "↓",
                  closeText: "关闭",
                  closeKeyAriaLabel: "esc",
                },
              },
            },
          },
        },
      },
    },

    lastUpdated: { text: "最后更新于", formatOptions: { dateStyle: "medium" } },

    // 每页底部显示「在 GitHub 上编辑此页」，访客点击后若非协作者会被引导 fork 后提 PR
    editLink: {
      pattern: EDIT_LINK,
      text: "在 GitHub 上编辑此页",
    },

    externalLinkIcon: true,
  },
});
