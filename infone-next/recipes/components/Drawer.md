# Drawer 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Drawer.d.ts

```typescript
import * as React from "react";
export interface DrawerProps {
  open?: boolean;
  title?: React.ReactNode;
  /** Small muted line under the title. */
  description?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  /** Right-aligned action row pinned to the bottom. */
  footer?: React.ReactNode;
  /** @default 420 */
  width?: number | string;
}
export function Drawer(props: DrawerProps): JSX.Element | null;
```

## Drawer.jsx

```jsx
import { Scrollbar } from "./Scrollbar";

/* Drawer.jsx — right-side slide-in panel: token detail, log detail. Scrim + header/body/footer. */
if (typeof document !== "undefined" && !document.getElementById("th-drawer-css")) {
  const s = document.createElement("style");
  s.id = "th-drawer-css";
  s.textContent = "@keyframes th-drawer-in{from{transform:translateX(48px);opacity:0}to{transform:none;opacity:1}}@keyframes th-drawer-scrim{from{opacity:0}to{opacity:1}}.th-drawer-body{scrollbar-width:none;-ms-overflow-style:none}.th-drawer-body::-webkit-scrollbar{width:0;height:0;display:none}";
  document.head.appendChild(s);
}
export function Drawer({ open, title, description, onClose, children, footer, width = 420 }) {
  const bodyRef = React.useRef(null);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: "var(--z-overlay)", background: "color-mix(in srgb, var(--color-fg) 32%, transparent)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", animation: "th-drawer-scrim var(--th-dur-1) var(--th-ease)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width, maxWidth: "92vw", height: "100%", background: "var(--th-white)", boxShadow: "var(--th-shadow-modal)", display: "flex", flexDirection: "column", fontFamily: "var(--th-font-cn)", animation: "th-drawer-in .28s var(--th-ease-spring)" }}>
        <header style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "0.5px solid var(--color-border)" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-fg)" }}>{title}</div>
            {description && <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 4 }}>{description}</div>}
          </div>
          <button onClick={onClose} style={{ appearance: "none", border: "none", background: "transparent", fontSize: 14, color: "var(--color-fg-muted)", cursor: "pointer" }}><i className="ri-close-line" /></button>
        </header>
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          <div ref={bodyRef} className="th-drawer-body" style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
          <Scrollbar targetRef={bodyRef} axis="y" reveal="hover" />
        </div>
        {footer && <footer style={{ padding: "12px 16px", display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "0.5px solid var(--color-border)", background: "var(--th-bg)" }}>{footer}</footer>}
      </div>
    </div>
  );
}
```

## drawer.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Drawer" subtitle="右侧滑出详情面板 — 令牌详情、日志详情" viewport="700x420" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;height:420px;overflow:hidden}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Drawer, Button, CopyField, StatusChip } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <Drawer open title="令牌详情" description="chat-prod · 创建于 2026-06-02" width={360}
    footer={<React.Fragment><Button variant="ghost" size="sm">关闭</Button><Button size="sm">编辑</Button></React.Fragment>}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <StatusChip tone="success">已启用</StatusChip>
      <StatusChip tone="info">不限额</StatusChip>
    </div>
    <CopyField label="密钥" value="sk-Xk92mPqL7vN3wRt8aB5cD1eF6gH0jZ4y" secret />
  </Drawer>
);
</script>
</body>
</html>
```
