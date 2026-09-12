"use client";

import { motion } from "framer-motion";
import {
  Puzzle,
  Package,
  Shield,
  Zap,
  Monitor,
  Users,
} from "lucide-react";
import { useI18n } from "./I18nProvider";

const icons = [Puzzle, Package, Shield, Zap, Monitor, Users];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

export default function Features() {
  const { t } = useI18n();
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium text-accent tracking-[0.2em] uppercase mb-4 block">
            {t.features.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            {t.features.title}{" "}
            <span className="gradient-text">{t.features.titleHighlight}</span>
          </h2>
        </motion.div>

        {/* 特性网格 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {t.features.items.map((f, i) => {
            const Icon = icons[i] ?? Puzzle;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="card-gold p-7 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-soft border border-border-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={22} className="text-accent" strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2.5">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
