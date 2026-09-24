"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  /** 省略则为当前页（不再生成链接）。 */
  href?: string;
}

/**
 * 可见的面包屑导航。
 *
 * 结构化数据里的 BreadcrumbList 要求页面上存在可见的面包屑，
 * 二者保持一致才能稳定拿到搜索结果里的面包屑样式（替代原始 URL 展示）。
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-8">
      <ol className="qx-label flex items-center gap-2">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-[var(--qx-amber)]">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-[var(--qx-t2)]">
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={12} aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
