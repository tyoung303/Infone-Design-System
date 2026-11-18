# RadioGroup 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## RadioGroup.d.ts

```typescript
export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}
export interface RadioGroupProps {
  label?: string;
  value?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  disabled?: boolean;
}
export function RadioGroup(props: RadioGroupProps): JSX.Element;
```

## RadioGroup.jsx

```jsx
/* RadioGroup.jsx — vertical radio list, brand-filled dot when selected. */
export function RadioGroup({ label, value, options = [], onChange, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--th-font-cn)" }}>
      {label && <span style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{label}</span>}
      {options.map((o) => {
        const checked = o.value === value;
        const itemDisabled = disabled || o.disabled;
        return (
          <label key={o.value} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: itemDisabled ? "not-allowed" : "pointer", opacity: itemDisabled ? 0.5 : 1, fontSize: 13, color: "var(--color-fg)" }}>
            <span
              onClick={() => !itemDisabled && onChange?.(o.value)}
              style={{
                width: 16, height: 16, borderRadius: 9999, flexShrink: 0,
                border: checked ? "1px solid var(--th-teal-500)" : "0.5px solid var(--color-border)",
                background: "var(--th-white)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "border-color .15s ease",
              }}
            >{checked && <span style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--th-teal-500)" }} />}</span>
            {o.label}
          </label>
        );
      })}
    </div>
  );
}
```

## radio-group.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Radio group" subtitle="18px dot — brand-blue fill when selected" viewport="260x160" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { RadioGroup } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [v, setV] = React.useState("all");
  return (
    <div className="panel">
      <RadioGroup label="可调用模型" value={v} onChange={setV} options={[
        { value: "all", label: "全部模型" },
        { value: "openai", label: "OpenAI 系列" },
        { value: "custom", label: "自定义" },
      ]} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
