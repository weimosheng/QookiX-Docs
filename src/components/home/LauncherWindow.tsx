"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import {
  AlignJustify,
  Check,
  ChevronDown,
  Compass,
  Download,
  Grid2x2,
  Home,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Palette,
  Play,
  Plus,
  Power,
  RefreshCw,
  Repeat,
  Scan,
  Search,
  Server,
  Settings as SettingsIcon,
  Shield,
  Shirt,
  SlidersHorizontal,
  Map as SeedIcon,
  Trash2,
  User,
  Users,
  Wrench,
  X,
  ArrowUpRight,
  Cloud,
  Cpu,
  FileText,
  FolderOpen,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import { EASE, EASE_INOUT } from "./motion";
import { useI18n } from "@/components/I18nProvider";
import type { Translation } from "@/lib/i18n";

/**
 * 首屏主角：按客户端 1:1 尺寸（1200×780）复刻的启动器窗口，
 * 外层用 transform: scale 缩进首屏，所以字号、间距、圆角与真机同比例。
 *
 * 取值来自 HomeView.vue / SideBar.vue / TitleBar.vue / InstanceCard.vue /
 * BrowseView.vue / SkinView.vue / MultiplayerView.vue / ToolboxView.vue /
 * SettingsView.vue。画面里出现的每个控件都有真实行为。
 */

/** 侧边栏导航：与 SideBar.vue 的顺序、图标一致（首页 / 内容 / 实例 / 多人 / 皮肤 / 工具箱 / 设置 / 新闻）。 */
const NAV = [Home, Compass, LayoutGrid, Users, Shirt, Wrench, SettingsIcon, FileText];
const TOOL_ICONS = [SeedIcon, Scan, Palette];
const VIEW_ICONS = [Grid2x2, List, AlignJustify];
const TOAST_MS = 2600;
const W = 1200;
const H = 780;

/** 页面顺序：0 首页 1 内容 2 实例 3 多人 4 皮肤 5 工具箱 6 设置。 */
const SKIN_PAGE = 4;

/** 主题色板：与启动器「外观 → 主题色」一致，点选即给整窗换强调色。默认琥珀。 */
const PALETTE: { rgb: string; lo: string; swatch: string; rainbow?: boolean }[] = [
  { rgb: "232,154,75", lo: "#d97f33", swatch: "#e89a4b" },
  { rgb: "242,104,60", lo: "#d9532b", swatch: "#f2683c" },
  { rgb: "239,77,77", lo: "#cf4545", swatch: "#ef4d4d" },
  { rgb: "236,79,134", lo: "#cf4585", swatch: "#ec4f86" },
  { rgb: "155,107,240", lo: "#7f52d6", swatch: "#9b6bf0" },
  { rgb: "90,176,255", lo: "#3d8fd6", swatch: "#5ab0ff" },
  { rgb: "34,195,214", lo: "#1fa8ba", swatch: "#22c3d6" },
  { rgb: "53,192,122", lo: "#33a567", swatch: "#35c07a" },
  { rgb: "232,195,75", lo: "#cfab33", swatch: "#e8c34b" },
  { rgb: "232,154,75", lo: "#d97f33", swatch: "#e89a4b", rainbow: true },
];
function themeVars(i: number): React.CSSProperties {
  const { rgb, lo } = PALETTE[i] ?? PALETTE[0];
  return {
    "--qx-amber": `rgb(${rgb})`,
    "--qx-amber-lo": lo,
    "--qx-a-08": `rgba(${rgb},0.08)`,
    "--qx-a-12": `rgba(${rgb},0.12)`,
    "--qx-a-14": `rgba(${rgb},0.14)`,
    "--qx-a-22": `rgba(${rgb},0.22)`,
    "--qx-a-25": `rgba(${rgb},0.25)`,
    "--qx-a-35": `rgba(${rgb},0.35)`,
    "--qx-a-45": `rgba(${rgb},0.45)`,
  } as React.CSSProperties;
}

/** 实例图标色相：真机用的是从客户端.jar 提取的方块贴图，这里用同色系的方块替代。 */
const HUES = [
  "linear-gradient(135deg, rgba(232,154,75,.55), rgba(232,154,75,.18))",
  "linear-gradient(135deg, rgba(122,208,138,.5), rgba(122,208,138,.16))",
  "linear-gradient(135deg, rgba(90,162,240,.5), rgba(90,162,240,.16))",
];

type Phase = "idle" | "launching" | "done";
type Instance = {
  name: string;
  full: string;
  kind: string;
  tone: string;
  meta: string;
  badge: string;
  ver: string;
  loaderVer: string;
  last: string;
  played: string;
};

/** 问候语时段划分与 HomeView.vue 一致。 */
function greetingKey(date: Date) {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning" as const;
  if (h >= 11 && h < 13) return "noon" as const;
  if (h >= 13 && h < 18) return "afternoon" as const;
  if (h >= 18 && h < 22) return "evening" as const;
  return "night" as const;
}

function Tile({ i, radius = 0 }: { i: number; radius?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
        borderRadius: radius,
        background: HUES[i % HUES.length],
      }}
    >
      <img
        src="/qookix-icon.png"
        alt=""
        width={20}
        height={20}
        style={{ imageRendering: "pixelated", opacity: 0.92 }}
      />
    </span>
  );
}

export default function LauncherWindow({ version }: { version: string | null }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const w = t.home.window;

  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState({ show: false, msg: "" });
  const [resident, setResident] = useState(0);
  const [unpinned, setUnpinned] = useState<number[]>([]);
  const [deleted, setDeleted] = useState<number[]>([]);
  const [accent, setAccent] = useState(0);

  const railRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stopProgress = useRef<(() => void) | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shake = useAnimationControls();
  const squash = useAnimationControls();
  const [indicator, setIndicator] = useState({ top: 0, height: 48 });

  // 缩放：设计空间宽度 / 容器实际宽度
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 滑动指示器：与 useSlidingIndicator 同样的「测量 + 过渡 top/height」
  useEffect(() => {
    const el = railRefs.current[page];
    if (el) setIndicator({ top: el.offsetTop, height: el.offsetHeight });
  }, [page]);

  useEffect(
    () => () => {
      stopProgress.current?.();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const notify = useCallback((msg: string) => {
    setNotice({ show: true, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setNotice((p) => ({ ...p, show: false })),
      TOAST_MS
    );
  }, []);

  const finish = useCallback(() => {
    setPhase("done");
    notify(w.resident.launched);
    if (reduce) return;
    shake.start({
      x: [0, 2, -1.4, 0.8, 0],
      y: [0, -1.2, 0.9, -0.4, 0],
      transition: { duration: 0.22, ease: "linear" },
    });
    squash.start({
      scale: [1, 1.012, 0.995, 1],
      transition: { duration: 0.26, ease: EASE },
    });
  }, [reduce, shake, squash, notify, w.resident.launched]);

  const launch = (index: number) => {
    setResident(index);
    if (phase !== "idle") return;
    if (reduce) {
      finish();
      return;
    }
    setPhase("launching");
    setProgress(0);
    const controls = animate(0, 1, {
      duration: 1.15,
      ease: EASE_INOUT,
      onUpdate: setProgress,
      onComplete: finish,
    });
    stopProgress.current = () => controls.stop();
  };

  const visible = w.instances
    .map((inst, i) => ({ inst, i }))
    .filter(({ i }) => !deleted.includes(i));
  const pins = visible.filter(({ i }) => !unpinned.includes(i));
  const active: Instance =
    w.instances[resident] && !deleted.includes(resident)
      ? w.instances[resident]
      : visible[0].inst;

  const cycleResident = () => {
    if (visible.length < 2) return;
    const at = visible.findIndex(({ inst }) => inst.name === active.name);
    setResident(visible[(at + 1) % visible.length].i);
  };

  const downloadLabel = w.resident.download.replace("{version}", version ?? "");

  return (
    <div ref={boxRef} className="relative">
      <div style={{ width: W * scale, height: H * scale }}>
        <motion.div
          className="qx-win"
          animate={shake}
          style={{ scale, transformOrigin: "top left", ...themeVars(accent) }}
        >
          <img src="/qx-backdrop.webp" alt="" aria-hidden className="qx-win-bg" />
          <span aria-hidden className="qx-win-scrim" />

          <div className="qx-win-shell">
            {/* 标题栏 */}
            <div className="qx-tb">
              <img
                src="/qookix-icon.png"
                alt=""
                className="qx-tb-logo"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="qx-tb-name">QookiX Launcher</span>
              <span className="qx-tb-sep">/</span>
              <span className="qx-tb-page">
                {(() => {
                  const Icon = NAV[page];
                  return <Icon size={13} strokeWidth={2} />;
                })()}
                {w.pageTitle[page]}
              </span>
              <div className="qx-tb-win" aria-hidden>
                <i>
                  <span style={{ width: 10, height: 1, background: "currentColor" }} />
                </i>
                <i>
                  <span style={{ width: 9, height: 9, border: "1px solid currentColor" }} />
                </i>
                <i>
                  <X size={12} />
                </i>
              </div>
            </div>

            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
              {/* 图标栏（固定折叠态 60px，与真机默认一致） */}
              <aside className="qx-rail" aria-label={w.railLabel}>
                <div className="qx-rail-nav">
                  <motion.span
                    aria-hidden
                    className="qx-rail-ind"
                    animate={{ top: indicator.top, height: indicator.height }}
                    transition={{ duration: 0.26, ease: EASE }}
                  />
                  {NAV.map((Icon, i) => (
                    <button
                      key={w.rail[i]}
                      ref={(el) => {
                        railRefs.current[i] = el;
                      }}
                      type="button"
                      onClick={() => setPage(i)}
                      aria-pressed={page === i}
                      title={w.rail[i]}
                      className="qx-nav-item"
                      data-on={page === i ? "1" : "0"}
                    >
                      <Icon size={18} strokeWidth={1.9} />
                    </button>
                  ))}
                </div>

                {pins.length > 0 && (
                  <>
                    <span className="qx-rail-divider" aria-hidden />
                    <div className="qx-rail-pins">
                      {pins.map(({ inst, i }) => (
                        <button
                          key={inst.name}
                          type="button"
                          className="qx-rail-pin"
                          data-on={active.name === inst.name ? "1" : "0"}
                          title={inst.name}
                          onClick={() => setResident(i)}
                        >
                          <Tile i={i} radius={10} />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="qx-rail-foot">
                  <button
                    type="button"
                    className="qx-nav-item"
                    title={w.download}
                    aria-label={w.download}
                    onClick={() => notify(w.dlEmpty)}
                  >
                    <Download size={18} strokeWidth={1.9} />
                    <span className="qx-nav-badge">{w.downloadsBadge}</span>
                  </button>

                  <div className="qx-acct-wrap">
                    <AcctPopover w={w} />
                  </div>
                </div>
              </aside>

              {/* 页面 */}
              <div className="qx-body">
                <div key={page} className="qx-page-wrap">
                {page === 0 && (
                  <HomePage
                    greeting={w.greeting[greetingKey(new Date())]}
                    pins={pins}
                    active={active}
                    phase={phase}
                    downloadLabel={downloadLabel}
                    onOpen={setResident}
                    onLaunch={launch}
                    onUnpin={(i) =>
                      setUnpinned((prev) => (pins.length <= 1 ? prev : [...prev, i]))
                    }
                    onBrowse={() => setPage(1)}
                    onCycle={cycleResident}
                    squash={squash}
                  />
                )}
                {page === 1 && <BrowsePage />}
                {page === 2 && (
                  <InstancesPage
                    visible={visible}
                    unpinned={unpinned}
                    onLaunch={launch}
                    onTogglePin={(i) =>
                      setUnpinned((prev) =>
                        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                      )
                    }
                    onDelete={(i) =>
                      setDeleted((prev) => (visible.length <= 1 ? prev : [...prev, i]))
                    }
                  />
                )}
                {page === 3 && <MultiplayerPage />}
                {page === SKIN_PAGE && <SkinPage />}
                {page === 5 && <ToolboxPage />}
                {page === 6 && (
                  <SettingsPage accent={accent} onAccent={setAccent} />
                )}
                {page === 7 && <NewsPage />}
                </div>
              </div>
            </div>
          </div>

          {phase !== "idle" && (
            <div className="qx-progress" aria-hidden>
              <span style={{ transform: `scaleX(${reduce ? 1 : progress})` }} />
            </div>
          )}

          <motion.div
            className="qx-g qx-toast"
            initial={false}
            animate={{ opacity: notice.show ? 1 : 0, y: notice.show ? 0 : 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            aria-hidden={!notice.show}
          >
            {notice.msg}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ==================== 账号弹层 ==================== */

function AcctPopover({ w }: { w: Translation["home"]["window"] }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  return (
    <>
      <button
        type="button"
        className="qx-rail-acct"
        title={w.accounts[sel].name}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="qx-head">
          <span />
        </span>
      </button>
      {open && (
        <div className="qx-g qx-acct-pop" role="menu">
          <span className="qx-acct-h">{w.acctTitle}</span>
          {w.accounts.map((a, i) => (
            <button
              key={a.name}
              type="button"
              role="menuitem"
              className="qx-acct-row"
              data-on={sel === i ? "1" : "0"}
              onClick={() => {
                setSel(i);
                setOpen(false);
              }}
            >
              <span className="qx-avatar">
                <i />
              </span>
              {a.name}
              <span className="qx-acct-type">{a.type}</span>
              {sel === i && (
                <span className="qx-acct-check">
                  <Check size={14} />
                </span>
              )}
            </button>
          ))}
          <button type="button" className="qx-mini" style={{ justifyContent: "center", marginTop: 2 }}>
            <Plus size={13} />
            {w.acctAdd}
          </button>
        </div>
      )}
    </>
  );
}

/* ==================== 首页 ==================== */

function HomePage({
  greeting,
  pins,
  active,
  phase,
  downloadLabel,
  onOpen,
  onLaunch,
  onUnpin,
  onBrowse,
  onCycle,
  squash,
}: {
  greeting: string;
  pins: { inst: Instance; i: number }[];
  active: Instance;
  phase: Phase;
  downloadLabel: string;
  onOpen: (i: number) => void;
  onLaunch: (i: number) => void;
  onUnpin: (i: number) => void;
  onBrowse: () => void;
  onCycle: () => void;
  squash: ReturnType<typeof useAnimationControls>;
}) {
  const { t } = useI18n();
  const w = t.home.window;

  return (
    <>
      <section className="qx-g qx-hero">
        <span className="qx-hero-glow" aria-hidden />
        <div className="qx-hero-text">
          <p className="qx-greeting" suppressHydrationWarning>
            {greeting}
          </p>
          <h2>
            {w.title} <span>{w.titleAccent}</span>
          </h2>
          <p>{w.subtitle}</p>
          <div className="qx-hero-actions">
            <button type="button" className="qx-b qx-b--ghost qx-b--big" onClick={onBrowse}>
              <Compass size={15} />
              {w.browse}
            </button>
            <button type="button" className="qx-b qx-b--ghost qx-b--big" onClick={onCycle}>
              <User size={15} />
              {w.switchAccount}
            </button>
          </div>
        </div>
        <img
          src="/qookix-icon.png"
          alt=""
          className="qx-hero-logo"
          style={{ imageRendering: "pixelated" }}
        />
      </section>

      {pins.length > 0 && (
        <section>
          <div className="qx-pin-grid">
            {pins.map(({ inst, i }) => (
              <div
                key={inst.name}
                className="qx-g qx-pin-card"
                onClick={() => onOpen(i)}
                data-on={active.name === inst.name ? "1" : "0"}
              >
                <span className="qx-pin-icon">
                  <Tile i={i} />
                </span>
                <span className="qx-pin-info">
                  <span className="qx-pin-title">{inst.name}</span>
                  <span className="qx-pin-meta">
                    <span className={`qx-chip qx-chip--${inst.tone}`}>{inst.kind}</span>
                    <span className="qx-pin-inst">{inst.meta}</span>
                  </span>
                </span>
                <span className="qx-pin-actions">
                  <button
                    type="button"
                    className="qx-unpin"
                    title={w.unpin}
                    aria-label={`${w.unpin} ${inst.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(i);
                    }}
                  >
                    <X size={13} />
                  </button>
                  <button
                    type="button"
                    className="qx-b qx-b--primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunch(i);
                    }}
                  >
                    <Play size={12} fill="currentColor" />
                    {w.launch}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="qx-win-section">
        <motion.div className="qx-g qx-resident" animate={squash}>
          <span className="qx-resident-icon">
            <Tile i={w.instances.indexOf(active)} radius={16} />
          </span>
          <span className="qx-resident-info">
            <span className="qx-resident-name">{active.full}</span>
            <span className="qx-resident-meta">
              <span className="qx-badge">{active.badge}</span>
              <span className="qx-ver">{active.ver}</span>
              {active.loaderVer && <span className="qx-ver">· {active.loaderVer}</span>}
              <span className="qx-ver">
                · {w.resident.recent} {active.last}
              </span>
            </span>
          </span>
          <span className="qx-resident-actions">
            {phase === "done" ? (
              <Link href="/download" className="qx-b qx-b--primary qx-b--big">
                <Download size={15} />
                {downloadLabel}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="qx-b qx-b--ghost"
                  onClick={onCycle}
                  disabled={pins.length < 2}
                >
                  <Repeat size={14} />
                  {w.resident.switch}
                </button>
                <button
                  type="button"
                  className="qx-b qx-b--primary qx-b--big"
                  onClick={() => onLaunch(w.instances.indexOf(active))}
                  disabled={phase === "launching"}
                >
                  <Play size={14} fill="currentColor" />
                  <span>{phase === "launching" ? w.resident.launching : w.resident.launch}</span>
                </button>
              </>
            )}
          </span>
        </motion.div>
      </section>
    </>
  );
}

/* ==================== 内容中心 ==================== */

function BrowsePage() {
  const { t } = useI18n();
  const b = t.home.window.browsePage;
  const [type, setType] = useState(0);
  const [view, setView] = useState(0);
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState(0);
  const [tags, setTags] = useState([true, true]);
  const [sort, setSort] = useState(0);
  const [installed, setInstalled] = useState<number[]>([]);
  const typeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeBarRef = useRef<HTMLDivElement>(null);
  const [tind, setTind] = useState({ left: 0, width: 0 });

  // 类型指示器：实测按钮位置，避免统一百分比因 gap/文字宽度造成的偏移对不齐
  useEffect(() => {
    const bar = typeBarRef.current;
    const el = typeRefs.current[type];
    if (!bar || !el) return;
    const br = bar.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setTind({ left: er.left - br.left, width: er.width });
  }, [type]);

  const providers = b.providers;
  const shown = b.items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => provider === 0 || item.source === providers[provider])
    .filter(
      ({ item }) =>
        !query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase())
    )
    .sort((x, y) =>
      sort === 0
        ? parseFloat(y.item.count) - parseFloat(x.item.count)
        : x.item.name.localeCompare(y.item.name)
    );

  return (
    <>
      <div className="qx-g qx-typebar" ref={typeBarRef}>
        {tind.width > 0 && (
          <motion.span
            aria-hidden
            className="qx-typebar-indicator"
            animate={{ left: tind.left, width: tind.width }}
            transition={{ duration: 0.26, ease: EASE }}
          />
        )}
        {b.types.map((label, i) => (
          <button
            key={label}
            type="button"
            ref={(el) => {
              typeRefs.current[i] = el;
            }}
            onClick={() => setType(i)}
            aria-pressed={type === i}
            data-on={type === i ? "1" : "0"}
            style={{ flex: 1 }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="qx-g qx-toolbar">
        <div className="qx-toolbar-row">
          <label className="qx-search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={b.search}
              aria-label={b.search}
            />
          </label>
          <span className="qx-select" style={{ display: "grid", placeItems: "center" }}>
            {b.instance}
          </span>
        </div>
        <div className="qx-toolbar-row">
          <select
            className="qx-select"
            aria-label={b.sorts[0]}
            value={sort}
            onChange={(e) => setSort(Number(e.target.value))}
          >
            {b.sorts.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
          <select className="qx-select" aria-label={b.pageSize} defaultValue="0">
            <option>{b.pageSize}</option>
            <option>{b.pageSizeMore}</option>
          </select>
          <div className="qx-viewswitch" role="group" aria-label={b.views[0]}>
            {VIEW_ICONS.map((Icon, i) => (
              <button
                key={b.views[i]}
                type="button"
                title={b.views[i]}
                aria-pressed={view === i}
                data-on={view === i ? "1" : "0"}
                onClick={() => setView(i)}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="qx-b"
            style={{
              padding: "7px 12px",
              fontSize: 12.5,
              background: tags.some(Boolean) ? "var(--qx-a-14)" : "rgba(255,255,255,0.06)",
              borderColor: "var(--qx-line)",
              color: tags.some(Boolean) ? "var(--qx-amber)" : "var(--qx-t1)",
            }}
            aria-pressed={tags.some(Boolean)}
            onClick={() => setTags(tags.map(() => !tags.some(Boolean)))}
          >
            <SlidersHorizontal size={13} />
            {b.filter}
          </button>
          <select
            className="qx-select"
            aria-label={b.providers[0]}
            value={provider}
            onChange={(e) => setProvider(Number(e.target.value))}
          >
            {providers.map((p, i) => (
              <option key={p} value={i}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tags.some(Boolean) && (
        <div className="qx-g qx-tags">
          {b.tags.map((tag, i) =>
            tags[i] ? (
              <span key={tag} className="qx-ftag">
                {tag}
                <button
                  type="button"
                  aria-label={tag}
                  onClick={() => setTags((prev) => prev.map((v, j) => (j === i ? false : v)))}
                >
                  <X size={11} />
                </button>
              </span>
            ) : null
          )}
          <button type="button" className="qx-ftag qx-ftag--clear" onClick={() => setTags([false, false])}>
            {b.clear}
          </button>
        </div>
      )}

      <div className="qx-mod-grid" data-view={view === 0 ? "grid" : view === 1 ? "list" : "compact"}>
        {shown.map(({ item, i }) => {
          const on = installed.includes(i);
          return (
            <article key={item.name} className="qx-g qx-mod-card">
              <div className="qx-mod-top">
                <span className="qx-mod-icon" aria-hidden />
                <div style={{ minWidth: 0 }}>
                  <p className="qx-mod-name">{item.name}</p>
                  <p className="qx-mod-by">
                    {item.author} · {item.time}
                  </p>
                </div>
              </div>
              <p className="qx-mod-desc">{item.desc}</p>
              <div className="qx-mod-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="qx-mod-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="qx-mod-foot">
                <span className="qx-mod-src">{item.source}</span>
                <span className="qx-mod-count">{item.count}</span>
                <button
                  type="button"
                  className="qx-b qx-b--primary"
                  aria-pressed={on}
                  onClick={() => setInstalled((prev) => (on ? prev.filter((x) => x !== i) : [...prev, i]))}
                >
                  {on ? <Check size={12} /> : <Download size={12} />}
                  {on ? b.installed : b.install}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ==================== 实例 ==================== */

function InstancesPage({
  visible,
  unpinned,
  onLaunch,
  onTogglePin,
  onDelete,
}: {
  visible: { inst: Instance; i: number }[];
  unpinned: number[];
  onLaunch: (i: number) => void;
  onTogglePin: (i: number) => void;
  onDelete: (i: number) => void;
}) {
  const { t } = useI18n();
  const p = t.home.window.instancesPage;
  const w = t.home.window;
  const [menu, setMenu] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  return (
    <>
      <div className="qx-inst-chips">
        <button
          type="button"
          className={filter === "all" ? "qx-chip active" : "qx-chip"}
          onClick={() => setFilter("all")}
        >
          {p.all}
          <span className="qx-chip-count">{visible.length}</span>
        </button>
        {p.groups.map((g, gi) => (
          <button
            key={g.name}
            type="button"
            className={filter === `g${gi}` ? "qx-chip active" : "qx-chip"}
            onClick={() => setFilter(`g${gi}`)}
          >
            <i className="qx-chip-dot" style={{ background: g.color }} />
            {g.name}
            <span className="qx-chip-count">{visible.filter(({ i }) => i % p.groups.length === gi).length}</span>
          </button>
        ))}
        <button
          type="button"
          className={filter === "ungrouped" ? "qx-chip active" : "qx-chip"}
          onClick={() => setFilter("ungrouped")}
        >
          {p.ungrouped}
          <span className="qx-chip-count">0</span>
        </button>
      </div>

      <div className="qx-mod-grid" style={{ position: "relative" }}>
        {visible.map(({ inst, i }) => (
          <article key={inst.name} className="qx-g qx-inst-card">
            <div className="qx-inst-top">
              <span className="qx-inst-icon">
                <Tile i={i} radius={12} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p className="qx-inst-name">{inst.name}</p>
                <p className="qx-inst-meta">
                  <span className="qx-badge">{inst.badge}</span>
                  <span>{inst.ver}</span>
                  {inst.loaderVer && <span>{inst.loaderVer}</span>}
                </p>
              </div>
            </div>
            <div className="qx-inst-foot">
              <span className="qx-inst-info">
                <span>{p.last} {inst.last}</span>
                {inst.played && <><span className="qx-inst-dot">·</span><span>{p.played} {inst.played}</span></>}
              </span>
              <div className="qx-actions">
                <button
                  type="button"
                  className="qx-iconbtn qx-iconbtn--play"
                  title={w.resident.launch}
                  aria-label={`${w.launch} ${inst.name}`}
                  onClick={() => onLaunch(i)}
                >
                  <Play size={13} fill="currentColor" />
                </button>
                <button
                  type="button"
                  className="qx-iconbtn"
                  title={p.openDir}
                  aria-label={`${p.openDir} ${inst.name}`}
                >
                  <FolderOpen size={13} />
                </button>
                <button
                  type="button"
                  className="qx-iconbtn"
                  title={p.more}
                  aria-expanded={menu === i}
                  aria-label={`${p.more} ${inst.name}`}
                  onClick={() => setMenu(menu === i ? null : i)}
                >
                  <MoreVertical size={13} />
                </button>
              </div>
            </div>

            {menu === i && (
              <div
                className="qx-g"
                style={{
                  position: "absolute",
                  right: 12,
                  top: 60,
                  zIndex: 20,
                  padding: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  minWidth: 172,
                }}
              >
                <button
                  type="button"
                  className="qx-mini"
                  style={{ border: 0, background: unpinned.includes(i) ? "transparent" : "var(--qx-a-14)" }}
                  onClick={() => onTogglePin(i)}
                >
                  <MapPin size={13} />
                  {unpinned.includes(i) ? p.pinHome : p.unpinHome}
                </button>
                <button type="button" className="qx-mini" style={{ border: 0 }}>
                  <Layers size={13} />
                  {p.moveTo}
                </button>
                <button type="button" className="qx-mini" style={{ border: 0 }} onClick={() => onDelete(i)}>
                  <Trash2 size={13} />
                  {p.remove}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

/* ==================== 多人游戏 ==================== */

type Room = { name: string; ver: string; port: string; online: boolean };

function MultiplayerPage() {
  const { t } = useI18n();
  const m = t.home.window.multiplayerPage;
  const [tab, setTab] = useState<"servers" | "rooms">("servers");
  const [rooms, setRooms] = useState<Room[]>(() => m.rooms.map((r) => ({ ...r })));

  const toggle = (i: number) =>
    setRooms((prev) => prev.map((r, j) => (j === i ? { ...r, online: !r.online } : r)));
  const remove = (i: number) => setRooms((prev) => prev.filter((_, j) => j !== i));
  const create = () =>
    setRooms((prev) => [
      ...prev,
      { name: m.newName, ver: "26.2", port: String(25565 + prev.length), online: false },
    ]);

  return (
    <>
      <div className="qx-mp-tabs">
        <button
          type="button"
          className={tab === "servers" ? "qx-mp-tab active" : "qx-mp-tab"}
          onClick={() => setTab("servers")}
        >
          <Server size={15} />
          {m.tabs[0]}
        </button>
        <button
          type="button"
          className={tab === "rooms" ? "qx-mp-tab active" : "qx-mp-tab"}
          onClick={() => setTab("rooms")}
        >
          <Users size={15} />
          {m.tabs[1]}
        </button>
      </div>

      {tab === "servers" && (
        <>
          <div className="qx-mp-head">
            <span className="qx-ver" style={{ fontSize: 13 }}>
              {rooms.length ? `${rooms.length}` : ""}
            </span>
            <button type="button" className="qx-b qx-b--primary" onClick={create}>
              <Plus size={14} />
              {m.create}
            </button>
          </div>

          {!rooms.length && (
            <div className="qx-g" style={{ padding: 40, textAlign: "center" }}>
              <span className="qx-mp-empty">{m.empty}</span>
            </div>
          )}

          <div className="qx-mp-list">
            {rooms.map((r, i) => (
              <div key={`${r.name}-${i}`} className="qx-g qx-mp-row">
                <span className="qx-mp-icon">
                  <Server size={20} />
                </span>
                <div className="qx-mp-main">
                  <p className="qx-mp-name">{r.name}</p>
                  <div className="qx-mp-meta">
                    <span
                      className="qx-mp-status"
                      data-on={r.online ? "1" : "0"}
                    >
                      <span className="qx-mp-dot" />
                      {r.online ? m.running : m.stopped}
                    </span>
                    <span>
                      {m.ver} {r.ver}
                    </span>
                    <span>
                      {m.port} {r.port}
                    </span>
                  </div>
                </div>
                <div className="qx-mp-actions">
                  <button
                    type="button"
                    className="qx-b qx-b--primary"
                    style={{ padding: "8px 14px", fontSize: 13 }}
                    onClick={() => toggle(i)}
                  >
                    {r.online ? <Power size={13} /> : <Play size={13} fill="currentColor" />}
                    {r.online ? m.stop : m.start}
                  </button>
                  <button
                    type="button"
                    className="qx-unpin"
                    aria-label={`${m.remove} ${r.name}`}
                    onClick={() => remove(i)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "rooms" && (
        <div className="qx-g qx-tc-root">
          <div className="qx-tc-hero">
            <span className="qx-tc-hero-icon">
              <Globe size={28} />
            </span>
            <div className="qx-tc-hero-text">
              <h3 className="qx-tc-title">{m.roomsTab.title}</h3>
              <p className="qx-tc-desc">{m.roomsTab.desc}</p>
            </div>
          </div>

          <div className="qx-tc-field">
            <label className="qx-tc-label">{m.roomsTab.playerName}</label>
            <input
              type="text"
              className="qx-tc-input"
              placeholder={m.roomsTab.playerPlaceholder}
              maxLength={16}
            />
          </div>

          <div className="qx-tc-grid">
            <div className="qx-tc-col">
              <div className="qx-tc-sub-title">
                <Plus size={14} />
                {m.roomsTab.createTitle}
              </div>
              <p className="qx-tc-sub-desc">{m.roomsTab.createDesc}</p>
              <button type="button" className="qx-b qx-b--primary qx-tc-btn">
                <Plus size={13} />
                {m.roomsTab.createBtn}
              </button>
            </div>
            <div className="qx-tc-divider" />
            <div className="qx-tc-col">
              <div className="qx-tc-sub-title">
                <User size={14} />
                {m.roomsTab.joinTitle}
              </div>
              <p className="qx-tc-sub-desc">{m.roomsTab.joinDesc}</p>
              <div className="qx-tc-join">
                <input
                  type="text"
                  className="qx-tc-input"
                  placeholder={m.roomsTab.codePlaceholder}
                />
                <button type="button" className="qx-b qx-b--primary qx-tc-btn">
                  <Play size={13} fill="currentColor" />
                  {m.roomsTab.joinBtn}
                </button>
              </div>
            </div>
          </div>

          <p className="qx-tc-license">{m.roomsTab.license}</p>
        </div>
      )}
    </>
  );
}

/* ==================== 工具箱 ==================== */

const BIOMES = ["#3a7d3f", "#5a8f3c", "#7ba85a", "#4f9d6b", "#8a6f3d", "#6f9ac2", "#b7c48f"];
function genBiomes(seed: number): string[] {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: 14 * 8 }, () => BIOMES[Math.floor(rand() * BIOMES.length)]);
}

function ToolboxPage() {
  const { t } = useI18n();
  const tb = t.home.window.toolboxPage;
  const [seed, setSeed] = useState(1337);
  const [open, setOpen] = useState(false);
  const cells = genBiomes(seed);

  return (
    <>
      <div className="qx-tool-grid">
        {tb.tools.map((tool, i) => (
          <article key={tool.name} className="qx-g qx-tool-card" data-ready={tool.ready ? "1" : "0"}>
            <div className="qx-tool-top">
              <span className="qx-tool-icon">
                {(() => {
                  const Icon = TOOL_ICONS[i] ?? Wrench;
                  return <Icon size={20} />;
                })()}
              </span>
              {!tool.ready && <span className="qx-soon">{tb.soon}</span>}
            </div>
            <p className="qx-tool-name">{tool.name}</p>
            <p className="qx-tool-desc">{tool.desc}</p>
            {tool.ready && (
              <button
                type="button"
                className="qx-b qx-b--primary"
                style={{ alignSelf: "flex-start", padding: "7px 14px", fontSize: 13 }}
                aria-pressed={open}
                onClick={() => setOpen((v) => !v)}
              >
                <SeedIcon size={13} />
                {tb.open}
              </button>
            )}
          </article>
        ))}
      </div>

      {open && (
        <div className="qx-g" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            aria-hidden
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(14, 1fr)",
              gap: 2,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {cells.map((c, i) => (
              <span key={i} style={{ aspectRatio: "1 / 1", background: c }} />
            ))}
          </div>
          <div className="qx-row qx-row--split">
            <span>
              {tb.seedLabel}: <strong>{seed}</strong>
            </span>
            <button
              type="button"
              className="qx-mini"
              onClick={() => setSeed((n) => (n * 1103515245 + 12345) % 100000)}
            >
              <RefreshCw size={12} />
              {tb.regenerate}
            </button>
          </div>
        </div>
      )}

      <p className="qx-tool-note">{tb.note}</p>
    </>
  );
}

/* ==================== 新闻 ==================== */

function NewsPage() {
  const { t } = useI18n();
  const n = t.home.window.newsPage;
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className="qx-news">
      <div className="qx-news-head">
        <h1>{n.title}</h1>
        <button
          type="button"
          className="qx-news-refresh"
          disabled={refreshing}
          onClick={refresh}
        >
          <RefreshCw size={14} />
          {refreshing ? n.refreshing : n.refresh}
        </button>
      </div>
      <div className="qx-news-list">
        {n.items.map((item) => (
          <div key={item.title} className="qx-g qx-news-card">
            <div className="qx-news-body">
              <h3 className="qx-news-title">{item.title}</h3>
              <p className="qx-news-desc">{item.desc}</p>
              <div className="qx-news-meta">
                <span className="qx-news-author">{item.author}</span>
                <span>{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== 设置 ==================== */

const SET_ICONS = [SlidersHorizontal, ImageIcon, Cpu, Download, Globe, HardDrive, FileText];
const DONUT_COLORS = ["#e89a4b", "#5ab0ff", "#35c07a", "#9b6bf0", "#ec4f86", "#8b8e9c", "#6b7280", "#4b5563", "#22c3d6"];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="qx-g qx-card">
      <h3 className="qx-card-h">{title}</h3>
      {children}
    </section>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="qx-set-row">
      <div className="qx-set-info">
        <div className="qx-set-label">{title}</div>
        {desc && <div className="qx-set-desc">{desc}</div>}
      </div>
      <div className="qx-set-ctl">{children}</div>
    </div>
  );
}

function Seg({ options, value, onChange }: { options: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div className="qx-seg">
      {options.map((label, i) => (
        <button
          key={label}
          type="button"
          aria-pressed={value === i}
          data-on={value === i ? "1" : "0"}
          onClick={() => onChange(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      className="qx-switch"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-on={on ? "1" : "0"}
      onClick={() => onChange(!on)}
    >
      <i />
    </button>
  );
}

function Slider({
  value,
  onChange,
  min,
  max,
  unit,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit: string;
  label: string;
}) {
  return (
    <div className="qx-slider">
      <input
        className="qx-range"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="qx-slider-val qx-mono">
        {value}
        {unit}
      </span>
    </div>
  );
}

function SettingsPage({
  accent,
  onAccent,
}: {
  accent: number;
  onAccent: (i: number) => void;
}) {
  const { t } = useI18n();
  const s = t.home.window.settingsPage;
  const [cat, setCat] = useState(0);
  const [version, setVersion] = useState("v0.8.0");

  const [onClose, setOnClose] = useState(2);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const [themeMode, setThemeMode] = useState(0);
  const [lang, setLang] = useState(0);
  const [ui, setUi] = useState([true, false, true]);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgDim, setBgDim] = useState(45);
  const [glass, setGlass] = useState(0);

  const [memMode, setMemMode] = useState(0);

  const [files, setFiles] = useState(8);
  const [shards, setShards] = useState(4);
  const [mirror, setMirror] = useState(0);

  const [proxy, setProxy] = useState(0);
  const [autoBody, setAutoBody] = useState(true);

  const [src, setSrc] = useState(1);

  useEffect(() => {
    fetch("https://api.github.com/repos/weimosheng/QookiX-Launcher/releases/latest")
      .then((res) => res.json())
      .then((data) => {
        if (data.tag_name) setVersion(data.tag_name);
      })
      .catch(() => {});
  }, []);

  const donut = (() => {
    const stops = s.storage.legend
      .reduce<{ css: string; end: number }[]>(
        (acc, l, i) => {
          const start = acc.length ? acc[acc.length - 1].end : 0;
          const end = start + (parseFloat(l.pct) || 0);
          return [...acc, { css: `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${end}%`, end }];
        },
        []
      )
      .map((x) => x.css);
    return `conic-gradient(${stops.join(",")})`;
  })();

  return (
    <div className="qx-settings">
      {/* 左侧子导航 */}
      <aside className="qx-g qx-set-side">
        <div className="qx-set-cats">
          {s.cats.map((label, i) => {
            const Ico = SET_ICONS[i];
            return (
              <button
                key={label}
                type="button"
                className="qx-set-cat"
                data-on={cat === i ? "1" : "0"}
                aria-pressed={cat === i}
                onClick={() => setCat(i)}
              >
                <Ico size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* 右侧内容 */}
      <div className="qx-set-main">
        {cat === 0 && (
          <>
            <div className="qx-set-grid">
              <Card title={s.general.behavior}>
                <Row title={s.general.onClose}>
                  <Seg options={s.general.onCloseOpts} value={onClose} onChange={setOnClose} />
                </Row>
                <Row title={s.general.autoUpdate} desc={s.general.autoUpdateDesc}>
                  <Toggle on={autoUpdate} onChange={setAutoUpdate} label={s.general.autoUpdate} />
                </Row>
              </Card>
              <Card title={s.general.dataDir}>
                <div className="qx-path">
                  <span className="qx-path-val qx-mono">{s.general.dataDirPath}</span>
                  <button type="button" className="qx-mini">
                    <FolderOpen size={13} />
                    {s.general.open}
                  </button>
                  <button type="button" className="qx-mini">
                    {s.general.change}
                  </button>
                </div>
                <p className="qx-note">{s.general.dataDirDesc}</p>
              </Card>
            </div>
          </>
        )}

        {cat === 1 && (
          <>
            <Card title={s.appearance.theme}>
              <Row title={s.appearance.themeMode}>
                <Seg options={s.appearance.themeModeOpts} value={themeMode} onChange={setThemeMode} />
              </Row>
              <div className="qx-set-row">
                <div className="qx-set-info">
                  <div className="qx-set-label">{s.appearance.themeColor}</div>
                </div>
                <div className="qx-swatches">
                  {PALETTE.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      className="qx-dot"
                      data-on={accent === i ? "1" : "0"}
                      aria-label={s.appearance.colors[i]}
                      aria-pressed={accent === i}
                      onClick={() => onAccent(i)}
                      style={{
                        background: c.rainbow
                          ? "conic-gradient(from 0deg, #ef4d4d, #e8c34b, #35c07a, #22c3d6, #5ab0ff, #9b6bf0, #ec4f86, #ef4d4d)"
                          : c.swatch,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <Card title={s.appearance.language}>
              <Row title={s.appearance.language} desc={s.appearance.languageDesc}>
                <Seg options={s.appearance.langOpts} value={lang} onChange={setLang} />
              </Row>
            </Card>

            <Card title={s.appearance.ui}>
              {s.appearance.switches.map((sw, i) => (
                <Row key={sw.label} title={sw.label} desc={sw.desc}>
                  <Toggle
                    on={ui[i]}
                    onChange={(v) => setUi((prev) => prev.map((x, j) => (j === i ? v : x)))}
                    label={sw.label}
                  />
                </Row>
              ))}
            </Card>

            <Card title={s.appearance.bg}>
              <div className="qx-bg-preview" />
              <div className="qx-set-row">
                <div className="qx-set-info">
                  <div className="qx-set-label">{s.appearance.bg}</div>
                </div>
                <div className="qx-set-ctl" style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="qx-mini">
                    {s.appearance.choose}
                  </button>
                  <button type="button" className="qx-mini">
                    {s.appearance.clear}
                  </button>
                </div>
              </div>
              <Row title={s.appearance.bgBlur}>
                <Slider value={bgBlur} onChange={setBgBlur} min={0} max={40} unit=" px" label={s.appearance.bgBlur} />
              </Row>
              <Row title={s.appearance.bgDim}>
                <Slider value={bgDim} onChange={setBgDim} min={0} max={100} unit="%" label={s.appearance.bgDim} />
              </Row>
            </Card>

            <Card title={s.appearance.glass}>
              <Row title={s.appearance.glassStrength} desc={s.appearance.glassDesc}>
                <Slider value={glass} onChange={setGlass} min={0} max={30} unit=" px" label={s.appearance.glassStrength} />
              </Row>
            </Card>
          </>
        )}

        {cat === 2 && (
          <>
            <div className="qx-set-grid">
              <Card title={s.java.runtime}>
                <div className="qx-java-find">
                  <button type="button" className="qx-mini">
                    <Search size={13} />
                    {s.java.find}
                  </button>
                  <span className="qx-note" style={{ margin: 0 }}>
                    {s.java.findDesc}
                  </span>
                </div>
                <div className="qx-java-list">
                  {s.java.list.map((j, i) => (
                    <div key={i} className="qx-g qx-jrow">
                      <span className="qx-jver">{j.ver}</span>
                      <span className="qx-jpath qx-mono">{j.path}</span>
                    </div>
                  ))}
                </div>
                <p className="qx-note">{s.java.listDesc}</p>
              </Card>

              <Card title={s.java.mem}>
                <Seg options={s.java.memModes} value={memMode} onChange={setMemMode} />
                <div className="qx-membar" aria-hidden>
                  <span style={{ width: "50%", background: "var(--qx-blue)" }} />
                  <span style={{ width: "13%", background: "var(--qx-amber)" }} />
                </div>
                <ul className="qx-memlegend">
                  <li>
                    <i style={{ background: "var(--qx-blue)" }} />
                    {s.java.memUsed} 31.5 GB (50%)
                  </li>
                  <li>
                    <i style={{ background: "var(--qx-amber)" }} />
                    {s.java.memGame} 8 GB (13%)
                  </li>
                  <li>
                    <i style={{ background: "var(--qx-t3)" }} />
                    {s.java.memTotal} 62.8 GB / {s.java.memAvail} 31.3 GB
                  </li>
                </ul>
              </Card>
            </div>

            <div className="qx-set-grid">
              <Card title={s.java.jvm}>
                <div className="qx-textarea">{s.java.jvmPh}</div>
              </Card>
              <Card title={s.java.gameArgs}>
                <div className="qx-input">{s.java.gameArgsPh}</div>
              </Card>
            </div>
          </>
        )}

        {cat === 3 && (
          <>
            <div className="qx-set-grid">
              <Card title={s.download.parallel}>
                <div className="qx-dl-count">
                  {s.download.files}：{files}
                </div>
                <Slider value={files} onChange={setFiles} min={1} max={16} unit="" label={s.download.files} />
                <p className="qx-note">{s.download.filesDesc}</p>
                <div className="qx-dl-count" style={{ marginTop: 14 }}>
                  {s.download.shards}：{shards}
                </div>
                <Slider value={shards} onChange={setShards} min={1} max={16} unit="" label={s.download.shards} />
                <p className="qx-note">{s.download.shardsDesc}</p>
              </Card>

              <Card title={s.download.mirror}>
                <div className="qx-mirrors">
                  {s.download.mirrors.map((m, i) => (
                    <button
                      key={m.name}
                      type="button"
                      className="qx-g qx-mirror"
                      data-on={mirror === i ? "1" : "0"}
                      onClick={() => setMirror(i)}
                    >
                      <span className="qx-mirror-main">
                        <span className="qx-mirror-name">{m.name}</span>
                        <span className="qx-mirror-sub qx-mono">{m.sub}</span>
                      </span>
                      <span className="qx-mini" style={{ pointerEvents: "none" }}>
                        {s.download.speedtest}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="qx-note">{s.download.mirrorDesc}</p>
              </Card>
            </div>

            <Card title={s.download.center}>
              <p className="qx-note" style={{ margin: 0 }}>
                {s.download.centerDesc}
              </p>
            </Card>
          </>
        )}

        {cat === 4 && (
          <>
            <div className="qx-set-grid">
              <Card title={s.content.cfKey}>
                <div className="qx-input qx-mono">••••••••••••••••••••••••</div>
                <p className="qx-note">{s.content.cfKeyDesc}</p>
              </Card>
              <Card title={s.content.proxy}>
                <div className="qx-proxy">
                  <Seg options={s.content.proxyOpts} value={proxy} onChange={setProxy} />
                  <button type="button" className="qx-mini">
                    {s.content.test}
                  </button>
                </div>
                <p className="qx-note">{s.content.proxyDesc}</p>
              </Card>
            </div>

            <Card title={s.content.translate}>
              <div className="qx-select-like">
                <span>{s.content.translateProvider}</span>
                <ChevronDown size={14} />
              </div>
              <p className="qx-note">{s.content.translateDesc}</p>
              <div className="qx-set-ctl" style={{ justifyContent: "flex-start", display: "flex", gap: 8 }}>
                <button type="button" className="qx-mini">
                  {s.content.clearBuiltin}
                </button>
                <button type="button" className="qx-mini">
                  {s.content.clearCustom}
                </button>
              </div>
              <Row title={s.content.autoBody} desc={s.content.autoBodyDesc}>
                <Toggle on={autoBody} onChange={setAutoBody} label={s.content.autoBody} />
              </Row>
            </Card>
          </>
        )}

        {cat === 5 && (
          <>
            <section className="qx-g qx-cloud">
              <span className="qx-cloud-ico">
                <Cloud size={16} />
              </span>
              <div className="qx-cloud-main">
                <span className="qx-card-h" style={{ margin: 0 }}>
                  {s.storage.cloud}
                </span>
                <span className="qx-note" style={{ margin: 0 }}>
                  {s.storage.cloudDesc}
                </span>
              </div>
              <button type="button" className="qx-mini">
                {s.storage.browse}
              </button>
            </section>

            <Card title={s.storage.stat}>
              <div className="qx-storage-top">
                <div className="qx-donut" style={{ background: donut }} aria-hidden>
                  <div className="qx-donut-hole">
                    <strong className="qx-mono">{s.storage.totalValue}</strong>
                    <span>{s.storage.total}</span>
                  </div>
                </div>
                <ul className="qx-legend">
                  {s.storage.legend.map((l, i) => (
                    <li key={l.name}>
                      <span className="qx-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="qx-legend-name">{l.name}</span>
                      <span className="qx-legend-size qx-mono">{l.size}</span>
                      <span className="qx-legend-pct qx-mono">{l.pct}</span>
                    </li>
                  ))}
                </ul>
                <div className="qx-storage-meta">
                  <span className="qx-note">{s.storage.lastUpdate}</span>
                  <button type="button" className="qx-mini">
                    <RefreshCw size={12} />
                    {s.storage.refresh}
                  </button>
                </div>
              </div>
            </Card>

            <Card title={`${s.storage.perInstance} · ${s.storage.perInstanceCount}`}>
              <ul className="qx-inst-list">
                {s.storage.instances.map((inst) => (
                  <li key={inst.name}>
                    <span className="qx-inst-nm">{inst.name}</span>
                    <span className="qx-mono">{inst.size}</span>
                    <span className="qx-mono qx-t3">{inst.pct}</span>
                  </li>
                ))}
              </ul>
              <div className="qx-clear">
                <button type="button" className="qx-mini qx-mini--danger">
                  <Trash2 size={12} />
                  {s.storage.clearCache}
                </button>
                <span className="qx-note" style={{ margin: 0 }}>
                  {s.storage.clearCacheDesc}
                </span>
              </div>
            </Card>
          </>
        )}

        {cat === 6 && (
          <>
            <section className="qx-g qx-about-hero">
              <div className="qx-checker" aria-hidden>
                <img src="/qookix-icon.png" alt="" width={72} height={72} style={{ imageRendering: "pixelated" }} />
              </div>
              <div className="qx-about-title">
                <strong>QookiX Launcher</strong>
                <span className="qx-badge">{version}</span>
              </div>
              <p className="qx-note" style={{ margin: 0 }}>
                {s.about.tagline}
              </p>
            </section>

            <div className="qx-set-grid">
              <Card title={s.about.devs}>
                <div className="qx-dev">
                  <img className="qx-dev-ava" src="/dev-weimosheng.jpg" alt={s.about.dev1} />
                  <div>
                    <div className="qx-dev-nm">{s.about.dev1}</div>
                    <div className="qx-note" style={{ margin: 0 }}>
                      {s.about.dev1role}
                    </div>
                  </div>
                </div>
                <div className="qx-dev">
                  <img className="qx-dev-ava" src="/dev-zhayi.jpg" alt={s.about.dev2} />
                  <div>
                    <div className="qx-dev-nm">{s.about.dev2}</div>
                    <div className="qx-note" style={{ margin: 0 }}>
                      {s.about.dev2role}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title={s.about.updateSource}>
                <div className="qx-set-ctl" style={{ justifyContent: "flex-start", display: "flex", gap: 8 }}>
                  <button type="button" className="qx-mini">
                    {s.about.diagnostics}
                  </button>
                  <button type="button" className="qx-mini qx-mini--primary">
                    {s.about.checkUpdate}
                  </button>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Seg options={s.about.srcOpts} value={src} onChange={setSrc} />
                </div>
                <p className="qx-note">{s.about.updateSrcDesc}</p>
              </Card>
            </div>

            <div className="qx-about-links">
              {s.about.links.map((l) => (
                <a key={l} href="#" onClick={(e) => e.preventDefault()} className="qx-g qx-about-link">
                  {l}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ==================== 皮肤中心 ==================== */

/** 姿态：四肢角度，让预览真的随所选动作摆位。 */
const POSE = [
  { arm: 4, leg: 2, lean: 0 },
  { arm: 26, leg: 18, lean: 2 },
  { arm: 52, leg: 38, lean: 7 },
  { arm: 0, leg: 0, lean: 0 },
];

function SkinPage() {
  const { t } = useI18n();
  const s = t.home.window.skinPage;
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState(1);
  const [applied, setApplied] = useState(1);
  const [pose, setPose] = useState(0);
  const [spin, setSpin] = useState(false);
  const [cape, setCape] = useState(false);
  const [model, setModel] = useState(0);
  const [angle, setAngle] = useState(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (!spin) return;
    let raf = 0;
    const tick = () => {
      setAngle((a) => (a + 0.8) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spin]);

  const p = POSE[pose] ?? POSE[0];
  const limb = model === 1 ? 6 : 9;

  const onDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setAngle((a) => a + e.movementX * 0.6);
  }, []);

  return (
    <div className="qx-skin-body">
      <section className="qx-g qx-pane">
        <div
          className="qx-stage"
          onPointerDown={() => {
            dragging.current = true;
            setSpin(false);
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
          onPointerMove={onDrag}
          style={{ cursor: "ew-resize" }}
        >
          <span className="qx-stage-label">
            {picked === applied ? s.applied : s.preview}
          </span>
          <div
            style={{
              position: "relative",
              width: 72,
              height: 150,
              transform: `perspective(420px) rotateY(${angle}deg) rotate(${p.lean}deg)`,
            }}
          >
            <span style={{ position: "absolute", left: 22, top: 0, width: 28, height: 28, background: "#f1c9a5", borderRadius: 3 }} />
            <span style={{ position: "absolute", left: 22, top: 0, width: 28, height: 9, background: "#5fb7d6", borderRadius: "3px 3px 0 0" }} />
            <span style={{ position: "absolute", left: 20, top: 29, width: 32, height: 44, background: "#4aa8c9", borderRadius: 2 }} />
            {cape && (
              <span style={{ position: "absolute", left: 16, top: 29, width: 40, height: 58, background: "var(--qx-a-35)", borderRadius: 2 }} />
            )}
            <span style={{ position: "absolute", left: 20 - limb - 1, top: 29, width: limb, height: 42, background: "#4aa8c9", borderRadius: 2, transform: `rotate(${p.arm}deg)`, transformOrigin: "top center", transition: "transform 260ms var(--qx-ease)" }} />
            <span style={{ position: "absolute", left: 52 + 1, top: 29, width: limb, height: 42, background: "#4aa8c9", borderRadius: 2, transform: `rotate(${-p.arm}deg)`, transformOrigin: "top center", transition: "transform 260ms var(--qx-ease)" }} />
            <span style={{ position: "absolute", left: 24, top: 74, width: 11, height: 46, background: "#3d5a8a", borderRadius: 2, transform: `rotate(${-p.leg}deg)`, transformOrigin: "top center", transition: "transform 260ms var(--qx-ease)" }} />
            <span style={{ position: "absolute", left: 37, top: 74, width: 11, height: 46, background: "#3d5a8a", borderRadius: 2, transform: `rotate(${p.leg}deg)`, transformOrigin: "top center", transition: "transform 260ms var(--qx-ease)" }} />
          </div>
          <span className="qx-stage-hint">{s.dragHint}</span>
        </div>

        <div className="qx-row qx-row--split">
          <span>{s.current}</span>
          <strong>{s.items[applied]?.name}</strong>
        </div>

        <div className="qx-row">
          <span style={{ width: 46, flexShrink: 0 }}>{s.anim}</span>
          <div className="qx-seg">
            {s.poses.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={pose === i}
                data-on={pose === i ? "1" : "0"}
                onClick={() => setPose(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="qx-row qx-row--split">
          <span>{s.autoRotate}</span>
          <button
            type="button"
            className="qx-switch"
            role="switch"
            aria-checked={spin}
            aria-label={s.autoRotate}
            data-on={spin ? "1" : "0"}
            onClick={() => setSpin((v) => !v)}
          >
            <i />
          </button>
        </div>

        <div className="qx-row">
          <button
            type="button"
            className="qx-mini"
            onClick={() => {
              setAngle(0);
              setPose(0);
            }}
          >
            <RefreshCw size={12} />
            {s.resetView}
          </button>
          <button type="button" className="qx-mini" aria-pressed={cape} onClick={() => setCape((v) => !v)}>
            <Shield size={12} />
            {s.cape}
          </button>
        </div>

        <div className="qx-row qx-row--split" style={{ marginTop: "auto" }}>
          <div className="qx-seg">
            {s.models.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={model === i}
                data-on={model === i ? "1" : "0"}
                onClick={() => setModel(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="qx-mini qx-mini--primary" onClick={() => setApplied(picked)}>
            <Check size={12} />
            {s.apply}
          </button>
        </div>
      </section>

      <section className="qx-g qx-pane">
        <div className="qx-skin-tabs">
          {s.tabs.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={tab === i}
              data-on={tab === i ? "1" : "0"}
              onClick={() => setTab(i)}
            >
              {label}
              <span aria-hidden />
            </button>
          ))}
        </div>

        <div className="qx-skin-toolbar">
          <em>{tab === 0 ? s.count : s.countEmpty}</em>
        </div>

        {tab === 0 ? (
          <div className="qx-skin-grid">
            {s.items.map((item, i) => (
              <button
                key={item.name}
                type="button"
                className="qx-skin-tile"
                data-on={picked === i ? "1" : "0"}
                aria-pressed={picked === i}
                onClick={() => setPicked(i)}
              >
                <figure>
                  <span
                    aria-hidden
                    style={{
                      display: "block",
                      width: 34,
                      height: 68,
                      background:
                        i === 0
                          ? "linear-gradient(180deg, #e8e8ee 0 22%, #d97f33 22% 52%, #f1c9a5 52% 62%, #3d5a8a 62% 100%)"
                          : "linear-gradient(180deg, #5fb7d6 0 22%, #4aa8c9 22% 52%, #f1c9a5 52% 62%, #3d5a8a 62% 100%)",
                    }}
                  />
                </figure>
                <figcaption>{item.name}</figcaption>
                <small>{item.size}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="qx-ver" style={{ fontSize: 13 }}>
            {s.empty}
          </p>
        )}
      </section>
    </div>
  );
}

