import { NextResponse } from "next/server";
import { getLatestRelease } from "@/lib/github";

// 服务端缓存 5 分钟，避免每次访问都打到 GitHub
export const revalidate = 300;

/**
 * 服务端代理：获取最新 Release，浏览器端只请求同源地址，
 * 避免跨域请求触发浏览器本地网络访问权限、并规避 GitHub 限流。
 */
export async function GET() {
  const release = await getLatestRelease();
  if (!release) {
    return NextResponse.json({ error: "failed_to_fetch" }, { status: 502 });
  }
  return NextResponse.json(release);
}
