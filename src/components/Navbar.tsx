"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import GithubIcon from "./GithubIcon";
import LangToggle from "./LangToggle";
import { useI18n } from "./I18nProvider";
import { DOCS_URL, GITHUB_REPO_URL } from "@/lib/site";
import { DUR, EASE } from "./home/motion";

const navKeys = [
  { href: "/", key: "home" as const },
  { href: "/download", key: "download" as const },
  { href: DOCS_URL, key: "docs" as const, external: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-[280ms]"
      style={{
        backgroundColor: scrolled ? "var(--nav-blur-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : undefined,
        WebkitBackdropFilter: scrolled ? "blur(14px)" : undefined,
        boxShadow: scrolled ? "inset 0 -1px 0 var(--border-subtle)" : "none",
      }}
    >
      <div className="relative mx-auto flex h-[60px] max-w-[86rem] items-center gap-6 px-[var(--qx-gutter)]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src="/qookix-icon.png"
            alt="QookiX"
            width={24}
            height={24}
            className="rounded-[5px]"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
              QookiX
            </span>
            <span className="qx-mono mt-0.5 text-[9px] tracking-[0.18em] text-[var(--text-tertiary)]">
              LAUNCHER
            </span>
          </span>
        </Link>

        {/* 桌面导航：下划线用启动器内容页签同一套机制 */}
        <nav className="hidden items-center gap-6 md:flex">
          {navKeys.map((item) => {
            const active = !item.external && pathname === item.href;
            const label = t.nav[item.key];
            const cls = `relative py-2 text-[14px] transition-colors duration-150 ${
              active
                ? "text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`;
            const inner = (
              <>
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-px h-[2px] origin-left"
                    style={{ background: "var(--accent)" }}
                    transition={{ duration: DUR.standard, ease: EASE }}
                  />
                )}
              </>
            );
            return item.external ? (
              <a key={item.href} href={item.href} className={cls}>
                {inner}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <LangToggle />
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-[10px] text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] sm:flex"
          >
            <GithubIcon size={17} />
          </a>
          <Link
            href="/download"
            className="qx-btn qx-btn-primary hidden !px-4 !py-2 !text-[13px] sm:inline-flex"
          >
            <Download size={14} />
            {t.nav.download}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t.nav.menu}
            aria-expanded={mobileOpen}
            className="grid h-9 w-9 place-items-center rounded-[10px] text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DUR.standard, ease: EASE }}
            className="overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-base)] md:hidden"
          >
            <nav className="flex flex-col gap-1 px-[var(--qx-gutter)] py-4">
              {navKeys.map((item) => {
                const active = !item.external && pathname === item.href;
                const cls = `rounded-[10px] px-3 py-2.5 text-left text-[15px] transition-colors duration-150 ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                }`;
                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cls}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav[item.key]}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cls}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav[item.key]}
                  </Link>
                );
              })}
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qx-btn qx-btn-ghost flex-1 !text-[13px]"
                >
                  <GithubIcon size={15} />
                  GitHub
                </a>
                <Link
                  href="/download"
                  onClick={() => setMobileOpen(false)}
                  className="qx-btn qx-btn-primary flex-1 !text-[13px]"
                >
                  <Download size={14} />
                  {t.nav.downloadNow}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
