export type Locale = "zh" | "en";

export const locales: Locale[] = ["zh", "en"];
export const defaultLocale: Locale = "zh";

const zh = {
  metadata: {
    title: "QookiX Launcher - 免费纯净的 Minecraft 启动器",
    description:
      "QookiX Launcher 是一款免费、纯净、无广告的 Minecraft 启动器。支持 Modrinth / CurseForge 双内容中心，模组、整合包、光影、资源包一键安装与升级。",
  },
  nav: {
    home: "首页",
    download: "下载",
    docs: "文档",
    downloadNow: "立即下载",
    github: "GitHub",
  },
  hero: {
    tagline1:
      "QookiX Launcher — 一款免费、开源、无广告的跨平台 Minecraft Java 版启动器",
    tagline2:
      "支持 安装和更新 Modrinth 与 CurseForge 的模组、整合包、光影、资源包",
    download: "立即下载",
    viewSource: "查看源码",
  },
  features: {
    eyebrow: "为什么选择 QookiX",
    title: "闲话少说 —",
    titleHighlight: "六大核心优势",
    items: [
      {
        title: "双内容中心",
        desc: "内置 Modrinth 与 CurseForge，模组、整合包、光影、资源包随便装，主流平台全覆盖。",
      },
      {
        title: "多实例管理",
        desc: "一个启动器管理多套游戏+模组组合，互不干扰，轻松切换不同玩法配置。",
      },
      {
        title: "纯净安全",
        desc: "无广告、无弹窗、无遥测，数据只保存在你自己的电脑上。开源透明，放心使用。",
      },
      {
        title: "高效便捷",
        desc: "多线程下载最大化利用带宽，自动检测 Java，从零到进游戏只需几步。",
      },
      {
        title: "跨平台体验",
        desc: "支持 Windows、macOS、Linux 及各类主流发行版本，几乎一致的体验。",
      },
      {
        title: "联机房间",
        desc: "集成陶瓦联机 (Terracotta)，NAT 穿透让多人游戏更便利，轻松与朋友联机。",
      },
    ],
  },
  screenshots: {
    eyebrow: "界面预览",
    title: "沉浸体验 —",
    titleHighlight: "干净利落",
    subtitle: "深色主题 + 暖琥珀色点缀，左侧导航 + 主内容区，所有操作触手可及。",
    items: [
      {
        alt: "QookiX Launcher 首页",
        title: "首页",
        desc: "一眼看全你的所有游戏实例，一键启动。",
      },
      {
        alt: "QookiX Launcher 内容中心",
        title: "内容中心",
        desc: "Modrinth + CurseForge 双内容中心，模组整合包随便装。",
      },
      {
        alt: "QookiX Launcher 皮肤中心",
        title: "皮肤中心",
        desc: "3D 皮肤预览，上传、切换、一键应用。",
      },
    ],
  },
  showcase: {
    eyebrow: "强大的功能",
    title: "不仅仅是一个启动器",
    subtitle: "提供大量实用强大的功能，一站式管理你的所有游戏资源。",
    steps: [
      {
        title: "下载安装",
        desc: "从官网下载对应平台的安装包，一键安装到你的电脑。",
      },
      {
        title: "选择内容",
        desc: "浏览 Modrinth 或 CurseForge，挑你喜欢的模组、整合包、光影。",
      },
      {
        title: "开玩！",
        desc: "多线程自动下载安装，配置完成后一键启动游戏。",
      },
    ],
    showcase1: {
      eyebrow: "极简外观 暗藏玄机",
      title: "即便放在桌面也是件艺术品",
      desc: "基于 Tauri 2 打造，体积轻巧，启动极速。界面遵循现代设计语言，深色主题配合暖琥珀色点缀，沉稳而不沉闷。",
      list: [
        "Tauri 2 内核，原生性能",
        "Vue 3 + Naive UI 现代化界面",
        "暖琥珀色主题，沉浸体验",
      ],
    },
    showcase2: {
      eyebrow: "与第三方资源集成",
      title: "主流内容平台一键接入",
      desc: "与 CurseForge、Modrinth 等第三方资源站点深度集成，为你提供最新的模组包、资源包、插件等资源。",
      tags: ["Modrinth", "CurseForge", "陶瓦联机"],
    },
  },
  stats: {
    title: "极致的优化",
    desc: "QookiX Launcher 始终与时俱进，借助最新的技术精心打造多任务调度和分片下载/断点续传功能，最大程度保证你的浏览和安装体验。",
    labels: ["修复 Bug 响应率", "更新频率", "功能开发进度", "反馈响应率"],
  },
  cta: {
    title: "准备好开始了吗？",
    desc: "立即下载 QookiX Launcher，体验纯净、高效、美观的 Minecraft 启动方式。",
    button: "前往下载页面",
  },
  download: {
    eyebrow: "获取",
    titlePrefix: "下载",
    publishedOn: "发布于",
    loading: "正在获取最新版本信息...",
    errorTitle: "暂时无法获取下载信息",
    errorDesc: "请直接前往 GitHub Releases 页面下载最新版本。",
    downloadButton: "下载",
    otherFormats: "其他下载格式",
    viewReleaseNotes: "查看完整 Release Notes",
    formats: {
      exeSetup: "安装版 (exe)",
      zipPortable: "便携版 (zip)",
      dmgSetup: "安装版 (dmg)",
      tarGz: "tar.gz",
      appImage: "AppImage",
      deb: "DEB",
      rpm: "RPM",
    },
  },
  footer: {
    desc: "一款免费、纯净、无广告的 Minecraft 启动器。支持 Modrinth / CurseForge 双内容中心，模组、整合包、光影、资源包一键安装与升级。",
    linksTitle: "相关链接",
    docs: "使用文档",
    feedback: "反馈问题",
    copyright: "QookiX Launcher. Licensed under GPL-3.0.",
    disclaimer: "非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。",
  },
  themeToggle: {
    toLight: "切换到浅色主题",
    toDark: "切换到深色主题",
  },
  langToggle: {
    label: "切换语言",
  },
};

const en: typeof zh = {
  metadata: {
    title: "QookiX Launcher - A Free, Clean Minecraft Launcher",
    description:
      "QookiX Launcher is a free, clean, ad-free Minecraft launcher. Supports both Modrinth and CurseForge content hubs — install and update mods, modpacks, shaders, and resource packs with one click.",
  },
  nav: {
    home: "Home",
    download: "Download",
    docs: "Docs",
    downloadNow: "Get Download",
    github: "GitHub",
  },
  hero: {
    tagline1:
      "QookiX Launcher — a free, open-source, ad-free cross-platform Minecraft Java Edition launcher",
    tagline2:
      "Install and update mods, modpacks, shaders, and resource packs from Modrinth and CurseForge",
    download: "Download Now",
    viewSource: "View Source",
  },
  features: {
    eyebrow: "Why QookiX",
    title: "Enough talk —",
    titleHighlight: "Six Core Advantages",
    items: [
      {
        title: "Dual Content Hubs",
        desc: "Built-in Modrinth and CurseForge — install mods, modpacks, shaders, and resource packs with full coverage of mainstream platforms.",
      },
      {
        title: "Multi-Instance Management",
        desc: "Manage multiple game and mod combinations in one launcher without interference, easily switch between different setups.",
      },
      {
        title: "Clean & Secure",
        desc: "No ads, no popups, no telemetry — your data stays on your own computer. Open source and transparent, use with confidence.",
      },
      {
        title: "Fast & Efficient",
        desc: "Multi-threaded downloads maximize bandwidth, auto Java detection — from zero to in-game in just a few steps.",
      },
      {
        title: "Cross-Platform",
        desc: "Supports Windows, macOS, Linux and mainstream distros with a nearly identical experience.",
      },
      {
        title: "Multiplayer Rooms",
        desc: "Integrated Terracotta relay — NAT traversal makes multiplayer easier, connect with friends effortlessly.",
      },
    ],
  },
  screenshots: {
    eyebrow: "Interface Preview",
    title: "Immersive Experience —",
    titleHighlight: "Clean & Crisp",
    subtitle:
      "Dark theme with warm amber accents, sidebar nav + main content area, everything within reach.",
    items: [
      {
        alt: "QookiX Launcher Home",
        title: "Home",
        desc: "See all your game instances at a glance, launch with one click.",
      },
      {
        alt: "QookiX Launcher Content Hub",
        title: "Content Hub",
        desc: "Modrinth + CurseForge dual content hubs, install mods and modpacks freely.",
      },
      {
        alt: "QookiX Launcher Skin Center",
        title: "Skin Center",
        desc: "3D skin preview, upload, switch, and apply with one click.",
      },
    ],
  },
  showcase: {
    eyebrow: "Powerful Features",
    title: "More Than Just a Launcher",
    subtitle:
      "Packed with practical, powerful features to manage all your game resources in one place.",
    steps: [
      {
        title: "Download & Install",
        desc: "Download the installer for your platform from the website and install with one click.",
      },
      {
        title: "Pick Content",
        desc: "Browse Modrinth or CurseForge and choose the mods, modpacks, and shaders you like.",
      },
      {
        title: "Play!",
        desc: "Multi-threaded auto-download and install, then launch the game with one click.",
      },
    ],
    showcase1: {
      eyebrow: "Minimal Outside, Mighty Inside",
      title: "A work of art even on your desktop",
      desc: "Built on Tauri 2 — lightweight and fast to launch. The UI follows modern design language, dark theme with warm amber accents, grounded yet lively.",
      list: [
        "Tauri 2 core, native performance",
        "Vue 3 + Naive UI modern interface",
        "Warm amber theme, immersive experience",
      ],
    },
    showcase2: {
      eyebrow: "Third-Party Resource Integration",
      title: "One-click access to mainstream content platforms",
      desc: "Deeply integrated with CurseForge, Modrinth and other third-party resource sites, bringing you the latest modpacks, resource packs, plugins and more.",
      tags: ["Modrinth", "CurseForge", "Terracotta Relay"],
    },
  },
  stats: {
    title: "Extreme Optimization",
    desc: "QookiX Launcher stays up to date, leveraging the latest tech to craft multi-task scheduling and chunked downloads with resume support, maximizing your browsing and install experience.",
    labels: [
      "Bug Fix Response Rate",
      "Update Frequency",
      "Feature Development Progress",
      "Feedback Response Rate",
    ],
  },
  cta: {
    title: "Ready to get started?",
    desc: "Download QookiX Launcher now and experience a clean, efficient, beautiful way to launch Minecraft.",
    button: "Go to Download Page",
  },
  download: {
    eyebrow: "Get",
    titlePrefix: "Download",
    publishedOn: "Published on",
    loading: "Fetching latest version info...",
    errorTitle: "Unable to fetch download info right now",
    errorDesc: "Please go to the GitHub Releases page to download the latest version.",
    downloadButton: "Download",
    otherFormats: "Other Download Formats",
    viewReleaseNotes: "View full Release Notes",
    formats: {
      exeSetup: "Installer (exe)",
      zipPortable: "Portable (zip)",
      dmgSetup: "Installer (dmg)",
      tarGz: "tar.gz",
      appImage: "AppImage",
      deb: "DEB",
      rpm: "RPM",
    },
  },
  footer: {
    desc: "A free, clean, ad-free Minecraft launcher. Supports both Modrinth and CurseForge content hubs — install and update mods, modpacks, shaders, and resource packs with one click.",
    linksTitle: "Related Links",
    docs: "Documentation",
    feedback: "Report an Issue",
    copyright: "QookiX Launcher. Licensed under GPL-3.0.",
    disclaimer:
      "Not an official Minecraft service. Not approved by or affiliated with Mojang or Microsoft.",
  },
  themeToggle: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  langToggle: {
    label: "Switch language",
  },
};

export const translations = { zh, en } satisfies Record<Locale, typeof zh>;

export type Translation = typeof zh;

export function getLocaleLabel(locale: Locale): string {
  return locale === "zh" ? "中文" : "English";
}

export function getLocaleShort(locale: Locale): string {
  return locale === "zh" ? "中" : "EN";
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const saved = localStorage.getItem("qookix-locale");
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  const lang = navigator.language?.toLowerCase() ?? "";
  return lang.startsWith("zh") ? "zh" : "en";
}
