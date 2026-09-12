"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useI18n } from "./I18nProvider";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, rotateY: -8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const sources = [
  "/screenshot-home.png",
  "/screenshot-content.png",
  "/screenshot-skin.png",
];

export default function Screenshots() {
  const { t } = useI18n();
  return (
    <section className="relative py-28 px-6 overflow-hidden">
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
            {t.screenshots.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            {t.screenshots.title}{" "}
            <span className="gradient-text">{t.screenshots.titleHighlight}</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mt-5 leading-relaxed">
            {t.screenshots.subtitle}
          </p>
        </motion.div>

        {/* 截图画廊 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          style={{ perspective: "1200px" }}
        >
          {t.screenshots.items.map((shot, i) => {
            const scale = i === 1 ? "scale-105" : "scale-100";
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`group relative ${scale} transition-transform duration-500`}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                }}
              >
                {/* 卡片容器 */}
                <div className="card-gold overflow-hidden p-2">
                  {/* 截图 */}
                  <div className="relative rounded-lg overflow-hidden bg-bg-base">
                    <Image
                      src={sources[i]}
                      alt={shot.alt}
                      width={1280}
                      height={720}
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ imageRendering: "auto" }}
                      quality={90}
                    />

                    {/* 悬浮高光 */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(135deg, transparent 40%, var(--accent-sweep) 50%, transparent 60%)",
                      }}
                    />
                  </div>

                  {/* 标题 */}
                  <div className="px-4 py-4">
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                      {shot.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {shot.desc}
                    </p>
                  </div>
                </div>

                {/* 底部发光 */}
                <div className="absolute -bottom-2 left-4 right-4 h-6 bg-accent-glow/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-full" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
