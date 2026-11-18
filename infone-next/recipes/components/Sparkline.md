# Sparkline 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Sparkline.d.ts

```typescript
export interface SparklinePoint { v: number; label?: string }
export interface SparklineProps {
  /** Plain numbers or {v,label} — label is unused today, kept for future tooltips. */
  data: number[] | SparklinePoint[];
  /** @default 64 */
  width?: number;
  /** @default 20 */
  height?: number;
  /** "neutral" (default — --color-data-line, neutral data ink; never competes
   *  with the accent), a semantic role ("success"|"warning"|"danger" →
   *  --color-<tone>-solid, "accent" → --color-accent), or a raw token name
   *  ("--th-chart-3", preferred when the line is the emphasis).
   *  @default "neutral" */
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | string;
  /** Fill the area under the line at 12% opacity. @default false */
  fill?: boolean;
  /** Mark the last point with a filled dot. @default true */
  dot?: boolean;
}
export function Sparkline(props: SparklineProps): JSX.Element;
```

## Sparkline.jsx

```jsx
/* Sparkline.jsx — standalone trend line, no axes/labels/tooltip: the shape
   IS the information. Table cells, card corners, inline-with-text contexts.
   Default stroke is --color-data-line: neutral DATA INK, not --th-gray-300
   (that is muted text — a 1.5px line in it reads as disabled). Stays out of
   the interactive budget (原则 1); pass `tone` only when the line itself is
   the emphasis, and prefer a "--th-chart-N" slot over a status color.
   Optional area fill and last-point dot. */
export function Sparkline({ data = [], width = 64, height = 20, tone = "neutral", fill = false, dot = true }) {
  const vals = data.map((d) => (typeof d === "number" ? d : d.v));
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const step = width / Math.max(1, vals.length - 1);
  const stroke = tone === "neutral" ? "var(--color-data-line)"
    : tone === "accent" ? "var(--color-accent)"
    : tone.startsWith("--") ? `var(${tone})`
    : tone.startsWith("var(") ? tone
    : `var(--color-${tone}-solid)`;
  const pts = vals.map((v, i) => [Number((i * step).toFixed(1)), Number((height - ((v - min) / span) * (height - 4) - 2).toFixed(1))]);
  const line = pts.map(([x, y], i) => (i === 0 ? "M" : "L") + x + " " + y).join(" ");
  const area = line + ` L ${width} ${height} L 0 ${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: "block", overflow: "visible", flex: "none" }}>
      {fill && <path d={area} fill={stroke} opacity="0.12" />}
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {dot && last && <circle cx={last[0]} cy={last[1]} r="2.5" fill={stroke} />}
    </svg>
  );
}
```

## sparkline.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Sparkline" subtitle="行内趋势线 — 无坐标轴/无标签，可选面积填充与末点圆点" viewport="480x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:432px;display:flex;flex-direction:column;gap:16px}.row{display:flex;align-items:center;gap:16px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);padding:12px 16px}.k{font-family:var(--th-font-ui);font-size:12px;color:var(--color-fg-muted);flex:1}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Sparkline } = window.TokenHubDesignSystem_019e20;
const data = [4,7,6,9,8,12,11,15,13,18,17,22];
function Demo() {
  return (
    <div className="panel">
      <div className="row"><span className="k">neutral（默认，表格单元格用）</span><Sparkline data={data} /></div>
      <div className="row"><span className="k">accent + 面积填充</span><Sparkline data={data} tone="accent" fill /></div>
      <div className="row"><span className="k">danger（成本/延迟等"越高越差"）</span><Sparkline data={[20,18,19,22,25,24,28,30,29,33,31,36]} tone="danger" fill /></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
