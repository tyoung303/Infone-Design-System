# VendorFilter 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## VendorFilter.d.ts

```typescript
export interface VendorFilterItem {
  key: string;
  label: string;
  count: number;
  icon?: string;
  iconColor?: string;
}
export interface VendorFilterProps {
  vendors: VendorFilterItem[];
  active?: string;
  /** Control height. sm=28px for table/filter rows, md=32px for relaxed panels. @default "md" */
  size?: "sm" | "md";
  onChange?: (key: string) => void;
  onReset?: () => void;
}
export function VendorFilter(props: VendorFilterProps): JSX.Element;
```

## VendorFilter.jsx

```jsx
import { Button } from "./Button";

/* VendorFilter.jsx — 2-col vendor chip grid with counts, brand-tinted active state. */
export function VendorFilter({ vendors = [], active, size = "md", onChange, onReset }) {
  const chipH = size === "sm" ? 28 : 32;
  return (
    <div style={vfStyles.wrap}>
      <div style={vfStyles.head}>
        <h2 style={vfStyles.title}>筛选</h2>
        {onReset && <Button variant="link" size="sm" onClick={onReset}>重置</Button>}
      </div>
      <div style={vfStyles.groupH}>供应商</div>
      <div style={vfStyles.grid}>
        {vendors.map((v) => {
          const isActive = v.key === active;
          return (
            <button key={v.key} type="button" onClick={() => onChange?.(v.key)} style={{
              ...vfStyles.chip,
              height: chipH,
              fontSize: size === "sm" ? 12 : 12.5,
              background: isActive ? "var(--th-teal-50)" : "var(--th-white)",
              borderColor: isActive ? "var(--th-teal-100)" : "var(--color-border)",
              color: isActive ? "var(--th-teal-700)" : "var(--color-fg)",
              fontWeight: isActive ? 500 : 400,
            }}>
              {v.icon && <i className={v.icon} style={{ color: v.iconColor || "currentColor", fontSize: 14 }} />}
              <span style={vfStyles.lab}>{v.label}</span>
              <span style={{ ...vfStyles.count, background: isActive ? "var(--th-teal-100)" : "var(--th-gray-50)", color: isActive ? "var(--th-teal-700)" : "var(--color-fg-muted)" }}>{v.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
const vfStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14, fontFamily: "var(--th-font-cn)" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 15, fontWeight: 600, margin: 0 },
  groupH: { fontSize: 13, color: "var(--color-fg-muted)", padding: "0 4px" },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 8 },
  chip: { height: 32, padding: "0 10px", borderRadius: "var(--th-radius-sm)", border: "0.5px solid", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", overflow: "hidden", transition: "background .15s ease, border-color .15s ease, color .15s ease" },
  lab: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" },
  count: { fontVariantNumeric: "tabular-nums", fontSize: 11, padding: "1px 6px", borderRadius: 4, marginLeft: "auto" },
};
```

## vendor-filter.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Vendor filter" subtitle="供应商筛选 chip 组，支持 sm=28px / md=32px" viewport="280x360" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:232px;background:var(--th-white);border:0.5px solid var(--color-border);border-radius:8px;margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { VendorFilter } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [active, setActive] = React.useState("all");
  return (
    <div className="panel" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{color:"var(--color-fg-muted)",fontSize:12,marginBottom:-8}}>sm · 表格筛选 · 28px</div>
      <VendorFilter size="sm" active={active} onChange={setActive} onReset={() => setActive("all")} vendors={[
        { key: "all", label: "全部供应商", count: 14 },
        { key: "Anthropic", label: "Anthropic", count: 5, icon: "ri-anthropic-fill", iconColor: "var(--color-fg)" },
        { key: "OpenAI", label: "OpenAI", count: 3, icon: "ri-openai-fill" },
      ]} />
      <div style={{color:"var(--color-fg-muted)",fontSize:12,marginBottom:-8}}>md · 筛选面板 · 32px</div>
      <VendorFilter active={active} onChange={setActive} onReset={() => setActive("all")} vendors={[
        { key: "all", label: "全部供应商", count: 14 },
        { key: "Anthropic", label: "Anthropic", count: 5, icon: "ri-anthropic-fill", iconColor: "var(--color-fg)" },
        { key: "OpenAI", label: "OpenAI", count: 3, icon: "ri-openai-fill" },
        { key: "DeepSeek", label: "DeepSeek", count: 2, icon: "ri-cpu-line", iconColor: "var(--color-fg)" },
      ]} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
