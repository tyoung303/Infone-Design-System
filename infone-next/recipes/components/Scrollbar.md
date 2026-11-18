# Scrollbar 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

`Scrollbar` 是可复用的浮层滚动条本体。它不拥有滚动容器，只接收一个已经具备 `overflow` 的 viewport ref，负责测量、显形策略与拖拽。需要自己组织滚动结构的组件，例如 `NavRail`、长列表容器或侧边筛选区，应直接调用 `Scrollbar`。

显形策略：`hover` 在指针停留于不滚动 shell 内时持续展示；`always` 固定常驻；`scroll` 在滚动开始时展示，并于停止滚动 700ms 后隐藏。三种策略对横向、纵向滚动条一致。

## Scrollbar.d.ts

```typescript
import * as React from "react";

export type ScrollbarReveal = "hover" | "always" | "scroll";

export interface ScrollbarProps {
  /** The scrolling viewport. Its parent must be the non-scrolling positioning shell. */
  targetRef: React.RefObject<HTMLElement>;
  /** Scroll axis. Default "y". */
  axis?: "y" | "x";
  /** Thumb reveal strategy. Default "hover". */
  reveal?: ScrollbarReveal;
  /** Thumb thickness in px. Default 4. */
  thickness?: number;
  /** Distance from the shell edge in px. Default 2. */
  inset?: number;
  /** Padding at both ends of the track in px. Default 4. */
  trackPadding?: number;
  /** Minimum thumb length in px. Default 24. */
  minThumb?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Overlay scrollbar that tracks and controls an external scrolling viewport. */
export function Scrollbar(props: ScrollbarProps): JSX.Element | null;
```

## Scrollbar.jsx

```jsx
/* Scrollbar.jsx — overlay scrollbar for an existing viewport. The thumb is
   rendered as a sibling overlay inside the viewport's non-scrolling parent, so
   it does not move with scrolled content and does not reserve layout width.

   Required structure:
   <div style={{ position:"relative", minHeight:0 }}>
     <div ref={viewportRef} style={{ overflowY:"auto" }}>...</div>
     <Scrollbar targetRef={viewportRef} />
   </div>

   reveal: "hover" (default) | "always" | "scroll". */
export function Scrollbar({
  targetRef, axis = "y", reveal = "hover",
  thickness = 4, inset = 2, trackPadding = 4, minThumb = 24,
  className, style,
}) {
  const horizontal = axis === "x";
  const dragRef = React.useRef(null);
  const hoverRef = React.useRef(false);
  const timerRef = React.useRef(null);
  const [track, setTrack] = React.useState({ size: 0, offset: 0, over: false });
  const [lit, setLit] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    clearTimeout(timerRef.current);
    if (reveal === "hover") setLit(hoverRef.current);
    else if (reveal === "scroll") setLit(false);
  }, [reveal]);

  const measure = React.useCallback(() => {
    const el = targetRef?.current;
    if (!el) return;
    const client = horizontal ? el.clientWidth : el.clientHeight;
    const scroll = horizontal ? el.scrollWidth : el.scrollHeight;
    const pos = horizontal ? el.scrollLeft : el.scrollTop;
    const over = scroll - client > 1;
    const span = Math.max(1, client - trackPadding * 2);
    const size = over ? Math.min(span, Math.max(minThumb, (client / scroll) * span)) : 0;
    const offset = over ? trackPadding + (pos / (scroll - client)) * Math.max(1, span - size) : trackPadding;
    setTrack({ size, offset, over });
  }, [horizontal, minThumb, targetRef, trackPadding]);

  React.useEffect(() => {
    const el = targetRef?.current;
    if (!el) return;
    const shell = el.parentElement;
    measure();
    const onScroll = () => {
      measure();
      if (reveal === "scroll") {
        setLit(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setLit(false), 700);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const onEnter = () => {
      hoverRef.current = true;
      if (reveal === "hover") setLit(true);
    };
    const onLeave = () => {
      hoverRef.current = false;
      if (reveal === "hover" && !dragRef.current) setLit(false);
    };
    if (shell) {
      shell.addEventListener("mouseenter", onEnter);
      shell.addEventListener("mouseleave", onLeave);
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) { ro.observe(el); if (el.firstElementChild) ro.observe(el.firstElementChild); }
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (shell) {
        shell.removeEventListener("mouseenter", onEnter);
        shell.removeEventListener("mouseleave", onLeave);
      }
      if (ro) ro.disconnect();
      clearTimeout(timerRef.current);
    };
  }, [measure, reveal, targetRef]);

  const onThumbDown = (e) => {
    const el = targetRef?.current;
    if (!el) return;
    e.preventDefault();
    setDragging(true);
    setLit(true);
    dragRef.current = {
      start: horizontal ? e.clientX : e.clientY,
      from: horizontal ? el.scrollLeft : el.scrollTop,
    };
    const move = (ev) => {
      const d = dragRef.current;
      const v = targetRef?.current;
      if (!d || !v) return;
      const client = horizontal ? v.clientWidth : v.clientHeight;
      const scroll = horizontal ? v.scrollWidth : v.scrollHeight;
      const span = Math.max(1, client - trackPadding * 2);
      const delta = (horizontal ? ev.clientX : ev.clientY) - d.start;
      const ratio = (scroll - client) / Math.max(1, span - track.size);
      if (horizontal) v.scrollLeft = d.from + delta * ratio;
      else v.scrollTop = d.from + delta * ratio;
    };
    const up = () => {
      dragRef.current = null;
      setDragging(false);
      if (reveal === "hover") setLit(hoverRef.current);
      else if (reveal === "scroll") setLit(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!track.over) return null;

  const show = reveal === "always" || dragging || (reveal === "hover" && lit) || (reveal === "scroll" && lit);
  const common = {
    position: "absolute", borderRadius: Math.max(2, thickness / 2), zIndex: 1,
    background: "var(--th-gray-250)", opacity: show ? 0.7 : 0,
    transition: "opacity var(--th-dur-1) var(--th-ease)",
    cursor: "default", touchAction: "none", pointerEvents: show ? "auto" : "none",
    ...style,
  };

  return (
    <div
      className={className}
      onPointerDown={onThumbDown}
      style={horizontal
        ? { ...common, height: thickness, width: track.size, left: track.offset, bottom: inset }
        : { ...common, width: thickness, height: track.size, top: track.offset, right: inset }}
    />
  );
}
```

## scrollbar.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Scrollbar" subtitle="Reusable overlay thumb for external scrolling viewports" viewport="700x300" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<title>Scrollbar</title>
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;padding:12px;background:var(--th-bg);font-family:var(--th-font-cn)}.wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{height:244px;background:var(--th-white);border:0.5px solid var(--color-border);border-radius:var(--th-radius-md);overflow:hidden;display:flex;flex-direction:column}.head{height:36px;flex-shrink:0;padding:0 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid var(--color-divider);font-size:13px;font-weight:600}.head span{font-size:11px;color:var(--color-fg-subtle);font-weight:400}.shell{position:relative;flex:1;min-height:0}.view{height:100%;overflow:auto;scrollbar-width:none;-ms-overflow-style:none}.view::-webkit-scrollbar{width:0;height:0;display:none}.row{padding:8px 12px;font-size:13px;border-top:0.5px solid var(--color-divider)}.row:first-child{border-top:none}.chips{display:flex;gap:8px;padding:12px;width:max-content}.chip{flex:none;height:26px;padding:0 10px;border-radius:6px;background:var(--color-surface-inset);font-size:12px;display:inline-flex;align-items:center;white-space:nowrap}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Scrollbar } = window.TokenHubDesignSystem_019e20;
const ITEMS = ["运行记录", "任务队列", "仓库接入", "密钥与令牌", "模型市场", "渠道管理", "用量分析", "账单记录", "系统设置", "团队配置"];
const TAGS = ["全部模型", "OpenAI 系列", "Anthropic 系列", "DeepSeek", "Gemini", "自定义渠道", "边缘缓存", "高可用线路"];
function Panel({ title, axis = "y", reveal }) {
  const ref = React.useRef(null);
  return (
    <div className="card">
      <div className="head">{title}<span>{reveal}</span></div>
      <div className="shell">
        <div ref={ref} className="view" style={axis === "x" ? { overflowX: "auto", overflowY: "hidden" } : { overflowY: "auto", overflowX: "hidden" }}>
          {axis === "x"
            ? <div className="chips">{TAGS.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
            : ITEMS.map((item) => <div className="row" key={item}>{item}</div>)}
        </div>
        <Scrollbar targetRef={ref} axis={axis} reveal={reveal} />
      </div>
    </div>
  );
}
function Demo() {
  return <div className="wrap"><Panel title="纵向" reveal="hover" /><Panel title="纵向" reveal="always" /><Panel title="横向" axis="x" reveal="scroll" /></div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
