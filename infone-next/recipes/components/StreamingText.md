# StreamingText 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## StreamingText.d.ts

```typescript
export interface StreamingTextProps {
  text: string;
  /** While true the text types in and a caret blinks at the end. @default true */
  streaming?: boolean;
  /** Characters per second. @default 42 */
  cps?: number;
  /** Fired once the last character lands. */
  onDone?: () => void;
  style?: React.CSSProperties;
}
export function StreamingText(props: StreamingTextProps): JSX.Element;
```

## StreamingText.jsx

```jsx
/* StreamingText.jsx — token-by-token reveal for model output. Drives the
   caret from --th-teal-600 and stops the moment `streaming` goes false.
   Under prefers-reduced-motion the full text renders immediately (the
   accessibility floor in motion.css applies to JS-driven motion too). */
export function StreamingText({ text = "", streaming = true, cps = 42, onDone, style }) {
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [n, setN] = React.useState(() => (streaming && !reduced ? 0 : text.length));
  React.useEffect(() => {
    if (!streaming || reduced) { setN(text.length); return; }
    setN(0);
    let raf, start = null;
    const tick = (t) => {
      if (start === null) start = t;
      const shown = Math.min(text.length, Math.floor(((t - start) / 1000) * cps));
      setN(shown);
      if (shown < text.length) raf = requestAnimationFrame(tick); else onDone && onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, streaming, cps, reduced]);
  const done = n >= text.length;
  return (
    <span style={{ fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-base)", lineHeight: 1.7, color: "var(--color-fg)", whiteSpace: "pre-wrap", wordBreak: "break-word", ...style }}>
      {text.slice(0, n)}
      {streaming && !done && <span className="th-caret" />}
    </span>
  );
}
```

## streaming-text.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Streaming text" subtitle="模型输出逐字流式渲染 + 光标；reduced-motion 下直接整段呈现" viewport="520x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:20px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}.panel{width:472px;display:flex;flex-direction:column;gap:12px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { StreamingText, Button } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [run, setRun] = React.useState(0);
  return (
    <div className="panel">
      <StreamingText key={run} text={"已接入 3 个上游供应商，正在按当前路由策略比较延迟与单价。\n建议将 claude-sonnet-4 设为默认模型：p95 延迟 1.4s，单价低于当前默认 18%。"} />
      <div><Button size="sm" variant="secondary" onClick={() => setRun(r => r + 1)}>重新播放</Button></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
