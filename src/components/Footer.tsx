"use client";

import Link from "next/link";
import GithubIcon from "./GithubIcon";
import { useI18n } from "./I18nProvider";
import {
  DOCS_URL,
  GITHUB_RELEASES_URL,
  GITHUB_REPO_URL,
  MAIN_SITE_URL,
} from "@/lib/site";

/** 页脚：三组不等宽的链接账本，没有流光装饰。 */
export default function Footer() {
  const { t } = useI18n();
  const f = t.footer;

  const groups: { title: string; links: { label: string; href: string; external?: boolean }[] }[] =
    [
      {
        title: f.groups.product,
        links: [
          { label: t.nav.download, href: `${MAIN_SITE_URL}/download` },
          { label: f.docs, href: DOCS_URL, external: true },
          { label: "Releases", href: GITHUB_RELEASES_URL, external: true },
        ],
      },
      {
        title: f.groups.resources,
        links: [
          { label: "Modrinth", href: "https://modrinth.com", external: true },
          { label: "CurseForge", href: "https://www.curseforge.com", external: true },
        ],
      },
      {
        title: f.groups.project,
        links: [
          { label: "GitHub", href: GITHUB_REPO_URL, external: true },
          { label: f.feedback, href: `${GITHUB_REPO_URL}/issues`, external: true },
          { label: "GPL-3.0", href: `${GITHUB_REPO_URL}/blob/main/LICENSE`, external: true },
        ],
      },
    ];

  return (
    <footer
      className="qx-gutter"
      style={{
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "clamp(3rem, 2rem + 4vw, 5rem)",
        paddingBottom: "clamp(2rem, 1.5rem + 2vw, 3rem)",
      }}
    >
      <div className="qx-shell grid gap-x-12 gap-y-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.6fr))]">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/qookix-icon.png"
              alt=""
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
          </div>
          <p className="mt-5 max-w-[38ch] text-[13px] leading-[1.9] text-[var(--text-secondary)]">
            {f.desc}
          </p>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border-subtle)] text-[var(--text-tertiary)] transition-colors duration-150 hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
          >
            <GithubIcon size={17} />
          </a>
        </div>

        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="qx-label">{group.title}</p>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--accent)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[13px] text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--accent)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className="qx-shell mt-14 flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <p className="qx-mono text-[11px] text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} {f.copyright}
        </p>
        <p className="max-w-[52ch] text-[11px] leading-relaxed text-[var(--text-tertiary)]">
          {f.disclaimer}
        </p>
      </div>
    </footer>
  );
}
