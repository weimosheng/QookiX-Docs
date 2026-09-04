"use client";

import { motion } from "framer-motion";
import { Download, MousePointer2, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Download,
    step: "01",
    title: "下载安装",
    desc: "从官网下载对应平台的安装包，一键安装到你的电脑。",
  },
  {
    icon: MousePointer2,
    step: "02",
    title: "选择内容",
    desc: "浏览 Modrinth 或 CurseForge，挑你喜欢的模组、整合包、光影。",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "开玩！",
    desc: "多线程自动下载安装，配置完成后一键启动游戏。",
  },
];

export default function Showcase() {
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
            强大的功能
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            不仅仅是一个启动器
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mt-5 leading-relaxed">
            提供大量实用强大的功能，一站式管理你的所有游戏资源。
          </p>
        </motion.div>

        {/* 三步骤流程 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              className="relative card-gold p-8"
            >
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-accent-light to-accent flex items-center justify-center shadow-lg shadow-accent-glow/40">
                <span className="text-bg-base font-bold text-sm">{s.step}</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-border-accent flex items-center justify-center mb-6">
                <s.icon size={26} className="text-accent" strokeWidth={1.8} />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {s.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
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
              极简外观 暗藏玄机
            </span>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              即便放在桌面也是件艺术品
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              基于 Tauri 2 打造，体积轻巧，启动极速。界面遵循现代设计语言，
              深色主题配合暖琥珀色点缀，沉稳而不沉闷。
            </p>
            <ul className="space-y-2.5">
              {[
                "Tauri 2 内核，原生性能",
                "Vue 3 + Naive UI 现代化界面",
                "暖琥珀色主题，沉浸体验",
              ].map((item, idx) => (
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
              与第三方资源集成
            </span>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              主流内容平台一键接入
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              与 CurseForge、Modrinth 等第三方资源站点深度集成，
              为你提供最新的模组包、资源包、插件等资源。
            </p>
            <div className="flex gap-3 flex-wrap">
              <div className="px-4 py-2 rounded-lg bg-accent-soft border border-border-accent text-sm text-accent font-medium">
                Modrinth
              </div>
              <div className="px-4 py-2 rounded-lg bg-accent-soft border border-border-accent text-sm text-accent font-medium">
                CurseForge
              </div>
              <div className="px-4 py-2 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-secondary">
                陶瓦联机
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
