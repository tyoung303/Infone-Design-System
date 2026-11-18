# ScrollArea 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

`ScrollArea` 是便捷滚动容器；滚动条本体由独立的 `Scrollbar` 组件提供。需要自己控制滚动 viewport 结构的组件，例如 `NavRail` 中间导航区，可直接使用 `Scrollbar`。

## ScrollArea.d.ts

```typescript
import * as React from "react";
import { Scrollbar, type ScrollbarReveal } from "./Scrollbar";

export interface ScrollAreaProps {
  children?: React.ReactNode;
  /** Scroll axis. Default "y". */
  axis?: "y" | "x";
  /** Thumb reveal strategy. Default "hover". */
  reveal?: ScrollbarReveal;
  /** @deprecated Use reveal="always". */
  always?: boolean;
  /** Cap the viewport; omit to fill the parent. */
  maxHeight?: number | string;
  maxWidth?: number | string;
  style?: React.CSSProperties;
  /** Extra styles on the inner scrolling viewport. */
  contentStyle?: React.CSSProperties;
  className?: string;
}
/** Scroll container whose Scrollbar overlays the content and reserves no layout space. */
export function ScrollArea(props: ScrollAreaProps): JSX.Element;
```

## ScrollArea.jsx

```jsx
import { Scrollbar } from "./Scrollbar";

/* ScrollArea.jsx — scroll container with an OVERLAY Scrollbar. ScrollArea owns
   the viewport and hides the native bar; Scrollbar owns measurement, reveal and
   dragging. Use for any band that can outgrow its box. Do NOT use it to scroll
   the page itself.

   axis: "y" (default) | "x"
   reveal: "hover" (default) | "always" | "scroll"
   always: deprecated alias for reveal="always". */
export function ScrollArea({
  children, axis = "y", reveal, maxHeight, maxWidth, always = false,
  style, contentStyle, className,
}) {
  const horizontal = axis === "x";
  const viewRef = React.useRef(null);
  const resolvedReveal = always ? "always" : (reveal || "hover");

  return (
    <div
      className={className}
      style={{ position: "relative", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", ...style }}
    >
      <div
        ref={viewRef}
        className="th-sa-view"
        style={{
          flex: 1, minWidth: 0, minHeight: 0,
          overflowX: horizontal ? "auto" : "hidden",
          overflowY: horizontal ? "hidden" : "auto",
          maxHeight, maxWidth,
          ...contentStyle,
        }}
      >
        {children}
      </div>
      <Scrollbar targetRef={viewRef} axis={axis} reveal={resolvedReveal} />
    </div>
  );
}

/* The native bar is hidden, not styled: a styled native bar still reserves
   layout width in Chromium on Windows, which is the thing we are avoiding. */
if (typeof document !== "undefined" && !document.getElementById("th-scrollarea-css")) {
  const s = document.createElement("style");
  s.id = "th-scrollarea-css";
  s.textContent = ".th-sa-view{scrollbar-width:none;-ms-overflow-style:none}.th-sa-view::-webkit-scrollbar{width:0;height:0;display:none}";
  document.head.appendChild(s);
}
```

## scroll-area.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="ScrollArea" subtitle="Overlay Scrollbar — viewport convenience wrapper, no layout width reserved" viewport="700x300" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<title>ScrollArea</title>
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;padding:12px;background:var(--th-bg);font-family:var(--th-font-cn)}.wrap{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.card{background:var(--th-white);border:0.5px solid var(--color-border);border-radius:var(--th-radius-md);overflow:hidden;display:flex;flex-direction:column}.head{height:36px;flex-shrink:0;padding:0 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid var(--color-divider);font-size:13px;font-weight:600}.head span.n{font-size:11px;color:var(--color-fg-subtle);font-weight:400}.row{padding:8px 12px;font-size:13px;border-top:0.5px solid var(--color-divider)}.row:first-child{border-top:none}.chips{display:flex;gap:8px;padding:12px}.chip{flex:none;height:26px;padding:0 10px;border-radius:6px;background:var(--color-surface-inset);font-size:12px;display:inline-flex;align-items:center;white-space:nowrap}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { ScrollArea } = window.TokenHubDesignSystem_019e20;
const RUNS = ["重构 auth 中间件", "补齐 billing 单测", "迁移 Prisma schema", "修复 SSE 断流", "接入 DeepMap 索引", "补 API 文档", "清理僵尸依赖", "重跑失败用例", "压测网关限流", "同步模型价格"];
const TAGS = ["全部模型", "OpenAI 系列", "Anthropic 系列", "DeepSeek", "Gemini", "自定义渠道", "边缘缓存"];
function Demo() {
  return (
    <div className="wrap">
      <div className="card" style={{ height: 244 }}>
        <div className="head">纵向 · hover<span className="n">默认</span></div>
        <ScrollArea reveal="hover">
          {RUNS.map((r) => <div className="row" key={r}>{r}</div>)}
        </ScrollArea>
      </div>
      <div className="card" style={{ height: 244 }}>
        <div className="head">横向 · always<span className="n">axis="x"</span></div>
        <ScrollArea axis="x" reveal="always" style={{ flex: "none" }}>
          <div className="chips">{TAGS.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
        </ScrollArea>
        <div style={{ padding: 12, fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.5, borderTop: "0.5px solid var(--color-divider)" }}>
          ScrollArea 只负责 viewport；浮层滑块由 Scrollbar 提供，并在两端保留 4px 运动间距。
        </div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
