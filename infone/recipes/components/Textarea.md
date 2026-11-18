# Textarea 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Textarea.d.ts

```typescript
export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Visible line count before content scrolls. @default 4 */
  rows?: number;
  hint?: string;
  error?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function Textarea(props: TextareaProps): JSX.Element;
```

## Textarea.jsx

```jsx
import { Scrollbar } from "./Scrollbar";

/* Textarea.jsx — multi-line TextField sibling with the shared overlay Scrollbar. */
export function Textarea({ label, placeholder, value, onChange, rows = 4, hint, error, disabled, style }) {
  const [focus, setFocus] = React.useState(false);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      textareaRef.current?.dispatchEvent(new Event("scroll"));
    });
    return () => cancelAnimationFrame(frame);
  }, [rows, value]);

  const handleChange = (event) => {
    onChange?.(event);
    requestAnimationFrame(() => event.target.dispatchEvent(new Event("scroll")));
  };

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--th-font-cn)", ...style }}>
      {label && <span style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{label}</span>}
      <div style={{
        position: "relative", minHeight: "var(--th-ctl-h-lg)",
        borderRadius: "var(--th-radius-sm)",
        border: `0.5px solid ${error ? "var(--color-danger-solid)" : focus ? "var(--color-accent)" : "var(--color-border)"}`,
        background: disabled ? "var(--th-bg)" : "var(--th-white)",
        boxShadow: focus ? "var(--th-ring)" : "none",
        transition: "border-color var(--th-dur-1) var(--th-ease), box-shadow var(--th-dur-1) var(--th-ease)",
      }}>
        <textarea
          ref={textareaRef} className="th-textarea-view"
          value={value} onChange={handleChange} placeholder={placeholder} disabled={disabled} rows={rows}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            display: "block", boxSizing: "border-box", width: "100%", minHeight: "var(--th-ctl-h-lg)",
            resize: "vertical", overflowY: "auto", padding: "var(--th-space-1) var(--th-space-6) var(--th-space-1) var(--th-space-4)",
            border: "none", borderRadius: "inherit", background: "transparent", outline: "none",
            fontSize: "var(--th-text-base)", lineHeight: 1.5, fontFamily: "var(--th-font-cn)", color: "var(--color-fg)",
          }}
        />
        <Scrollbar targetRef={textareaRef} axis="y" reveal="hover" />
      </div>
      {(hint || error) && <span style={{ fontSize: 11, color: error ? "var(--color-danger-fg)" : "var(--color-fg-subtle)" }}>{error || hint}</span>}
    </label>
  );
}

if (typeof document !== "undefined" && !document.getElementById("th-textarea-css")) {
  const style = document.createElement("style");
  style.id = "th-textarea-css";
  style.textContent = ".th-textarea-view{scrollbar-width:none;-ms-overflow-style:none}.th-textarea-view::-webkit-scrollbar{width:0;height:0;display:none}";
  document.head.appendChild(style);
}
```

## 绘制规范

- 默认 `rows=4`，但纵向缩放的最小高度固定为 `--th-ctl-h-lg`，最小状态必须完整显示一行正文。
- 输入区字号使用 `--th-text-base`、行高 `1.5`；边框、圆角、焦点环和动效分别使用 `--color-border`、`--th-radius-sm`、`--th-ring`、`--th-dur-1` 与 `--th-ease`。
- 内容高度超过可视区域时隐藏原生滚动条，并调用 `Scrollbar targetRef={textareaRef}`。滑块浮在右缘且不占用文字布局宽度，禁止在 `Textarea` 内重新绘制另一套滑块。
- 右侧内边距使用 `--th-space-6` 为浮层滑块留出安全区；用户仍可通过原生 `resize: vertical` 调整高度。

## textarea.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Textarea" subtitle="Multi-line input — same focus ring + hint/error as Text field" viewport="320x180" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:272px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Textarea } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [v, setV] = React.useState("密钥仅在创建时显示一次。\n请妥善保存。\n如有遗失，请重新生成。\n旧密钥将立即失效。");
  return <div className="panel"><Textarea label="备注" rows={2} value={v} onChange={(e) => setV(e.target.value)} /></div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
