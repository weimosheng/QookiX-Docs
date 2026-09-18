import type { MetadataRoute } from "next";
import { MAIN_SITE_URL } from "@/lib/site";

// output: "export" 下，元数据路由同样需要显式声明静态化
export const dynamic = "force-static";

/** 站点地图：便于爬虫完整发现并周期性重抓全部页面。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: MAIN_SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${MAIN_SITE_URL}/screenshot-home.png`,
        `${MAIN_SITE_URL}/screenshot-content.png`,
        `${MAIN_SITE_URL}/screenshot-skin.png`,
      ],
    },
    {
      url: `${MAIN_SITE_URL}/download`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
