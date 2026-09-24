"use client";

import { useSyncExternalStore } from "react";
import type { GithubRelease } from "./github";

/**
 * 首页实时数据：版本信息与最近提交。
 *
 * 策略：缓存优先。
 *  - 首次成功获取后写入 localStorage；之后每次进页面先直接展示缓存。
 *  - 展示缓存的同时后台拉一次 GitHub；成功就更新缓存与界面。
 *  - 失败不显示任何错误态，只保留上一次内容，并每隔 30 秒在后台重试，直到成功。
 */

const MIRROR_RELEASE_JSON = "https://qookix.cn-nb1.rains3.com/release.json";
const GITHUB_RELEASE_LATEST =
  "https://api.github.com/repos/weimosheng/QookiX-Launcher/releases/latest";
const GITHUB_COMMITS =
  "https://api.github.com/repos/weimosheng/QookiX-Launcher/commits?per_page=8";

const RETRY_MS = 30_000;
const RELEASE_KEY = "qookix.feed.release";
const COMMITS_KEY = "qookix.feed.commits";

export interface ReleaseInfo {
  tag: string;
  publishedAt: string;
  url: string;
  assetCount: number;
}

export interface CommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
  author: string;
  url: string;
}

type FeedStatus = "loading" | "ready";
interface FeedSnapshot<T> {
  data: T | null;
  status: FeedStatus;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function toReleaseInfo(raw: GithubRelease): ReleaseInfo {
  return {
    tag: raw.tag_name,
    publishedAt: raw.published_at,
    url: raw.html_url,
    assetCount: (raw.assets ?? []).filter((a) => !a.name.endsWith(".sig")).length,
  };
}

/** 镜像优先，失败回退 GitHub。 */
async function loadRelease(): Promise<ReleaseInfo> {
  const raw = await fetchJson(MIRROR_RELEASE_JSON).catch(async () =>
    fetchJson(GITHUB_RELEASE_LATEST)
  );
  const r = raw as GithubRelease;
  if (!r?.tag_name) throw new Error("invalid release json");
  return toReleaseInfo(r);
}

interface RawCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name?: string; date?: string } | null;
  };
}

async function loadCommits(): Promise<CommitInfo[]> {
  const raw = await fetchJson(GITHUB_COMMITS);
  return (raw as RawCommit[]).map((c) => ({
    sha: c.sha,
    shortSha: c.sha.slice(0, 7),
    message: c.commit.message.split("\n")[0] ?? "",
    date: c.commit.author?.date ?? "",
    author: c.commit.author?.name ?? "",
    url: c.html_url,
  }));
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: T };
    return parsed?.data ?? null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, at: Date.now() }));
  } catch {
    /* 配额或隐私模式，忽略 */
  }
}

/**
 * 一个共享的缓存优先数据源：多个组件订阅同一份快照，
 * 只在第一个订阅者挂载时启动一次后台拉取；失败每 30 秒重试，成功即停。
 */
function createFeed<T>(key: string, loader: () => Promise<T>) {
  const LOADING: FeedSnapshot<T> = { data: null, status: "loading" };
  let snapshot: FeedSnapshot<T> = LOADING;
  let started = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const subs = new Set<() => void>();

  const emit = () => subs.forEach((cb) => cb());

  async function attempt() {
    try {
      const data = await loader();
      snapshot = { data, status: "ready" };
      writeCache(key, data);
      emit();
      return; // 成功：本轮不再重试
    } catch {
      /* 失败：保留当前快照（缓存或 loading），下面安排重试 */
    }
    if (subs.size > 0) timer = setTimeout(attempt, RETRY_MS);
  }

  function start() {
    if (started || typeof window === "undefined") return;
    started = true;
    const cached = readCache<T>(key);
    if (cached != null) {
      snapshot = { data: cached, status: "ready" };
      emit();
    }
    void attempt();
  }

  function subscribe(cb: () => void) {
    subs.add(cb);
    start();
    return () => {
      subs.delete(cb);
      if (subs.size === 0) {
        if (timer) clearTimeout(timer);
        timer = null;
        started = false; // 允许下次挂载重新水合
      }
    };
  }

  const getSnapshot = () => snapshot;
  return () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const useReleaseFeed = createFeed<ReleaseInfo>(RELEASE_KEY, loadRelease);
const useCommitsFeed = createFeed<CommitInfo[]>(COMMITS_KEY, loadCommits);

export function useLatestRelease() {
  return useReleaseFeed();
}

export function useRecentCommits() {
  return useCommitsFeed();
}

/** 相对时间，措辞与启动器 InstanceCard 的 relTime 保持一致。 */
export function relativeTime(iso: string, locale: "zh" | "en"): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  const en = locale === "en";
  if (mins < 1) return en ? "just now" : "刚刚";
  if (mins < 60) return en ? `${mins}m ago` : `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return en ? `${hours}h ago` : `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days === 1) return en ? "yesterday" : "昨天";
  if (days === 2) return en ? "2 days ago" : "前天";
  if (days < 30) return en ? `${days} days ago` : `${days} 天前`;
  return new Date(iso).toLocaleDateString(en ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
