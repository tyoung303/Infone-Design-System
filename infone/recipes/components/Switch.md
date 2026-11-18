# Switch 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Switch.d.ts

```typescript
export interface SwitchProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Required when label is omitted. */
  "aria-label"?: string;
}
export function Switch(props: SwitchProps): JSX.Element;
```

## Switch.jsx

```jsx
/* Switch.jsx — native checkbox semantics with a 36x20 token-bound switch track. */
export function Switch({ label, checked, onChange, disabled, "aria-label": ariaLabel }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: 13, fontFamily: "var(--th-font-cn)", color: "var(--color-fg)" }}>
      <span style={{ width: 36, height: 20, position: "relative", flex: "none" }}>
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) => onChange?.(event.target.checked)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: "inherit" }}
        />
        <span aria-hidden="true" style={{ display: "block", width: 36, height: 20, borderRadius: 999, background: checked ? "var(--color-accent)" : "var(--th-gray-100)", position: "relative", boxShadow: focused ? "var(--th-ring)" : "none", transition: "background var(--th-dur-1) var(--th-ease), box-shadow var(--th-dur-1) var(--th-ease)", pointerEvents: "none" }}>
          <span style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: 999, background: "var(--th-white)", boxShadow: "var(--th-shadow-soft)", transition: "left var(--th-dur-1) var(--th-ease)" }} />
        </span>
      </span>
      {label}
    </label>
  );
}
```

## switch.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Switch" subtitle="36x20 toggle track — brand-blue fill when on" viewport="240x100" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;display:flex;flex-direction:column;gap:12px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Switch } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(false);
  return (
    <div className="panel">
      <Switch label="自动续费" checked={a} onChange={setA} />
      <Switch label="邮件通知" checked={b} onChange={setB} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
