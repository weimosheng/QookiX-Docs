import type { MetadataRoute } from "next";
import { MAIN_SITE_URL } from "@/lib/site";

// output: "export" 下，元数据路由同样需要显式声明静态化
export const dynamic = "force-static";

/** robots.txt：全站开放抓取，并指向 sitemap。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${MAIN_SITE_URL}/sitemap.xml`,
    host: MAIN_SITE_URL,
  };
}
