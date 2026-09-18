import {
  createOgImage,
  ogAlt,
  ogContentType,
  ogSize,
} from "@/lib/og";

// output: "export" 下，动态生成的路由必须显式声明为静态，构建期预渲染成 PNG
export const dynamic = "force-static";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage();
}
