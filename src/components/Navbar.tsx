"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Download } from "lucide-react";
import GithubIcon from "./GithubIcon";
import ThemeToggle from "./ThemeToggle";

// external: 指向 VitePress 文档站（独立应用，不能用 next/link 做客户端路由）
const navItems: { href: string; label: string; external?: boolean }[] = [
  { href: "/", label: "首页" },
  { href: "/download", label: "下载" },
  { href: "/docs/", label: "文档", external: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,backdrop-filter,box-shadow] duration-300 ${
        scrolled
          ? "bg-bg-base backdrop-blur-xl shadow-[0_1px_0_var(--border-subtle)]"
          : "bg-transparent shadow-none"
      }`}
    >
      <div className="relative max-w-7xl mx-auto px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Logo */}
        <Link href="/" className="col-start-1 row-start-1 justify-self-start flex items-center gap-2.5 group">
          <img
            src="/qookix-icon.png"
            alt="QookiX"
            width={36}
            height={36}
            className="object-contain transition-transform group-hover:scale-105"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-text-primary text-[15px] tracking-wide">QookiX</span>
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Launcher</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex col-start-2 row-start-1 justify-self-center items-center gap-1">
          {navItems.map((item) => {
            const isActive = !item.external && pathname === item.href;
            const cls = `relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "text-accent"
                : "text-text-secondary hover:text-text-primary"
            }`;
            return item.external ? (
              <a key={item.href} href={item.href} className={cls}>
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={cls}>
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-accent-soft"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex col-start-3 row-start-1 justify-self-end items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/weimosheng/QookiX-Launcher"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            <GithubIcon size={18} />
            <span>GitHub</span>
          </a>
          <Link
            href="/download"
            className="btn-primary !py-2.5 !px-5 !text-sm"
          >
            <Download size={16} />
            下载
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden col-start-3 row-start-1 justify-self-end p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border-subtle bg-bg-base/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = !item.external && pathname === item.href;
                const cls = `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-accent bg-accent-soft"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`;
                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cls}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cls}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="https://github.com/weimosheng/QookiX-Launcher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              >
                <GithubIcon size={18} />
                GitHub
              </a>
              <Link
                href="/download"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full mt-2"
              >
                <Download size={16} />
                立即下载
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
