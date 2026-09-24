"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { DUR, EASE } from "./motion";
import { useI18n } from "@/components/I18nProvider";

/**
 * 两个深度特写：都用真实截图，都不靠假外壳。
 * 内容中心：同一页的中英两张截图叠在一起，中间一条竖线，往左拖露译文、往右拖露原文；
 * 皮肤中心用指针倾斜 + 沿光标滑过的高光，让静态图有实体感。
 */

function Frame({
  src,
  alt,
  className,
  children,
}: {
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ clipPath: "inset(10% 10% 10% 10% round 14px)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 14px)", opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: DUR.slow, ease: EASE }}
      className={`relative overflow-hidden rounded-[14px] border border-[var(--qx-line)] bg-[var(--qx-bg-1)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)]${className ? ` ${className}` : ""}`}
    >
      {src && <Image src={src} alt={alt ?? ""} width={1280} height={800} />}
      {children}
    </motion.div>
  );
}

export function ContentHub() {
  const { t } = useI18n();
  const hub = t.home.hub;
  const hostRef = useRef<HTMLDivElement>(null);
  // 竖线位置（%）：左边原文、右边译文
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = hostRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(100, Math.max(0, pct)));
  }, []);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    setFromClientX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") setSplit((v) => Math.max(0, v - step));
    else if (e.key === "ArrowRight") setSplit((v) => Math.min(100, v + step));
    else if (e.key === "Home") setSplit(100);
    else if (e.key === "End") setSplit(0);
    else return;
    e.preventDefault();
  };

  return (
    <section className="qx-section qx-gutter" style={{ background: "var(--qx-bg-0)" }}>
      <div className="qx-shell grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
        <div>
          <p className="qx-label">{hub.eyebrow}</p>
          <h2 className="qx-h2 mt-4 max-w-[16ch]">{hub.title}</h2>
          <p className="qx-lead mt-6">{hub.desc}</p>
          <p className="qx-mono mt-8 text-[12px] leading-relaxed text-[var(--qx-t3)]">
            {hub.translateHint}
          </p>
        </div>

        {/* 中英对照：竖线左侧原文、右侧译文，往左拖露出译文，往右拖回到原文 */}
        <Frame>
          <div
            ref={hostRef}
            className="qx-tr"
            role="slider"
            tabIndex={0}
            aria-label={hub.translateHint}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(split)}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
          >
            <Image
              className="qx-tr-base"
              src="/screenshot-content-en.png"
              alt={hub.imageAlt}
              width={1202}
              height={782}
              draggable={false}
            />
            <Image
              className="qx-tr-cn"
              style={{ clipPath: `inset(0 0 0 ${split}%)` }}
              src="/screenshot-content-cn.png"
              alt=""
              aria-hidden
              width={1202}
              height={782}
              draggable={false}
            />
            <span className="qx-tr-line" style={{ left: `${split}%` }} aria-hidden>
              <span className="qx-tr-knob">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3.5 2.5 8 6 12.5M10 3.5 13.5 8 10 12.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>
        </Frame>
      </div>
    </section>
  );
}

export function SkinCenter() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const skin = t.home.skin;
  const hostRef = useRef<HTMLDivElement>(null);

  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpring(nx, { stiffness: 140, damping: 20 });
  const sy = useSpring(ny, { stiffness: 140, damping: 20 });
  const rotateY = useTransform(sx, (v) => v * 6);
  const rotateX = useTransform(sy, (v) => -v * 5);
  const lightX = useTransform(sx, (v) => 50 + v * 34);
  const lightY = useTransform(sy, (v) => 50 + v * 30);
  const sheen = useTransform(
    [lightX, lightY],
    ([x, y]: number[]) =>
      `radial-gradient(38% 38% at ${x}% ${y}%, rgba(255,255,255,0.14), transparent 72%)`
  );

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduce || e.pointerType !== "mouse") return;
      const rect = hostRef.current?.getBoundingClientRect();
      if (!rect) return;
      nx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      ny.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [nx, ny, reduce]
  );

  return (
    <section
      className="qx-section qx-gutter"
      style={{
        background: "var(--qx-bg-1)",
        borderTop: "1px solid var(--qx-line)",
      }}
    >
      <div className="qx-shell grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
        <div
          ref={hostRef}
          onPointerMove={onMove}
          onPointerLeave={() => {
            nx.set(0);
            ny.set(0);
          }}
          style={{ perspective: 1200 }}
        >
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <Frame src="/screenshot-skin.png" alt={skin.imageAlt}>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: sheen, mixBlendMode: "screen" }}
              />
            </Frame>
          </motion.div>
        </div>

        <div>
          <p className="qx-label">{skin.eyebrow}</p>
          <h2 className="qx-h2 mt-4 max-w-[16ch]">{skin.title}</h2>
          <p className="qx-lead mt-6">{skin.desc}</p>
          <ul className="mt-8">
            {skin.points.map((point, i) => (
              <motion.li
                key={point}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: DUR.medium, ease: EASE, delay: i * 0.07 }}
                className="flex items-baseline gap-4 border-t border-[var(--qx-line)] py-3.5"
              >
                <span className="qx-mono text-[11px] text-[var(--qx-amber)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[14px] text-[var(--qx-t2)]">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
