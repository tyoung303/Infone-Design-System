# Button 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Button.d.ts

```typescript
import * as React from "react";
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  children?: React.ReactNode;
  /** @default "primary" */
  variant?: "primary" | "secondary" | "ghost" | "link" | "danger";
  /** @default "md" */
  size?: "md" | "sm";
  /** Remix Icon class, e.g. "ri-add-line" */
  icon?: string;
  /** @default "left" */
  iconPosition?: "left" | "right";
  disabled?: boolean;
  /** Shows a spinner in place of the icon and blocks interaction, without the disabled dim. */
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** @default "button" */
  type?: "button" | "submit";
  /** Overrides the size-derived height (px), e.g. to align with an adjacent control of a different height in a toolbar row. */
  height?: number | string;
  style?: React.CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
```

## 使用规则

- `primary`：页面或操作组的最高优先级动作，同一视口默认只出现一个。
- `secondary`：次级入口，例如查看文档、复制、导出、返回。
- `ghost`：低强调动作，例如取消、关闭、工具栏轻量操作。
- `link`：行内跳转或表格行内操作。
- `danger`：明确破坏性确认，例如删除、移除、撤销授权、清空数据；业务页面不要手写红色按钮。
- 表格行内操作优先用 `link` 或 `ghost`，最终确认可在 `Popconfirm` 中使用危险按钮语义。
- 只有图标、没有文字时必须提供可读的 `aria-label`；加载态由组件写入 `aria-busy`。
- 业务需要新样式时先通过现有 props、组合或向后兼容的可选能力扩展 Button，不在页面内复制一套按钮结构。

## Button.jsx

```jsx
/* Button.jsx — TokenHub primary UI action atom.
   CTA-token filled primary, danger solid for destructive confirms, white secondary / transparent ghost / link text.
   Exported for consuming projects via window.<Namespace>.Button.
   Sizing spec: md is a fixed 32px, sm a fixed 28px tall (explicit height, not
   padding-derived) so buttons align predictably next to other UI. Input controls
   (TextField/Select/DateRangePicker/CopyField/InputNumber/Cascader) expose the same
   `size="sm" | "md"` two-tier 28/32px height, so a button and field of the same size
   sit flush in one toolbar row; override with `height` only for exotic custom rows.
*/
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  height,
  style,
  ...buttonProps
}) {
  const isDisabled = disabled || loading;
  const iconOnly = !!icon && !children;
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--th-font-cn)", fontWeight: 500,
    borderRadius: "var(--th-radius-pill)",
    border: "1px solid transparent",
    cursor: isDisabled ? "not-allowed" : "pointer",
    userSelect: "none", whiteSpace: "nowrap", lineHeight: 1,
    transition: "transform var(--th-dur-1) var(--th-ease), box-shadow var(--th-dur-1) var(--th-ease), background var(--th-dur-1) var(--th-ease), opacity var(--th-dur-1) var(--th-ease)",
    opacity: disabled ? 0.5 : 1,
  };
  const sizes = {
    md: { height: 32, padding: "0 16px", fontSize: 13 },
    sm: { height: 28, padding: "0 12px", fontSize: 12 },
  };
  const iconOnlySizes = {
    md: { width: 32, height: 32, padding: 0, fontSize: 14 },
    sm: { width: 28, height: 28, padding: 0, fontSize: 14 },
  };
  const linkSizes = {
    md: { height: 32, padding: "0 6px", fontSize: 13 },
    sm: { height: 28, padding: "0 4px", fontSize: 12 },
  };
  const variants = {
    primary:   { background: "var(--color-cta)", color: "var(--color-cta-fg)" },
    danger:    { background: "var(--color-danger-solid)", color: "var(--color-bg)" },
    secondary: { background: "var(--th-white)", color: "var(--color-fg)", borderColor: "var(--color-border)" },
    ghost:     { background: "transparent", color: "var(--color-fg)" },
    link:      { background: "transparent", color: "var(--color-link)" },
  };

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverStyle = !isDisabled && hover
    ? (variant === "primary" ? { background: "color-mix(in srgb, var(--color-cta) 88%, black)" }
      : variant === "danger" ? { background: "color-mix(in srgb, var(--color-danger-solid) 88%, black)" }
      : variant === "secondary" || variant === "ghost" ? { background: "var(--th-gray-50)" }
      : { opacity: 0.85 })
    : {};

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        ...base,
        ...(iconOnly ? iconOnlySizes[size] : variant === "link" ? linkSizes[size] : sizes[size]),
        ...variants[variant],
        ...hoverStyle,
        transform: active && !isDisabled ? "scale(0.98)" : "none",
        ...(height != null ? { height: isNaN(height) ? height : Number(height) } : null),
        ...style,
      }}
    >
      {loading && <i className="ri-loader-4-line th-spin" aria-hidden="true" />}
      {!loading && icon && iconPosition === "left" && <i className={icon} aria-hidden="true" style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, fontWeight: "normal" }} />}
      {children}
      {!loading && icon && iconPosition === "right" && <i className={icon} aria-hidden="true" style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, fontWeight: "normal" }} />}
    </button>
  );
}
```

## button.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Button" subtitle="按钮 — primary / secondary / ghost / link / danger，sm=28px / md=32px" viewport="760x210" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;width:100%;min-height:100%;padding:24px 26px;display:flex;flex-wrap:wrap;gap:18px;align-items:center;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px;width:calc(100% - 48px)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Button } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <Button>获取秘钥</Button>
      <Button icon="ri-add-line">新建令牌</Button>
      <Button size="sm">充值</Button>
      <Button variant="secondary">查看文档</Button>
      <Button variant="secondary" size="sm" icon="ri-file-copy-line">复制</Button>
      <Button variant="ghost" size="sm">取消</Button>
      <Button variant="danger" size="sm">删除</Button>
      <Button variant="link">了解更多 →</Button>
      <Button disabled>已禁用</Button>
      <Button loading>创建中</Button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
