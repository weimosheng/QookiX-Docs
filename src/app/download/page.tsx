"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  ExternalLink,
  Package,
  AlertCircle,
  Loader2,
  Monitor,
  Command,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import GithubIcon from "@/components/GithubIcon";
import StripesBackground from "@/components/StripesBackground";
import {
  parseDownloads,
  formatFileSize,
  formatDate,
  type GithubRelease,
} from "@/lib/github";

type Platform = "windows" | "linux" | "macos";

interface ApiDownloadAsset {
  name: string;
  browser_download_url: string;
  size: number;
  size_label: string;
}

interface ApiDownload {
  id: string;
  platform: Platform;
  arch: string;
  label: string;
  format: string;
  asset: ApiDownloadAsset | null;
}

interface ApiRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  formatted_date: string;
  downloads: ApiDownload[];
}

const platformMeta: Record<
  Platform,
  { label: string; icon: LucideIcon; order: number }
> = {
  windows: { label: "Windows", icon: Monitor, order: 0 },
  macos: { label: "macOS", icon: Command, order: 1 },
  linux: { label: "Linux", icon: Terminal, order: 2 },
};

// 国内镜像站：优先直连其 release.json（不经 Worker/Cloudflare），失败回退 /api/releases（Worker 代理 GitHub）。
// 拿到镜像数据后把下载链接改写为镜像站文件 URL（镜像站文件用空格名 QookiX Launcher）。
const MIRROR_BASE = "https://qookix.cn-nb1.rains3.com";
const MIRROR_RELEASE_JSON = `${MIRROR_BASE}/release.json`;

export default function DownloadPage() {
  const [release, setRelease] = useState<ApiRelease | null>(null);
  const [downloads, setDownloads] = useState<ApiDownload[]>([]);
  const [activePlatform, setActivePlatform] = useState<Platform>("windows");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // 优先直连国内镜像 release.json（不经 Worker/Cloudflare）；
    // 失败回退 /api/releases（Worker 代理 GitHub）
    fetch(MIRROR_RELEASE_JSON, { cache: "no-store", signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((raw: GithubRelease) => {
        if (!raw || !Array.isArray(raw.assets) || !raw.tag_name) {
          throw new Error("invalid mirror release json");
        }
        // 改写下载链接指向镜像站：镜像站文件用空格名 "QookiX Launcher"，
        // 而 GitHub asset 名是点名 "QookiX.Launcher"，需替换以免 404
        return {
          ...raw,
          assets: raw.assets.map((a) => ({
            ...a,
            browser_download_url: `${MIRROR_BASE}/${a.name.replace(
              /QookiX\.Launcher/g,
              "QookiX%20Launcher"
            )}`,
          })),
        };
      })
      .catch(() =>
        fetch("/api/releases", { cache: "no-store", signal }).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
      )
      .then((raw: GithubRelease) => {
        const downloads: ApiDownload[] = parseDownloads(raw.assets).map(
          (d) => ({
            id: d.id,
            platform: d.platform,
            arch: d.arch,
            label: d.label,
            format: d.format,
            asset: d.asset
              ? {
                  name: d.asset.name,
                  browser_download_url: d.asset.browser_download_url,
                  size: d.asset.size,
                  size_label: formatFileSize(d.asset.size),
                }
              : null,
          })
        );
        const data: ApiRelease = {
          tag_name: raw.tag_name,
          name: raw.name,
          published_at: raw.published_at,
          html_url: raw.html_url,
          prerelease: raw.prerelease,
          formatted_date: formatDate(raw.published_at),
          downloads,
        };
        setRelease(data);
        setDownloads(downloads);
      })
      .catch(() => {
        if (signal.aborted) return;
        setError(true);
      })
      .finally(() => {
        if (signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const platformDownloads = downloads.filter(
    (d) => d.platform === activePlatform && d.asset
  );

  // 获取当前激活平台的首个可用下载
  const primaryDownload = platformDownloads[0]?.asset;

  return (
    <>
      {/* 条纹背景（覆盖全局连线背景） */}
      <StripesBackground />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* 金色光晕装饰 */}
        <div
          className="glow-orb"
          style={{
            top: "20%",
            left: "50%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, var(--glow-bg-accent) 0%, transparent 70%)",
            transform: "translateX(-50%)",
          }}
        />

      <div className="relative z-10 w-full max-w-4xl">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium text-accent tracking-[0.2em] uppercase mb-4 block">
            获取
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
            下载{" "}
            <span className="gradient-text">QookiX Launcher</span>
          </h1>
          {release && (
            <p className="text-text-secondary">
              <span className="text-accent font-semibold">
                {release.tag_name}
              </span>
              <span className="mx-2">·</span>
              发布于 {release.formatted_date}
            </p>
          )}
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="text-accent animate-spin" />
            <p className="text-text-secondary text-sm">正在获取最新版本信息...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card-gold p-8 text-center">
            <AlertCircle
              size={40}
              className="text-accent mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              暂时无法获取下载信息
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              请直接前往 GitHub Releases 页面下载最新版本。
            </p>
            <a
              href="https://github.com/weimosheng/QookiX-Launcher/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <GithubIcon size={18} />
              GitHub Releases
            </a>
          </div>
        )}

        {!loading && !error && release && (
          <>
            {/* 平台选择器 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-bg-card border border-border-subtle">
                {(Object.keys(platformMeta) as Platform[])
                  .sort(
                    (a, b) =>
                      platformMeta[a].order - platformMeta[b].order
                  )
                  .map((p) => {
                    const hasDownload = downloads.some(
                      (d) => d.platform === p && d.asset
                    );
                    const isActive = activePlatform === p;
                    const Icon = platformMeta[p].icon;
                    return (
                      <button
                        key={p}
                        onClick={() => hasDownload && setActivePlatform(p)}
                        disabled={!hasDownload}
                        className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-accent-light to-accent text-bg-base shadow-lg shadow-accent-glow/30"
                            : hasDownload
                            ? "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
                            : "text-text-tertiary cursor-not-allowed opacity-40"
                        }`}
                      >
                        <Icon size={16} />
                        {platformMeta[p].label}
                      </button>
                    );
                  })}
              </div>
            </motion.div>

            {/* 主下载按钮 */}
            {primaryDownload && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="mb-12"
              >
                <div className="text-center">
                  <a
                    href={primaryDownload.browser_download_url}
                    className="btn-primary !px-12 !py-5 text-base"
                  >
                    <Download size={22} />
                    下载 {platformMeta[activePlatform].label} ({primaryDownload.size_label})
                  </a>
                </div>
                <p className="text-text-tertiary text-xs mt-3 text-center">
                  {primaryDownload.name}
                </p>
              </motion.div>
            )}

            {/* 该平台的所有下载选项 */}
            {platformDownloads.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                className="mb-12"
              >
                <h3 className="text-center text-xs font-medium text-text-tertiary tracking-wider uppercase mb-5">
                  其他下载格式
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {platformDownloads.map((d) => (
                    <a
                      key={d.id}
                      href={d.asset!.browser_download_url}
                      className="card-gold p-4 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-soft border border-border-accent flex items-center justify-center">
                          <Package size={18} className="text-accent" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {d.format}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {d.asset!.size_label}
                          </div>
                        </div>
                      </div>
                      <ExternalLink
                        size={16}
                        className="text-text-tertiary group-hover:text-accent transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Release 链接 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center mt-10"
            >
              <a
                href={release.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
              >
                <GithubIcon size={16} />
                查看完整 Release Notes
                <ExternalLink size={14} />
              </a>
            </motion.div>
          </>
        )}
      </div>
    </section>
    </>
  );
}
