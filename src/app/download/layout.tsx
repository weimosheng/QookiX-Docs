import type { Metadata } from "next";
import { MAIN_SITE_URL, SITE_NAME } from "@/lib/site";

const DOWNLOAD_TITLE = `下载 ${SITE_NAME} - Windows / macOS / Linux`;
const DOWNLOAD_DESCRIPTION =
  "免费下载 QookiX Launcher：支持 Windows（安装包 / 免安装版）、macOS（Intel / Apple Silicon）、Linux（AppImage / deb / rpm），一键安装并自动更新。";

const DOWNLOAD_URL = `${MAIN_SITE_URL}/download`;

/**
 * 面包屑 + 页面实体。
 *
 * BreadcrumbList 让搜索结果用「首页 › 下载」的层级样式替代原始 URL 展示，
 * 页面上也渲染了对应的可见面包屑（见 components/Breadcrumbs.tsx）。
 */
const downloadStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": `${DOWNLOAD_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "首页",
          item: `${MAIN_SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "下载",
          item: DOWNLOAD_URL,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${DOWNLOAD_URL}#webpage`,
      url: DOWNLOAD_URL,
      name: DOWNLOAD_TITLE,
      description: DOWNLOAD_DESCRIPTION,
      isPartOf: { "@id": `${MAIN_SITE_URL}/#website` },
      breadcrumb: { "@id": `${DOWNLOAD_URL}#breadcrumb` },
      inLanguage: ["zh-CN", "en"],
    },
  ],
};

/**
 * /download 页面本体是 Client Component，无法导出 metadata，
 * 因此在这里（Server Component layout）统一提供该路由的 SEO 信息。
 *
 * 站点级实体（Organization / WebSite / SoftwareApplication）已在根 layout 声明，
 * 此处只补充页面级实体并通过 @id 引用，避免重复定义同一实体。
 */
export const metadata: Metadata = {
  // 使用 absolute 避免再被根 layout 的 title template 追加站点名导致标题过长
  title: { absolute: DOWNLOAD_TITLE },
  description: DOWNLOAD_DESCRIPTION,
  alternates: {
    canonical: "/download",
  },
  openGraph: {
    type: "website",
    title: DOWNLOAD_TITLE,
    description: DOWNLOAD_DESCRIPTION,
    url: DOWNLOAD_URL,
    siteName: SITE_NAME,
    locale: "zh_CN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DOWNLOAD_TITLE,
    description: DOWNLOAD_DESCRIPTION,
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(downloadStructuredData),
        }}
      />
      {children}
    </>
  );
}
