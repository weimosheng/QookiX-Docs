"use client";

import { motion } from "framer-motion";
import { DUR, EASE } from "./motion";
import { useI18n } from "@/components/I18nProvider";
import { useLatestRelease } from "@/lib/feed";
import { GITHUB_RELEASES_URL } from "@/lib/site";

/**
 * 取代原来那四个凭空编出来的百分比：只写能被核验的事实，
 * 版本与日期从发布接口取，取不到就留空并给出跳转。
 */
export default function SpecLedger() {
  const { t, locale } = useI18n();
  const { data: release } = useLatestRelease();
  const L = t.home.ledger;

  const released = release?.publishedAt
    ? new Date(release.publishedAt).toLocaleDateString(
        locale === "zh" ? "zh-CN" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : L.pending;

  const rows: { k: string; v: string; href?: string }[] = [
    { k: L.labels.version, v: release?.tag ?? L.pending, href: GITHUB_RELEASES_URL },
    { k: L.labels.released, v: released, href: release?.url },
    { k: L.labels.platforms, v: L.values.platforms },
    { k: L.labels.sources, v: L.values.sources },
    { k: L.labels.stack, v: L.values.stack },
    { k: L.labels.license, v: L.values.license },
    { k: L.labels.telemetry, v: L.values.telemetry },
    { k: L.labels.relay, v: L.values.relay },
  ];

  return (
    <section
      className="qx-section qx-gutter"
      style={{
        background: "var(--qx-bg-1)",
        borderTop: "1px solid var(--qx-line)",
        borderBottom: "1px solid var(--qx-line)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
        <div>
          <p className="qx-label">{L.eyebrow}</p>
          <h2 className="qx-h2 mt-4 max-w-[14ch]">{L.title}</h2>
        </div>

        <motion.dl
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          transition={{ staggerChildren: 0.045 }}
          className="grid gap-x-10 sm:grid-cols-2"
        >
          {rows.map((row) => (
            <motion.div
              key={row.k}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="border-t border-[var(--qx-line)] py-4"
            >
              <motion.dt
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: { duration: DUR.medium, ease: EASE },
                  },
                }}
                className="qx-label origin-left"
              >
                {row.k}
              </motion.dt>
              <motion.dd
                variants={{
                  hidden: { y: 10 },
                  visible: {
                    y: 0,
                    transition: { duration: DUR.medium, ease: EASE },
                  },
                }}
                className="qx-mono mt-2 text-[15px] font-medium text-[var(--qx-t1)]"
              >
                {row.href ? (
                  <a href={row.href} className="qx-link">
                    {row.v}
                  </a>
                ) : (
                  row.v
                )}
              </motion.dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
