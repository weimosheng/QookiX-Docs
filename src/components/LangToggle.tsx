"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "./I18nProvider";
import { getLocaleShort, type Locale } from "@/lib/i18n";

export default function LangToggle() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const options: Locale[] = ["zh", "en"];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.langToggle.label}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center
                   text-text-secondary hover:text-accent hover:bg-bg-card
                   border border-transparent hover:border-border-subtle
                   transition-colors text-xs font-semibold"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={locale}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {getLocaleShort(locale)}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 min-w-[7rem] rounded-xl bg-bg-elevated
                       border border-border-subtle shadow-xl overflow-hidden z-50"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setLocale(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                  opt === locale
                    ? "text-accent bg-accent-soft"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                {opt === "zh" ? "中文" : "English"}
                {opt === locale && (
                  <span className="text-accent text-xs">●</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
