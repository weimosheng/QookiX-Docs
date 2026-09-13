/**
 * 站点地址常量。
 *
 * 官网与文档站是两个独立部署的站点（Vercel 上各自一个项目、各自绑定子域名），
 * 因此跨站跳转必须使用绝对地址，不能再写成 `/docs/` 这类同站相对路径。
 */

/** 主站（官网）地址。 */
export const MAIN_SITE_URL = "https://www.qookix.cn";

/** 文档站地址。 */
export const DOCS_URL = "https://docs.qookix.cn";
