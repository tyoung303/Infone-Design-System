# Slider 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Slider.d.ts

```typescript
import * as React from "react";
export interface SliderProps {
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /** Controlled value. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Show the numeric readout after the track. @default true */
  showValue?: boolean;
  /** @default false */
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function Slider(props: SliderProps): JSX.Element;
```

## Slider.jsx

```jsx
/* Slider.jsx — single-value slider for model params (temperature, top_p). Drag track or handle. */
export function Slider({ min = 0, max = 100, step = 1, value, defaultValue, onChange, showValue = true, disabled = false, style }) {
  const [inner, setInner] = React.useState(defaultValue ?? min);
  const cur = value !== undefined ? value : inner;
  const trackRef = React.useRef(null);
  const pct = max === min ? 0 : ((cur - min) / (max - min)) * 100;
  const commit = (v) => { if (value === undefined) setInner(v); onChange && onChange(v); };
  const fromEvent = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    const raw = min + Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (max - min);
    const snapped = Math.round(raw / step) * step;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(6))));
  };
  const onPointerDown = (e) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    commit(fromEvent(e));
    const move = (ev) => commit(fromEvent(ev));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const decimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: disabled ? 0.45 : 1, ...style }}>
      <div ref={trackRef} onPointerDown={onPointerDown} style={{ position: "relative", flex: 1, height: 20, cursor: disabled ? "not-allowed" : "pointer", touchAction: "none" }}>
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 4, borderRadius: 999, background: "var(--th-gray-100)" }} />
        <div style={{ position: "absolute", top: 8, left: 0, width: pct + "%", height: 4, borderRadius: 999, background: "var(--th-teal-500)" }} />
        <div style={{ position: "absolute", top: 3, left: `calc(${pct}% - 7px)`, width: 14, height: 14, borderRadius: 999, background: "var(--th-white)", border: "2px solid var(--th-teal-500)", boxShadow: "var(--th-shadow-card)", transition: "transform .12s var(--th-ease)" }} />
      </div>
      {showValue && <span className="th-nums" style={{ fontSize: 12, color: "var(--th-gray-600)", minWidth: 34, textAlign: "right" }}>{cur.toFixed(decimals)}</span>}
    </div>
  );
}
```

## slider.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Slider" subtitle="滑块 — 模型参数 temperature / top_p" viewport="700x200" -->
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
const { Slider } = window.TokenHubDesignSystem_019e20;
const row = { display: "grid", gridTemplateColumns: "110px 1fr", gap: 16, alignItems: "center", fontFamily: "var(--th-font-cn)", fontSize: 13, color: "var(--th-gray-600)" };
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    <div style={row}><span>temperature</span><Slider min={0} max={2} step={0.1} defaultValue={0.7} /></div>
    <div style={row}><span>top_p</span><Slider min={0} max={1} step={0.05} defaultValue={0.9} /></div>
    <div style={row}><span style={{ color: "var(--th-gray-250)" }}>禁用</span><Slider defaultValue={40} disabled /></div>
  </div>
);</script>
</body>
</html>
```
