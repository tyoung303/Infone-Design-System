# CopyField 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## CopyField.d.ts

```typescript
import * as React from "react";
export interface CopyFieldProps {
  value?: string;
  /** Small muted label above the field. */
  label?: string;
  /** Masks the middle of the value with an eye toggle — for API keys. @default false */
  secret?: boolean;
  /** 控制高度两档：`sm`=28px 紧凑、`md`=32px 松弛。@default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function CopyField(props: CopyFieldProps): JSX.Element;
```

## CopyField.jsx

```jsx
/* CopyField.jsx — single-line copyable value: API key / endpoint URL. Optional secret masking. */
export function CopyField({ value = "", label, secret = false, size = "md", style }) {
  const [copied, setCopied] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const copy = () => { try { navigator.clipboard.writeText(value); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const shown = secret && !revealed ? value.slice(0, 6) + "••••••••" + value.slice(-4) : value;
  const iconBtn = (icon, onClick, title, active) => (
    <button onClick={onClick} title={title} style={{ appearance: "none", border: "none", background: "transparent", cursor: "pointer", padding: 4, borderRadius: 6, display: "inline-flex", fontSize: 13, color: active ? "var(--th-teal-600)" : "var(--color-fg-muted)", transition: "color .15s" }}>
      <i className={icon} />
    </button>
  );
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", ...style }}>
      {label && <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 6 }}>{label}</div>}
      <div style={{ height: size === "sm" ? 28 : 32, padding: "0 6px 0 12px", display: "flex", alignItems: "center", gap: 4, background: "var(--th-white)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)" }}>
        <span style={{ flex: 1, fontFamily: "var(--th-font-mono)", fontSize: size === "sm" ? 12 : 13, color: "var(--color-fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shown}</span>
        {secret && iconBtn(revealed ? "ri-eye-off-line" : "ri-eye-line", () => setRevealed(!revealed), revealed ? "隐藏" : "显示")}
        {iconBtn(copied ? "ri-check-line" : "ri-file-copy-line", copy, "复制", copied)}
      </div>
    </div>
  );
}
```

## copyfield.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="CopyField" subtitle="单行可复制值 — sm=28px / md=32px" viewport="700x240" -->
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
const { CopyField } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <CopyField size="sm" label="sm · 接口地址" value="http://localhost:3000/v1/chat/completions" />
    <CopyField label="API 密钥" value="sk-Xk92mPqL7vN3wRt8aB5cD1eF6gH0jZ4y" secret />
  </div>
);
</script>
</body>
</html>
```
