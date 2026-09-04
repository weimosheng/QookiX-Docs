"use client";

import { useEffect, useRef } from "react";

const CHARS = "0123456789ABCDEF{}[]<>/\\|+-*=#$@!?._";
const CELL_W = 16;
const CELL_H = 22;

function readColor(): [number, number, number] {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue("--stripe-rgba")
    .trim();
  const parts = val.split(",").map((s) => parseInt(s.trim(), 10));
  if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
    return parts as [number, number, number];
  }
  return [232, 154, 75];
}

export default function CharRainBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cells: string[] = [];
    let alphas: number[] = [];
    let color: [number, number, number] = [232, 154, 75];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w === 0 || h === 0) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL_W);
      rows = Math.ceil(h / CELL_H);
      const n = cols * rows;
      cells = new Array(n);
      alphas = new Array(n);
      for (let i = 0; i < n; i++) {
        cells[i] = CHARS[(Math.random() * CHARS.length) | 0];
        alphas[i] = 0.08 + Math.random() * 0.25;
      }
    };

    let frame = 0;
    const FONT = "14px ui-monospace, SFMono-Regular, Menlo, monospace";

    const paintCell = (idx: number) => {
      const col = idx % cols;
      const row = (idx - col) / cols;
      const x = col * CELL_W;
      const y = row * CELL_H;
      ctx.clearRect(x - 0.5, y - 0.5, CELL_W + 1, CELL_H + 1);
      const [r, g, b] = color;
      ctx.fillStyle = `rgba(${r},${g},${b},${alphas[idx]})`;
      ctx.fillText(cells[idx], x, y);
    };

    const drawAll = () => {
      if (w === 0 || h === 0) return;
      ctx.clearRect(0, 0, w, h);
      ctx.font = FONT;
      ctx.textBaseline = "top";
      for (let i = 0; i < cells.length; i++) paintCell(i);
    };

    const tick = () => {
      if (w === 0 || h === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // 每 8 帧才刷新一次，且只改少量字符，温和刷机
      frame++;
      if (frame % 8 === 0) {
        ctx.font = FONT;
        ctx.textBaseline = "top";
        const refresh = Math.max(2, Math.ceil(cells.length * 0.01));
        for (let k = 0; k < refresh; k++) {
          const idx = (Math.random() * cells.length) | 0;
          cells[idx] = CHARS[(Math.random() * CHARS.length) | 0];
          paintCell(idx);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    color = readColor();
    resize();
    drawAll();
    tick();

    const ro = new ResizeObserver(() => {
      resize();
      drawAll();
    });
    ro.observe(canvas);
    const themeObs = new MutationObserver(() => {
      color = readColor();
      drawAll();
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObs.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}
