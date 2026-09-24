"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * 首屏的竖向细线场：靠近光标的那几根会浮到前面并轻微横移。
 *
 * 密度本身是手段——细线给版面撑出结构，而不是用光晕去填空。
 * 只在首屏可见且有指针输入时运行，离开即停。
 */
const COUNT = 13;

export default function RuleField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reduce) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const rules = Array.from(host.children) as HTMLElement[];
    let target = 0.5;
    let current = 0.5;
    let raf = 0;
    let running = false;

    const loop = () => {
      current += (target - current) * 0.1;
      for (const el of rules) {
        const x = Number(el.dataset.x);
        const pull = Math.max(0, 1 - Math.abs(x - current) * 7);
        el.style.opacity = String(0.05 + pull * 0.45);
        el.style.transform = `translate3d(${(current - x) * 22 * pull}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target = (e.clientX - rect.left) / rect.width;
    };
    const onLeave = () => {
      target = 0.5;
    };

    const visible = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    visible.observe(host);

    window.addEventListener("pointermove", onMove, { passive: true });
    host.closest("section")?.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      visible.disconnect();
      window.removeEventListener("pointermove", onMove);
      host.closest("section")?.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: COUNT }, (_, i) => (
        <span
          key={i}
          data-x={i / (COUNT - 1)}
          className="absolute top-0 h-full w-px"
          style={{
            left: `${(i / (COUNT - 1)) * 100}%`,
            opacity: 0.05,
            background:
              "linear-gradient(180deg, transparent, var(--qx-line-hi) 18%, var(--qx-line-hi) 82%, transparent)",
          }}
        />
      ))}
    </div>
  );
}
