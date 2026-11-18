# Toast 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Toast.d.ts

```typescript
export type ToastTone = "default" | "success" | "warning" | "danger" | "info";
export interface ToastProps {
  /** @default "default" */
  tone?: ToastTone;
  children: React.ReactNode;
  onClose?: () => void;
  /** ms before auto-dismiss; 0 disables. @default 3200 */
  duration?: number;
}
export function Toast(props: ToastProps): JSX.Element;
```

## Toast.jsx

```jsx
/* Toast.jsx — bottom-anchored notification, auto-dismiss. */
if (typeof document !== "undefined" && !document.getElementById("th-toast-css")) {
  const s = document.createElement("style");
  s.id = "th-toast-css";
  s.textContent = "@keyframes th-toast-in{from{transform:translateY(10px) scale(0.97);opacity:0}to{transform:none;opacity:1}}";
  document.head.appendChild(s);
}
const TH_TOAST_TONES = {
  default: { bg: "var(--color-surface-raised)", fg: "var(--color-fg)", border: "0.5px solid var(--color-border)", icon: "ri-information-line" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-fg)", icon: "ri-checkbox-circle-line" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-fg)", icon: "ri-alert-line" },
  danger:  { bg: "var(--color-danger-bg)", fg: "var(--color-danger-fg)", icon: "ri-close-circle-line" },
  info:    { bg: "var(--color-info-bg)", fg: "var(--color-info-fg)", icon: "ri-information-line" },
};
export function Toast({ tone = "default", children, onClose, duration = 3200 }) {
  React.useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);
  const t = TH_TOAST_TONES[tone] || TH_TOAST_TONES.default;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: "var(--th-radius-md)",
      border: t.border || "0.5px solid transparent",
      background: t.bg, color: t.fg,
      boxShadow: "var(--th-shadow-soft)",
      fontFamily: "var(--th-font-cn)", fontSize: 13, fontWeight: 500,
      animation: "th-toast-in .32s var(--th-ease-spring)",
    }}>
      <i className={t.icon} style={{ fontSize: 14 }} />
      <span>{children}</span>
      {onClose && <button onClick={onClose} style={{ appearance: "none", border: "none", background: "transparent", color: "currentColor", opacity: 0.6, cursor: "pointer", marginLeft: 4, fontSize: 14, display: "inline-flex" }}><i className="ri-close-line" /></button>}
    </div>
  );
}
```

## toast.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Toast" subtitle="Neutral default + soft-tint status notification, auto-dismiss" viewport="420x140" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;display:flex;flex-direction:column;gap:10px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Toast } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <Toast tone="success" duration={0}>令牌创建成功</Toast>
      <Toast tone="default" duration={0}>系统将在后台继续处理</Toast>
      <Toast tone="danger" duration={0}>密钥已失效</Toast>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
