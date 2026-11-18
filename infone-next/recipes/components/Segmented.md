# Segmented 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## 绘制规范

- 外层高度使用 `--th-ctl-h`（sm，28px）或 `--th-ctl-h-lg`（md，32px），内外间距只能使用 spacing token。
- 背景使用 `--color-surface-inset`（浅色 #F1F1F1，暗色 #232323），比 quiet 表面深一档，与页面画布区分；默认外框不绘制边框，圆角使用 `--th-radius-sm`，不得使用 `999px` 胶囊圆角。
- 选中滑块使用 `--color-surface`、`--th-border-hairline` 与 `--th-radius-xs`，不使用自定义阴影；选中与未选中文字分别使用 `--color-fg` 和 `--color-fg-muted`。
- 标签必须单行显示，按钮使用 `role="tab"` 和 `aria-selected`，并提供清晰的 `:focus-visible` 状态。
- 选项可以声明 `icon`，但默认不绘制；仅在调用方显式传入 `showIcon={true}` 时显示图标。图标只能辅助识别，不能替代文字标签。

## Segmented.d.ts

```typescript
import * as React from "react";
export interface SegmentedOption { label: React.ReactNode; value: string; /** Remix Icon class */ icon?: string; }
export interface SegmentedProps {
  /** Strings or {label, value, icon} objects. */
  options: (string | SegmentedOption)[];
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** @default "md" */
  size?: "sm" | "md";
  /** Whether to render option icons. @default false */
  showIcon?: boolean;
  style?: React.CSSProperties;
}
export function Segmented(props: SegmentedProps): JSX.Element;
```

## Segmented.jsx

```jsx
/* Segmented.jsx — compact segmented control. Controlled or uncontrolled.

   Motion: the white thumb is ONE element that slides between segments (transform +
   width, --th-dur-2/--th-ease) instead of a background flipping from segment to
   segment. The eye follows the moved object, so the control reads as "the same
   selection moved", not "one thing turned off and another turned on".
   Measured from the live DOM (layout effect + ResizeObserver) so label width,
   density and font loading can't desync it; it snaps without animating on first
   paint and under prefers-reduced-motion. */
export function Segmented({ options = [], value, defaultValue, onChange, size = "md", showIcon = false, style }) {
  const [inner, setInner] = React.useState(defaultValue ?? (options[0] && (options[0].value ?? options[0])));
  const cur = value !== undefined ? value : inner;
  const h = size === "sm" ? "var(--th-ctl-h)" : "var(--th-ctl-h-lg)";
  const wrapRef = React.useRef(null);
  const [thumb, setThumb] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document !== "undefined" && !document.getElementById("th-segmented-css")) {
    const s = document.createElement("style");
    s.id = "th-segmented-css";
     s.textContent = `.th-segmented-tab:focus-visible{outline:none;box-shadow:var(--th-ring)}`;
    document.head.appendChild(s);
  }

  const measure = React.useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = wrap.querySelector('[data-sg-active="1"]');
    if (!el) { setThumb(null); return; }
    setThumb({ x: el.offsetLeft, w: el.offsetWidth });
  }, []);

  React.useLayoutEffect(() => { measure(); }, [measure, cur, size, options.length]);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    const wrap = wrapRef.current;
    let ro;
    if (wrap && typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => measure());
      ro.observe(wrap);
      Array.from(wrap.children).forEach((c) => ro.observe(c));
    }
    return () => { cancelAnimationFrame(id); ro && ro.disconnect(); };
  }, [measure]);

  return (
    <div ref={wrapRef} role="tablist" style={{ position: "relative", display: "inline-flex", padding: "var(--th-space-1)", gap: "var(--th-space-1)", background: "var(--color-surface-inset)", borderRadius: "var(--th-radius-sm)", fontFamily: "var(--th-font-cn)", ...style }}>
      {thumb && (
        <span aria-hidden="true" style={{
           position: "absolute", top: "var(--th-space-1)", left: 0, height: "calc(" + h + " - var(--th-space-2))", width: thumb.w,
          transform: `translateX(${thumb.x}px)`,
           background: "var(--color-surface)", border: "var(--th-border-hairline)", borderRadius: "var(--th-radius-xs)",
          boxShadow: "var(--th-shadow-card)", pointerEvents: "none",
          transition: ready && !reduced
            ? "transform var(--th-dur-2) var(--th-ease-out), width var(--th-dur-2) var(--th-ease-out)"
            : "none",
        }} />
      )}
      {options.map((o) => {
        const val = o.value ?? o, label = o.label ?? o, icon = o.icon;
        const active = val === cur;
        return (
           <button key={val} type="button" role="tab" aria-selected={active} data-sg-active={active ? "1" : "0"} className="th-press th-segmented-tab"
            onClick={() => { if (value === undefined) setInner(val); onChange && onChange(val); }}
             style={{ position: "relative", height: "calc(" + h + " - var(--th-space-2))", padding: "0 var(--th-space-4)", border: "none", borderRadius: "var(--th-radius-xs)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "var(--th-space-1)", whiteSpace: "nowrap", flexShrink: 0, flexGrow: 0, fontFamily: "inherit", fontSize: size === "sm" ? "var(--th-text-xs)" : "var(--th-text-base)", fontWeight: active ? 500 : 400, background: "transparent", color: active ? "var(--color-fg)" : "var(--color-fg-muted)", transition: "color var(--th-dur-1) var(--th-ease)" }}>
              {showIcon && icon && <i aria-hidden="true" className={icon} style={{ fontSize: "var(--th-text-base)" }} />}{label}
          </button>
        );
      })}
    </div>
  );
}
```

## segmented.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Segmented" subtitle="分段控制器 — sm=28px / md=32px" viewport="700x180" -->
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
const { Segmented } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
    <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{width:86,color:"var(--color-fg-muted)",fontSize:12}}>sm · 无图标</span><Segmented size="sm" options={[{ label: "卡片", value: "card", icon: "ri-layout-grid-line" }, { label: "列表", value: "list", icon: "ri-list-check-2" }]} defaultValue="card" /></div>
    <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{width:86,color:"var(--color-fg-muted)",fontSize:12}}>sm · 图标</span><Segmented size="sm" showIcon options={[{ label: "卡片", value: "card", icon: "ri-layout-grid-line" }, { label: "列表", value: "list", icon: "ri-list-check-2" }]} defaultValue="card" /></div>
    <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{width:86,color:"var(--color-fg-muted)",fontSize:12}}>md · 32px</span><Segmented options={["近 7 天", "近 30 天", "自定义"]} defaultValue="近 7 天" /></div>
  </div>
);</script>
</body>
</html>
```
