"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE } from "./motion";
import { useI18n } from "@/components/I18nProvider";

/**
 * 六项能力用编号索引排，而不是六张等大卡片——
 * 同一组信息，排成可查的表就比排成货架更像在说事。
 */
export default function CapabilityIndex() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const idx = t.home.index;

  return (
    <section className="qx-section qx-gutter" style={{ background: "var(--qx-bg-0)" }}>
      <div className="qx-shell">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--qx-line)] pb-7">
          <h2 className="qx-h2 max-w-[18ch]">{idx.title}</h2>
          <p className="qx-label">{idx.eyebrow}</p>
        </header>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-12%" }}
          transition={{ staggerChildren: reduce ? 0 : 0.06 }}
        >
          {idx.rows.map((row, i) => (
            <motion.li
              key={row.title}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: DUR.medium, ease: EASE },
                },
              }}
              className="grid gap-x-10 gap-y-2 border-b border-[var(--qx-line)] py-7 md:grid-cols-[4rem_minmax(0,0.34fr)_minmax(0,0.58fr)]"
            >
              <span className="qx-mono pt-1 text-[12px] text-[var(--qx-amber)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="qx-h3">{row.title}</h3>
              <p className="max-w-[58ch] text-[14px] leading-[1.85] text-[var(--qx-t2)]">
                {row.desc}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
