# ThinkingBlock 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## ThinkingBlock.d.ts

```typescript
export interface ThinkingBlockProps {
  /** true while streaming the reasoning trace */
  active: boolean;
  /** elapsed seconds shown in the timer pill */
  elapsed: number;
  /** the reasoning trace text (partial while streaming) */
  text: string;
}
export function ThinkingBlock(props: ThinkingBlockProps): JSX.Element;
```

## ThinkingBlock.jsx

```jsx
/* ThinkingBlock.jsx — collapsible "deep thinking" reveal for AI chat replies.
   active: shimmering label + ticking timer + streaming body.
   settled: muted "已深度思考 N s" pill, collapsed by default, expandable.
*/
export function ThinkingBlock({ active, elapsed, text }) {
  const [open, setOpen] = React.useState(active);
  const wasActive = React.useRef(active);

  React.useEffect(() => {
    if (wasActive.current && !active) {
      const t = setTimeout(() => setOpen(false), 700);
      wasActive.current = active;
      return () => clearTimeout(t);
    }
    if (!wasActive.current && active) setOpen(true);
    wasActive.current = active;
  }, [active]);

  const seconds = Math.max(0, Math.floor(elapsed || 0));

  return (
    <div className={"th-think" + (active ? " is-active" : "")}>
      <button type="button" className="th-think-header" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="th-think-icon" aria-hidden="true">
          <i className={active ? "ri-loader-4-line th-spin" : "ri-sparkling-2-line"} />
        </span>
        <span className={"th-think-label" + (active ? " th-shimmer-text" : "")}>{active ? "深度思考中" : "已深度思考"}</span>
        <span className="th-think-elapsed">{seconds}s</span>
        <span className="th-think-chev"><i className={"ri-arrow-down-s-line" + (open ? " is-open" : "")} /></span>
      </button>
      {open && (
        <div className="th-think-body">
          {text ? text : (active ? "\u2026" : "（无思考记录）")}
          {active && <span className="th-caret" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}

if (typeof document !== "undefined" && !document.getElementById("th-think-css")) {
  const s = document.createElement("style");
  s.id = "th-think-css";
  s.textContent = `
     .th-think{--th-think-rail-offset:calc(var(--th-space-4) + var(--th-text-xl) / 2);background:var(--color-surface-raised);border:var(--th-border-card);border-radius:var(--th-radius-md);padding:var(--th-space-1);margin-bottom:var(--th-block-gap);max-width:720px;transition:border-color var(--th-dur-2) var(--th-ease),background var(--th-dur-2) var(--th-ease)}
    .th-think.is-active{border-color:var(--color-accent);background:var(--color-surface-raised)}
    .th-think-header{width:100%;appearance:none;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;gap:var(--th-space-2);padding:var(--th-space-2) var(--th-space-4);border-radius:var(--th-radius-sm);color:var(--color-fg-muted);font-family:var(--th-font-cn);font-size:var(--th-text-base)}
    .th-think-header:hover{background:var(--color-row-hover);color:var(--color-fg)}
    .th-think-header:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}
     .th-think-icon{width:var(--th-text-xl);height:var(--th-text-xl);flex-shrink:0;border-radius:var(--th-radius-full);background:var(--color-accent-soft);color:var(--color-link);display:inline-flex;align-items:center;justify-content:center;font-size:var(--th-text-base)}
    .th-think.is-active .th-think-icon{background:var(--color-surface-selected)}
    .th-think-label{font-size:var(--th-text-base);font-weight:500;flex:1;text-align:left;color:var(--color-fg-muted)}
    .th-think-elapsed{font-family:var(--th-font-ui);font-size:var(--th-text-xs);color:var(--color-fg-subtle);font-variant-numeric:tabular-nums;padding:var(--th-space-1) var(--th-space-2);border-radius:var(--th-radius-sm);background:var(--color-surface-quiet);border:0.5px solid var(--color-border)}
    .th-think.is-active .th-think-elapsed{color:var(--color-link);border-color:var(--color-accent)}
    .th-think-chev{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;color:var(--color-fg-subtle);font-size:var(--th-text-md)}
    .th-think-chev .ri-arrow-down-s-line{transition:transform var(--th-dur-1) var(--th-ease)}
    .th-think-chev .is-open{transform:rotate(180deg)}
     .th-think-body{margin:var(--th-space-1) var(--th-space-2) var(--th-space-2) var(--th-think-rail-offset);padding:var(--th-space-2) 0 var(--th-space-2) var(--th-space-4);border-left:var(--th-border-hairline);font-size:var(--th-text-base);line-height:1.5;color:var(--color-fg-muted);white-space:pre-wrap;word-break:break-word;animation:th-think-fade-in var(--th-dur-1) var(--th-ease) both}
    .th-think.is-active .th-think-body{border-left-color:var(--color-accent)}
    @keyframes th-think-fade-in{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}
    .th-think-body .th-caret{margin-left:var(--th-space-1);background:var(--color-link)}
    @media (prefers-reduced-motion: reduce){.th-think-body{animation:none}}
   `;
  document.head.appendChild(s);
}
```

## thinking-block.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Thinking block" subtitle="AI reasoning reveal — shimmering label while active, collapsible once settled" viewport="720x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:26px;display:flex;flex-direction:column;gap:16px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { ThinkingBlock } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setElapsed((e) => (e < 6 ? e + 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="panel">
      <ThinkingBlock active={true} elapsed={elapsed} text={"正在分析用户意图…\n拆解为几个子问题，逐一验证假设。"} />
      <ThinkingBlock active={false} elapsed={8} text={"已完成的推理记录，点击标题可展开查看。"} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
