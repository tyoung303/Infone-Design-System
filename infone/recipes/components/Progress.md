# Progress 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Progress.d.ts

```typescript
import * as React from "react";
export interface ProgressProps {
  /** @default 0 */
  value?: number;
  /** @default 100 */
  max?: number;
  /** Left-side label above the bar, e.g. "本月额度". */
  label?: string;
  /** Right-side text above the bar, e.g. "¥120.00 / ¥300.00". Overrides showValue. */
  caption?: string;
  /** Show the percentage on the right. @default false */
  showValue?: boolean;
  /** @default "accent" */
  tone?: "accent" | "success" | "warning" | "danger";
  /** @default "md" (8px); "sm" is a 4px hairline bar */
  size?: "md" | "sm";
  style?: React.CSSProperties;
}
export function Progress(props: ProgressProps): JSX.Element;
```

## Progress.jsx

```jsx
/* Progress.jsx — quota / usage bar. Brand fill by default; tone switches for
   warning states. The fill is a painted shape, so every tone reads the -solid
   rung, never -fg (a text color filled into an 8px bar comes out muddy). */
const TH_PROGRESS_TONES = {
  accent:  "var(--color-accent)",
  success: "var(--color-success-solid)",
  warning: "var(--color-warning-solid)",
  danger:  "var(--color-danger-solid)",
};
export function Progress({ value = 0, max = 100, label, caption, showValue = false, tone = "accent", size = "md", style }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  const h = size === "sm" ? 4 : 8;
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", ...style }}>
      {(label || showValue || caption) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--color-fg)" }}>{label}</span>
          <span style={{ fontSize: 12, color: "var(--color-fg-muted)", fontVariantNumeric: "tabular-nums" }}>{caption ?? (showValue ? Math.round(pct) + "%" : null)}</span>
        </div>
      )}
      <div style={{ height: h, borderRadius: 999, background: "var(--color-data-track)", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: 999, background: TH_PROGRESS_TONES[tone] || TH_PROGRESS_TONES.accent, transition: "width .3s cubic-bezier(0.2,0.7,0.2,1)" }} />
      </div>
    </div>
  );
}
```

## progress.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Progress" subtitle="额度 / 用量进度条 — accent、warning、danger 语气 + sm 细条" viewport="700x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;display:flex;flex-direction:column;gap:20px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Progress } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Progress label="本月额度" caption="¥120.00 / ¥300.00" value={40} />
    <Progress label="请求配额" value={86} showValue tone="warning" />
    <Progress value={62} size="sm" />
  </div>
);
</script>
</body>
</html>
```
