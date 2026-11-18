# ModelPriceCard 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## ModelPriceCard.d.ts

```typescript
export interface ModelPrice {
  label: string;
  value: string;
}
export interface ModelPriceCardProps {
  /** Remix Icon class for the vendor logo tile */
  vendorIcon?: string;
  vendorColor?: string;
  name: string;
  prices: ModelPrice[];
  /** @default "按量计费" */
  billingLabel?: string;
  selected?: boolean;
  onToggleSelect?: () => void;
  onCopy?: () => void;
  onView?: () => void;
}
export function ModelPriceCard(props: ModelPriceCardProps): JSX.Element;
```

## ModelPriceCard.jsx

```jsx
/* ModelPriceCard.jsx — model marketplace card: vendor tile, price lines, billing tag, select+copy actions. */
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Tag } from "./Tag";

export function ModelPriceCard({ vendorIcon = "ri-cpu-line", vendorColor = "var(--color-fg)", name, prices = [], billingLabel = "按量计费", selected = false, onToggleSelect, onCopy, onView }) {
  return (
    <article style={mpStyles.card}>
      <div style={mpStyles.actions}>
        <Button variant="ghost" size="sm" icon="ri-file-copy-line" onClick={onCopy} aria-label="复制 endpoint" />
        <Checkbox checked={selected} onChange={onToggleSelect} aria-label={`选择 ${name}`} />
      </div>
      <div style={{ ...mpStyles.vicon, color: vendorColor }}><i className={vendorIcon} /></div>
      <div style={mpStyles.body}>
        <div style={mpStyles.nameRow}>
          <h3 style={mpStyles.name}>{name}</h3>
          <Tag tone="cat2">{billingLabel}</Tag>
        </div>
        {prices.map((p) => (
          <div key={p.label} style={mpStyles.priceLine}>
            <span style={mpStyles.priceLab}>{p.label}</span>
            <span style={mpStyles.priceVal}>{p.value}</span>
            <span style={mpStyles.priceUnit}>/ 1M Tokens</span>
          </div>
        ))}
        <div style={mpStyles.bottom}>
          <Button size="sm" icon="ri-eye-line" onClick={onView}>查看</Button>
        </div>
      </div>
    </article>
  );
}
const mpStyles = {
  card: { position: "relative", background: "var(--th-white)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-md)", padding: "20px 70px 16px 22px", display: "flex", gap: 16, fontFamily: "var(--th-font-cn)" },
  actions: { position: "absolute", top: 16, right: 14, display: "flex", alignItems: "center", gap: 6 },
  vicon: { flexShrink: 0, width: 56, height: 56, borderRadius: "var(--th-radius-md)", background: "var(--th-white)", border: "1px solid var(--th-gray-50)", boxShadow: "var(--th-shadow-card)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginTop: 4 },
  body: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  nameRow: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  name: { fontFamily: "var(--th-font-mono)", fontSize: 18, fontWeight: 700, color: "var(--color-fg)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3, minWidth: 0 },
  priceLine: { display: "flex", alignItems: "baseline", gap: 8, fontSize: 13, color: "var(--color-fg)", whiteSpace: "nowrap" },
  priceLab: { color: "var(--color-fg-muted)", flexShrink: 0 },
  priceVal: { fontVariantNumeric: "tabular-nums", color: "var(--color-fg)" },
  priceUnit: { color: "var(--color-fg-muted)", fontSize: 12 },
  bottom: { marginTop: 20, paddingTop: 0, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8 },
};
```

## model-price-card.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Model price card" subtitle="Vendor tile + price lines + billing tag, select/copy actions" viewport="420x240" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:376px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { ModelPriceCard } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [sel, setSel] = React.useState(false);
  return (
    <div className="panel">
      <ModelPriceCard
        vendorIcon="ri-anthropic-fill" vendorColor="var(--color-fg)"
        name="claude-opus-4-7"
        prices={[{ label: "输入价格", value: "$4.5000" }, { label: "补全价格", value: "$20.0000" }]}
        selected={sel} onToggleSelect={() => setSel((v) => !v)}
      />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
