<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

/**
 * 翻译缓存服务状态页
 *
 * 数据来自翻译服务对外的两个只读接口（跨域头已开放、无需鉴权）：
 *   GET /public/status          总状态 + 今日量 + 速度
 *   GET /public/uptime?days=90  组件 × 每天状态（画色条与日历）
 *
 * 通道成功率、事件明细、任务进度都属于内部数据：公开接口不再返回，页面也不展示，
 * 需要看这些就登录管理面板（那些接口是要鉴权的）。
 * 换域名或改走自建代理：只改 API_BASE（也可用 VITE_TRANS_STATUS_API 覆盖）。
 * 所有请求都在 onMounted 之后发起，站点仍是纯静态。
 */
const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
const API_BASE = (env.VITE_TRANS_STATUS_API || "https://trans.zhayi.cc").replace(/\/+$/, "");

const DAYS = 90;
const REFRESH_MS = 30_000;
const WORKER_KEY = "worker";
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

type State = "ok" | "warn" | "bad" | "unknown";

interface DayPoint { date: string; state: State; rate: number }
interface StatusComponent {
  key: string;
  name: string;
  kind: "uptime" | "success";
  rate: number;
  state: State;
  days: DayPoint[];
  detail?: string;
}
interface ServiceStatus {
  online: boolean;
  state: string;
  server_time: number;
  worker: { running: boolean };
  speed: { ready: boolean; chars_per_min: number; mods_per_min: number; window_sec: number };
  today: { chars: number; mods: number; fail: number; calls?: number; body_ok?: number };
}

const status = ref<ServiceStatus | null>(null);
const components = ref<StatusComponent[]>([]);
const month = ref(startOfMonth(new Date()));
const failed = ref(false);
const loading = ref(true);

let timer: ReturnType<typeof setInterval> | undefined;

/* ---------- 工具 ---------- */
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function iso(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayISO() { return iso(new Date()); }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function monthKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
function fmtNum(n: number | undefined) { return n === undefined || n === null ? "—" : n.toLocaleString("zh-CN"); }
function fmtChars(n: number | undefined) {
  if (n === undefined || n === null) return "—";
  return n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : fmtNum(n);
}
function fmtClock(ts: number | undefined) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function pct(rate: number) { return `${(rate * 100).toFixed(1)}%`; }
function stateOf(rate: number): State { return rate >= 0.99 ? "ok" : rate >= 0.9 ? "warn" : "bad"; }
function stateText(s: State) { return { ok: "正常", warn: "波动", bad: "故障", unknown: "无数据" }[s]; }

/* ---------- 取数 ---------- */
async function jget<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function loadAll(initial = false) {
  if (initial) loading.value = true;
  try {
    const [st, up] = await Promise.all([
      jget<ServiceStatus>("/public/status"),
      jget<{ days?: number; components?: StatusComponent[] }>(`/public/uptime?days=${DAYS}`),
    ]);
    status.value = st;
    components.value = up.components ?? [];
    failed.value = false;
    if (!barsScrolled) {
      barsScrolled = true;
      void scrollBarsToEnd();
    }
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

function shiftMonth(delta: number) {
  month.value = new Date(month.value.getFullYear(), month.value.getMonth() + delta, 1);
}

onMounted(() => {
  loadAll(true);
  timer = setInterval(() => loadAll(), REFRESH_MS);
});
onUnmounted(() => { if (timer) clearInterval(timer); });

/* ---------- 派生值 ---------- */
const bannerLevel = computed(() => {
  const st = status.value;
  if (!st) return "unknown";
  if (!st.online) return "bad";
  return st.state === "degraded" ? "warn" : "ok";
});

const bannerTitle = computed(() => {
  const st = status.value;
  if (!st) return "正在读取服务状态";
  if (st.online === false) return "服务不可用";
  return st.worker?.running ? "后台翻译缓存运行中" : "翻译缓存服务正常";
});

const bannerDetail = computed(() => {
  const st = status.value;
  if (!st) return "正在读取服务状态";
  return `更新于 ${fmtClock(st.server_time)}`;
});

/** 今日翻译 = 今天新翻成功的 mod + 今天补成功的正文（合成一个数字，不单独显示补正文） */
const todayTranslated = computed(() => {
  const t = status.value?.today;
  if (!t) return undefined;
  return (t.mods ?? 0) + (t.body_ok ?? 0);
});

const speedText = computed(() => {
  const sp = status.value?.speed;
  if (!sp) return "—";
  return sp.ready ? `${fmtNum(Math.round(sp.chars_per_min))} 字符/分` : "采样中";
});

const monthLabel = computed(() => monthKey(month.value));
const nextDisabled = computed(() => month.value >= startOfMonth(new Date()));

/** 状态页只保留两行：翻译服务（可用性）+ Worker 成功度（= 用户请求的成功度） */
const visibleComponents = computed<StatusComponent[]>(() => {
  const rows = components.value.filter((c) => c.key === "service" || c.key === WORKER_KEY);
  if (!rows.some((c) => c.key === WORKER_KEY)) {
    const fallback = fallbackWorkerRow();
    if (fallback) rows.push(fallback);
  }
  return rows;
});

/** 服务端还没有按天数据时，用今日汇总顶一行（只有今天一格色条） */
function fallbackWorkerRow(): StatusComponent | undefined {
  const today = status.value?.today;
  if (!today) return undefined;
  const total = (today.mods ?? 0) + (today.fail ?? 0);
  if (total <= 0) return undefined;
  const rate = (today.mods ?? 0) / total;
  return {
    key: WORKER_KEY,
    name: "Worker 成功度",
    kind: "success",
    rate,
    state: stateOf(rate),
    days: [{ date: todayISO(), state: stateOf(rate), rate }],
  };
}

/** 采样功能上线前的日期没有记录，需要一句说明，否则满屏灰块容易被当成故障 */
const hasUnknownDays = computed(() =>
  visibleComponents.value.some((c) => c.days.some((d) => d.state === "unknown"))
);

/** 日历按 Worker 成功度（用户请求的成功度）上色，后端没给时退回服务可用性 */
const calendarSource = computed<StatusComponent | undefined>(
  () =>
    visibleComponents.value.find((c) => c.key === WORKER_KEY) ??
    visibleComponents.value.find((c) => c.key === "service")
);

const calendar = computed(() => {
  const y = month.value.getFullYear();
  const m = month.value.getMonth() + 1;
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();

  const byDate: Record<string, DayPoint> = {};
  for (const d of calendarSource.value?.days ?? []) byDate[d.date] = d;

  const cells: { key: string; day: number; state: string; tip: string; today: boolean }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ key: `pad-${i}`, day: 0, state: "", tip: "", today: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${y}-${pad(m)}-${pad(d)}`;
    const point = byDate[date];
    const known = !!point && point.state !== "unknown";
    cells.push({
      key: date,
      day: d,
      state: known ? point.state : "unknown",
      tip: `${date} · ${known ? `成功度 ${pct(point.rate)}` : "无数据"}`,
      today: date === todayISO(),
    });
  }
  return cells;
});

/** 色条默认停在最新一天：只看当天的访客不用每次往右拖 */
const rootEl = ref<HTMLElement | null>(null);
let barsScrolled = false;

// 渲染完成时间不一定等于布局完成（字体/容器宽度变化会让色条重新排），
// 所以多校正几次：DOM 更新后 + 150ms / 450ms 各再校准一次，直到能滚动为止。
async function scrollBarsToEnd(attempt = 0) {
  await nextTick();
  const bars = rootEl.value?.querySelectorAll<HTMLElement>(".qx-bars");
  if (!bars?.length) return;
  let scrollable = false;
  bars.forEach((el) => {
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = max > 0 ? max : el.scrollWidth;
    if (max > 0) scrollable = true;
  });
  if (!scrollable && attempt < 3) {
    setTimeout(() => void scrollBarsToEnd(attempt + 1), attempt === 0 ? 150 : 300);
  }
}
</script>

<template>
  <div ref="rootEl" class="qx-status">
    <!-- 总状态 -->
    <div class="qx-banner" :class="`is-${bannerLevel}`">
      <span class="qx-banner-bar" />
      <div class="qx-banner-main">
        <div class="qx-banner-title">{{ bannerTitle }}</div>
        <div class="qx-banner-sub">{{ bannerDetail }}</div>
      </div>
      <div class="qx-metrics">
        <div class="qx-metric">
          <span>今日翻译</span>
          <b>{{ fmtNum(todayTranslated) }} <i>个</i></b>
        </div>
        <div class="qx-metric">
          <span>今日调用</span>
          <b>{{ fmtNum(status?.today?.calls) }} <i>次</i></b>
        </div>
        <div class="qx-metric">
          <span>今日字符</span>
          <b>{{ fmtChars(status?.today?.chars) }} <i>字</i></b>
        </div>
        <div class="qx-metric">
          <span>当前速度</span>
          <b>{{ speedText }}</b>
        </div>
        <div class="qx-metric">
          <span>今日失败</span>
          <b>{{ fmtNum(status?.today?.fail) }} <i>次</i></b>
        </div>
      </div>
    </div>

    <div v-if="failed" class="qx-error">
      <b>无法读取到服务状态数据</b>
      <span>
        可能是网络波动或被广告拦截插件阻止，每30秒自动重试一次，请稍候
      </span>
      <button type="button" @click="loadAll(true)">立即重试</button>
    </div>

    <div v-else-if="loading" class="qx-loading">正在读取服务状态…</div>

    <template v-else>
      <!-- 组件可用性 -->
      <section class="qx-card">
        <header class="qx-card-head">
          <div class="qx-card-title">组件可用性<span class="qx-hint">最近 {{ DAYS }} 天</span></div>
          <div class="qx-legend">
            <i class="is-ok" />正常
            <i class="is-warn" />波动
            <i class="is-bad" />故障
            <i class="is-unknown" />无数据
          </div>
        </header>

        <div v-if="hasUnknownDays" class="qx-note">
          灰色方块是采样功能上线之前的日期（当时没有记录），不代表该服务当天存在故障
        </div>
        <div v-if="!visibleComponents.length" class="qx-empty">暂无组件数据</div>
        <div v-for="c in visibleComponents" :key="c.key" class="qx-comp">
          <div class="qx-comp-name">
            {{ c.name }}
            <em>{{ c.kind === "uptime" ? "可用性" : "成功率" }}</em>
            <small v-if="c.detail">{{ c.detail }}</small>
          </div>
          <div class="qx-bars">
            <i
              v-for="d in c.days"
              :key="d.date"
              :class="`is-${d.state}`"
              :title="d.state === 'unknown' ? `${d.date} · 无数据` : `${d.date} · ${pct(d.rate)}`"
            />
          </div>
          <div class="qx-rate">{{ c.state === "unknown" ? "—" : pct(c.rate) }}</div>
          <div class="qx-tag" :class="`is-${c.state}`">{{ stateText(c.state) }}</div>
        </div>
      </section>

      <!-- 状态日历：格子颜色 = 当天用户请求的成功度 -->
      <section class="qx-card">
        <header class="qx-card-head">
          <div class="qx-card-title">状态日历</div>
          <div class="qx-month">
            <button type="button" aria-label="上个月" @click="shiftMonth(-1)">←</button>
            <b>{{ monthLabel }}</b>
            <button type="button" aria-label="下个月" :disabled="nextDisabled" @click="shiftMonth(1)">→</button>
          </div>
        </header>

        <div class="qx-cal">
          <div v-for="w in WEEKDAYS" :key="w" class="qx-cal-wd">{{ w }}</div>
          <div
            v-for="cell in calendar"
            :key="cell.key"
            class="qx-cal-day"
            :class="[cell.day && `is-${cell.state}`, cell.today && 'is-today', !cell.day && 'is-pad']"
            :title="cell.day ? cell.tip : ''"
          >
            <span v-if="cell.day">{{ cell.day }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.qx-status {
  --qx-ok: #1a7f37;
  --qx-warn: #9a6700;
  --qx-bad: #cf222e;
  --qx-unknown: rgba(26, 24, 22, 0.14);
  --qx-ok-soft: rgba(26, 127, 55, 0.1);
  --qx-warn-soft: rgba(154, 103, 0, 0.1);
  --qx-bad-soft: rgba(207, 34, 46, 0.1);
  --qx-line: var(--vp-c-divider);
  margin: 24px 0 8px;
  font-size: 14px;
}
html.dark .qx-status {
  --qx-ok: #3fb950;
  --qx-warn: #d29922;
  --qx-bad: #f85149;
  --qx-unknown: rgba(255, 255, 255, 0.14);
  --qx-ok-soft: rgba(63, 185, 80, 0.12);
  --qx-warn-soft: rgba(210, 153, 34, 0.12);
  --qx-bad-soft: rgba(248, 81, 73, 0.12);
}

/* ---------- 总状态 ---------- */
.qx-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--qx-line);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.qx-banner-bar {
  flex: 0 0 3px;
  background: var(--qx-ok);
}
.qx-banner.is-warn .qx-banner-bar { background: var(--qx-warn); }
.qx-banner.is-bad .qx-banner-bar { background: var(--qx-bad); }
.qx-banner.is-unknown .qx-banner-bar { background: var(--qx-unknown); }

.qx-banner-main {
  flex: 1 1 260px;
  min-width: 0;
  padding: 12px 16px;
}
.qx-banner-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}
.qx-banner.is-warn .qx-banner-title { color: var(--qx-warn); }
.qx-banner.is-bad .qx-banner-title { color: var(--qx-bad); }
.qx-banner-sub {
  margin-top: 3px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

.qx-metrics {
  display: flex;
  flex-wrap: wrap;
  border-left: 1px solid var(--qx-line);
}
.qx-metric {
  min-width: 104px;
  padding: 10px 16px;
  border-right: 1px solid var(--qx-line);
}
.qx-metric:last-child { border-right: none; }
.qx-metric > span {
  display: block;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.qx-metric > b {
  display: block;
  margin-top: 2px;
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-1);
}
.qx-metric > b > i {
  font-size: 11.5px;
  font-style: normal;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

/* ---------- 状态占位 ---------- */
.qx-loading,
.qx-empty {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}
.qx-note {
  padding: 8px 16px;
  border-bottom: 1px solid var(--qx-line);
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.qx-error {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
  padding: 13px 16px;
  border: 1px solid var(--qx-warn);
  border-radius: 10px;
  background: var(--qx-warn-soft);
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.qx-error > b { color: var(--vp-c-text-1); }
.qx-error button {
  align-self: flex-start;
  margin-top: 2px;
  padding: 4px 12px;
  border: 1px solid var(--qx-line);
  border-radius: 8px;
  background: var(--vp-c-bg);
  font-size: 12.5px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s;
}
.qx-error button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

/* ---------- 卡片 ---------- */
.qx-card {
  margin-top: 16px;
  border: 1px solid var(--qx-line);
  border-radius: 10px;
  overflow: hidden;
}
.qx-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 14px;
  padding: 9px 16px;
  border-bottom: 1px solid var(--qx-line);
  background: var(--vp-c-bg-soft);
}
.qx-card-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.qx-hint {
  margin-left: 7px;
  font-size: 12px;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.qx-legend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.qx-legend > i {
  display: block;
  width: 9px;
  height: 9px;
  margin-left: 8px;
  border-radius: 2px;
}
.qx-legend > i:first-child { margin-left: 0; }
/* 图例的色块颜色（之前只给了色条上的 .qx-bars > i，图例方块是透明的） */
.qx-legend > i.is-ok { background: var(--qx-ok); }
.qx-legend > i.is-warn { background: var(--qx-warn); }
.qx-legend > i.is-bad { background: var(--qx-bad); }
.qx-legend > i.is-unknown { background: var(--qx-unknown); }

/* ---------- 组件色条 ---------- */
.qx-comp {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr) 62px 58px;
  align-items: center;
  gap: 12px;
  padding: 9px 16px;
  border-bottom: 1px solid var(--qx-line);
}
.qx-comp:last-child { border-bottom: none; }
.qx-comp-name {
  min-width: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--vp-c-text-1);
  word-break: break-word;
}
.qx-comp-name > em {
  margin-left: 6px;
  padding: 0 5px;
  border: 1px solid var(--qx-line);
  border-radius: 4px;
  font-size: 10.5px;
  font-style: normal;
  color: var(--vp-c-text-3);
}
.qx-comp-name > small {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: var(--vp-c-text-3);
}
.qx-bars {
  display: flex;
  gap: 2px;
  height: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  /* 默认已停在最新一天，滚动条不再占位（仍可用触控板/Shift+滚轮回看历史） */
  scrollbar-width: none;
}
.qx-bars::-webkit-scrollbar { display: none; }
.qx-bars > i {
  flex: 0 0 4px;
  border-radius: 2px;
  background: var(--qx-unknown);
}
.qx-bars > i.is-ok { background: var(--qx-ok); }
.qx-bars > i.is-warn { background: var(--qx-warn); }
.qx-bars > i.is-bad { background: var(--qx-bad); }
.qx-rate {
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--vp-c-text-2);
}
.qx-tag {
  padding: 1px 0;
  border: 1px solid var(--qx-line);
  border-radius: 5px;
  font-size: 11.5px;
  text-align: center;
  color: var(--vp-c-text-3);
}
.qx-tag.is-ok { border-color: var(--qx-ok); background: var(--qx-ok-soft); color: var(--qx-ok); }
.qx-tag.is-warn { border-color: var(--qx-warn); background: var(--qx-warn-soft); color: var(--qx-warn); }
.qx-tag.is-bad { border-color: var(--qx-bad); background: var(--qx-bad-soft); color: var(--qx-bad); }

/* ---------- 状态日历 ---------- */
.qx-month {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qx-month > b {
  min-width: 64px;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  text-align: center;
  color: var(--vp-c-text-1);
}
.qx-month > button {
  width: 24px;
  height: 24px;
  border: 1px solid var(--qx-line);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 12px;
  line-height: 1;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s;
}
.qx-month > button:hover:not(:disabled) { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.qx-month > button:disabled { opacity: 0.4; cursor: not-allowed; }

.qx-cal {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 12px 16px;
}
.qx-cal-wd {
  padding-bottom: 2px;
  font-size: 11.5px;
  text-align: center;
  color: var(--vp-c-text-3);
}
.qx-cal-day {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border: 1px solid var(--qx-line);
  border-radius: 6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-2);
}
.qx-cal-day.is-pad { border-color: transparent; }
.qx-cal-day.is-ok { border-color: var(--qx-ok); background: var(--qx-ok-soft); color: var(--qx-ok); }
.qx-cal-day.is-warn { border-color: var(--qx-warn); background: var(--qx-warn-soft); color: var(--qx-warn); }
.qx-cal-day.is-bad { border-color: var(--qx-bad); background: var(--qx-bad-soft); color: var(--qx-bad); }
.qx-cal-day.is-unknown { color: var(--vp-c-text-3); }
/* 用内描边标今天，避免和状态色（border-color）互相覆盖 */
.qx-cal-day.is-today { box-shadow: inset 0 0 0 1px var(--vp-c-brand-1); }

/* ---------- 窄屏 ---------- */
@media (max-width: 767px) {
  .qx-metrics { border-top: 1px solid var(--qx-line); border-left: none; }
  .qx-metric { flex: 1 1 46%; min-width: 0; border-right: none; }
  .qx-comp {
    grid-template-columns: minmax(0, 1fr) 58px;
    grid-template-areas:
      "name tag"
      "bars rate";
    row-gap: 6px;
  }
  .qx-comp-name { grid-area: name; }
  .qx-bars { grid-area: bars; }
  .qx-rate { grid-area: rate; }
  .qx-tag { grid-area: tag; }
  /* 手机宽度下 90 个方块自适应铺满整行，不需要横向滚动 */
  .qx-bars { gap: 1px; overflow-x: hidden; }
  .qx-bars > i { flex: 1 1 0; min-width: 2px; border-radius: 1px; }
  .qx-cal { padding: 10px 12px; }
  .qx-cal-day { min-height: 38px; }
}
</style>
