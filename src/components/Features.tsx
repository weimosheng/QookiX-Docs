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

const features = [
  {
    icon: Puzzle,
    title: "双内容中心",
    desc: "内置 Modrinth 与 CurseForge，模组、整合包、光影、资源包随便装，主流平台全覆盖。",
  },
  {
    icon: Package,
    title: "多实例管理",
    desc: "一个启动器管理多套游戏+模组组合，互不干扰，轻松切换不同玩法配置。",
  },
  {
    icon: Shield,
    title: "纯净安全",
    desc: "无广告、无弹窗、无遥测，数据只保存在你自己的电脑上。开源透明，放心使用。",
  },
  {
    icon: Zap,
    title: "高效便捷",
    desc: "多线程下载最大化利用带宽，自动检测 Java，从零到进游戏只需几步。",
  },
  {
    icon: Monitor,
    title: "跨平台体验",
    desc: "支持 Windows、macOS、Linux 及各类主流发行版本，几乎一致的体验。",
  },
  {
    icon: Users,
    title: "联机房间",
    desc: "集成陶瓦联机 (Terracotta)，NAT 穿透让多人游戏更便利，轻松与朋友联机。",
  },
];

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
            为什么选择 QookiX
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            闲话少说 —{" "}
            <span className="gradient-text">六大核心优势</span>
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
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="card-gold p-7 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-soft border border-border-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <f.icon size={22} className="text-accent" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2.5">
                {f.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
