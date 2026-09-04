export interface GithubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
  download_count: number;
}

export interface GithubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  body: string;
  assets: GithubAsset[];
}

export interface PlatformDownload {
  id: string;
  platform: "windows" | "linux" | "macos";
  arch: "x64" | "arm64";
  label: string;
  format: string;
  asset: GithubAsset | null;
}

/**
 * 从 GitHub Release 获取下载信息
 */
export async function getLatestRelease(): Promise<GithubRelease | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "QookiX-Website",
    };

    // 若配置了 GITHUB_TOKEN，用于提升 GitHub API 限流额度（未认证仅 60 次/小时/IP）
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      "https://api.github.com/repos/weimosheng/QookiX-Launcher/releases/latest",
      {
        headers,
        // 缓存 5 分钟
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 从 assets 列表中智能匹配各平台下载
 */
export function parseDownloads(assets: GithubAsset[]): PlatformDownload[] {
  // 过滤掉 .sig 文件
  const validAssets = assets.filter((a) => !a.name.endsWith(".sig"));

  const findAsset = (patterns: string[]): GithubAsset | null => {
    for (const pattern of patterns) {
      const found = validAssets.find((a) =>
        a.name.toLowerCase().includes(pattern.toLowerCase())
      );
      if (found) return found;
    }
    return null;
  };

  return [
    // Windows
    {
      id: "windows-x64-setup",
      platform: "windows",
      arch: "x64",
      label: "Windows",
      format: "安装版 (exe)",
      asset: findAsset(["x64-setup.exe"]),
    },
    {
      id: "windows-x64-portable",
      platform: "windows",
      arch: "x64",
      label: "Windows",
      format: "便携版 (zip)",
      asset: findAsset(["x64_portable.zip"]),
    },
    // macOS
    {
      id: "macos-arm64",
      platform: "macos",
      arch: "arm64",
      label: "macOS (Apple Silicon)",
      format: "安装版 (dmg)",
      asset: findAsset(["aarch64.dmg"]),
    },
    {
      id: "macos-x64",
      platform: "macos",
      arch: "x64",
      label: "macOS (Intel)",
      format: "tar.gz",
      asset: findAsset(["app.tar.gz"]),
    },
    // Linux
    {
      id: "linux-x64-appimage",
      platform: "linux",
      arch: "x64",
      label: "Linux",
      format: "AppImage",
      asset: findAsset(["amd64.AppImage"]),
    },
    {
      id: "linux-x64-deb",
      platform: "linux",
      arch: "x64",
      label: "Linux (Debian/Ubuntu)",
      format: "DEB",
      asset: findAsset(["amd64.deb"]),
    },
    {
      id: "linux-x64-rpm",
      platform: "linux",
      arch: "x64",
      label: "Linux (Fedora/RHEL)",
      format: "RPM",
      asset: findAsset(["x86_64.rpm"]),
    },
  ];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
