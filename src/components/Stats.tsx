"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

function AnimatedStat({ value, suffix = "", label, duration = 1.8 }: StatProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(ease * value);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        start = value;
      }
    };

    requestAnimationFrame(tick);
  }, [started, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-2 tabular-nums">
        {display}
        {suffix}
      </div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* 金色分割线 */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-border-accent to-transparent mb-20" />

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            极致的优化
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
            QookiX Launcher 始终与时俱进，借助最新的技术精心打造多任务调度和分片下载/断点续传功能，
            最大程度保证你的浏览和安装体验。
          </p>
        </motion.div>

        {/* 统计数据 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          <AnimatedStat value={99} suffix="%" label="修复 Bug 响应率" />
          <AnimatedStat value={82} suffix=".76%" label="更新频率" />
          <AnimatedStat value={76} suffix="%" label="功能开发进度" />
          <AnimatedStat value={60} suffix="%" label="反馈响应率" />
        </motion.div>

        {/* 底部金色分割线 */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-border-accent to-transparent mt-20" />
      </div>
    </section>
  );
}
