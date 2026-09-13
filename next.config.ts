import type { NextConfig } from "next";

// 主站独立部署在 www.qookix.cn 的根路径下，不再使用任何仓库子路径前缀。
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
