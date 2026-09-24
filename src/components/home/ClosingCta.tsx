"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useLatestRelease } from "@/lib/feed";
import { DOCS_URL } from "@/lib/site";

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
      <div className="qx-shell flex flex-col items-start gap-10">
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
    </section>
  );
}
