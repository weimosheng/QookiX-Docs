/**
 * QookiX 官网 - Cloudflare Worker
 *
 * 职责：
 * 1. /api/releases 采用 SWR（Stale-While-Revalidate）策略：
 *    - 每次请求先返回 KV 缓存的最新数据（秒开，不依赖 GitHub）
 *    - 同时后台异步刷新：请求 GitHub 成功则更新 KV 缓存
 *    - 若 KV 无缓存且 GitHub 请求失败，回退到内置 fallback 数据
 *    => 下载页永远有数据，发布新版本后缓存会自动更新
 * 2. 其余请求回退到静态资源（out/ 目录）。
 *
 * 说明：前端优先直连国内镜像 release.json；失败时回退到本接口（GitHub 代理）。
 *
 * 依赖：
 * - wrangler.toml 的 [assets] 配置（绑定 ASSETS）
 * - wrangler.toml 的 [[kv_namespaces]]（绑定 QOOKIX_RELEASES）
 */

import fallback from "./fallback.json";

const GITHUB_API =
  "https://api.github.com/repos/weimosheng/QookiX-Launcher/releases/latest";
const CACHE_KEY = "latest_release";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

/** 请求 GitHub 最新 release，带重试；成功返回对象，失败返回 null */
async function fetchGitHubRelease(env) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "QookiX-Website",
  };
  // 可选：配置 GITHUB_TOKEN 提升限流额度
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }

  let upstream = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      upstream = await fetch(GITHUB_API, { headers });
      if (upstream.ok) break;
    } catch {
      // 网络异常，继续重试
    }
    // 指数退避：1s、2s
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }

  if (!upstream || !upstream.ok) return null;
  try {
    const data = await upstream.json();
    return data && data.tag_name ? data : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 动态 API：SWR 策略
    if (url.pathname === "/api/releases") {
      // 1. 先读 KV 缓存
      let cached = null;
      try {
        cached = await env.QOOKIX_RELEASES.get(CACHE_KEY, "json");
      } catch {
        // KV 不可用时忽略，走实时请求
      }

      // 2. 后台刷新任务：请求 GitHub，成功则更新 KV
      const refresh = async () => {
        const fresh = await fetchGitHubRelease(env);
        if (fresh) {
          try {
            await env.QOOKIX_RELEASES.put(CACHE_KEY, JSON.stringify(fresh));
          } catch {
            // 写缓存失败不影响响应
          }
        }
      };

      // 3. 有缓存：立即返回，同时后台刷新（SWR 核心）
      if (cached) {
        ctx.waitUntil(refresh());
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: jsonHeaders,
        });
      }

      // 4. 无缓存：同步请求一次，成功则返回并写入缓存
      const fresh = await fetchGitHubRelease(env);
      if (fresh) {
        ctx.waitUntil(
          env.QOOKIX_RELEASES.put(CACHE_KEY, JSON.stringify(fresh)).catch(() => {})
        );
        return new Response(JSON.stringify(fresh), {
          status: 200,
          headers: jsonHeaders,
        });
      }

      // 5. 全部失败：返回内置 fallback，保证永远可用
      return new Response(JSON.stringify(fallback), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 其余请求交给静态资源
    return env.ASSETS.fetch(request);
  },
};
