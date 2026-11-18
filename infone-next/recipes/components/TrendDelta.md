# TrendDelta 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## TrendDelta.d.ts

```typescript
export interface TrendDeltaProps {
  /** Numeric percent (sign determines direction) or a pre-signed string ("+12.4%"). */
  value: number | string;
  /** "auto" (up=good, default), "inverse" (up=bad — cost/latency/errors), "neutral" (gray, no judgment). @default "auto" */
  tone?: "auto" | "inverse" | "neutral";
  /** @default "md" */
  size?: "sm" | "md";
}
export function TrendDelta(props: TrendDeltaProps): JSX.Element;
```

## TrendDelta.jsx

```jsx
/* TrendDelta.jsx — "↑12.4%" / "↓3.1%" inline change indicator. Standalone
   version of the delta used inside MetricStrip — for use in table cells,
   card headers, anywhere a change needs to read at a glance.
   tone="inverse" flips the good/bad read for metrics where up is bad
   (cost, latency, error rate). */
export function TrendDelta({ value, tone = "auto", size = "md" }) {
  const up = typeof value === "number" ? value >= 0 : String(value).trim().startsWith("+");
  const magnitude = typeof value === "number" ? `${Math.abs(value)}%` : String(value).replace(/^[+-]/, "");
  const good = tone === "inverse" ? !up : up;
  const color = tone === "neutral" ? "var(--color-fg-muted)" : good ? "var(--color-success-fg)" : "var(--color-danger-fg)";
  const fontSize = size === "sm" ? "var(--th-text-2xs)" : "var(--th-text-xs)";
  return (
    <span className="th-nums" style={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize, fontWeight: 500, color, whiteSpace: "nowrap" }}>
      <i className={up ? "ri-arrow-up-line" : "ri-arrow-down-line"} style={{ fontSize: size === "sm" ? 12 : 13 }} />{magnitude}
    </span>
  );
}
```

## trend-delta.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Trend delta" subtitle="行内涨跌指示 — tone=inverse 用于成本/延迟等\"越高越差\"的指标" viewport="420x180" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:372px;display:flex;flex-direction:column;gap:12px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}.row{display:flex;justify-content:space-between;align-items:center;font-family:var(--th-font-ui);font-size:13px;color:var(--color-fg)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { TrendDelta } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <div className="row"><span>请求成功率</span><TrendDelta value={12.4} /></div>
      <div className="row"><span>平均延迟（tone="inverse"）</span><TrendDelta value={8.1} tone="inverse" /></div>
      <div className="row"><span>本周成本</span><TrendDelta value={-6.2} /></div>
      <div className="row"><span>较小尺寸（size="sm"）</span><TrendDelta value="+3.0%" size="sm" tone="neutral" /></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
