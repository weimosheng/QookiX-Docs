"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useLatestRelease } from "@/lib/feed";
import { DOCS_URL } from "@/lib/site";

/** 曲奇饼干 12×12 像素图：圆形饼干面 + 巧克力豆 */
const COOKIE_SIZE = 12;
const COOKIE_CX = 5.5;
const COOKIE_CY = 5.5;
const COOKIE_R = 5.15;
const COOKIE_RY = 4.85;
const COOKIE_CHIPS = new Set([
  2 * 12 + 4, 3 * 12 + 8, 4 * 12 + 2, 5 * 12 + 7, 6 * 12 + 3, 7 * 12 + 8,
  8 * 12 + 5, 4 * 12 + 9, 7 * 12 + 1, 2 * 12 + 7,
]);
function inCookie(i: number) {
  const r = Math.floor(i / COOKIE_SIZE);
  const c = i % COOKIE_SIZE;
  const dx = c - COOKIE_CX;
  const dy = r - COOKIE_CY;
  return (dx * dx) / (COOKIE_R * COOKIE_R) + (dy * dy) / (COOKIE_RY * COOKIE_RY) <= 1;
}

/**
 * 收尾刻意不做任何入场动效——前面攒了一整页的运动，
 * 这里用静止来把唯一的诉求顶出来。
 */
export default function ClosingCta() {
  const { t } = useI18n();
  const { data: release } = useLatestRelease();
  const cta = t.home.cta;
  const label = release
    ? cta.button.replace("{version}", release.tag)
    : cta.fallback;

  return (
    <section
      className="qx-gutter"
      style={{
        background: "var(--qx-bg-0)",
        paddingBlock: "clamp(8rem, 5rem + 16vw, 20rem)",
        borderTop: "1px solid var(--qx-line)",
      }}
    >
      <div className="qx-shell grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
        <div className="flex flex-col items-start gap-10">
          <h2 className="qx-display max-w-[12ch]">{cta.title}</h2>
          <p className="qx-lead">{cta.desc}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/download" className="qx-btn qx-btn-primary !px-7 !py-4 !text-base">
              <Download size={17} />
              {label}
            </Link>
            <a href={DOCS_URL} className="qx-link text-[14px]">
              {cta.docs}
            </a>
          </div>
        </div>

        {/* 右侧装饰：12×12 像素方块拼出曲奇饼干（QookiX 吉祥物），静态无动效 */}
        <div
          aria-hidden
          className="hidden aspect-[10/9] w-full max-w-[22rem] ml-auto lg:grid"
          style={{ gridTemplateColumns: `repeat(${COOKIE_SIZE}, 1fr)`, gap: "1.5%" }}
        >
          {Array.from({ length: COOKIE_SIZE * COOKIE_SIZE }, (_, i) => {
            const face = inCookie(i);
            const chip = COOKIE_CHIPS.has(i);
            return (
              <div
                key={i}
                className="rounded-[10%]"
                style={{
                  background: chip
                    ? "#3d2415"
                    : face
                      ? "var(--qx-amber)"
                      : "transparent",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
