"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

/**
 * 主题切换按钮 — 圆形，点击后从按钮中心展开遮罩过渡
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isDark ? "切换到浅色主题" : "切换到深色主题"}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center
                 text-text-secondary hover:text-accent hover:bg-bg-card
                 border border-transparent hover:border-border-subtle
                 transition-colors overflow-hidden"
    >
      <motion.div
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-5 h-5"
      >
        {isDark ? (
          // 太阳图标（切到浅色）
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          // 月亮图标（切到深色）
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}
