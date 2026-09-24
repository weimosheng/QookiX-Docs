"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft } from "lucide-react";
import { DUR, EASE } from "./motion";
import { useI18n } from "@/components/I18nProvider";
import { relativeTime, useLatestRelease, useRecentCommits } from "@/lib/feed";

/**
 * 实时动态：最近提交与最新发布。缓存优先展示，后台静默刷新，
 * 拉不到就继续显示上一次的内容——不出现失败态。
 */
export default function ActivityLedger() {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const feed = t.home.feed;
  const { data: commits } = useRecentCommits();
  const { data: release } = useLatestRelease();

  return (
    <section
      id="activity"
      className="qx-section qx-gutter scroll-mt-24"
      style={{
        background: "var(--qx-bg-1)",
        borderTop: "1px solid var(--qx-line)",
      }}
    >
      <div className="qx-shell">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--qx-line)] pb-7">
          <h2 className="qx-h2 max-w-[20ch]">{feed.title}</h2>
          <p className="qx-label">{feed.eyebrow}</p>
        </header>

        <div className="grid gap-x-16 gap-y-12 pt-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
          {/* 最近提交 */}
          <div>
            <h3 className="qx-label">{feed.commits}</h3>

            {commits && commits.length ? (
              <ul className="mt-2">
                {commits.slice(0, 7).map((c, i) => (
                  <motion.li
                    key={c.sha}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: DUR.fast, ease: EASE, delay: i * 0.04 }}
                    className="border-b border-[var(--qx-line)]"
                  >
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] items-baseline gap-4 py-3.5"
                    >
                      <span className="qx-mono text-[12px] text-[var(--qx-t3)] transition-colors group-hover:text-[var(--qx-amber)]">
                        {c.shortSha}
                      </span>
                      <span className="truncate text-[13px] text-[var(--qx-t1)]">
                        {c.message}
                      </span>
                      <span className="qx-mono text-right text-[11px] text-[var(--qx-t3)]">
                        {relativeTime(c.date, locale)}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <Sweep />
            )}
          </div>

          {/* 最新发布 */}
          <div>
            <h3 className="qx-label">{feed.releases}</h3>
            {release ? (
              <div className="mt-6 border-t border-[var(--qx-line)] pt-6">
                <p className="qx-mono text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-bold leading-none text-[var(--qx-amber)]">
                  {release.tag}
                </p>
                <p className="mt-4 text-[13px] text-[var(--qx-t2)]">
                  {new Date(release.publishedAt).toLocaleDateString(
                    locale === "zh" ? "zh-CN" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                  <span className="qx-mono text-[var(--qx-t3)]">
                    {"  ·  "}
                    {release.assetCount} {feed.assets}
                  </span>
                </p>
                <a
                  href={release.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qx-link mt-6 inline-flex items-center gap-2 text-[13px]"
                >
                  <ArrowDownLeft size={13} />
                  {t.download.viewReleaseNotes}
                </a>
              </div>
            ) : (
              <Sweep />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 首次尚无数据时的读取指示：一条沿水平方向走过 1px 的琥珀线。 */
function Sweep() {
  const reduce = useReducedMotion();
  if (reduce) return <div className="qx-rule mt-6" />;
  return (
    <div className="relative mt-6 h-px overflow-hidden bg-[var(--qx-line)]">
      <motion.span
        className="absolute inset-y-0 w-1/3"
        style={{ background: "var(--qx-amber)" }}
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
