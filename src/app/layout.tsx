import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/components/I18nProvider";
import {
  GITHUB_RELEASES_URL,
  GITHUB_REPO_URL,
  MAIN_SITE_URL,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_TITLE,
  SITE_VERIFICATION,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultTitle = SITE_TITLE;
const defaultDescription = SITE_DESCRIPTION;

/** 结构化数据：Organization + WebSite + 免费桌面软件信息。 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${MAIN_SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: SITE_SHORT_NAME,
      url: MAIN_SITE_URL,
      logo: `${MAIN_SITE_URL}/qookix-icon.png`,
      sameAs: [GITHUB_REPO_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${MAIN_SITE_URL}/#website`,
      url: MAIN_SITE_URL,
      name: SITE_NAME,
      description: defaultDescription,
      publisher: { "@id": `${MAIN_SITE_URL}/#organization` },
      inLanguage: ["zh-CN", "en"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${MAIN_SITE_URL}/#software`,
      name: SITE_NAME,
      alternateName: SITE_SHORT_NAME,
      description: defaultDescription,
      applicationCategory: "UtilitiesApplication",
      applicationSubCategory: "Minecraft Launcher",
      operatingSystem: "Windows, macOS, Linux",
      url: MAIN_SITE_URL,
      downloadUrl: `${MAIN_SITE_URL}/download`,
      codeRepository: GITHUB_REPO_URL,
      softwareVersion: "latest",
      isAccessibleForFree: true,
      inLanguage: ["zh-CN", "en"],
      publisher: { "@id": `${MAIN_SITE_URL}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CNY",
        url: GITHUB_RELEASES_URL,
      },
      screenshot: [
        `${MAIN_SITE_URL}/screenshot-home.png`,
        `${MAIN_SITE_URL}/screenshot-content.png`,
        `${MAIN_SITE_URL}/screenshot-skin.png`,
      ],
      featureList: [
        "Modrinth 与 CurseForge 双内容中心",
        "模组、整合包、光影、资源包一键安装与升级",
        "多实例管理",
        "无广告、无遥测",
        "跨平台（Windows / Linux / macOS / Android）",
        "集成陶瓦联机（Android暂不支持）",
      ],
    },
  ],
};

export const metadata: Metadata = {
  // 所有相对路径（canonical、OG 图等）都基于此解析，避免导出成站内相对地址
  metadataBase: new URL(MAIN_SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: GITHUB_REPO_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Utilities",
  classification: "Minecraft Launcher",
  alternates: {
    canonical: "/",
  },
  // 图标由 scripts/generate-icons.mjs 生成：
  // 尺寸取 48 的倍数（Google 硬性要求），并提供真正的 ICO 供百度 / 必应 / 老浏览器抓取
  icons: {
    icon: [
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon", sizes: "any" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "zh_CN",
    alternateLocale: "en_US",
    url: "/",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  // 配置环境变量后自动输出，用于在各站长平台验证站点所有权
  verification: {
    google: SITE_VERIFICATION.google,
    other: {
      ...(SITE_VERIFICATION.bing
        ? { "msvalidate.01": SITE_VERIFICATION.bing }
        : {}),
      ...(SITE_VERIFICATION.baidu
        ? { "baidu-site-verification": SITE_VERIFICATION.baidu }
        : {}),
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // og:image / twitter:image 由 opengraph-image.tsx 与 twitter-image.tsx 自动生成
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 与启动器外壳同色，浏览器标题栏与滚动条据此跟随深色
  themeColor: "#0b0d12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-bg-base`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-base" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <I18nProvider>
          {/* 固定导航 */}
          <Navbar />

          {/* 主内容区 */}
          <main className="flex-1 relative z-10">{children}</main>

          {/* 页脚 */}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
