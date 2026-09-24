"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Command,
  Download,
  Monitor,
  Package,
  Smartphone,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import GithubIcon from "@/components/GithubIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useI18n } from "@/components/I18nProvider";
import { DUR, EASE } from "@/components/home/motion";
import {
  parseDownloads,
  formatFileSize,
  formatDate,
  type GithubRelease,
} from "@/lib/github";
import {
  GITHUB_ANDROID_RELEASES_URL,
  GITHUB_ANDROID_REPO_URL,
  GITHUB_RELEASES_URL,
} from "@/lib/site";

type Platform = "windows" | "linux" | "macos" | "android";

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
  downloads: ApiDownload[];
}

const platformMeta: Record<Platform, { label: string; icon: LucideIcon; order: number }> = {
  windows: { label: "Windows", icon: Monitor, order: 0 },
  macos: { label: "macOS", icon: Command, order: 1 },
  linux: { label: "Linux", icon: Terminal, order: 2 },
  android: { label: "Android", icon: Smartphone, order: 3 },
};
const ORDERED: Platform[] = (Object.keys(platformMeta) as Platform[]).sort(
  (a, b) => platformMeta[a].order - platformMeta[b].order
);

const MIRROR_BASE = "https://qookix.cn-nb1.rains3.com";
const MIRROR_RELEASE_JSON = `${MIRROR_BASE}/release.json`;
const GITHUB_LATEST =
  "https://api.github.com/repos/weimosheng/QookiX-Launcher/releases/latest";
const ANDROID_API = "/api/android-release";
const GITHUB_ANDROID_LATEST =
  "https://api.github.com/repos/ZhaYi-Miao/QookiX-Launcher-Android/releases/latest";
const CACHE_KEY = "qookix.download.release";
const ANDROID_CACHE_KEY = "qookix.download.android";
const RETRY_MS = 30_000;

async function fetchMirror(): Promise<GithubRelease> {
  const res = await fetch(MIRROR_RELEASE_JSON, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = (await res.json()) as GithubRelease;
  if (!raw || !Array.isArray(raw.assets) || !raw.tag_name)
    throw new Error("invalid mirror release json");
  // 镜像按文件名直链分发，重写下载地址指向对象存储
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
}

async function fetchGithub(): Promise<GithubRelease> {
  const res = await fetch(GITHUB_LATEST, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as GithubRelease;
}

function toApiRelease(raw: GithubRelease): ApiRelease {
  const downloads: ApiDownload[] = parseDownloads(raw.assets).map((d) => ({
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
  }));
  return {
    tag_name: raw.tag_name,
    name: raw.name,
    published_at: raw.published_at,
    html_url: raw.html_url,
    prerelease: raw.prerelease,
    downloads,
  };
}

interface ApiAndroidRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  download: ApiDownload;
}

/** Android 版在独立仓库发布，只发一个 arm64 的 APK。 */
async function fetchAndroid(): Promise<ApiAndroidRelease> {
  // 优先走同源代理（国内直连 GitHub API 常被阻断），失败再回退直连
  let raw: GithubRelease | null = null;
  try {
    const res = await fetch(ANDROID_API, { cache: "no-store" });
    if (res.ok) raw = (await res.json()) as GithubRelease;
  } catch {
    /* 同源接口不可用，落到下面的直连兜底 */
  }
  if (!raw?.assets) {
    const res = await fetch(GITHUB_ANDROID_LATEST, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    raw = (await res.json()) as GithubRelease;
  }
  const apk = raw.assets?.find((a) => a.name.toLowerCase().endsWith(".apk"));
  if (!apk) throw new Error("no apk asset in latest android release");
  return {
    tag_name: raw.tag_name,
    published_at: raw.published_at,
    html_url: raw.html_url,
    download: {
      id: "android-arm64-apk",
      platform: "android",
      arch: "arm64",
      label: "Android",
      format: "apk",
      asset: {
        name: apk.name,
        browser_download_url: apk.browser_download_url,
        size: apk.size,
        size_label: formatFileSize(apk.size),
      },
    },
  };
}

export default function DownloadPage() {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const [release, setRelease] = useState<ApiRelease | null>(null);
  const [downloads, setDownloads] = useState<ApiDownload[]>([]);
  const [android, setAndroid] = useState<ApiAndroidRelease | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform>("windows");
  const [error, setError] = useState(false);
  const defaulted = useRef(false);
  const tabRefs = useRef<Partial<Record<Platform, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // 设备识别：安卓设备访问时默认选中 Android
  useEffect(() => {
    if (typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)) {
      defaulted.current = true;
      setActivePlatform("android");
    }
  }, []);

  // 滑动高亮块：跟随当前选中的平台按钮
  useEffect(() => {
    const sync = () => {
      const el = tabRefs.current[activePlatform];
      if (!el) return;
      setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
    // 依赖里带上数据状态：tab 行随数据出现后需要重新量一次
  }, [activePlatform, downloads, release, android, error, locale]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let gotData = false;

    const apply = (data: ApiRelease) => {
      setRelease(data);
      setDownloads(data.downloads);
      gotData = true;
      if (!defaulted.current) {
        defaulted.current = true;
        const first = ORDERED.find((p) =>
          data.downloads.some((d) => d.platform === p && d.asset)
        );
        if (first) setActivePlatform(first);
      }
    };

    // 缓存优先：先直接展示上次拿到的结果
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = (JSON.parse(raw) as { data?: ApiRelease }).data;
        if (cached) apply(cached);
      }
    } catch {
      /* 忽略读取异常 */
    }

    const attempt = async () => {
      let data: ApiRelease | null = null;
      try {
        data = toApiRelease(await fetchMirror().catch(fetchGithub));
      } catch {
        data = null;
      }
      if (!active) return;
      if (data) {
        apply(data);
        setError(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
        } catch {
          /* 配额或隐私模式，忽略 */
        }
      } else if (!gotData) {
        setError(true); // 从没拿到过数据才提示，否则保留缓存静默重试
        timer = setTimeout(attempt, RETRY_MS);
      } else {
        timer = setTimeout(attempt, RETRY_MS);
      }
    };
    void attempt();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Android 版信息：独立仓库，单独拉取并缓存
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let gotData = false;

    try {
      const raw = localStorage.getItem(ANDROID_CACHE_KEY);
      if (raw) {
        const cached = (JSON.parse(raw) as { data?: ApiAndroidRelease }).data;
        if (cached) {
          setAndroid(cached);
          gotData = true;
        }
      }
    } catch {
      /* 忽略读取异常 */
    }

    const attempt = async () => {
      try {
        const data = await fetchAndroid();
        if (!active) return;
        setAndroid(data);
        gotData = true;
        try {
          localStorage.setItem(
            ANDROID_CACHE_KEY,
            JSON.stringify({ data, at: Date.now() })
          );
        } catch {
          /* 配额或隐私模式，忽略 */
        }
      } catch {
        if (!active || gotData) return;
        timer = setTimeout(attempt, RETRY_MS);
      }
    };
    void attempt();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const allDownloads = android ? [...downloads, android.download] : downloads;
  const platformDownloads = allDownloads.filter(
    (d) => d.platform === activePlatform && d.asset
  );
  const primaryDownload = platformDownloads[0]?.asset ?? null;
  const otherDownloads = platformDownloads.slice(1);
  const loading = !release && !error;
  // Android 在独立仓库，桌面版数据缺失也保持可点，缺失时给出仓库兜底入口
  const hasAsset = (p: Platform): boolean =>
    p === "android" ||
    allDownloads.some((d) => d.platform === p && d.asset);
  const activeRelease =
    activePlatform === "android"
      ? android
        ? {
            tag_name: android.tag_name,
            published_at: android.published_at,
            html_url: android.html_url,
          }
        : null
      : release;

  const formatLabel = (key: string): string =>
    (t.download.formats as Record<string, string>)[key] ?? key;

  return (
    <div className="qx-page min-h-screen">
      <section
        className="qx-section qx-gutter"
        style={{ background: "var(--qx-bg-0)" }}
      >
        <div className="qx-shell max-w-[62rem]">
          <Breadcrumbs
            items={[
              { label: t.nav.home, href: "/" },
              { label: t.nav.download },
            ]}
          />

          <header>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.medium, ease: EASE }}
              className="qx-label"
            >
              {t.download.eyebrow}
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE }}
              className="qx-display mt-4"
            >
              {t.download.titlePrefix}{" "}
              <span style={{ color: "var(--qx-amber)" }}>QookiX Launcher</span>
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE, delay: 0.08 }}
              className="qx-lead mt-6"
            >
              {t.download.lead}
            </motion.p>
            {activeRelease && (
              <p className="qx-mono mt-6 text-[13px] text-[var(--qx-t3)]">
                <span className="font-semibold text-[var(--qx-amber)]">
                  {activeRelease.tag_name}
                </span>
                <span className="mx-2">·</span>
                {t.download.publishedOn}{" "}
                {formatDate(activeRelease.published_at, locale)}
              </p>
            )}
          </header>

          <div className="mt-14">
            {loading ? (
              <Sweep />
            ) : error && !release && !android ? (
              <Fallback t={t} />
            ) : (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.medium, ease: EASE }}
              >
                {/* 平台选择：高亮块在按钮之间平移 */}
                <div
                  role="tablist"
                  aria-label={t.nav.download}
                  className="relative inline-flex gap-1 overflow-x-auto rounded-xl border border-[var(--qx-line)] bg-[var(--qx-panel)] p-1.5"
                >
                  {pill && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute z-0 rounded-lg"
                      style={{
                        left: pill.left,
                        width: pill.width,
                        top: 6,
                        bottom: 6,
                        background:
                          "linear-gradient(135deg, var(--qx-amber), var(--qx-amber-lo))",
                        transition:
                          "left 0.22s cubic-bezier(0.22,1,0.36,1), width 0.22s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    />
                  )}
                  {ORDERED.map((p) => {
                    const has = hasAsset(p);
                    const isActive = p === activePlatform;
                    const Icon = platformMeta[p].icon;
                    return (
                      <button
                        key={p}
                        ref={(el) => {
                          tabRefs.current[p] = el;
                        }}
                        type="button"
                        role="tab"
                        disabled={!has}
                        onClick={() => has && setActivePlatform(p)}
                        aria-selected={isActive}
                        className="relative z-10 inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        style={
                          isActive
                            ? { color: "var(--qx-ink)" }
                            : { color: "var(--qx-t2)" }
                        }
                      >
                        <Icon size={15} />
                        {platformMeta[p].label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px] text-[var(--qx-t3)]">
                  {t.download.hint}
                </p>

                {/* 主下载 */}
                {primaryDownload && (
                  <div className="mt-8">
                    <a
                      href={primaryDownload.browser_download_url}
                      className="qx-btn qx-btn-primary !px-8 !py-4 !text-base"
                    >
                      <Download size={18} />
                      {t.download.downloadButton} {platformMeta[activePlatform].label}
                      <span className="qx-mono opacity-70">
                        {" · "}
                        {primaryDownload.size_label}
                      </span>
                    </a>
                    <p className="qx-mono mt-3 text-[12px] text-[var(--qx-t3)]">
                      {primaryDownload.name}
                    </p>
                  </div>
                )}

                {/* Android 版仓库入口 */}
                {activePlatform === "android" && (
                  <div className="mt-4">
                    <a
                      href={GITHUB_ANDROID_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="qx-link inline-flex items-center gap-2 text-[13px]"
                    >
                      <GithubIcon size={15} />
                      {t.download.androidRepo}
                    </a>
                  </div>
                )}

                {/* Android 数据拿不到时的兜底 */}
                {activePlatform === "android" && !android && (
                  <div className="qx-panel mt-8 p-6">
                    <p className="text-[13px] leading-relaxed text-[var(--qx-t2)]">
                      {t.download.androidFallback}
                    </p>
                    <a
                      href={GITHUB_ANDROID_RELEASES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="qx-btn qx-btn-ghost mt-5"
                    >
                      <GithubIcon size={16} />
                      GitHub Releases
                    </a>
                  </div>
                )}

                {/* 其他格式 */}
                {otherDownloads.length > 0 && (
                  <div className="mt-12">
                    <h2 className="qx-label">{t.download.otherFormats}</h2>
                    <div className="mt-3 border-t border-[var(--qx-line)]">
                      {otherDownloads.map((d) => (
                        <a
                          key={d.id}
                          href={d.asset!.browser_download_url}
                          className="group flex items-center justify-between gap-4 border-b border-[var(--qx-line)] py-4"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-[var(--qx-line)] bg-[var(--qx-a-08)] text-[var(--qx-amber)]">
                              <Package size={16} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] text-[var(--qx-t1)] transition-colors group-hover:text-[var(--qx-amber)]">
                                {formatLabel(d.format)}
                              </span>
                              <span className="qx-mono block text-[12px] text-[var(--qx-t3)]">
                                {d.asset!.size_label} · {d.arch}
                              </span>
                            </span>
                          </span>
                          <Download
                            size={16}
                            className="flex-shrink-0 text-[var(--qx-t3)] transition-colors group-hover:text-[var(--qx-amber)]"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Release Notes */}
                {activeRelease && (
                  <a
                    href={activeRelease.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qx-link mt-12 inline-flex items-center gap-2 text-[13px]"
                  >
                    <GithubIcon size={15} />
                    {t.download.viewReleaseNotes}
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** 首次尚无数据时的读取指示：一条沿水平方向走过的琥珀线。 */
function Sweep() {
  const reduce = useReducedMotion();
  if (reduce) return <div className="qx-rule" />;
  return (
    <div className="relative h-px overflow-hidden bg-[var(--qx-line)]">
      <motion.span
        className="absolute inset-y-0 w-1/3"
        style={{ background: "var(--qx-amber)" }}
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/** 从没拿到过任何数据（无缓存且拉取失败）时的兜底：直接给去仓库的路。 */
function Fallback({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className="qx-panel p-8">
      <h2 className="qx-h3">{t.download.errorTitle}</h2>
      <p className="mt-3 text-[13px] leading-relaxed text-[var(--qx-t2)]">
        {t.download.errorDesc}
      </p>
      <a
        href={GITHUB_RELEASES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="qx-btn qx-btn-ghost mt-6"
      >
        <GithubIcon size={16} />
        GitHub Releases
      </a>
    </div>
  );
}
