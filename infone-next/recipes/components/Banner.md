# Banner 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Banner.d.ts

```typescript
export type BannerTone = "info" | "success" | "warning" | "danger";
export interface BannerProps {
  /** @default "info" */
  tone?: BannerTone;
  title: string;
  description?: string;
  /** Optional trailing action, e.g. a Button */
  action?: React.ReactNode;
  onClose?: () => void;
}
export function Banner(props: BannerProps): JSX.Element;
```

## Banner.jsx

```jsx
/* Banner.jsx — persistent inline alert (page/section level), distinct from the auto-dismiss Toast.
   Use for form-submit errors, system notices, degraded-service warnings — anything that should
   stay visible until the user dismisses it or the underlying condition clears.
*/
const TH_BANNER_TONES = {
  info:    { bg: "var(--color-info-bg)", fg: "var(--color-info-fg)", icon: "ri-information-line" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-fg)", icon: "ri-checkbox-circle-line" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-fg)", icon: "ri-alert-line" },
  danger:  { bg: "var(--color-danger-bg)", fg: "var(--color-danger-fg)", icon: "ri-close-circle-line" },
};
export function Banner({ tone = "info", title, description, action, onClose }) {
  const t = TH_BANNER_TONES[tone] || TH_BANNER_TONES.info;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: "var(--th-radius-sm)", background: t.bg, fontFamily: "var(--th-font-cn)" }}>
      <i className={t.icon} style={{ color: t.fg, fontSize: 14, lineHeight: "20px", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: "20px", color: t.fg }}>{title}</span>
        {description && <span style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{description}</span>}
      </div>
      {action}
      {onClose && (
        <button type="button" onClick={onClose} aria-label="关闭" style={{ appearance: "none", border: "none", background: "transparent", color: t.fg, opacity: 0.6, cursor: "pointer", fontSize: 14, flexShrink: 0, display: "inline-flex" }}>
          <i className="ri-close-line" />
        </button>
      )}
    </div>
  );
}
```

## banner.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Banner" subtitle="Persistent inline alert — info/success/warning/danger, stays until dismissed" viewport="440x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:392px;display:flex;flex-direction:column;gap:12px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Banner } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <Banner tone="warning" title="渠道 deepmap 响应延迟升高" description="过去 10 分钟平均延迟 2.4s，已自动降级到备用渠道" onClose={() => {}} />
      <Banner tone="danger" title="令牌保存失败" description="名称已存在，请更换后重试" />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
