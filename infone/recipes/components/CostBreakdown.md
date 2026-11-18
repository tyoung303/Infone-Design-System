# CostBreakdown 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## CostBreakdown.d.ts

```typescript
export interface CostBreakdownItem {
  label: string;
  value: number;
  /** Chart-palette slot for the bar, e.g. "cat-3" or "3" → --th-chart-3, or a
   *  raw token ("--th-chart-7"). Defaults to the row index (1→12). */
  tone?: string;
}
export interface CostBreakdownProps {
  items: CostBreakdownItem[];
  /** @default "¥" */
  currency?: string;
  /** Override the computed sum (e.g. when rows are a top-N subset). */
  total?: number;
  /** @default "comfortable" */
  density?: "comfortable" | "compact";
  /** @default "合计" */
  totalLabel?: string;
}
export function CostBreakdown(props: CostBreakdownProps): JSX.Element;
```

## CostBreakdown.jsx

```jsx
/* CostBreakdown.jsx — where the money went: one row per model/vendor/team
   with a proportion bar, amount and share; the totals row uses the light
   summary surface --color-surface-quiet.
   Bars are DATA, so they take the chart palette (--th-chart-1…12) assigned by
   row index — the same model keeps the same color as its chart series and its
   Tag elsewhere, because the category tones are derived from this same ring.
   They must NOT take --th-cat-N-fg: that is a TEXT color tuned for a 12px
   label, and filled into a 6px bar it reads muddy and arbitrary. A legacy
   tone="cat-3" still resolves to chart-3, so existing call sites keep their
   colors. */
export function CostBreakdown({ items = [], currency = "¥", total, density = "comfortable", totalLabel = "合计" }) {
  const compact = density === "compact";
  const sum = total ?? items.reduce((a, b) => a + (b.value || 0), 0);
  const top = Math.max(1, ...items.map((i) => i.value || 0));
  const fmt = (n) => n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", display: "flex", flexDirection: "column" }}>
      <div className="th-stagger" style={{ display: "flex", flexDirection: "column" }}>
        {items.map((it, i) => {
          const slot = it.tone ? Number(String(it.tone).replace(/\D/g, "")) || (i % 12) + 1 : (i % 12) + 1;
          const bar = it.tone && String(it.tone).startsWith("--") ? `var(${it.tone})` : `var(--th-chart-${Math.min(12, Math.max(1, slot))})`;
          return (
            <div key={it.label} style={{ display: "grid", gridTemplateColumns: "1.4fr 2fr auto auto", alignItems: "center", gap: 12, padding: compact ? "7px 0" : "10px 0", borderTop: i ? "0.5px solid var(--color-border)" : "none" }}>
              <span style={{ fontSize: compact ? "var(--th-text-xs)" : "var(--th-text-base)", color: "var(--color-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
              <span style={{ height: 6, borderRadius: 999, background: "var(--color-data-track)", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: `${((it.value || 0) / top) * 100}%`, borderRadius: 999, background: bar, transition: "width var(--th-dur-3) var(--th-ease-out)" }} />
              </span>
              <span className="th-nums" style={{ fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", textAlign: "right", minWidth: 44 }}>{sum ? Math.round(((it.value || 0) / sum) * 100) : 0}%</span>
              <span className="th-nums" style={{ fontSize: compact ? "var(--th-text-xs)" : "var(--th-text-base)", color: "var(--color-fg)", textAlign: "right", minWidth: 76 }}>{currency}{fmt(it.value || 0)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8, padding: compact ? "8px 10px" : "10px 12px", borderRadius: "var(--th-radius-sm)", background: "var(--color-surface-quiet)" }}>
        <span style={{ fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)" }}>{totalLabel}</span>
        <span className="th-nums" style={{ fontSize: "var(--th-text-md)", fontWeight: 600, color: "var(--color-fg)" }}>{currency}{fmt(sum)}</span>
      </div>
    </div>
  );
}
```

## cost-breakdown.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Cost breakdown" subtitle="成本构成：占比条 + 金额 + 份额，合计行使用浅层摘要背景" viewport="500x330" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:20px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}.panel{width:452px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { CostBreakdown } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <CostBreakdown items={[
        { label: "claude-sonnet-4", value: 4212.4 },
        { label: "gpt-4o-mini", value: 1860.9 },
        { label: "deepseek-v3", value: 642.5 },
        { label: "qwen-max", value: 188.2 },
      ]} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
