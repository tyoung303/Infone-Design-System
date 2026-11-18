# Descriptions 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Descriptions.d.ts

```typescript
import * as React from "react";
export interface DescriptionItem { label: React.ReactNode; value: React.ReactNode; /** Columns this item spans. */ span?: number; }
export interface DescriptionsProps {
  items: DescriptionItem[];
  /** @default 2 */
  columns?: number;
  title?: React.ReactNode;
  /** Row rhythm. @default "comfortable" */
  density?: "comfortable" | "compact";
  style?: React.CSSProperties;
}
export function Descriptions(props: DescriptionsProps): JSX.Element;
```

## Descriptions.jsx

```jsx
/* Descriptions.jsx — label/value detail grid (model detail, account info).
   density: "comfortable" (default) | "compact". */
export function Descriptions({ items = [], columns = 2, title, density = "comfortable", style }) {
  const compact = density === "compact";
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", ...style }}>
      {title && <div style={{ fontSize: "var(--th-text-md)", fontWeight: 600, color: "var(--th-gray-900)", marginBottom: compact ? 8 : 12 }}>{title}</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: compact ? "8px 24px" : "12px 32px" }}>
        {items.map((it, i) => (
          <div key={i} style={{ gridColumn: it.span ? `span ${it.span}` : undefined, minWidth: 0 }}>
            <div style={{ fontSize: "var(--th-text-xs)", color: "var(--th-gray-300)", marginBottom: compact ? 2 : 4 }}>{it.label}</div>
            <div className="th-nums" style={{ fontSize: "var(--th-text-base)", color: "var(--th-gray-900)", lineHeight: compact ? 1.5 : 1.6, overflowWrap: "break-word" }}>{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## descriptions.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Descriptions" subtitle="描述列表 — 模型详情、账户信息" viewport="700x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Descriptions, Tag } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Descriptions title="模型详情" columns={3} items={[
      { label: "模型 ID", value: <span style={{ fontFamily: "var(--th-font-mono)", fontSize: 12 }}>deepseek-v3</span> },
      { label: "上下文长度", value: "128K" },
      { label: "状态", value: <Tag tone="cat2">可用</Tag> },
      { label: "输入价格", value: "¥2.00 / 百万 tokens" },
      { label: "输出价格", value: "¥8.00 / 百万 tokens" },
      { label: "更新时间", value: "2026-07-12" },
      { label: "能力", value: "函数调用 · JSON 模式 · 前缀续写", span: 3 },
    ]} />
  </div>
);</script>
</body>
</html>
```
