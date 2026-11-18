# SearchBox 组件说明

SearchBox 是关键词搜索的专用输入组件。它复用 TextField 的尺寸、边框、焦点、错误与禁用契约，并补充搜索图标、回车提交、清除、加载反馈和搜索框语义。结构化条件仍使用 Select、Cascader、DateRangePicker 或 VendorFilter，不把 SearchBox 当作通用筛选容器。

## SearchBox.d.ts

```typescript
export interface SearchBoxProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  /** @default "搜索" */
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  /** @default true */
  allowClear?: boolean;
  /** `sm`=28px，用于列表工具栏；`md`=32px，用于表单和详情。@default "md" */
  size?: "sm" | "md";
  autoFocus?: boolean;
  /** Accessible name when no visible label is provided. @default "搜索" */
  "aria-label"?: string;
  style?: React.CSSProperties;
}
export function SearchBox(props: SearchBoxProps): JSX.Element;
```

## SearchBox.jsx

```jsx
import { TextField } from "./TextField";

/* SearchBox.jsx — keyword search specialization built on TextField. */
export function SearchBox({
  label,
  value,
  defaultValue = "",
  onChange,
  onSearch,
  onClear,
  placeholder = "搜索",
  loading = false,
  disabled = false,
  error,
  hint,
  allowClear = true,
  size = "md",
  autoFocus = false,
  "aria-label": ariaLabel = "搜索",
  style,
}) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const inputRef = React.useRef(null);
  const currentValue = controlled ? String(value) : internalValue;
  const iconStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 14, height: 14, fontSize: 14, lineHeight: 1 };
  const suffixBoxStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 24, height: 24 };

  const updateValue = (nextValue) => {
    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };
  const clear = () => {
    if (disabled || loading || !currentValue) return;
    updateValue("");
    onClear?.();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape" && currentValue) {
      event.preventDefault();
      clear();
      return;
    }
    if (event.key === "Enter" && !loading && !disabled && onSearch) {
      event.preventDefault();
      onSearch(currentValue.trim());
    }
  };
  const suffix = loading
    ? (
      <span aria-hidden="true" style={suffixBoxStyle}>
        <i className="ri-loader-4-line th-spin" style={iconStyle} />
      </span>
    )
    : currentValue && allowClear && !disabled
      ? (
        <button type="button" aria-label="清除搜索内容" onMouseDown={(event) => event.preventDefault()} onClick={clear} style={{
          ...suffixBoxStyle, padding: 0,
          border: 0, borderRadius: "var(--th-radius-xs)", background: "transparent", color: "var(--color-fg-muted)", cursor: "pointer",
        }}>
          <i className="ri-close-line" aria-hidden="true" style={iconStyle} />
        </button>
      )
      : null;

  return (
    <TextField
      label={label}
      type="text"
      size={size}
      value={currentValue}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      hint={hint}
      prefix={<i className="ri-search-line" aria-hidden="true" style={iconStyle} />}
      suffix={suffix}
      inputRef={inputRef}
      onChange={(event) => updateValue(event.target.value)}
      inputProps={{
        role: "searchbox",
        "aria-label": label ? undefined : ariaLabel,
        "aria-busy": loading || undefined,
        autoComplete: "off",
        autoFocus,
        enterKeyHint: "search",
        onKeyDown,
        style: { appearance: "none", WebkitAppearance: "none" },
      }}
      style={style}
    />
  );
}
```

## 状态与使用边界

- 默认：空值、搜索图标和简短 placeholder。
- Hover：只加强中性边框，不改变文字颜色。
- Focus：使用 TextField 的品牌焦点边框与 `--th-ring`。
- Filled：显示清除按钮；清除后焦点回到输入框。
- Loading：清除按钮替换为等待图标，输入内容与宽度保持稳定。
- Disabled：使用禁用表面，不显示清除按钮，不响应提交。
- Error：使用 TextField 的 danger 边框和邻近错误说明；错误文案同时说明原因和恢复方式。
- sm 与 md 使用相同状态、行为和 `14×14` 图标；仅控件高度与输入字号按 TextField 尺寸契约变化。
- 清除按钮和等待图标共用 `24×24` 后缀盒；不启用浏览器原生搜索清除控件，避免重复图标和位置跳动。
- 搜索成功、无结果和请求失败后的结果内容属于结果区，由 DataTable、EmptyState 或 Banner 表达；SearchBox 不重复承载这些业务状态。

## search-box.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="SearchBox" subtitle="搜索框 — sm=28px / md=32px，含完整输入状态" viewport="760x600" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>
body{margin:0;background:var(--th-bg)}
.panel{box-sizing:border-box;width:712px;margin:24px;padding:16px;overflow-x:auto;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}
.matrix{display:grid;grid-template-columns:96px repeat(2,minmax(0,1fr));gap:16px;align-items:start;min-width:640px}
.matrix-head{color:var(--color-fg-muted);font-size:12px;font-weight:600}
.state-name{padding-top:7px;color:var(--color-fg-muted);font-size:12px}
@media(max-width:720px){.panel{width:calc(100% - 24px);margin:12px}}
</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { SearchBox } = window.TokenHubDesignSystem_019e20;
function StateRow({ name, props }) {
  return (
    <React.Fragment>
      <span className="state-name">{name}</span>
      <SearchBox {...props} size="sm" />
      <SearchBox {...props} size="md" />
    </React.Fragment>
  );
}
function Demo() {
  return (
    <div className="panel">
      <div className="matrix">
        <span aria-hidden="true"></span>
        <span className="matrix-head">sm · 28px</span>
        <span className="matrix-head">md · 32px</span>
        <StateRow name="默认" props={{ placeholder: "搜索模型" }} />
        <StateRow name="悬停 / 聚焦" props={{ placeholder: "移入或点击查看" }} />
        <StateRow name="已输入" props={{ defaultValue: "DeepSeek V3" }} />
        <StateRow name="加载" props={{ loading: true, defaultValue: "运行记录" }} />
        <StateRow name="禁用" props={{ disabled: true, defaultValue: "不可用条件" }} />
        <StateRow name="错误" props={{ defaultValue: "超时请求", error: "搜索服务暂不可用，请稍后重试" }} />
        <StateRow name="带标签" props={{ label: "资源搜索", hint: "支持名称、ID 或负责人", placeholder: "输入关键词" }} />
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
