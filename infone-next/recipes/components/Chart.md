# Chart 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Chart.d.ts

```typescript
import * as React from "react";

export type ChartType =
  | "line" | "spline" | "step" | "area" | "stackedArea"
  | "bar" | "groupedBar" | "stackedBar" | "hbar" | "stackedHbar" | "combo"
  | "pie" | "donut" | "scatter" | "bubble" | "radar"
  | "funnel" | "waterfall" | "boxplot" | "treemap";

export interface ChartSeries {
  /** Key read off each data row. */
  key: string;
  /** Legend/tooltip label. Defaults to `key`. */
  name?: string;
  /** Override the palette slot — pass a `--th-chart-*` token, never a raw hex. */
  color?: string;
  /** Only for type="combo": render this series as a line instead of a bar. */
  type?: "bar" | "line";
}

export interface ChartProps {
  /** @default "line" */
  type?: ChartType;
  /** Rows. Cartesian/radar: `{ label, <seriesKey>: number, … }`. pie/donut/funnel/
   *  treemap/hbar: `{ label, value, color? }`. scatter/bubble: `{ x, y, r?, series?, label? }`.
   *  boxplot: `{ label, min, q1, median, q3, max }`. waterfall: `{ label, value, total? }`. */
  data: any[];
  /** Series to plot. Omitted → every numeric key on the first row, in order. */
  series?: ChartSeries[];
  /** Category field name. @default "label" */
  xKey?: string;
  /** Plot height in px; width always fills the container. @default 240 */
  height?: number;
  /** @default true (shown when there is more than one series / category) */
  showLegend?: boolean;
  /** Value gridlines + axis labels. @default true */
  showGrid?: boolean;
  /** Force point markers on dense line charts. @default false */
  showValues?: boolean;
  /** Value formatter for axis + tooltip. Defaults to a 万/亿 compact formatter. */
  yFormat?: (v: number) => string;
  /** Unit appended after every formatted value, e.g. "次" / "ms". */
  unit?: string;
  /** Smooth the line on type="line"/"area" (type="spline" implies it). */
  smooth?: boolean;
  /** Caption under the donut's center total. @default "合计" */
  donutLabel?: string;
  /** @default "暂无数据" */
  emptyText?: string;
  /** Entrance fade/rise on mount. Ignored under prefers-reduced-motion. @default true */
  animate?: boolean;
  style?: React.CSSProperties;
}

/** SVG chart set. Series colors always come from `--th-chart-1…12`, gridlines and
 *  empty tracks from `--color-data-track`. NOT a card — put it inside one.
 *  Already covered elsewhere, don't rebuild here: heat grid → `Heatgrid`,
 *  single ratio → `RingGauge`, single bar → `Progress`, inline trend → `Sparkline`,
 *  token split → `TokenMeter`, cost share → `CostBreakdown`. */
export function Chart(props: ChartProps): JSX.Element;
```

## Chart.jsx

```jsx
/* Chart.jsx — 统一图表组件（SVG，无第三方依赖）。
   一个 type prop 覆盖后台常用的全部图形；系列色恒取 --th-chart-1…12（等明度色环），
   网格与轨道取 --color-data-track，坐标标签取 --color-fg-muted，数值等宽。
   容器宽度用 ResizeObserver 实测，所以永不写死宽度、不靠 viewBox 拉伸文字。

   已由专用组件覆盖、不在此重复实现：热力网格 → Heatgrid，单一比率环 → RingGauge，
   单条进度 → Progress，行内趋势 → Sparkline，token 构成 → TokenMeter，成本占比 → CostBreakdown。

   注意：本文件顶层不得出现 React.*（bundle 求值早于 React UMD）。 */
const CH_PAD = { t: 10, r: 12, b: 24, l: 46 };
const CH_TYPES = ["line", "spline", "step", "area", "stackedArea", "bar", "groupedBar", "stackedBar", "hbar", "stackedHbar", "combo", "pie", "donut", "scatter", "bubble", "radar", "funnel", "waterfall", "boxplot", "treemap"];
function chColor(i) { return `var(--th-chart-${(i % 12) + 1})`; }
function chFmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e8) return (v / 1e8).toFixed(1) + "亿";
  if (a >= 1e4) return (v / 1e4).toFixed(a >= 1e5 ? 0 : 1) + "万";
  if (Number.isInteger(v)) return String(v);
  return String(+v.toFixed(2));
}
function chScale(min, max, n) {
  let lo = Math.min(0, min), hi = max;
  if (hi === lo) hi = lo + 1;
  const step0 = (hi - lo) / (n || 4);
  const mag = Math.pow(10, Math.floor(Math.log10(step0 || 1)));
  const norm = step0 / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
  return { lo, hi, ticks };
}
function chLine(pts, smooth) {
  if (!pts.length) return "";
  if (!smooth) return pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const cx = (p0[0] + p1[0]) / 2;
    d += ` C${cx} ${p0[1]} ${cx} ${p1[1]} ${p1[0]} ${p1[1]}`;
  }
  return d;
}
function chStep(pts) {
  if (!pts.length) return "";
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += ` H${(pts[i - 1][0] + pts[i][0]) / 2} V${pts[i][1]} H${pts[i][0]}`;
  return d;
}
function chArc(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return { x0, y0, x1, y1, large: a1 - a0 > Math.PI ? 1 : 0 };
}
function chTile(items, x, y, w, h, out) {
  if (!items.length) return out;
  if (items.length === 1) { out.push({ ...items[0], x, y, w, h }); return out; }
  const total = items.reduce((s, d) => s + d.value, 0);
  let acc = 0, cut = 1;
  for (let i = 0; i < items.length; i++) { acc += items[i].value; if (acc >= total / 2) { cut = i + 1; break; } }
  cut = Math.min(Math.max(cut, 1), items.length - 1);
  const head = items.slice(0, cut), tail = items.slice(cut);
  const share = head.reduce((s, d) => s + d.value, 0) / total;
  if (w >= h) { chTile(head, x, y, w * share, h, out); chTile(tail, x + w * share, y, w * (1 - share), h, out); }
  else { chTile(head, x, y, w, h * share, out); chTile(tail, x, y + h * share, w, h * (1 - share), out); }
  return out;
}

export function Chart({
  type = "line", data = [], series, xKey = "label", height = 240,
  showLegend = true, showGrid = true, showValues = false, yFormat, unit = "",
  smooth, donutLabel, emptyText = "暂无数据", animate = true, style,
}) {
  const wrapRef = React.useRef(null);
  const [w, setW] = React.useState(0);
  const [hover, setHover] = React.useState(null);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => setW(Math.round(entries[0].contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  const fmt = yFormat || chFmt;
  const ser = React.useMemo(() => {
    const src = series && series.length
      ? series
      : Object.keys(data[0] || {}).filter((k) => k !== xKey && typeof data[0][k] === "number").map((k) => ({ key: k, name: k }));
    return src.map((s, i) => ({ key: s.key || s.name, name: s.name || s.key, color: s.color || chColor(i), kind: s.type, axis: s.axis }));
  }, [series, data, xKey]);

  const polar = type === "pie" || type === "donut" || type === "radar";
  const noLegend = type === "hbar" || type === "funnel" || type === "treemap" || type === "boxplot" || type === "waterfall";
  const legend = showLegend && !noLegend && (type === "pie" || type === "donut" ? data.length > 1 : ser.length > 1);
  const legendItems = type === "pie" || type === "donut"
    ? data.map((d, i) => ({ name: d[xKey], color: d.color || chColor(i) }))
    : ser;
  const H = height, W = Math.max(w, 0);
  const plot = { l: CH_PAD.l, t: CH_PAD.t, w: Math.max(W - CH_PAD.l - CH_PAD.r, 1), h: Math.max(H - CH_PAD.t - CH_PAD.b, 1) };

  const body = () => {
    if (!W) return null;
    if (!data.length) return <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontSize: 12, fill: "var(--color-fg-subtle)" }}>{emptyText}</text>;
    switch (type) {
      case "pie": case "donut": return renderPie();
      case "radar": return renderRadar();
      case "hbar": case "stackedHbar": return renderHBar();
      case "funnel": return renderFunnel();
      case "treemap": return renderTreemap();
      case "scatter": case "bubble": return renderScatter();
      case "boxplot": return renderBox();
      case "waterfall": return renderWaterfall();
      default: return renderCartesian();
    }
  };

  /* ── 直角坐标：line / spline / step / area / stackedArea / bar / groupedBar / stackedBar / combo ── */
  function renderCartesian() {
    const stacked = type === "stackedArea" || type === "stackedBar";
    const rightSer = ser.filter((s) => s.axis === "right");
    const leftSer = ser.filter((s) => s.axis !== "right");
    const innerW = plot.w - (rightSer.length ? 42 : 0);
    const collect = (list) => {
      const out = [];
      data.forEach((d) => {
        if (stacked) out.push(list.reduce((s, x) => s + (Number(d[x.key]) || 0), 0));
        else list.forEach((x) => out.push(Number(d[x.key]) || 0));
      });
      return out;
    };
    const lv = collect(leftSer.length ? leftSer : ser);
    const sc = chScale(Math.min(...lv, 0), Math.max(...lv, 0), 4);
    const rv = rightSer.length ? collect(rightSer) : [];
    const sc2 = rightSer.length ? chScale(Math.min(...rv, 0), Math.max(...rv, 0), 4) : null;
    const yOf = (s) => (s && s.axis === "right" && sc2
      ? (v) => plot.t + plot.h - ((v - sc2.lo) / (sc2.hi - sc2.lo)) * plot.h
      : (v) => plot.t + plot.h - ((v - sc.lo) / (sc.hi - sc.lo)) * plot.h);
    const y = yOf(null);
    const bw = innerW / data.length;
    const cx = (i) => plot.l + bw * (i + 0.5);
    const isBarish = type === "bar" || type === "groupedBar" || type === "stackedBar" || type === "combo";
    const barSeries = type === "combo" ? ser.filter((s) => s.kind !== "line") : ser;
    const lineSeries = type === "combo" ? ser.filter((s) => s.kind === "line") : [];
    const groupN = type === "groupedBar" ? ser.length : 1;
    const barW = Math.max(Math.min((bw * 0.62) / groupN, 26), 3);
    return (
      <g>
        {showGrid && sc.ticks.map((t) => (
          <g key={t}>
            <line x1={plot.l} x2={plot.l + innerW} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--color-border)" : "var(--color-data-track)"} strokeWidth="1" />
            <text x={plot.l - 8} y={y(t) + 3.5} textAnchor="end" style={chAxis}>{fmt(t)}</text>
          </g>
        ))}
        {sc2 && sc2.ticks.map((t) => (
          <text key={"r" + t} x={plot.l + innerW + 8} y={yOf(rightSer[0])(t) + 3.5} style={{ ...chAxis, fill: rightSer[0].color }}>{fmt(t)}</text>
        ))}
        {data.map((d, i) => (i % Math.ceil(data.length / Math.max(Math.floor(innerW / 56), 2)) ? null :
          <text key={i} x={cx(i)} y={H - 8} textAnchor="middle" style={chAxis}>{d[xKey]}</text>))}
        {isBarish && data.map((d, i) => {
          let acc = 0;
          return barSeries.map((s, si) => {
            const v = Number(d[s.key]) || 0;
            const ys = yOf(s);
            const x = type === "groupedBar" ? cx(i) - (barW * ser.length) / 2 + si * barW : cx(i) - barW / 2;
            const top = type === "stackedBar" ? ys(acc + v) : ys(Math.max(v, 0));
            const bot = type === "stackedBar" ? ys(acc) : ys(Math.min(v, 0));
            if (type === "stackedBar") acc += v;
            return <rect key={s.key} x={x + (type === "groupedBar" ? 1 : 0)} y={top} width={Math.max(barW - (type === "groupedBar" ? 2 : 0), 2)} height={Math.max(bot - top, 1)} rx="2" fill={s.color} opacity={hover !== null && hover !== i ? 0.55 : 1}>
              <title>{`${d[xKey]} · ${s.name} ${fmt(Number(d[s.key]))}${unit}`}</title>
            </rect>;
          });
        })}
        {(type === "stackedArea" ? [...ser].reverse() : ser).map((s, ri) => {
          if (isBarish && !lineSeries.includes(s)) return null;
          const idx = ser.indexOf(s);
          const ys = yOf(s);
          const pts = data.map((d, i) => {
            const v = type === "stackedArea" ? ser.slice(0, idx + 1).reduce((a, x) => a + (Number(d[x.key]) || 0), 0) : Number(d[s.key]) || 0;
            return [cx(i), ys(v)];
          });
          const path = type === "step" ? chStep(pts) : chLine(pts, smooth || type === "spline");
          const filled = type === "area" || type === "stackedArea";
          return (
            <g key={s.key}>
              {filled && <path d={`${path} L${pts[pts.length - 1][0]} ${ys(sc.lo)} L${pts[0][0]} ${ys(sc.lo)} Z`} fill={s.color} opacity={type === "stackedArea" ? 0.82 : 0.14} />}
              <path d={path} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              {(data.length <= 14 || showValues) && pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 3.6 : 2.4} fill="var(--th-white)" stroke={s.color} strokeWidth="1.6" />)}
            </g>
          );
        })}
        {hover !== null && <line x1={cx(hover)} x2={cx(hover)} y1={plot.t} y2={plot.t + plot.h} stroke="var(--color-border)" strokeWidth="1" />}
        <rect x={plot.l} y={plot.t} width={innerW} height={plot.h} fill="transparent"
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(data.length - 1, Math.floor(((e.clientX - r.left) / innerW) * data.length)))); }}
          onMouseLeave={() => setHover(null)} />
      </g>
    );
  }

  /* ── 横向条：hbar / stackedHbar ── */
  function renderHBar() {
    const stacked = type === "stackedHbar";
    const rows = data.map((d) => (stacked ? ser.reduce((s, x) => s + (Number(d[x.key]) || 0), 0) : Number(d.value ?? d[ser[0] && ser[0].key]) || 0));
    const max = Math.max(...rows, 1);
    const labelW = Math.min(Math.max(...data.map((d) => String(d[xKey] || "").length)) * 12 + 8, Math.max(W * 0.32, 60));
    const rowH = plot.h / data.length, bh = Math.min(rowH * 0.56, 18);
    const barX = labelW + 4, barW = Math.max(W - barX - 52, 20);
    return (
      <g>
        {data.map((d, i) => {
          const yTop = plot.t + rowH * i + (rowH - bh) / 2;
          let acc = 0;
          return (
            <g key={i}>
              <text x={labelW - 6} y={yTop + bh / 2 + 3.5} textAnchor="end" style={{ ...chAxis, fill: "var(--color-fg)" }}>{d[xKey]}</text>
              <rect x={barX} y={yTop} width={barW} height={bh} rx="2" fill="var(--color-data-track)" />
              {stacked ? ser.map((s, si) => {
                const v = Number(d[s.key]) || 0, x0 = barX + (acc / max) * barW, ww = (v / max) * barW;
                acc += v;
                return <rect key={s.key} x={x0} y={yTop} width={Math.max(ww, 0)} height={bh} rx={si === ser.length - 1 ? 2 : 0} fill={s.color}><title>{`${d[xKey]} · ${s.name} ${fmt(v)}${unit}`}</title></rect>;
              }) : <rect x={barX} y={yTop} width={Math.max((rows[i] / max) * barW, 2)} height={bh} rx="2" fill={d.color || chColor(i)}><title>{`${d[xKey]} ${fmt(rows[i])}${unit}`}</title></rect>}
              <text x={barX + barW + 8} y={yTop + bh / 2 + 3.5} style={chNum}>{fmt(rows[i])}{unit}</text>
            </g>
          );
        })}
      </g>
    );
  }

  /* ── 饼 / 环 ── */
  function renderPie() {
    const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
    const cxp = W / 2, cyp = plot.t + plot.h / 2;
    const R = Math.max(Math.min(plot.h, plot.w) / 2 - 6, 10);
    const r0 = type === "donut" ? R * 0.62 : 0;
    let a = -Math.PI / 2;
    return (
      <g>
        {data.map((d, i) => {
          const frac = (Number(d.value) || 0) / total, a1 = a + frac * Math.PI * 2;
          const o = chArc(cxp, cyp, R, a, a1), inn = chArc(cxp, cyp, r0, a1, a);
          const mid = (a + a1) / 2;
          const path = r0
            ? `M${o.x0} ${o.y0} A${R} ${R} 0 ${o.large} 1 ${o.x1} ${o.y1} L${inn.x0} ${inn.y0} A${r0} ${r0} 0 ${o.large} 0 ${inn.x1} ${inn.y1} Z`
            : `M${cxp} ${cyp} L${o.x0} ${o.y0} A${R} ${R} 0 ${o.large} 1 ${o.x1} ${o.y1} Z`;
          const el = (
            <g key={i} opacity={hover !== null && hover !== i ? 0.6 : 1} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <path d={path} fill={d.color || chColor(i)} stroke="var(--th-white)" strokeWidth="1.5"><title>{`${d[xKey]} ${fmt(d.value)}${unit} · ${(frac * 100).toFixed(1)}%`}</title></path>
              {frac >= 0.1 && <text x={cxp + Math.cos(mid) * (R + r0) / 2} y={cyp + Math.sin(mid) * (R + r0) / 2 + 4} textAnchor="middle" style={{ fontSize: 11, fontWeight: 600, fill: "var(--th-white)", fontVariantNumeric: "tabular-nums" }}>{Math.round(frac * 100)}%</text>}
            </g>
          );
          a = a1;
          return el;
        })}
        {type === "donut" && (
          <g>
            <text x={cxp} y={cyp - 2} textAnchor="middle" style={{ fontSize: 17, fontWeight: 600, fill: "var(--color-fg)", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}{unit}</text>
            <text x={cxp} y={cyp + 14} textAnchor="middle" style={chAxis}>{donutLabel || "合计"}</text>
          </g>
        )}
      </g>
    );
  }

  /* ── 雷达 ── */
  function renderRadar() {
    const cxp = W / 2, cyp = plot.t + plot.h / 2, R = Math.max(Math.min(plot.h, plot.w) / 2 - 18, 12);
    const n = data.length, max = Math.max(...data.flatMap((d) => ser.map((s) => Number(d[s.key]) || 0)), 1);
    const pt = (i, v) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; const rr = (v / max) * R; return [cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr]; };
    return (
      <g>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={data.map((_, i) => pt(i, max * f).join(",")).join(" ")} fill="none" stroke="var(--color-data-track)" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const [x, y2] = pt(i, max * 1.16);
          return <g key={i}><line x1={cxp} y1={cyp} x2={pt(i, max)[0]} y2={pt(i, max)[1]} stroke="var(--color-data-track)" strokeWidth="1" /><text x={x} y={y2 + 3.5} textAnchor="middle" style={chAxis}>{d[xKey]}</text></g>;
        })}
        {ser.map((s) => (
          <g key={s.key}>
            <polygon points={data.map((d, i) => pt(i, Number(d[s.key]) || 0).join(",")).join(" ")} fill={s.color} fillOpacity="0.14" stroke={s.color} strokeWidth="1.8" />
            {data.map((d, i) => { const [x, y2] = pt(i, Number(d[s.key]) || 0); return <circle key={i} cx={x} cy={y2} r="2.6" fill="var(--th-white)" stroke={s.color} strokeWidth="1.6" />; })}
          </g>
        ))}
      </g>
    );
  }

  /* ── 散点 / 气泡 ── */
  function renderScatter() {
    const pts = data.map((d, i) => ({ ...d, si: ser.length ? Math.max(ser.findIndex((s) => s.name === d.series || s.key === d.series), 0) : 0, i }));
    const sx = chScale(Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)), 4);
    const sy = chScale(Math.min(...pts.map((p) => p.y)), Math.max(...pts.map((p) => p.y)), 4);
    const X = (v) => plot.l + ((v - sx.lo) / (sx.hi - sx.lo)) * plot.w;
    const Y = (v) => plot.t + plot.h - ((v - sy.lo) / (sy.hi - sy.lo)) * plot.h;
    const rMax = Math.max(...pts.map((p) => p.r || 1));
    return (
      <g>
        {showGrid && sy.ticks.map((t) => <g key={t}><line x1={plot.l} x2={plot.l + plot.w} y1={Y(t)} y2={Y(t)} stroke="var(--color-data-track)" /><text x={plot.l - 8} y={Y(t) + 3.5} textAnchor="end" style={chAxis}>{fmt(t)}</text></g>)}
        {sx.ticks.map((t) => <text key={t} x={X(t)} y={H - 8} textAnchor="middle" style={chAxis}>{fmt(t)}</text>)}
        {pts.map((p) => (
          <circle key={p.i} cx={X(p.x)} cy={Y(p.y)} r={type === "bubble" ? 4 + Math.sqrt((p.r || 1) / rMax) * 14 : 4}
            fill={chColor(p.si)} fillOpacity={type === "bubble" ? 0.55 : 0.85} stroke={chColor(p.si)} strokeWidth="1.2">
            <title>{`${p.label || ""} x ${fmt(p.x)} · y ${fmt(p.y)}${p.r ? " · " + fmt(p.r) : ""}`}</title>
          </circle>
        ))}
      </g>
    );
  }

  /* ── 箱线 ── */
  function renderBox() {
    const sc = chScale(Math.min(...data.map((d) => d.min)), Math.max(...data.map((d) => d.max)), 4);
    const y = (v) => plot.t + plot.h - ((v - sc.lo) / (sc.hi - sc.lo)) * plot.h;
    const bw = plot.w / data.length, boxW = Math.min(bw * 0.46, 30);
    return (
      <g>
        {showGrid && sc.ticks.map((t) => <g key={t}><line x1={plot.l} x2={plot.l + plot.w} y1={y(t)} y2={y(t)} stroke="var(--color-data-track)" /><text x={plot.l - 8} y={y(t) + 3.5} textAnchor="end" style={chAxis}>{fmt(t)}</text></g>)}
        {data.map((d, i) => {
          const c = plot.l + bw * (i + 0.5), col = d.color || chColor(i);
          return (
            <g key={i}>
              <line x1={c} x2={c} y1={y(d.max)} y2={y(d.min)} stroke={col} strokeWidth="1.2" />
              <line x1={c - boxW / 3} x2={c + boxW / 3} y1={y(d.max)} y2={y(d.max)} stroke={col} strokeWidth="1.2" />
              <line x1={c - boxW / 3} x2={c + boxW / 3} y1={y(d.min)} y2={y(d.min)} stroke={col} strokeWidth="1.2" />
              <rect x={c - boxW / 2} y={y(d.q3)} width={boxW} height={Math.max(y(d.q1) - y(d.q3), 2)} rx="2" fill={col} fillOpacity="0.72" stroke={col} strokeWidth="1" />
              <line x1={c - boxW / 2} x2={c + boxW / 2} y1={y(d.median)} y2={y(d.median)} stroke="var(--th-white)" strokeWidth="1.6" />
              <title>{`${d[xKey]} 中位 ${fmt(d.median)}${unit}`}</title>
              <text x={c} y={H - 8} textAnchor="middle" style={chAxis}>{d[xKey]}</text>
            </g>
          );
        })}
      </g>
    );
  }

  /* ── 瀑布 ── */
  function renderWaterfall() {
    let run = 0;
    const steps = data.map((d) => {
      if (d.total) {
        const to = run === 0 && d.value ? Number(d.value) : run;
        run = to;
        return { ...d, from: 0, to };
      }
      const from = run; run += Number(d.value) || 0;
      return { ...d, from, to: run };
    });
    const sc = chScale(Math.min(0, ...steps.map((s) => Math.min(s.from, s.to))), Math.max(...steps.map((s) => Math.max(s.from, s.to))), 4);
    const y = (v) => plot.t + plot.h - ((v - sc.lo) / (sc.hi - sc.lo)) * plot.h;
    const bw = plot.w / steps.length, barW = Math.min(bw * 0.56, 34);
    return (
      <g>
        {showGrid && sc.ticks.map((t) => <g key={t}><line x1={plot.l} x2={plot.l + plot.w} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--color-border)" : "var(--color-data-track)"} /><text x={plot.l - 8} y={y(t) + 3.5} textAnchor="end" style={chAxis}>{fmt(t)}</text></g>)}
        {steps.map((s, i) => {
          const c = plot.l + bw * (i + 0.5);
          const col = s.total ? "var(--th-chart-1)" : (Number(s.value) || 0) >= 0 ? "var(--color-success-solid)" : "var(--color-danger-solid)";
          const top = Math.min(y(s.from), y(s.to)), h2 = Math.max(Math.abs(y(s.to) - y(s.from)), 2);
          return (
            <g key={i}>
              {i > 0 && <line x1={plot.l + bw * (i - 0.5) + barW / 2} x2={c - barW / 2} y1={y(steps[i - 1].to)} y2={y(steps[i - 1].to)} stroke="var(--color-border)" strokeDasharray="2 2" />}
              <rect x={c - barW / 2} y={top} width={barW} height={h2} rx="2" fill={col}><title>{`${s[xKey]} ${s.total ? fmt(s.to) : (Number(s.value) > 0 ? "+" : "") + fmt(s.value)}${unit}`}</title></rect>
              <text x={c} y={H - 8} textAnchor="middle" style={chAxis}>{s[xKey]}</text>
            </g>
          );
        })}
      </g>
    );
  }

  /* ── 漏斗（标签走右侧固定槽，永不被窄段裁掉） ── */
  function renderFunnel() {
    const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);
    const rowH = plot.h / data.length, gap = Math.min(rowH * 0.18, 6);
    const labelW = Math.min(Math.max(W * 0.3, 96), 180);
    const bodyW = Math.max(plot.w - labelW, 40), cxp = plot.l + bodyW / 2;
    return (
      <g>
        {data.map((d, i) => {
          const v = Number(d.value) || 0, next = Number((data[i + 1] || d).value) || 0;
          const wTop = (v / max) * bodyW, wBot = (next / max) * bodyW;
          const yTop = plot.t + rowH * i, yBot = yTop + rowH - gap;
          const mid = yTop + (yBot - yTop) / 2;
          return (
            <g key={i}>
              <path d={`M${cxp - wTop / 2} ${yTop} L${cxp + wTop / 2} ${yTop} L${cxp + wBot / 2} ${yBot} L${cxp - wBot / 2} ${yBot} Z`} fill={d.color || chColor(i)} opacity="0.92"><title>{`${d[xKey]} ${fmt(v)}${unit}`}</title></path>
              <text x={plot.l + bodyW + 12} y={mid - 2} style={{ fontSize: 11, fill: "var(--color-fg)" }}>{d[xKey]}</text>
              <text x={plot.l + bodyW + 12} y={mid + 11} style={chNum}>{fmt(v)}{unit}{i > 0 ? ` · ${Math.round((v / (Number(data[0].value) || 1)) * 100)}%` : ""}</text>
            </g>
          );
        })}
      </g>
    );
  }

  /* ── 矩形树图 ── */
  function renderTreemap() {
    const items = [...data].map((d, i) => ({ ...d, value: Number(d.value) || 0, color: d.color || chColor(i) })).sort((a, b) => b.value - a.value);
    const tiles = chTile(items, plot.l, plot.t, plot.w, plot.h, []);
    return (
      <g>
        {tiles.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={t.y} width={Math.max(t.w - 2, 1)} height={Math.max(t.h - 2, 1)} rx="3" fill={t.color}><title>{`${t[xKey]} ${fmt(t.value)}${unit}`}</title></rect>
            {t.w > 56 && t.h > 30 && (
              <g>
                <text x={t.x + 8} y={t.y + 18} style={{ fontSize: 11, fontWeight: 600, fill: "var(--th-white)" }}>{t[xKey]}</text>
                <text x={t.x + 8} y={t.y + 32} style={{ fontSize: 11, fill: "var(--th-white)", fillOpacity: 0.86, fontVariantNumeric: "tabular-nums" }}>{fmt(t.value)}{unit}</text>
              </g>
            )}
          </g>
        ))}
      </g>
    );
  }

  const tip = hover !== null && data[hover] && (type === "line" || type === "spline" || type === "step" || type === "area" || type === "stackedArea" || type === "bar" || type === "groupedBar" || type === "stackedBar" || type === "combo");
  return (
    <div ref={wrapRef} style={{ width: "100%", fontFamily: "var(--th-font-cn)", position: "relative", ...style }}>
      {legend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginBottom: 8 }}>
          {legendItems.map((s, i) => (
            <span key={s.key || s.name || i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-fg-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />{s.name}
            </span>
          ))}
        </div>
      )}
      <svg className={animate ? "th-in" : undefined} width="100%" height={H} viewBox={`0 0 ${Math.max(W, 1)} ${H}`} role="img" style={{ display: "block", overflow: "visible" }}>
        {body()}
      </svg>
      {tip && (
        <div style={{ position: "absolute", right: 0, top: legend ? 22 : 0, pointerEvents: "none", background: "var(--th-white)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", boxShadow: "var(--th-shadow-card)", padding: "6px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{data[hover][xKey]}</span>
          {ser.map((s) => (
            <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />
              <span style={{ color: "var(--color-fg-muted)" }}>{s.name}</span>
              <span className="th-nums" style={{ fontWeight: 600 }}>{fmt(Number(data[hover][s.key]))}{unit}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
Chart.types = CH_TYPES;
const chAxis = { fontSize: 11, fill: "var(--color-fg-muted)", fontVariantNumeric: "tabular-nums" };
const chNum = { fontSize: 11, fill: "var(--color-fg)", fontVariantNumeric: "tabular-nums" };
```

## chart.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Chart" subtitle="统一图表组件 — 20 种图形，系列色恒取 --th-chart-1…12，网格取 --color-data-track" viewport="1180x1560" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg);font-family:var(--th-font-cn)}.wrap{padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}.cell{background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-width:0}.cell h4{margin:0;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}.cell code{font-family:var(--th-font-mono);font-size:11px;color:var(--color-fg-muted);font-weight:400}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Chart } = window.TokenHubDesignSystem_019e20;
const days = ["07-25","07-26","07-27","07-28","07-29","07-30","07-31"];
const trend = days.map((d,i)=>({ label:d, calls:[5820,6410,6120,7240,7860,8020,8730][i], errors:[42,38,51,33,29,31,24][i] }));
const split = days.map((d,i)=>({ label:d, sonnet:[3200,3600,3400,4100,4400,4600,4800][i], gpt:[1800,2000,1900,2200,2300,2200,2600][i], deepseek:[820,810,820,940,1160,1220,1330][i] }));
const vendors = [
  { label:"Anthropic", value:42100 }, { label:"OpenAI", value:28600 },
  { label:"DeepSeek", value:14300 }, { label:"Qwen", value:8200 }, { label:"Moonshot", value:3900 },
];
const cap = [
  { label:"推理", a:92, b:78 }, { label:"代码", a:88, b:84 }, { label:"长文", a:76, b:90 },
  { label:"多语言", a:81, b:72 }, { label:"速度", a:64, b:88 }, { label:"成本", a:58, b:86 },
];
const latency = days.slice(0,5).map((d,i)=>({ label:d, min:[180,190,175,200,186][i], q1:[280,300,265,320,290][i], median:[380,410,360,430,395][i], q3:[520,560,480,610,530][i], max:[880,940,760,1100,900][i] }));
const scatter = Array.from({length:22},(_,i)=>({ x: 120+Math.round(Math.sin(i*1.7)*90)+i*22, y: 0.2+((i*37)%50)/100, r: 200+((i*91)%800), series: i%3===0?"Anthropic":i%3===1?"OpenAI":"DeepSeek", label:"model-"+(i+1) }));
const cells = [
  ["折线 line","line",{ data:trend, series:[{key:"calls",name:"调用量"},{key:"errors",name:"错误数",axis:"right"}] }],
  ["平滑 spline","spline",{ data:trend, series:[{key:"calls",name:"调用量"}], unit:"次" }],
  ["阶梯 step","step",{ data:trend, series:[{key:"calls",name:"调用量"}], unit:"次" }],
  ["面积 area","area",{ data:trend, series:[{key:"calls",name:"调用量"}], unit:"次" }],
  ["堆叠面积 stackedArea","stackedArea",{ data:split, series:[{key:"sonnet",name:"Sonnet"},{key:"gpt",name:"GPT-4o"},{key:"deepseek",name:"DeepSeek"}] }],
  ["柱 bar","bar",{ data:trend, series:[{key:"calls",name:"调用量"}], unit:"次" }],
  ["分组柱 groupedBar","groupedBar",{ data:split, series:[{key:"sonnet",name:"Sonnet"},{key:"gpt",name:"GPT-4o"},{key:"deepseek",name:"DeepSeek"}] }],
  ["堆叠柱 stackedBar","stackedBar",{ data:split, series:[{key:"sonnet",name:"Sonnet"},{key:"gpt",name:"GPT-4o"},{key:"deepseek",name:"DeepSeek"}] }],
  ["柱线组合 combo","combo",{ data:trend, series:[{key:"calls",name:"调用量"},{key:"errors",name:"错误数",type:"line",axis:"right"}] }],
  ["条形 hbar","hbar",{ data:vendors, unit:"" }],
  ["堆叠条形 stackedHbar","stackedHbar",{ data:[{label:"Anthropic",in:26000,out:12000,cache:4100},{label:"OpenAI",in:17000,out:9000,cache:2600},{label:"DeepSeek",in:9000,out:4000,cache:1300}], series:[{key:"in",name:"输入"},{key:"out",name:"输出"},{key:"cache",name:"缓存"}] }],
  ["饼 pie","pie",{ data:vendors }],
  ["环 donut","donut",{ data:vendors, donutLabel:"总调用量" }],
  ["散点 scatter","scatter",{ data:scatter.map(({x,y,series,label})=>({x,y,series,label})), series:[{key:"a",name:"Anthropic"},{key:"b",name:"OpenAI"},{key:"c",name:"DeepSeek"}] }],
  ["气泡 bubble","bubble",{ data:scatter, series:[{key:"a",name:"Anthropic"},{key:"b",name:"OpenAI"},{key:"c",name:"DeepSeek"}] }],
  ["雷达 radar","radar",{ data:cap, series:[{key:"a",name:"claude-sonnet-4-5"},{key:"b",name:"deepseek-v3"}] }],
  ["漏斗 funnel","funnel",{ data:[{label:"访问",value:12800},{label:"注册",value:5400},{label:"接入密钥",value:2100},{label:"首次调用",value:1480},{label:"付费",value:520}] }],
  ["瀑布 waterfall","waterfall",{ data:[{label:"上月",value:8200,total:true},{label:"新增",value:2600},{label:"升配",value:900},{label:"流失",value:-1400},{label:"降配",value:-300},{label:"本月",total:true}], unit:"元" }],
  ["箱线 boxplot","boxplot",{ data:latency, unit:"ms" }],
  ["矩形树图 treemap","treemap",{ data:vendors }],
];
function Demo() {
  return (
    <div className="wrap">
      {cells.map(([title, type, props]) => (
        <div className="cell" key={type + title}>
          <h4>{title.split(" ")[0]} <code>type="{type}"</code></h4>
          <Chart type={type} height={196} {...props} />
        </div>
      ))}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
