# ModelDetailModal 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## ModelDetailModal.d.ts

```typescript
export interface ModelDetailEndpoint {
  name: string;
  path: string;
  method: string;
}
export interface ModelDetailPrice {
  label: string;
  value: string;
}
export interface ModelDetailModalProps {
  open: boolean;
  name: string;
  vendorIcon?: string;
  vendorColor?: string;
  description?: string;
  endpoints: ModelDetailEndpoint[];
  /** @default "按量计费" */
  billingLabel?: string;
  prices: ModelDetailPrice[];
  /** @default "USD" */
  currency?: "USD" | "CNY";
  onCurrencyChange?: (c: "USD" | "CNY") => void;
  onClose?: () => void;
}
export function ModelDetailModal(props: ModelDetailModalProps): JSX.Element;
```

## ModelDetailModal.jsx

```jsx
/* ModelDetailModal.jsx — model marketplace detail dialog: info / API endpoints / grouped pricing (with currency toggle). */
import { Modal } from "./Modal";
import { SectionCard } from "./SectionCard";
import { Segmented } from "./Segmented";
import { Tag } from "./Tag";

export function ModelDetailModal({ open, name, vendorIcon = "ri-cpu-line", vendorColor = "var(--color-fg)", description, endpoints = [], billingLabel = "按量计费", prices = [], currency = "USD", onCurrencyChange, onClose }) {
  return (
    <Modal open={open} title="模型详情" width={640} onClose={onClose}>
      <div style={mdStyles.modelSummary}>
        <div style={{ ...mdStyles.vicon, color: vendorColor }}><i className={vendorIcon} aria-hidden="true" /></div>
        <div>
          <div style={mdStyles.lockup}>
            <span style={mdStyles.modelName}>{name}</span>
          </div>
          <span style={mdStyles.modelMeta}>模型详情与接口价格</span>
        </div>
      </div>

      <SectionCard embedded icon="ri-information-line" title="基本信息" subtitle="模型的详细描述和基本特性">
        <div style={mdStyles.infoBlock}>{description || "暂无模型描述"}</div>
      </SectionCard>

      <SectionCard embedded icon="ri-link" title="API 端点" subtitle="模型支持的接口端点信息">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {endpoints.map((endpoint, index) => (
            <div key={`${endpoint.name}-${endpoint.path}`} style={{ ...mdStyles.epRow, borderTop: index === 0 ? "none" : "0.5px solid var(--color-border)" }}>
              <span style={mdStyles.epDot} />
              <span style={mdStyles.epName}>{endpoint.name}：</span>
              <span style={mdStyles.epPath}>{endpoint.path}</span>
              <span style={mdStyles.epMethod}>{endpoint.method}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        embedded
        icon="ri-coin-line"
        title="分组价格"
        subtitle="不同用户分组的价格信息"
        actions={<Segmented size="sm" options={[{ label: "$ USD", value: "USD" }, { label: "¥ CNY", value: "CNY" }]} value={currency} onChange={onCurrencyChange} />}
      >
        <div style={mdStyles.priceTable}>
          <div style={mdStyles.priceThead}><div>计费类型</div><div>价格摘要</div></div>
          <div style={mdStyles.priceRow}>
            <div><Tag tone="cat2">{billingLabel}</Tag></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {prices.map((price) => (
                <div key={price.label} style={mdStyles.priceLine}>
                  <span style={{ color: "var(--color-fg-muted)" }}>{price.label}</span>
                  <span className="th-nums">{price.value}</span>
                  <span style={mdStyles.priceUnit}>/ 1M Tokens</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </Modal>
  );
}
const mdStyles = {
  modelSummary: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "0.5px solid var(--color-border)" },
  lockup: { display: "flex", alignItems: "center", gap: 12 },
  vicon: { width: 36, height: 36, flexShrink: 0, borderRadius: "var(--th-radius-sm)", background: "var(--th-white)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  modelName: { fontSize: "var(--th-text-md)", fontWeight: 700, color: "var(--color-fg)", fontFamily: "var(--th-font-mono)" },
  modelMeta: { display: "block", marginTop: 2, fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)" },
  infoBlock: { fontSize: "var(--th-text-base)", color: "var(--color-fg-muted)" },
  epRow: { display: "flex", alignItems: "center", gap: 8, minWidth: 0, padding: "10px 0", fontSize: "var(--th-text-base)" },
  epDot: { width: 6, height: 6, borderRadius: "var(--th-radius-full)", background: "var(--th-teal-500)", flexShrink: 0 },
  epName: { color: "var(--color-fg)", flexShrink: 0 },
  epPath: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--th-font-mono)", color: "var(--color-fg)" },
  epMethod: { marginLeft: "auto", flexShrink: 0, fontSize: "var(--th-text-2xs)", color: "var(--color-fg-muted)", fontFamily: "var(--th-font-mono)" },
  priceTable: { border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", overflow: "hidden" },
  priceThead: { display: "grid", gridTemplateColumns: "1fr 2fr", padding: "6px 12px", background: "var(--th-bg)", fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)" },
  priceRow: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, padding: "10px 12px", borderTop: "0.5px solid var(--color-border)" },
  priceLine: { display: "flex", alignItems: "baseline", gap: 8, fontSize: "var(--th-text-base)" },
  priceUnit: { color: "var(--color-fg-muted)", fontSize: "var(--th-text-2xs)" },
};
```

## model-detail-modal.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Model detail modal" subtitle="Info / API endpoints / grouped pricing with currency toggle" viewport="680x520" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;display:flex;align-items:center;justify-content:center;height:520px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { ModelDetailModal, Button } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [open, setOpen] = React.useState(true);
  const [currency, setCurrency] = React.useState("USD");
  return (
    <div className="panel">
      {!open && <Button onClick={() => setOpen(true)}>查看详情</Button>}
      <ModelDetailModal
        open={open} onClose={() => setOpen(false)}
        name="gpt-5.5" vendorIcon="ri-openai-fill"
        endpoints={[{ name: "openai", path: "/v1/chat/completions", method: "POST" }, { name: "openai-response", path: "/v1/responses", method: "POST" }]}
        prices={[{ label: "输入价格", value: currency === "USD" ? "$5.0000" : "¥36.0000" }, { label: "补全价格", value: currency === "USD" ? "$40.0000" : "¥288.0000" }]}
        currency={currency} onCurrencyChange={setCurrency}
      />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
