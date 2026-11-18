# Popconfirm 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Popconfirm.d.ts

```typescript
import * as React from "react";
export interface PopconfirmProps {
  /** Trigger element. */
  children: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** @default "确定" */
  okText?: string;
  /** @default "取消" */
  cancelText?: string;
  /** Red confirm button + warning icon. @default true */
  danger?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** @default "top" */
  placement?: "top" | "bottom";
  style?: React.CSSProperties;
}
export function Popconfirm(props: PopconfirmProps): JSX.Element;
```

## Popconfirm.jsx

```jsx
import { Button } from "./Button";

/* Popconfirm.jsx — inline confirm bubble for destructive actions (delete key, revoke).
   No leading icon: the bubble is already anchored to the button the user just
   pressed, and the destructive confirm button carries the danger color — a
   warning glyph in front of the copy was a third signal for the same fact.
   `danger` still maps to Button variant="danger" semantics. */
export function Popconfirm({ children, title, description, okText = "确定", cancelText = "取消", danger = true, onConfirm, onCancel, placement = "top", style }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const pos = placement === "bottom" ? { top: "calc(100% + 8px)" } : { bottom: "calc(100% + 8px)" };
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", ...style }}>
      <span onClick={() => setOpen((v) => !v)} style={{ display: "inline-flex" }}>{children}</span>
      {open && (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", ...pos, zIndex: 50, width: 240, padding: 12, background: "var(--th-white)", border: "var(--th-border-card)", borderRadius: "var(--th-radius-md)", boxShadow: "var(--th-shadow-soft)", fontFamily: "var(--th-font-cn)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", lineHeight: 1.5 }}>{title}</div>
            {description && <div style={{ fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.5, marginTop: 3 }}>{description}</div>}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <Button variant="secondary" size="sm" onClick={() => { setOpen(false); onCancel?.(); }}>{cancelText}</Button>
            <Button variant={danger ? "danger" : "primary"} size="sm" onClick={() => { setOpen(false); onConfirm?.(); }}>{okText}</Button>
          </div>
        </div>
      )}
    </span>
  );
}
```

## popconfirm.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Popconfirm" subtitle="气泡确认 — 删除密钥、危险操作" viewport="700x260" -->
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
const { Popconfirm, Button } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ display: "flex", gap: 20, paddingTop: 120, alignItems: "center" }}>
    <Popconfirm title="删除此 API Key？" description="删除后调用将立即失效，且无法恢复。" onConfirm={() => {}}>
      <Button variant="secondary" size="sm">删除密钥</Button>
    </Popconfirm>
    <Popconfirm danger={false} title="切换默认模型？" okText="切换" placement="top">
      <Button variant="secondary" size="sm">设为默认</Button>
    </Popconfirm>
  </div>
);</script>
</body>
</html>
```
