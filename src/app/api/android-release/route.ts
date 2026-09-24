import { NextResponse } from "next/server";

/**
 * Android 版发布信息代理。
 *
 * Android 版在独立仓库发布，且国内网络直连 api.github.com 经常被阻断，
 * 因此由服务端代取最新 Release，浏览器只请求同源接口。
 */
const UPSTREAM =
  "https://api.github.com/repos/ZhaYi-Miao/QookiX-Launcher-Android/releases/latest";

export const revalidate = 600;

export async function GET() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "QookiX-Website",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(UPSTREAM, { headers, next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 });
  }
}
