"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Grid3X3, Compass, Users, Shirt, Settings, Download,
  Play, Search, SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp,
  FolderOpen, RefreshCw, ExternalLink, Trash2, Square, RotateCcw,
  Info, Palette, HardDrive, FileText, InfoIcon,
  Monitor, Smartphone, Box, Globe, List, Heart, GitBranch,
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { EASE } from "./motion";

/**
 * Android 横屏启动器模拟，1:1 对齐 QookiX-Launcher-Android 前端代码。
 * 外壳 940 × 560，外层 transform:scale 自适应。
 */
const MH = 560;
const MW = 940;

const NAV = [
  { icon: Home,          labelKey: 0, page: "home" },
  { icon: Grid3X3,       labelKey: 2, page: "instances" },
  { icon: Compass,       labelKey: 1, page: "browse" },
  { icon: FileText,      labelKey: 7, page: "news" },
  { icon: Users,         labelKey: 3, page: "multiplayer" },
  { icon: Shirt,         labelKey: 4, page: "skin" },
  { icon: Settings,      labelKey: 6, page: "settings" },
  { icon: Download,      labelKey: -1, page: "downloads" },
];

/* ---------- Mock data ---------- */
const INSTANCE_GROUPS = [
  { id: "g1", name: "Fabric 整合", color: "#e89a4b" },
  { id: "g2", name: "原版存档", color: "#4ec9a0" },
];
const INSTANCES = [
  { id: "i1", name: "XPlus PerioTable", loader: "Fabric", mc: "26.2", lv: "0.19.3", group: "g1", badge: "Fabric", played: "12 小时 30 分钟", last: "昨天", icon: "mod" },
  { id: "i2", name: "红石生电优化 26.2", loader: "Fabric", mc: "26.2", lv: "0.19.3", group: "g1", badge: "Fabric", played: "3 小时 20 分钟", last: "三天前", icon: "mod" },
  { id: "i3", name: "新的世界", loader: "Vanilla", mc: "26.2", lv: "", group: "g2", badge: "原版", played: "刚刚", last: "刚刚", icon: "world" },
  { id: "i4", name: "纯生电测试", loader: "Forge", mc: "1.21.4", lv: "53.0.12", group: "g1", badge: "Forge", played: "2 小时 10 分钟", last: "5 天前", icon: "mod" },
];
const SERVERS = [
  { id: "s1", name: "红石生存服", core: "Paper", ver: "1.21.4", port: "25565", motd: "§a欢迎来到红石技术服！§r\n§6生电 / 建筑 / 机械 全攻略", running: true },
  { id: "s2", name: "创造建筑房", core: "Forge", ver: "1.21.1", port: "25566", motd: "A Minecraft Server", running: false },
];
const NEWS = [
  { url: "#", title: "Minecraft 1.22 正式发布", desc: "新生物 Armadillo、新方块 Tuff 系列、新指令 /placefeature…", author: "Mojang", time: "2 小时前" },
  { url: "#", title: "Fabric Loader 0.19 发布", desc: "支持 MC 26.x，性能改善 + 新的 API 文档站上线。", author: "Fabric Team", time: "1 天前" },
  { url: "#", title: "Iris 光影 1.8.0 更新", desc: "兼容 Sodium 0.7，新的 PBR 材质 API。", author: "Iris Team", time: "3 天前" },
];
const TASKS = [
  { id: "t1", source: "Sodium 0.7.0", status: "run", pct: 64, speed: "3.2 MB/s", files: "14 / 21", instance: "XPlus PerioTable", time: "10:23", stage: "下载中" },
  { id: "t2", source: "XPlus PerioTable 整合包", status: "ok", pct: 100, speed: "", files: "", instance: "XPlus PerioTable", time: "09:58", stage: "已完成" },
  { id: "t3", source: "JEI 物品管理器", status: "ok", pct: 100, speed: "", files: "", instance: "红石生电优化", time: "昨天", stage: "已完成" },
];

const SETTINGS_TABS = [
  { key: "general",   label: "常规",    icon: Info },
  { key: "appearance",label: "外观",    icon: Palette },
  { key: "download",  label: "下载",    icon: Download },
  { key: "content",   label: "内容服务",icon: Box },
  { key: "game",      label: "游戏内",  icon: Play },
  { key: "storage",   label: "存储",    icon: HardDrive },
  { key: "about",     label: "关于",    icon: InfoIcon },
];

/* ---------- MobileLauncherWindow ---------- */

export default function MobileLauncherWindow({ version }: { version: string | null }) {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const s = Math.min(1, (w - 24) / MW);
        setScale(s);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [tab, setTab] = useState(0);
  const [type, setType] = useState(0);
  const [filter, setFilter] = useState<"all" | string>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [serverTab, setServerTab] = useState<"servers" | "rooms">("servers");
  const [settingsTab, setSettingsTab] = useState("general");
  const [dlTab, setDlTab] = useState<"active" | "finished">("active");

  const currentTab = NAV[tab];
  const w = t.home.window;
  const h = new Date().getHours();
  const greeting =
    h >= 5 && h < 11 ? w.greeting.morning
    : h >= 11 && h < 13 ? w.greeting.noon
    : h >= 13 && h < 18 ? w.greeting.afternoon
    : h >= 18 && h < 22 ? w.greeting.evening
    : w.greeting.night;
  const browse = w.browsePage;
  const resident = w.instances[0];
  const pins = w.instances.slice(0, 3);

  const currentLabel = currentTab.labelKey === -1 ? w.download : (w.rail[currentTab.labelKey] ?? "");
  const currentTitle = currentTab.labelKey === -1 ? w.download : (w.pageTitle[currentTab.labelKey] ?? currentLabel);

  const filteredInstances = filter === "all"
    ? INSTANCES
    : filter === "ungrouped"
      ? INSTANCES.filter((i) => !i.group)
      : INSTANCES.filter((i) => i.group === filter);

  const toggleGroup = (k: string) =>
    setCollapsed((c) => ({ ...c, [k]: !c[k] }));

  return (
    <div ref={wrapRef} className="w-full overflow-hidden">
      <div
        style={{
          width: MW * scale,
          height: MH * scale,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: MW,
            height: MH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <div className="qx-mo-phone">
          {/* 状态栏 */}
          <div className="qx-mo-statusbar">
            <span>9:41</span>
            <div className="qx-mo-status-icons">
              <span className="qx-mo-signal" aria-hidden />
              <span className="qx-mo-wifi" aria-hidden />
              <span className="qx-mo-battery" aria-hidden />
            </div>
          </div>

          {/* 标题栏 */}
          <div className="qx-mo-titlebar">
            <div className="qx-mo-tb-left">
              <img src="/qookix-icon.png" alt="" className="qx-mo-logo" />
              <span className="qx-mo-tb-app">QookiX Launcher</span>
              <span className="qx-mo-tb-divider">/</span>
              {(() => {
                const I = currentTab.icon;
                return <I className="qx-mo-tb-page-icon" />;
              })()}
              <span className="qx-mo-tb-page">{currentTitle}</span>
            </div>
            <div className="qx-mo-tb-actions">
              {currentTab.page === "instances" && (
                <>
                  <button className="qx-mo-tb-action">+ 新建分组</button>
                  <button className="qx-mo-tb-action primary">+ 新建实例</button>
                </>
              )}
              {currentTab.page === "news" && (
                <button className="qx-mo-tb-action">
                  <RefreshCw size={12} /> 刷新
                </button>
              )}
              {currentTab.page === "downloads" && (
                <button className="qx-mo-tb-action" disabled>
                  <Trash2 size={12} /> 清除已完成
                </button>
              )}
            </div>
          </div>

          {/* 内容区 */}
          <div className="qx-mo-body">
            <div key={currentTab.page} className="qx-mo-page-wrap">
            {/* ========== HOME ========== */}
            {currentTab.page === "home" && (
              <div className="qx-mo-home">
                <section className="qx-mo-hero">
                  <div className="qx-mo-hero-glow" aria-hidden />
                  <img src="/qookix-icon.png" alt="" className="qx-mo-hero-logo" />
                  <div className="qx-mo-hero-text">
                    <div className="qx-mo-greeting">{greeting}</div>
                    <h1 className="qx-mo-h1">
                      {w.title} <span className="qx-mo-accent">{w.titleAccent}</span>
                    </h1>
                    <p className="qx-mo-subtitle">{w.subtitle}</p>
                  </div>
                  <div className="qx-mo-hero-actions">
                    <button className="qx-mo-btn ghost">浏览内容</button>
                    <button className="qx-mo-btn ghost">切换账号</button>
                  </div>
                </section>

                {resident && (
                  <section className="qx-mo-resident">
                    <div className="qx-mo-res-icon"><Home size={26} /></div>
                    <div className="qx-mo-res-info">
                      <div className="qx-mo-res-name">{resident.name}</div>
                      <div className="qx-mo-res-meta">
                        <span className="qx-mo-badge">{resident.badge}</span>
                        <span>{resident.ver}</span>
                        {resident.loaderVer && <span>· {resident.loaderVer}</span>}
                        {resident.played && <span>· 已玩 {resident.played}</span>}
                      </div>
                    </div>
                    <div className="qx-mo-res-actions">
                      <button className="qx-mo-btn ghost">切换</button>
                      <button className="qx-mo-btn primary">
                        <Play size={14} /> {w.resident.launch}
                      </button>
                    </div>
                  </section>
                )}

                <section className="qx-mo-pin-block">
                  <div className="qx-mo-pin-grid">
                    {pins.map((p, i) => (
                      <div key={i} className="qx-mo-pin-card">
                        <div className="qx-mo-pin-icon"><Play size={18} /></div>
                        <div className="qx-mo-pin-info">
                          <div className="qx-mo-pin-name">{p.name}</div>
                          <div className="qx-mo-pin-meta">
                            <span className="qx-mo-pin-type">{p.kind}</span>
                            <span>{p.meta}</span>
                          </div>
                        </div>
                        <button className="qx-mo-pin-play" aria-label="启动">
                          <Play size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ========== INSTANCES ========== */}
            {currentTab.page === "instances" && (
              <div className="qx-mo-instances">
                {/* 顶部 chips 筛选 */}
                <div className="qx-mo-inst-toolbar">
                  <div className="qx-mo-inst-chips">
                    <button
                      className={`qx-mo-chip ${filter === "all" ? "active" : ""}`}
                      onClick={() => setFilter("all")}
                    >
                      全部
                    </button>
                    {INSTANCE_GROUPS.map((g) => {
                      const cnt = INSTANCES.filter((i) => i.group === g.id).length;
                      return (
                        <button
                          key={g.id}
                          className={`qx-mo-chip ${filter === g.id ? "active" : ""}`}
                          onClick={() => setFilter(g.id)}
                        >
                          <span className="qx-mo-dot" style={{ background: g.color }} />
                          {g.name}
                        </button>
                      );
                    })}
                    <button
                      className={`qx-mo-chip ${filter === "ungrouped" ? "active" : ""}`}
                      onClick={() => setFilter("ungrouped")}
                    >
                      未分组
                    </button>
                  </div>
                </div>

                {/* 分组视图 */}
                {filter === "all" ? (
                  <div className="qx-mo-groups">
                    {INSTANCE_GROUPS.map((g) => {
                      const items = INSTANCES.filter((i) => i.group === g.id);
                      if (!items.length) return null;
                      const isCollapsed = collapsed[g.id];
                      return (
                        <div key={g.id} className="qx-mo-group-block">
                          <div className="qx-mo-group-head">
                            <button
                              className="qx-mo-group-toggle"
                              onClick={() => toggleGroup(g.id)}
                            >
                              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              <span className="qx-mo-dot" style={{ background: g.color }} />
                              <span>{g.name}</span>
                              <span className="qx-mo-group-count">{items.length}</span>
                            </button>
                          </div>
                          {!isCollapsed && (
                            <div className="qx-mo-card-grid">
                              {items.map((inst) => (
                                <InstanceCardMini key={inst.id} inst={inst} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* 未分组 */}
                    {(() => {
                      const items = INSTANCES.filter((i) => !i.group);
                      if (!items.length) return null;
                      const isCollapsed = collapsed["ungrouped"];
                      return (
                        <div className="qx-mo-group-block">
                          <div className="qx-mo-group-head">
                            <button
                              className="qx-mo-group-toggle"
                              onClick={() => toggleGroup("ungrouped")}
                            >
                              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              <span className="qx-mo-dot" />
                              <span>未分组</span>
                              <span className="qx-mo-group-count">{items.length}</span>
                            </button>
                          </div>
                          {!isCollapsed && (
                            <div className="qx-mo-card-grid">
                              {items.map((inst) => (
                                <InstanceCardMini key={inst.id} inst={inst} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="qx-mo-card-grid">
                    {filteredInstances.map((inst) => (
                      <InstanceCardMini key={inst.id} inst={inst} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========== BROWSE ========== */}
            {currentTab.page === "browse" && (
              <div className="qx-mo-browse">
                <aside className="qx-mo-browse-side">
                  <div className="qx-mo-browse-rail">
                    <motion.div
                      aria-hidden
                      className="qx-mo-browse-type-ind"
                      animate={{ top: type * 34 + 6, height: 30 }}
                      transition={{ duration: 0.24, ease: EASE }}
                    />
                    {(browse.types ?? []).map((t: string, i: number) => (
                      <button
                        key={t}
                        className={`qx-mo-browse-type ${type === i ? "active" : ""}`}
                        onClick={() => setType(i)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </aside>
                <div className="qx-mo-browse-main">
                  <div className="qx-mo-browse-tb">
                    <div className="qx-mo-browse-tb-row">
                      <div className="qx-mo-search">
                        <Search size={13} />
                        <span>{browse.search}</span>
                      </div>
                      <button className="qx-mo-tb-btn">
                        <SlidersHorizontal size={12} /> 筛选
                      </button>
                    </div>
                    <div className="qx-mo-browse-tb-row">
                      <button className="qx-mo-tb-btn active">下载量</button>
                      <button className="qx-mo-tb-btn">列表</button>
                      <button className="qx-mo-tb-btn">20 条/页</button>
                      <button className="qx-mo-tb-btn qx-mo-provider">全部来源</button>
                    </div>
                  </div>
                  <div className="qx-mo-browse-tags">
                    <span className="qx-mo-ftag">版本 26.2</span>
                    <span className="qx-mo-ftag">加载器 Fabric</span>
                    <button className="qx-mo-ftag-clear">清除全部</button>
                  </div>
                  <div className="qx-mo-browse-list">
                    {(browse.items ?? []).map((it: any, i: number) => (
                      <div key={i} className="qx-mo-browse-card">
                        <div className="qx-mo-browse-icon"><Grid3X3 size={20} /></div>
                        <div className="qx-mo-browse-info">
                          <div className="qx-mo-browse-name">{it.name}</div>
                          <div className="qx-mo-browse-sub">{it.author} · {it.count}</div>
                        </div>
                        <button className="qx-mo-browse-btn">{browse.install}</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== NEWS ========== */}
            {currentTab.page === "news" && (
              <div className="qx-mo-news">
                <div className="qx-mo-news-header">
                  <h1>Minecraft 新闻</h1>
                  <button className="qx-mo-tb-action">
                    <RefreshCw size={12} /> 刷新
                  </button>
                </div>
                <div className="qx-mo-news-list">
                  {NEWS.map((n, i) => (
                    <article key={i} className="qx-mo-news-card">
                      <div className="qx-mo-news-body">
                        <h3 className="qx-mo-news-title">{n.title}</h3>
                        <p className="qx-mo-news-desc">{n.desc}</p>
                        <div className="qx-mo-news-meta">
                          <span>{n.author}</span>
                          <span>{n.time}</span>
                          <ExternalLink size={11} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ========== MULTIPLAYER ========== */}
            {currentTab.page === "multiplayer" && (
              <div className="qx-mo-mp">
                <div className="qx-mo-mode-tabs">
                  <button
                    className={`qx-mo-mode-tab ${serverTab === "servers" ? "active" : ""}`}
                    onClick={() => setServerTab("servers")}
                  >
                    服务器
                  </button>
                </div>
                <div className="qx-mo-server-grid">
                  {SERVERS.map((s) => (
                    <div key={s.id} className="qx-mo-server-card">
                      <div className="qx-mo-server-head">
                        <span className="qx-mo-core-badge" style={{ color: s.running ? "#4ec9a0" : "#8b8e9c", borderColor: s.running ? "#4ec9a0" : "#8b8e9c" }}>
                          {s.core}
                        </span>
                        <h3 className="qx-mo-server-name">{s.name}</h3>
                      </div>
                      <div className="qx-mo-server-meta">
                        <div>版本 <b>{s.ver}</b></div>
                        <div>端口 <b>{s.port}</b></div>
                      </div>
                      <div className="qx-mo-server-motd">{s.motd}</div>
                      <div className="qx-mo-server-foot">
                        <span className={`qx-mo-status ${s.running ? "on" : ""}`}>
                          {s.running ? "运行中" : "未启动"}
                        </span>
                        <div className="qx-mo-server-ops">
                          <button className={`qx-mo-op ${s.running ? "stop" : "start"}`}>
                            {s.running ? <Square size={12} /> : <Play size={12} />}
                            {s.running ? "停止" : "启动"}
                          </button>
                          <button className="qx-mo-op danger">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== SKIN ========== */}
            {currentTab.page === "skin" && (
              <div className="qx-mo-skin">
                <div className="qx-mo-skin-preview">
                  <div className="qx-mo-skin-canvas">
                    <div className="qx-mo-skin-steve" />
                    <div className="qx-mo-skin-label">预览</div>
                  </div>
                  <div className="qx-mo-skin-info-row">
                    <span>当前皮肤</span>
                    <b>Steve</b>
                  </div>
                  <div className="qx-mo-skin-actions">
                    <button className="qx-mo-mini-btn"><RefreshCw size={12} /> 重置视角</button>
                    <button className="qx-mo-mini-btn"><Box size={12} /> 披风</button>
                    <button className="qx-mo-mini-btn primary"><Download size={12} /> 保存到本地</button>
                  </div>
                </div>
                <div className="qx-mo-skin-list">
                  <div className="qx-mo-skin-list-title">我的皮肤</div>
                  {["Steve", "Alex", "紫袍法师", "赛博骑士"].map((n, i) => (
                    <div key={i} className={`qx-mo-skin-item ${i === 0 ? "active" : ""}`}>
                      <div className="qx-mo-skin-item-icon" />
                      <div className="qx-mo-skin-item-name">{n}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== SETTINGS ========== */}
            {currentTab.page === "settings" && (
              <div className="qx-mo-settings-layout">
                <aside className="qx-mo-settings-nav">
                  <nav className="qx-mo-settings-nav-list">
                    {SETTINGS_TABS.map((t) => {
                      const I = t.icon;
                      return (
                        <button
                          key={t.key}
                          className={`qx-mo-settings-nav-item ${settingsTab === t.key ? "active" : ""}`}
                          onClick={() => setSettingsTab(t.key)}
                        >
                          <I size={14} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>

                <div className="qx-mo-settings-body">
                  {settingsTab === "general" && (
                    <div className="qx-mo-settings-pane">
                      <div className="qx-mo-settings-card">
                        <h3>内存分配（默认值）</h3>
                        <div className="qx-mo-mem-row">
                          <span className="qx-mo-radio active">自动配置</span>
                          <span className="qx-mo-radio">手动配置</span>
                        </div>
                        <div className="qx-mo-mem-gauge">
                          <div className="qx-mo-mem-gauge-track">
                            <div className="qx-mo-mem-gauge-used" style={{ width: "48%" }} />
                            <div className="qx-mo-mem-gauge-alloc" style={{ left: "10%", width: "14%" }} />
                          </div>
                          <div className="qx-mo-mem-labels">
                            <span><span className="dot used" />已使用 8.2 GB（48%）</span>
                            <span><span className="dot alloc" />游戏分配 2.0 GB</span>
                            <span><span className="dot total" />总内存 16 GB</span>
                          </div>
                        </div>
                      </div>
                      <div className="qx-mo-settings-card">
                        <h3>行为</h3>
                        <div className="qx-mo-settings-item">
                          <div>
                            <div className="qx-mo-settings-label">关闭窗口时</div>
                            <div className="qx-mo-settings-sub">最小化到后台</div>
                          </div>
                        </div>
                        <div className="qx-mo-settings-item">
                          <div>
                            <div className="qx-mo-settings-label">自动更新</div>
                            <div className="qx-mo-settings-sub">启动时检测版本</div>
                          </div>
                          <span className="qx-mo-toggle on" />
                        </div>
                      </div>
                    </div>
                  )}
                  {settingsTab === "appearance" && (
                    <div className="qx-mo-settings-pane">
                      <div className="qx-mo-settings-card">
                        <h3>主题</h3>
                        <div className="qx-mo-theme-row">
                          <button className="qx-mo-theme-item active">深色</button>
                          <button className="qx-mo-theme-item">浅色</button>
                        </div>
                        <h3>主题色</h3>
                        <div className="qx-mo-colors">
                          {["#e89a4b","#ffa050","#ff6666","#ff86c8","#b57cff","#5aa8ff","#4ec9a0","#ffcf4b","#ff6bd6"].map((c, i) => (
                            <span
                              key={i}
                              className="qx-mo-color-dot"
                              style={{ background: c, borderColor: i === 0 ? "#fff" : "transparent" }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {settingsTab === "download" && (
                    <div className="qx-mo-settings-pane">
                      <div className="qx-mo-settings-card">
                        <h3>下载</h3>
                        <div className="qx-mo-settings-item">
                          <div>
                            <div className="qx-mo-settings-label">最大并发数</div>
                            <div className="qx-mo-settings-sub">4</div>
                          </div>
                        </div>
                        <div className="qx-mo-settings-item">
                          <div>
                            <div className="qx-mo-settings-label">限速</div>
                            <div className="qx-mo-settings-sub">不限速</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {settingsTab === "about" && (
                    <div className="qx-mo-settings-pane">
                      {/* 顶部 showcase 大卡片 */}
                      <div className="qx-mo-about-showcase">
                        <div className="qx-mo-about-checker" aria-hidden />
                        <img src="/qookix-icon.png" alt="" width={72} height={72} className="qx-mo-about-logo" style={{ imageRendering: "pixelated" }} />
                        <div className="qx-mo-about-title-row">
                          <span className="qx-mo-about-name">QookiX Launcher Android</span>
                          <span className="qx-mo-about-ver">{version ?? "v1.0.0"}</span>
                        </div>
                        <p className="qx-mo-about-slogan">现代化、简洁、无广告的 Minecraft 启动器</p>
                      </div>

                      {/* about-grid 两列：开发者卡 | 链接按钮列 */}
                      <div className="qx-mo-about-grid">
                        <div className="qx-mo-about-card">
                          <div className="qx-mo-about-devs-title">开发者</div>
                          <div className="qx-mo-dev-line">
                            <img className="qx-mo-dev-ava" src="/dev-zhayi.jpg" alt="ZhaYi" />
                            <div>
                              <div className="qx-mo-dev-head">
                                <span className="qx-mo-dev-nm">ZhaYi</span>
                                <button className="qx-mo-dev-gh" aria-label="GitBranch"><GitBranch size={12} /></button>
                              </div>
                              <span className="qx-mo-dev-role">QookiX-Launcher-Android 的开发者</span>
                            </div>
                          </div>
                          <div className="qx-mo-dev-line">
                            <img className="qx-mo-dev-ava" src="/dev-weimosheng.jpg" alt="维墨笙" />
                            <div>
                              <div className="qx-mo-dev-head">
                                <span className="qx-mo-dev-nm">维墨笙</span>
                                <button className="qx-mo-dev-gh" aria-label="GitBranch"><GitBranch size={12} /></button>
                              </div>
                              <span className="qx-mo-dev-role">QookiX-Launcher-Android 的协力开发者</span>
                            </div>
                          </div>
                        </div>

                        <div className="qx-mo-about-links-row">
                          {[
                            { I: Globe,  l: "官方网站" },
                            { I: GitBranch, l: "GitBranch 仓库" },
                            { I: ExternalLink, l: "问题反馈" },
                            { I: List,   l: "更新日志" },
                            { I: Users,  l: "官方 Q 群" },
                            { I: Heart,  l: "爱发电赞助" },
                          ].map(({ I, l }) => (
                            <button key={l} className="qx-mo-about-link" type="button">
                              <span className="qx-mo-link-left"><I size={12} /> {l}</span>
                              <span className="qx-mo-link-arrow">→</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* about-grid 下一行：许可证卡 + 依赖声明卡 */}
                      <div className="qx-mo-about-grid">
                        <div className="qx-mo-about-card">
                          <h3>许可证</h3>
                          <p className="qx-mo-about-license-text">
                            QookiX Launcher 基于 <span className="qx-mo-license-accent">GPL-3.0</span>{" "}
                            开源协议发布。图标、名称与品牌归属 QookiX 开发组所有，未经许可请勿用于商业用途。
                          </p>
                          <button className="qx-mo-about-link" type="button">
                            <span className="qx-mo-link-left"><FileText size={12} /> 查看 GPL-3.0 完整文本</span>
                            <span className="qx-mo-link-arrow">→</span>
                          </button>
                        </div>
                        <div className="qx-mo-about-card">
                          <h3>许可与版权声明</h3>
                          <p className="qx-mo-about-license-text">
                            QookiX Launcher 的构建得益于以下优秀的开源项目。
                          </p>
                          <div className="qx-mo-deps-list">
                            {[
                              { name: "Vue", ver: "3.5", lic: "MIT" },
                              { name: "Naive UI", ver: "2.45", lic: "MIT" },
                              { name: "Pinia", ver: "2.2", lic: "MIT" },
                              { name: "Tauri API", ver: "2", lic: "MIT/Apache-2.0" },
                              { name: "Tokio", ver: "1", lic: "MIT" },
                            ].map((d) => (
                              <div key={d.name} className="qx-mo-dep-row">
                                <div className="qx-mo-dep-info">
                                  <span className="qx-mo-dep-name">{d.name}<span className="qx-mo-dep-ver">v{d.ver}</span></span>
                                  <span className="qx-mo-dep-lic">{d.lic}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {(settingsTab === "storage" || settingsTab === "content" || settingsTab === "game") && (
                    <div className="qx-mo-settings-pane">
                      <div className="qx-mo-settings-card">
                        <h3>{SETTINGS_TABS.find((t) => t.key === settingsTab)?.label}</h3>
                        <div className="qx-mo-empty-inline">完整功能将在后续更新中推出</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== DOWNLOADS ========== */}
            {currentTab.page === "downloads" && (
              <div className="qx-mo-dl">
                <div className="qx-mo-dl-tabs">
                  <motion.div
                    aria-hidden
                    className="qx-mo-dl-tab-ind"
                    animate={{ left: dlTab === "active" ? "3px" : "calc(50% + 0px)", width: "calc(50% - 3px)" }}
                    transition={{ duration: 0.24, ease: EASE }}
                  />
                  <button
                    className={`qx-mo-dl-tab ${dlTab === "active" ? "active" : ""}`}
                    onClick={() => setDlTab("active")}
                  >
                    进行中 <span className="qx-mo-tab-count">1</span>
                  </button>
                  <button
                    className={`qx-mo-dl-tab ${dlTab === "finished" ? "active" : ""}`}
                    onClick={() => setDlTab("finished")}
                  >
                    已完成 <span className="qx-mo-tab-count">2</span>
                  </button>
                </div>

                <div className="qx-mo-dl-list">
                  {TASKS.filter((t) => (dlTab === "active" ? t.status === "run" : t.status !== "run")).map((t) => (
                    <div key={t.id} className="qx-mo-dl-card">
                      <div className="qx-mo-dl-title-row">
                        <div className="qx-mo-dl-title">{t.source}</div>
                        <span className={`qx-mo-dl-status ${t.status}`}>{t.stage}</span>
                      </div>
                      <div className="qx-mo-dl-meta">
                        <span>{t.time}</span>
                        <span>目标实例：{t.instance}</span>
                      </div>
                      <div className="qx-mo-dl-side">
                        {t.status === "run" ? (
                          <>
                            <div className="qx-mo-dl-speed">{t.speed}</div>
                            <div className="qx-mo-dl-progress">
                              <div className="qx-mo-dl-progress-fill" style={{ width: `${t.pct}%` }} />
                            </div>
                            <div className="qx-mo-dl-pct">{t.pct}%</div>
                          </>
                        ) : (
                          <div className="qx-mo-dl-done-icon">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* 底部导航 */}
          <nav className="qx-mo-nav">
            {NAV.map((entry, i) => {
              const Icon = entry.icon;
              const label = entry.labelKey === -1 ? w.download : (w.rail[entry.labelKey] ?? "");
              const active = tab === i;
              return (
                <button
                  key={entry.page}
                  type="button"
                  className={`qx-mo-nav-item ${active ? "active" : ""}`}
                  onClick={() => setTab(i)}
                  aria-label={label}
                >
                  <Icon className="qx-mo-nav-icon" size={20} />
                  <span className="qx-mo-nav-label">{label}</span>
                  {entry.page === "downloads" && <span className="qx-mo-badge-num">{w.downloadsBadge}</span>}
                  {active && (
                    <motion.span
                      aria-hidden
                      className="qx-mo-nav-ind"
                      layoutId="qxmo-ind"
                      transition={{ duration: 0.26, ease: EASE }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- InstanceCard (迷你) ---------- */

function InstanceCardMini({ inst }: { inst: any }) {
  return (
    <div className="qx-mo-inst-card">
      <div className="qx-mo-inst-top">
        <div className="qx-mo-inst-icon">
          {inst.icon === "world" ? <FolderOpen size={20} /> : <Grid3X3 size={20} />}
        </div>
        <div className="qx-mo-inst-title-wrap">
          <div className="qx-mo-inst-name">{inst.name}</div>
          <div className="qx-mo-inst-meta">
            <span className="qx-mo-badge">{inst.badge}</span>
            <span>{inst.mc}</span>
            {inst.lv && <span>· {inst.lv}</span>}
          </div>
        </div>
      </div>
      <div className="qx-mo-inst-foot">
        <div className="qx-mo-inst-foot-info">
          {inst.last && <span>上次 {inst.last}</span>}
          {inst.last && inst.played && <span>·</span>}
          {inst.played && <span>已玩 {inst.played}</span>}
        </div>
        <div className="qx-mo-inst-actions" onClick={(e) => e.stopPropagation()}>
          <button className="qx-mo-icon-btn play" aria-label="启动">
            <Play size={13} />
          </button>
          <button className="qx-mo-icon-btn" aria-label="打开目录">
            <FolderOpen size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}







