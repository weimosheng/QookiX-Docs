"use client";

import { useEffect, useRef } from "react";

/**
 * 布料条纹背景 —— 水平条纹随风向 x 方向传播的行波，呈旗帜飘扬感
 * 颜色从 CSS 变量 --stripe-rgba 读取，主题变化时自动重新采样
 */
function readStripeColor(): [number, number, number] {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue("--stripe-rgba")
    .trim();
  const parts = val.split(",").map((s) => parseInt(s.trim(), 10));
  if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
    return parts as [number, number, number];
  }
  return [232, 154, 75];
}

export default function StripesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const colorRef = useRef<[number, number, number]>([232, 154, 75]);

  useEffect(() => {
    colorRef.current = readStripeColor();
    const observer = new MutationObserver(() => {
      colorRef.current = readStripeColor();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    let numStripes = 60;
    let stripeGap = 0;
    const stripeWidth = 1.2;
    const baseAmplitude = 24;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 水平条纹数量按高度算，线间距加大
      numStripes = Math.min(72, Math.max(42, Math.round(height / 20)));
      stripeGap = height / (numStripes - 1);
    };

    // 统一的 2D 位移场：所有水平条纹共享，波沿 x 方向传播（风从左向右）
    const displaceY = (x: number, y: number, time: number): number => {
      const amp = baseAmplitude;
      // 主飘扬行波：沿 +x 传播，纵向缓慢起伏
      const w1 = Math.sin(x * 0.012 - time * 0.6 + y * 0.004) * amp;
      // 次波：反向斜向，增加布面扭转
      const w2 = Math.sin(x * 0.007 + time * 0.4 - y * 0.005) * amp * 0.4;
      // 细褶皱：高频小幅
      const w3 = Math.sin(x * 0.03 + time * 0.9 + y * 0.02) * amp * 0.08;
      return w1 + w2 + w3;
    };

    const draw = () => {
      timeRef.current += 0.008;

      ctx.clearRect(0, 0, width, height);

      const [r, g, b] = colorRef.current;
      const centerY = height / 2;
      const segLen = 4;
      const numSegs = Math.ceil(width / segLen);
      const t = timeRef.current;

      for (let i = 0; i < numStripes; i++) {
        const baseY = i * stripeGap;

        const distFromCenter = Math.abs(baseY - centerY);
        const centerFade = Math.max(0.3, 1 - distFromCenter / (height / 2));
        const baseAlpha = centerFade * 0.22;

        for (let s = 0; s < numSegs; s++) {
          const x1 = s * segLen;
          const x2 = (s + 1) * segLen;

          const y1f = baseY + displaceY(x1, baseY, t);
          const y2f = baseY + displaceY(x2, baseY, t);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
          ctx.lineWidth = stripeWidth;
          ctx.lineCap = "butt";
          ctx.moveTo(x1, y1f);
          ctx.lineTo(x2, y2f);
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[5] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block"
        style={{ width: "100%", height: "100%" }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, var(--stripe-edge-fade) 100%)",
        }}
      />
    </div>
  );
}
