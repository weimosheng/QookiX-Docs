"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (originX?: number, originY?: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "qookix-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* ignore */ }
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const readyRef = useRef(false);

  // 初始化：读取 localStorage + 立即设置 html 属性（防止 FOUC）
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    readyRef.current = true;

    // 跟随系统变化（仅当用户未手动设置时）
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          const t: Theme = e.matches ? "light" : "dark";
          setTheme(t);
          document.documentElement.setAttribute("data-theme", t);
        }
      } catch { /* ignore */ }
    };
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []);

  const toggleTheme = useCallback((originX?: number, originY?: number) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const size = Math.max(window.innerWidth, window.innerHeight) * 1.5;

    // 如果没给原点，从屏幕中心
    const cx = originX ?? window.innerWidth / 2;
    const cy = originY ?? window.innerHeight / 2;

    // 立即隐藏滚动条（避免它和遮罩"分裂"——Windows Chrome 滚动条不支持过渡）
    document.documentElement.classList.add("theme-switching");

    // 创建圆形遮罩动画（用当前主题色）
    const el = document.createElement("div");
    el.className = "theme-reveal";
    const currentBg = getComputedStyle(document.documentElement).getPropertyValue("--bg-base").trim();
    el.style.background = currentBg;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${cx - size / 2}px`;
    el.style.top = `${cy - size / 2}px`;
    document.body.appendChild(el);

    // 切主题
    requestAnimationFrame(() => {
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
    });

    // 动画结束后：移除遮罩 + 恢复滚动条（此时滚动条会以新主题色重新出现）
    setTimeout(() => {
      el.remove();
      document.documentElement.classList.remove("theme-switching");
    }, 420);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
