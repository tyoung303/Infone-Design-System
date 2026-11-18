# Statistic 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Statistic.d.ts

```typescript
import * as React from "react";
export interface StatisticProps {
  title: React.ReactNode;
  /** Pass a number to get the 560ms count-up and locale formatting. */
  value: number | React.ReactNode;
  /** Small node before the number (e.g. "¥"). */
  prefix?: React.ReactNode;
  /** Small unit after the number (e.g. "tokens"). */
  suffix?: React.ReactNode;
  /** Direction of the delta chip. */
  trend?: "up" | "down";
  /** Delta text, e.g. "12.4%". */
  trendValue?: React.ReactNode;
  /** Count the number up on mount. Ignored under prefers-reduced-motion. @default true */
  animate?: boolean;
  style?: React.CSSProperties;
}
export function Statistic(props: StatisticProps): JSX.Element;
```

## Statistic.jsx

```jsx
/* Statistic.jsx — headline number with optional trend delta (usage cards).
   Numbers count up once on mount when `value` is a number and `animate` is
   on; anything the user can't compare (strings) renders as-is.
   Numeric values use the UI font stack plus .th-nums tabular numerals;
   brand and mono fonts are reserved for wordmarks/code, not figures. */
export function Statistic({ title, value, prefix, suffix, trend, trendValue, animate = true, style }) {
  const up = trend === "up";
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", ...style }}>
      <div style={{ fontSize: "var(--th-text-sm)", color: "var(--th-gray-400)", marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span className="th-nums" style={{ fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-xl)", fontWeight: 600, color: "var(--th-gray-900)", lineHeight: 1.1 }}>
          {prefix && <span style={{ fontSize: "var(--th-text-md)", fontWeight: 500, marginRight: 2 }}>{prefix}</span>}
          <StatNumber value={value} animate={animate} />
          {suffix && <span style={{ fontSize: "var(--th-text-sm)", fontWeight: 400, color: "var(--th-gray-400)", marginLeft: 4 }}>{suffix}</span>}
        </span>
        {trend && (
          <span className="th-nums" style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: "var(--th-text-xs)", fontWeight: 500, color: up ? "var(--color-success-fg)" : "var(--color-danger-fg)" }}>
            <i className={up ? "ri-arrow-up-line" : "ri-arrow-down-line"} style={{ fontSize: 12 }} />{trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

function StatNumber({ value, animate }) {
  const numeric = typeof value === "number";
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = React.useState(() => (animate && numeric && !reduced ? 0 : value));
  React.useEffect(() => {
    if (!animate || !numeric || reduced) { setShown(value); return; }
    let raf, start = null;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / 560);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate, numeric, reduced]);
  if (!numeric) return <>{value}</>;
  const decimals = (String(value).split(".")[1] || "").length;
  return <>{shown.toLocaleString("zh-CN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}
```

## statistic.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Statistic" subtitle="统计数值 — 用量与费用总览" viewport="700x200" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Statistic } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
    <Statistic title="今日调用" value={42318} suffix="次" trend="up" trendValue="12.4%" />
    <Statistic title="Token 消耗" value={8.62} suffix="M tokens" trend="down" trendValue="3.1%" />
    <Statistic title="账户余额" value={1280.5} prefix="¥" />
  </div>
);</script>
</body>
</html>
```
