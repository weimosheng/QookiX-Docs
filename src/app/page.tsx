import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import SpecLedger from "@/components/home/SpecLedger";
import { ContentHub, SkinCenter } from "@/components/home/DeepDive";
import CapabilityIndex from "@/components/home/CapabilityIndex";
import ActivityLedger from "@/components/home/ActivityLedger";
import ClosingCta from "@/components/home/ClosingCta";
import { MAIN_SITE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";

/** 页面级实体：为首页声明 WebPage（含主图），站点级实体在根 layout 声明。 */
const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${MAIN_SITE_URL}/#webpage`,
      url: `${MAIN_SITE_URL}/`,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": `${MAIN_SITE_URL}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${MAIN_SITE_URL}/screenshot-home.png`,
        caption: "QookiX Launcher 首页",
      },
      inLanguage: ["zh-CN", "en"],
    },
  ],
};

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: MAIN_SITE_URL,
    siteName: SITE_NAME,
    locale: "zh_CN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <div className="qx-page flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <Hero />
      <SpecLedger />
      <ContentHub />
      <SkinCenter />
      <CapabilityIndex />
      <ActivityLedger />
      <ClosingCta />
    </div>
  );
}
