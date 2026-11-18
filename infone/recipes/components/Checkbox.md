# Checkbox 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Checkbox.d.ts

```typescript
export interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Mixed state for hierarchical and select-all controls. */
  indeterminate?: boolean;
   /** Required when label is omitted. */
   "aria-label"?: string;
   style?: React.CSSProperties;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
```

## Checkbox.jsx

```jsx
/* Checkbox.jsx — native checkbox semantics with a token-bound visual box. */
export function Checkbox({ label, checked, onChange, disabled, indeterminate = false, "aria-label": ariaLabel, style }) {
  const inputRef = React.useRef(null);
  const pointerFocusRef = React.useRef(false);
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, lineHeight: 1, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: 13, fontFamily: "var(--th-font-cn)", color: "var(--color-fg)", ...style }}>
      <span style={{ position: "relative", width: 14, height: 14, flex: "0 0 14px", display: "inline-flex", alignItems: "center" }}>
        <input
          ref={inputRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) => onChange?.(event.target.checked)}
          onMouseDown={() => { pointerFocusRef.current = true; }}
          onFocus={() => setFocused(!pointerFocusRef.current)}
          onMouseUp={() => { pointerFocusRef.current = false; }}
          onBlur={() => setFocused(false)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: "inherit" }}
        />
        <span aria-hidden="true" style={{
           width: 14, height: 14, boxSizing: "border-box", borderRadius: 2,
          border: checked || indeterminate ? "1px solid var(--color-accent)" : "0.5px solid var(--color-border)",
          background: checked || indeterminate ? "var(--color-accent)" : "var(--th-white)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          boxShadow: focused ? "var(--th-ring)" : "none",
          transition: "background var(--th-dur-1) var(--th-ease), border-color var(--th-dur-1) var(--th-ease), box-shadow var(--th-dur-1) var(--th-ease)",
          pointerEvents: "none",
        }}
        >
           {checked && <i className="ri-check-line" style={{ fontSize: 12, lineHeight: 1, color: "var(--color-cta-fg)" }} />}
          {!checked && indeterminate && <span style={{ width: 7, height: 2, borderRadius: 1, background: "var(--color-cta-fg)" }} />}
        </span>
      </span>
      {label && <span style={{ minWidth: 0, overflow: "hidden" }}>{label}</span>}
    </label>
  );
}
```

## checkbox.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Checkbox" subtitle="18px box — brand-blue fill, check glyph" viewport="240x120" -->
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
const { Checkbox } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(false);
  const [c, setC] = React.useState(false);
  return (
    <div className="panel">
      <Checkbox label="记住此设备" checked={a} onChange={setA} />
      <Checkbox label="未选中" checked={c} onChange={setC} />
      <Checkbox label="已禁用" checked={b} onChange={setB} disabled />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
