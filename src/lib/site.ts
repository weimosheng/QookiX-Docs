/**
 * 站点常量：跨域地址、品牌信息、SEO 文案。
 *
 * 官网与文档站是两个独立部署的站点（各自绑定子域名），
 * 因此跨站跳转必须使用绝对地址，不能再写成 `/docs/` 这类同站相对路径。
 */

/** 主站（官网）地址。 */
export const MAIN_SITE_URL = "https://www.qookix.cn";

/** 文档站地址。 */
export const DOCS_URL = "https://docs.qookix.cn";

/** 品牌全称与简称。 */
export const SITE_NAME = "QookiX Launcher";
export const SITE_SHORT_NAME = "QookiX";

/** GitHub 仓库地址（开源地址，同时用于结构化数据中的 codeRepository）。 */
export const GITHUB_REPO_URL =
  "https://github.com/weimosheng/QookiX-Launcher";
export const GITHUB_RELEASES_URL = `${GITHUB_REPO_URL}/releases`;

/** Android 版仓库地址（独立仓库，发布 APK）。 */
export const GITHUB_ANDROID_REPO_URL =
  "https://github.com/ZhaYi-Miao/QookiX-Launcher-Android";
export const GITHUB_ANDROID_RELEASES_URL = `${GITHUB_ANDROID_REPO_URL}/releases`;

/** SEO 主标题与描述，全站共用一份以保证一致性。 */
export const SITE_TITLE = "QookiX Launcher - 免费纯净的 Minecraft 启动器";
export const SITE_DESCRIPTION =
  "QookiX Launcher 是一款免费、纯净、无广告的 Minecraft 启动器。内置 Modrinth / CurseForge 双内容中心，模组、整合包、光影、资源包一键安装与升级。";

/**
 * 站长平台验证 token。
 *
 * 只有在站长平台完成站点所有权验证后，才能提交 sitemap、
 * 查看/修正搜索结果的摘要与站点链接等展示方式。
 * 在部署环境（或 .env.local）配置以下变量即自动输出对应 meta，未配置则不输出。
 *
 * - Google Search Console → google-site-verification
 * - Bing Webmaster Tools  → msvalidate.01
 * - 百度搜索资源平台       → baidu-site-verification
 */
export const SITE_VERIFICATION = {
  google: process.env.GOOGLE_SITE_VERIFICATION,
  bing: process.env.BING_SITE_VERIFICATION,
  baidu: process.env.BAIDU_SITE_VERIFICATION,
};

/**
 * 站点关键词。
 *
 * Google 已不再参考 keywords 做排名，但百度、必应等仍会读取，
 * 且该字段对站内搜索/长尾词覆盖仍有意义，保留但控制数量避免堆砌。
 */
export const SITE_KEYWORDS = [
  "QookiX Launcher",
  "QookiX",
  "Minecraft 启动器",
  "Minecraft Launcher",
  "我的世界启动器",
  "免费 Minecraft 启动器",
  "开源 Minecraft 启动器",
  "跨平台 Minecraft 启动器",
  "Minecraft 模组管理器",
  "Modrinth",
  "CurseForge",
  "整合包",
  "光影",
  "资源包",
  "多实例管理",
  "陶瓦联机",
];
