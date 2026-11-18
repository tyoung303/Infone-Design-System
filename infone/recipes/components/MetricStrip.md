# MetricStrip 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## MetricStrip.d.ts

```typescript
import * as React from "react";
export interface MetricStripItem {
  /** Stable key; falls back to label. */
  key?: string;
  label: React.ReactNode;
  /** Pass a number to get the count-up animation and tabular formatting. */
  value: number | string;
  /** Small node before the digits, e.g. "¥". */
  prefix?: React.ReactNode;
  /** Unit after the digits, e.g. "次" / "M tokens". */
  suffix?: React.ReactNode;
  /** Remix Icon class for the label row. */
  icon?: string;
  /** Second line under the value, e.g. "较上周". */
  caption?: React.ReactNode;
  /** Number (percent) or string like "+12.4%". */
  delta?: number | string;
  /** auto = up is good · inverse = up is bad (cost, latency) · neutral = gray. */
  /** Opt the sparkline out of neutral data ink into a chart slot, e.g.
   *  "--th-chart-3". Use only when this one line is the emphasis; a strip of
   *  differently-colored lines implies a category meaning that isn't there. */
  sparkTone?: string;
  deltaTone?: "auto" | "inverse" | "neutral";
  /** 7–30 points render as a gray trend sparkline. */
  series?: number[];
  /** Override the number formatter. */
  format?: (n: number) => string;
}
export interface MetricStripProps {
  /** 3–5 metrics reads best; more than 6 should become a table. */
  items: MetricStripItem[];
  density?: "comfortable" | "compact";
  /** Count numbers up on mount. Ignored under prefers-reduced-motion. */
  animate?: boolean;
  /** The strip IS a card by default. Pass `embedded` when it sits inside another
   *  card: drops border, radius, shadow and fill so the outlines don't double up. @default false */
  embedded?: boolean;
  style?: React.CSSProperties;
}
export function MetricStrip(props: MetricStripProps): JSX.Element;
```

## MetricStrip.jsx

```jsx
/* MetricStrip.jsx — one-row KPI strip: 3–5 metrics divided by hairlines,
   each with an optional sparkline and delta. Use this instead of stacking
   single-number cards: same information, ~40% of the vertical space.

   Numbers count up once on mount (--th-dur-count, 560ms) unless the user
   asked for reduced motion. Geometry follows the density scale. */
import { Sparkline } from "./Sparkline";

export function MetricStrip({ items = [], density = "comfortable", animate = true, embedded = false, style }) {
  const compact = density === "compact";
  /* flexShrink:0 — the strip is a FIXED-HEIGHT band (~64px). Dropped into a
     scrolling flex column (`overflow:auto` + `flex-direction:column`, the
     standard D-tier content column), a shrinkable child gets squeezed once the
     page is taller than the viewport; because each cell is a size container
     its content overflows instead of pushing back, so the strip collapsed to a
     1px line and the KPIs simply disappeared. Same reasoning as Tag/StatusChip. */
  return (
    <div className="th-in" style={{
      display: "grid", gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, 1fr)`,
      flexShrink: 0,
      background: embedded ? "transparent" : "var(--th-white)", border: embedded ? "none" : "var(--th-border-card)",
      borderRadius: embedded ? 0 : "var(--th-radius-md)", boxShadow: embedded ? "none" : "var(--th-shadow-card)",
      fontFamily: "var(--th-font-cn)", overflow: "hidden", ...style,
    }}>
      {items.map((it, i) => (
        <div key={it.key || it.label} className="th-ms-cell" style={{
          padding: compact ? "10px 12px" : "12px 14px", minWidth: 0, containerType: "inline-size",
          borderLeft: i ? "0.5px solid var(--color-border)" : "none",
          display: "flex", flexDirection: "column", gap: compact ? 3 : 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", minWidth: 0 }}>
            {it.icon && <i className={it.icon} style={{ fontSize: 14, color: "var(--color-fg-muted)" }} />}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0, flexShrink: 0 }}>
              <span className="th-nums" style={{ fontSize: compact ? 15 : 18, fontWeight: 600, lineHeight: 1.1, color: "var(--color-fg)", whiteSpace: "nowrap" }}>
                {it.prefix && <span style={{ fontSize: compact ? 12 : 13, fontWeight: 500, marginRight: 1 }}>{it.prefix}</span>}
                <MsNumber value={it.value} animate={animate} format={it.format} />
                {it.suffix && <span style={{ fontSize: "var(--th-text-xs)", fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 3 }}>{it.suffix}</span>}
              </span>
              {it.delta != null && <MsDelta delta={it.delta} tone={it.deltaTone} />}
            </div>
            {Array.isArray(it.series) && it.series.length > 1 && (
              <span className="th-ms-spark" style={{ flex: "0 1 auto", minWidth: 0, overflow: "hidden", display: "inline-flex", justifyContent: "flex-end" }}>
                <Sparkline data={it.series} width={compact ? 44 : 48} height={compact ? 14 : 16} tone={it.sparkTone || "neutral"} dot={false} />
              </span>
            )}
          </div>
          {it.caption && <div style={{ fontSize: "var(--th-text-2xs)", color: "var(--color-fg-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.caption}</div>}
        </div>
      ))}
    </div>
  );
}

/* Below ~230px per cell the value, delta and sparkline can't coexist on one
   line — the sparkline is the least load-bearing of the three, so it drops.
   230, not 190: an 18px value + suffix + delta already eats ~130px, and the
   old threshold left a 190–230px blind spot where the line overlapped the
   delta (hit by 3-up strips next to a 240px nav rail). The value group is
   flex-shrink:0 and the spark shrinks, so even inside the band the line
   yields instead of colliding.
   Container query: it measures the CELL, not the viewport, so a 4-up strip in
   a narrow panel behaves the same as one in a narrow window. */
if (typeof document !== "undefined" && !document.getElementById("th-metricstrip-css")) {
  const s = document.createElement("style");
  s.id = "th-metricstrip-css";
  s.textContent = "@container (max-width: 230px){.th-ms-spark{display:none}}";
  document.head.appendChild(s);
}

function msReduced() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function msFormat(n, target) {
  const decimals = (String(target).split(".")[1] || "").length;
  return n.toLocaleString("zh-CN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* Counts from 0 to the target on mount and on every value change. Strings
   pass straight through — pull "¥" and units out into prefix/suffix so the
   digits stay a real number. */
function MsNumber({ value, animate, format }) {
  const numeric = typeof value === "number";
  const [shown, setShown] = React.useState(() => (animate && numeric && !msReduced() ? 0 : value));
  React.useEffect(() => {
    if (!animate || !numeric || msReduced()) { setShown(value); return; }
    const dur = 560, from = 0;
    let raf, start = null;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setShown(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate, numeric]);
  if (!numeric) return <>{value}</>;
  return <>{format ? format(shown) : msFormat(shown, value)}</>;
}

/* tone: "auto" (default — up is good), "inverse" (up is bad, e.g. cost/latency),
   "neutral" (gray). */
function MsDelta({ delta, tone = "auto" }) {
  const up = typeof delta === "number" ? delta >= 0 : String(delta).trim().startsWith("+");
  const magnitude = typeof delta === "number" ? `${Math.abs(delta)}%` : String(delta).replace(/^[+-]/, "");
  const good = tone === "inverse" ? !up : up;
  const color = tone === "neutral" ? "var(--color-fg-muted)" : good ? "var(--color-success-fg)" : "var(--color-danger-fg)";
  return (
    <span className="th-nums" style={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: "var(--th-text-xs)", fontWeight: 500, color, whiteSpace: "nowrap" }}>
      <i className={up ? "ri-arrow-up-line" : "ri-arrow-down-line"} style={{ fontSize: 12 }} />{magnitude}
    </span>
  );
}

```

## metric-strip.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="MetricStrip" subtitle="指标条 — 一行装下 3–5 个 KPI，替代单数字卡堆叠" viewport="900x300" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;padding:24px;background:var(--th-bg)}.wrap{display:flex;flex-direction:column;gap:8px}.cap{font-size:var(--th-text-2xs);color:var(--color-fg-subtle)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { MetricStrip } = window.TokenHubDesignSystem_019e20;
const items = [
  { label: "今日调用", value: 42318, suffix: "次", icon: "ri-pulse-line", delta: 12.4, series: [12,18,15,22,26,24,31] },
  { label: "Token 消耗", value: 8.62, suffix: "M", icon: "ri-database-2-line", delta: -3.1, deltaTone: "inverse", series: [30,28,26,27,22,20,19] },
  { label: "本月费用", value: 1204.5, prefix: "¥", icon: "ri-money-cny-circle-line", delta: 6.8, deltaTone: "inverse", caption: "预算 ¥2,000" },
  { label: "平均延迟", value: 412, suffix: "ms", icon: "ri-timer-line", delta: -8.2, deltaTone: "inverse", series: [520,498,470,455,441,428,412] },
];
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="wrap">
    <div className="cap">comfortable · 默认</div>
    <MetricStrip items={items} />
    <div className="cap" style={{ marginTop: 8 }}>compact · 列表 / 日志页</div>
    <MetricStrip items={items} density="compact" />
  </div>
);</script>
</body>
</html>
```
