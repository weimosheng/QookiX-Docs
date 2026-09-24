import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { GITHUB_REPO_URL } from "@/lib/site";

/** OG 图尺寸（1.91:1，社交平台通用）。 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = "QookiX Launcher – A free, open-source Minecraft launcher";

/**
 * 读取本地 logo 转成 data URI，供 satori 内联渲染。
 *
 * 走本地文件而非网络地址，保证离线/受限构建环境也能产出 OG 图；
 * 读取失败时降级为纯文字排版，不影响构建。
 */
async function loadLogoDataUri(): Promise<string | null> {
  try {
    const file = await readFile(
      join(process.cwd(), "public", "qookix-icon.png")
    );
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * 生成分享卡片（OG / Twitter 共用）。
 *
 * 注意：内置字体只有拉丁字形，因此图上文案统一使用英文，避免中文渲染成方块。
 */
export async function createOgImage(): Promise<ImageResponse> {
  const logo = await loadLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0b0d12",
          backgroundImage:
            "radial-gradient(1000px 620px at 8% -10%, rgba(232,154,75,0.30) 0%, rgba(10,10,12,0) 62%)",
          color: "#f2f3f7",
        }}
      >
        {/* 顶部：品牌 */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {logo ? <img src={logo} width={84} height={84} alt="" /> : null}
          <div
            style={{
              display: "flex",
              marginLeft: logo ? 26 : 0,
              fontSize: 38,
              fontWeight: 400,
              letterSpacing: -1,
              color: "#e89a4b",
            }}
          >
            QookiX
          </div>
        </div>

        {/* 中部：主标题 + 卖点 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 400,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            QookiX Launcher
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 36,
              fontWeight: 400,
              color: "#b4b6c0",
            }}
          >
            Free, clean and ad-free Minecraft launcher
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              fontWeight: 400,
              color: "#e89a4b",
            }}
          >
            Modrinth &amp; CurseForge · Multi-instance · Cross-platform
          </div>
        </div>

        {/* 底部：平台 + 开源 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: "1px solid rgba(232,154,75,0.35)",
            fontSize: 26,
            color: "#7a7d8a",
          }}
        >
          <div style={{ display: "flex" }}>
            Windows · macOS · Linux
          </div>
          <div style={{ display: "flex", color: "#b4b6c0" }}>
            {GITHUB_REPO_URL.replace("https://github.com/", "github.com/")}
          </div>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
