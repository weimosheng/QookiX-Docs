"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, Monitor, Smartphone } from "lucide-react";
import LauncherWindow from "./LauncherWindow";
import MobileLauncherWindow from "./MobileLauncherWindow";
import RuleField from "./RuleField";
import { DUR, EASE_EXPO, SPRING_HEAVY, lineReveal } from "./motion";
import { useI18n } from "@/components/I18nProvider";
import { useLatestRelease } from "@/lib/feed";
import { useDevice } from "@/hooks/useDevice";

/**
 * 首屏：大标题在上，把话说清楚；下面是一台撑满容器、能真的点的启动器。
 * 页面唯一的诉求（下载）藏在窗口的「启动游戏」里，播完启动序列才反形出来。
 */
export default function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const { data: release } = useLatestRelease();
  const version = release?.tag ?? null;
  const hero = t.home.hero;
  const sectionRef = useRef<HTMLElement>(null);
  const { device, switchDevice } = useDevice();

  // 视差：窗口几乎不动，细线场动得最多，光源最含蓄
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpring(nx, { stiffness: 120, damping: 24, mass: 1 });
  const sy = useSpring(ny, { stiffness: 120, damping: 24, mass: 1 });
  const winX = useTransform(sx, (v) => v * -6);
  const winY = useTransform(sy, (v) => v * -4);
  const fieldX = useTransform(sx, (v) => v * 22);
  const fieldY = useTransform(sy, (v) => v * 12);
  const glowX = useTransform(sx, (v) => v * 4);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduce || e.pointerType !== "mouse") return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      nx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      ny.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [nx, ny, reduce]
  );

  const reset = useCallback(() => {
    nx.set(0);
    ny.set(0);
  }, [nx, ny]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className="relative isolate overflow-hidden"
      style={{
        background: "var(--qx-bg-0)",
        paddingTop: "clamp(7rem, 5.5rem + 7vw, 11rem)",
        paddingBottom: "clamp(4rem, 3rem + 6vw, 8rem)",
      }}
    >
      {/* 远层：与客户端外壳同源的单一光源 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          x: glowX,
          background:
            "radial-gradient(1000px 520px at 50% -8%, var(--qx-a-12), transparent 62%)",
        }}
      />

      {/* 中层：竖向细线场 */}
      <motion.div className="absolute inset-0" style={{ x: fieldX, y: fieldY }}>
        <RuleField />
      </motion.div>

      {/* 标题区：居中排印 */}
      <div className="relative z-10 mx-auto flex max-w-[80rem] flex-col items-center px-[var(--qx-gutter)] text-center">
        <h1 className="qx-display mt-5 max-w-[16ch]">
          {hero.lines.map((line, i) => (
            <motion.span
              key={line}
              custom={i}
              variants={lineReveal(0.12)}
              initial={reduce ? "visible" : "hidden"}
              animate="visible"
              className="block"
              style={{
                color: i === hero.accentLine ? "var(--qx-amber)" : undefined,
              }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={lineReveal(0.42, 0.04)}
          initial={reduce ? "visible" : "hidden"}
          animate="visible"
          className="qx-lead mx-auto mt-7"
        >
          {hero.lead}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.medium, ease: EASE_EXPO, delay: 0.6 }}
          className="mt-9"
        >
          <Link href="#activity" className="qx-link inline-flex items-center gap-2 text-[14px]">
            <ArrowDown size={14} />
            {hero.secondary}
          </Link>
        </motion.div>
      </div>

      {/* 启动器窗口容器 */}
      <motion.div
        style={{ x: winX, y: winY }}
        className="relative z-10 mx-auto mt-14 w-full max-w-[1400px] px-[var(--qx-gutter)] sm:mt-20"
      >
        {/* 设备切换按钮 —— 左上角 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="qx-device-switch" role="tablist" aria-label={hero.deviceSwitch}>
            <span
              className="qx-ds-ind"
              style={{ transform: device === "desktop" ? "translateX(0%)" : "translateX(100%)" }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={device === "desktop"}
              className={device === "desktop" ? "active" : ""}
              onClick={() => switchDevice("desktop")}
            >
              <Monitor size={14} /> Windows
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={device === "mobile"}
              className={device === "mobile" ? "active" : ""}
              onClick={() => switchDevice("mobile")}
            >
              <Smartphone size={14} /> Android
            </button>
          </div>
          {/* 右侧留白，未来可以放下载按钮等 */}
        </div>

        <motion.div
          key={device}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_HEAVY}
        >
          {device === "desktop" ? (
            <LauncherWindow version={version} />
          ) : (
            <MobileLauncherWindow version={version} />
          )}
        </motion.div>
        <p className="qx-note" style={{ textAlign: "center", marginTop: 12, fontSize: 12, opacity: 0.55 }}>
          {hero.demoNote}
        </p>
      </motion.div>
    </section>
  );
}
