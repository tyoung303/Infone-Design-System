# CodeBlock 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## CodeBlock.d.ts

```typescript
import * as React from "react";
export interface CodeBlockProps {
  /** The code text, verbatim (preserves newlines). */
  code?: string;
  /** Optional header label, e.g. "cURL" or a filename — adds a white header row. */
  label?: string;
  /** @default true */
  copyable?: boolean;
  /** Scroll beyond this height, e.g. 240. */
  maxHeight?: number | string;
  style?: React.CSSProperties;
}
export function CodeBlock(props: CodeBlockProps): JSX.Element;
```

## CodeBlock.jsx

```jsx
import { Scrollbar } from "./Scrollbar";
import { Button } from "./Button";

/* CodeBlock.jsx — multi-line code block: IBM Plex Mono, optional header label, copy action. */
if (typeof document !== "undefined" && !document.getElementById("th-codeblock-css")) {
  const s = document.createElement("style");
  s.id = "th-codeblock-css";
  s.textContent = `.th-codeblock-pre{scrollbar-width:none;-ms-overflow-style:none}.th-codeblock-pre::-webkit-scrollbar{width:0;height:0;display:none}`;
  document.head.appendChild(s);
}
export function CodeBlock({ code = "", label, copyable = true, maxHeight, style }) {
  const [copied, setCopied] = React.useState(false);
  const preRef = React.useRef(null);
  const copy = () => { try { navigator.clipboard.writeText(code); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const copyBtn = copyable && (
    <Button
      variant="ghost"
      size="sm"
      icon={copied ? "ri-check-line" : "ri-file-copy-line"}
      onClick={copy}
      aria-label="复制"
      style={{ color: copied ? "var(--th-teal-600)" : "var(--color-fg-muted)" }}
    />
  );
  return (
    <div style={{ background: "var(--th-bg)", border: "var(--th-border-card)", borderRadius: "var(--th-radius-sm)", overflow: "hidden", ...style }}>
      {label && (
        <div style={{ height: 34, padding: "0 8px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--color-border)", background: "var(--th-white)" }}>
          <span style={{ fontSize: 12, color: "var(--color-fg-muted)", fontFamily: "var(--th-font-ui)" }}>{label}</span>
          {copyBtn}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <pre ref={preRef} className="th-codeblock-pre" style={{ margin: 0, padding: label ? "14px 16px" : "14px 40px 14px 16px", fontFamily: "var(--th-font-mono)", fontSize: 13, lineHeight: 1.7, color: "var(--color-fg)", overflow: "auto", maxHeight }}>{code}</pre>
        <Scrollbar targetRef={preRef} axis="y" reveal="hover" />
        <Scrollbar targetRef={preRef} axis="x" reveal="hover" />
        {!label && <div style={{ position: "absolute", top: 8, right: 8 }}>{copyBtn}</div>}
      </div>
    </div>
  );
}
```

## codeblock.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="CodeBlock" subtitle="IBM Plex Mono 代码块 — 可选头部标签 + 复制按钮" viewport="700x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;display:flex;flex-direction:column;gap:16px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { CodeBlock } = window.TokenHubDesignSystem_019e20;
const curl = 'curl http://localhost:3000/v1/chat/completions \\\n  -H "Authorization: Bearer sk-****" \\\n  -d \'{"model": "deepseek-v3", "messages": []}\'';
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <CodeBlock label="cURL" code={curl} />
    <CodeBlock code={'BASE_URL=http://localhost:3000/v1'} />
  </div>
);
</script>
</body>
</html>
```
