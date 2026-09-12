"use client";

import { motion } from "framer-motion";
import { Download, MousePointer2, CheckCircle } from "lucide-react";
import { useI18n } from "./I18nProvider";

const stepIcons = [Download, MousePointer2, CheckCircle];

export default function Showcase() {
  const { t } = useI18n();
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* 背景光晕 */}
      <div
        className="glow-orb"
        style={{
          top: "20%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, var(--glow-bg-deep) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium text-accent tracking-[0.2em] uppercase mb-4 block">
            {t.showcase.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            {t.showcase.title}
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mt-5 leading-relaxed">
            {t.showcase.subtitle}
          </p>
        </motion.div>

        {/* 三步骤流程 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {t.showcase.steps.map((s, i) => {
            const Icon = stepIcons[i] ?? Download;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                className="relative card-gold p-8"
              >
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-accent-light to-accent flex items-center justify-center shadow-lg shadow-accent-glow/40">
                  <span className="text-bg-base font-bold text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-border-accent flex items-center justify-center mb-6">
                  <Icon size={26} className="text-accent" strokeWidth={1.8} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {s.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* 功能亮点横向展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左：极简美观 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="card-gold p-8 lg:p-10"
          >
            <span className="text-xs font-medium text-accent tracking-wider uppercase mb-3 block">
              {t.showcase.showcase1.eyebrow}
            </span>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              {t.showcase.showcase1.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              {t.showcase.showcase1.desc}
            </p>
            <ul className="space-y-2.5">
              {t.showcase.showcase1.list.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 右：第三方集成 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="card-gold p-8 lg:p-10"
          >
            <span className="text-xs font-medium text-accent tracking-wider uppercase mb-3 block">
              {t.showcase.showcase2.eyebrow}
            </span>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              {t.showcase.showcase2.title}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              {t.showcase.showcase2.desc}
            </p>
            <div className="flex gap-3 flex-wrap">
              {t.showcase.showcase2.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className={
                    idx < 2
                      ? "px-4 py-2 rounded-lg bg-accent-soft border border-border-accent text-sm text-accent font-medium"
                      : "px-4 py-2 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-secondary"
                  }
                >
                  {tag}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
