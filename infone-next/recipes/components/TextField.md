# TextField 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## TextField.d.ts

```typescript
export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** @default "text" */
  type?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** Forward a ref to the native input for focus restoration and composite controls. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Additional native input attributes; controlled value/change/type/disabled remain owned by TextField. */
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "disabled" | "placeholder">;
  /** 控制高度两档：`sm`=28px 紧凑、`md`=32px 松弛。@default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function TextField(props: TextFieldProps): JSX.Element;
```

## TextField.jsx

```jsx
/* TextField.jsx — labeled text input with focus ring + error/hint slot. */
export function TextField({ label, placeholder, value, onChange, type = "text", prefix, suffix, hint, error, disabled, inputRef, inputProps, size = "md", style }) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const feedbackId = React.useId();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--th-font-cn)", ...style }}>
      {label && <span style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{label}</span>}
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
        display: "flex", alignItems: "center", gap: 8, height: size === "sm" ? 28 : 32, padding: "0 12px",
        borderRadius: "var(--th-radius-sm)",
        border: `0.5px solid ${error ? "var(--color-danger-solid)" : focus ? "var(--color-accent)" : hover && !disabled ? "var(--color-fg-subtle)" : "var(--color-border)"}`,
        background: disabled ? "var(--th-bg)" : "var(--th-white)",
        boxShadow: focus ? "var(--th-ring)" : "none",
        transition: "border-color .15s ease, box-shadow .15s ease",
      }}>
        {prefix && <span style={{ color: "var(--color-fg-muted)", fontSize: 13 }}>{prefix}</span>}
        <input
          {...inputProps}
          ref={inputRef}
          type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          aria-invalid={error ? true : inputProps?.["aria-invalid"]}
          aria-describedby={(hint || error) ? feedbackId : inputProps?.["aria-describedby"]}
          onFocus={(event) => { setFocus(true); inputProps?.onFocus?.(event); }}
          onBlur={(event) => { setFocus(false); inputProps?.onBlur?.(event); }}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: size === "sm" ? 12 : 13, fontFamily: "var(--th-font-cn)", color: "var(--color-fg)", ...inputProps?.style }}
        />
        {suffix && <span style={{ color: "var(--color-fg-muted)", fontSize: 12 }}>{suffix}</span>}
      </div>
      {(hint || error) && <span id={feedbackId} style={{ fontSize: 11, color: error ? "var(--color-danger-fg)" : "var(--color-fg-subtle)" }}>{error || hint}</span>}
    </label>
  );
}
```

## text-field.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Text field" subtitle="输入框 — sm=28px / md=32px" viewport="360x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;display:flex;flex-direction:column;gap:14px;width:320px}.hint{color:var(--color-fg-muted);font-size:12px;margin-bottom:-8px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { TextField } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [v, setV] = React.useState("production-web");
  return (
    <div className="panel">
      <div className="hint">sm · 表格筛选 · 28px</div>
      <TextField size="sm" label="名称" value={v} onChange={(e) => setV(e.target.value)} />
      <div className="hint">md · 表单字段 · 32px</div>
      <TextField label="预算上限" prefix="¥" suffix="/ 月" type="number" value={100} />
      <TextField label="邮箱" value="not-an-email" error="请输入有效的邮箱地址" />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
