"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 网格背景 */}
      <div
        className="absolute inset-0 bg-grid-pattern"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
      />

      {/* 金色光晕装饰 */}
      <div
        className="glow-orb"
        style={{
          top: "10%",
          left: "50%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, var(--glow-bg-accent) 0%, transparent 70%)",
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="glow-orb"
        style={{
          bottom: "5%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, var(--glow-bg-deep) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-24">
        {/* 大 Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="mb-8"
        >
          <img
            src="/qookix-icon.png"
            alt="QookiX Launcher"
            width={128}
            height={128}
            className="mx-auto object-contain drop-shadow-[0_8px_32px_var(--accent-glow)]"
            style={{ imageRendering: "pixelated" }}
          />
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="gradient-text text-glow">QookiX Launcher</span>
        </motion.h1>

        {/* 描述 */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="text-lg sm:text-xl text-text-secondary mx-auto leading-relaxed mb-10"
        >
          QookiX Launcher — 一款免费、开源、无广告的跨平台 Minecraft Java 版启动器
          <br className="hidden sm:block" />
          支持 安装和更新 Modrinth 与 CurseForge 的模组、整合包、光影、资源包
        </motion.p>

        {/* CTA 按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/download" className="btn-primary text-base !px-8 !py-3.5 animate-float">
            <Download size={18} />
            立即下载
          </Link>
          <a
            href="https://github.com/weimosheng/QookiX-Launcher"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base !px-8 !py-3.5"
          >
            查看源码
          </a>
        </motion.div>

        {/* 向下滚动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={24} className="text-text-tertiary" />
          </motion.div>
        </motion.div>
      </div>

      {/* 底部金色渐变线 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] shimmer-line" />
    </section>
  );
}
