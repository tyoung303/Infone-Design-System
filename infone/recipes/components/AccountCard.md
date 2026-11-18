# AccountCard 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## AccountCard.d.ts

```typescript
export interface AccountCardRowAction {
  label: string;
  onClick?: () => void;
}
export interface AccountCardRow {
  label: string;
  value: string | number;
  icon?: string;
  tint?: string;
  iconColor?: string;
  action?: AccountCardRowAction;
}
export interface AccountCardProps {
  /** @default "ri-bank-card-line" */
  icon?: string;
  title: string;
  rows?: AccountCardRow[];
}
export function AccountCard(props: AccountCardProps): JSX.Element;
```

## AccountCard.jsx

```jsx
import { Button } from "./Button";

/* AccountCard.jsx — 276×170 white card: title row + stacked data rows. */
export function AccountCard({ icon = "ri-bank-card-line", title, rows = [] }) {
  return (
    <article style={{ width: 276, height: 170, borderRadius: 8, background: "var(--th-white)", border: "var(--th-border-card)", boxShadow: "var(--th-shadow-card)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <header style={{ height: 40, padding: "0 14px", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--th-font-cn)", fontWeight: 500, fontSize: 13, borderBottom: "0.5px solid var(--color-border)" }}>
        <i className={icon} style={{ fontSize: 14 }} />
        <span>{title}</span>
      </header>
      {rows.map((row, i) => (
        <div key={i} style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: i === 0 ? "none" : "0.5px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: row.tint || "var(--th-pink-50)", color: row.iconColor || "var(--th-pink-500)" }}>
              <i className={row.icon || "ri-money-cny-circle-line"} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--color-fg)", lineHeight: 1 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{row.value}</span>
            </div>
          </div>
          {row.action && (
            <Button size="sm" height={30} onClick={row.action.onClick}>
              {row.action.label}
            </Button>
          )}
        </div>
      ))}
    </article>
  );
}
```

## account-card.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Account card" subtitle="276×170 white card — title row + stacked data rows" viewport="340x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:26px;display:flex;justify-content:center}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { AccountCard } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <AccountCard
        title="账户余额"
        rows={[
          { label: "可用余额", value: "¥300.00", icon: "ri-money-cny-circle-fill", action: { label: "充值" } },
          { label: "累计消耗", value: "¥1,204.50", icon: "ri-line-chart-line", tint: "var(--brand-50)", iconColor: "var(--brand-600)" },
        ]}
      />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
