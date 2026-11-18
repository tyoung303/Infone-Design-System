# InputNumber 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## InputNumber.d.ts

```typescript
import * as React from "react";
export interface InputNumberProps {
  min?: number;
  max?: number;
  /** @default 1 */
  step?: number;
  /** Controlled value. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** @default false */
  disabled?: boolean;
  /** Control width in px. @default 120 */
  width?: number;
  /** 控制高度两档：`sm`=28px 紧凑、`md`=32px 松弛。@default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function InputNumber(props: InputNumberProps): JSX.Element;
```

## InputNumber.jsx

```jsx
/* InputNumber.jsx — numeric stepper input (max_tokens, quota). */
export function InputNumber({ min = -Infinity, max = Infinity, step = 1, value, defaultValue, onChange, disabled = false, width = 120, size = "md", style }) {
  const [inner, setInner] = React.useState(defaultValue ?? (isFinite(min) ? min : 0));
  const cur = value !== undefined ? value : inner;
  const [text, setText] = React.useState(String(cur));
  React.useEffect(() => { setText(String(cur)); }, [cur]);
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const commit = (v) => { const c = clamp(v); if (value === undefined) setInner(c); onChange && onChange(c); setText(String(c)); };
  const btn = (dir) => ({ width: 24, flex: "none", border: "none", borderLeft: "var(--th-border-hairline)", background: "transparent", cursor: disabled ? "not-allowed" : "pointer", color: "var(--th-gray-400)", fontSize: 12, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" });
  return (
    <div style={{ display: "inline-flex", height: size === "sm" ? 28 : 32, width, border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", background: disabled ? "var(--th-gray-50)" : "var(--th-white)", overflow: "hidden", opacity: disabled ? 0.6 : 1, ...style }}>
      <input value={text} disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => { const n = parseFloat(text); commit(isNaN(n) ? cur : n); }}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "ArrowUp") { e.preventDefault(); commit(cur + step); } if (e.key === "ArrowDown") { e.preventDefault(); commit(cur - step); } }}
        style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", padding: "0 10px", fontVariantNumeric: "tabular-nums", fontSize: size === "sm" ? 12 : 13, color: "var(--th-gray-900)" }} />
      <div style={{ display: "flex", flexDirection: "column", width: 24 }}>
        <button onClick={() => !disabled && commit(cur + step)} style={{ ...btn(), flex: 1, borderBottom: "0.5px solid var(--th-gray-100)" }}><i className="ri-arrow-up-s-line" /></button>
        <button onClick={() => !disabled && commit(cur - step)} style={{ ...btn(), flex: 1 }}><i className="ri-arrow-down-s-line" /></button>
      </div>
    </div>
  );
}
```

## input-number.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="InputNumber" subtitle="数字输入 — sm=28px / md=32px" viewport="700x190" -->
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
const { InputNumber } = window.TokenHubDesignSystem_019e20;
const row = { display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--th-font-cn)", fontSize: 13, color: "var(--th-gray-600)" };
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
    <div style={row}><span>sm · max_tokens</span><InputNumber size="sm" min={1} max={128000} step={512} defaultValue={4096} width={130} /></div>
    <div style={row}><span>md · 并发上限</span><InputNumber min={1} max={100} defaultValue={10} width={100} /></div>
    <div style={row}><span>禁用</span><InputNumber defaultValue={0} disabled width={90} /></div>
  </div>
);</script>
</body>
</html>
```
