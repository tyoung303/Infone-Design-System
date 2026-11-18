# Divider 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Divider.d.ts

```typescript
import * as React from "react";
export interface DividerProps {
  /** Optional centered label (horizontal only). */
  children?: React.ReactNode;
  /** @default false */
  vertical?: boolean;
  /** @default false */
  dashed?: boolean;
  style?: React.CSSProperties;
}
export function Divider(props: DividerProps): JSX.Element;
```

## Divider.jsx

```jsx
/* Divider.jsx — hairline separator, horizontal (optional inline label) or vertical. */
export function Divider({ children, vertical = false, dashed = false, style }) {
  const line = { borderTop: `${dashed ? "1px dashed" : "1px solid"} var(--th-gray-100)`, flex: 1, height: 0 };
  if (vertical) return <span style={{ display: "inline-block", width: 0, alignSelf: "stretch", minHeight: 14, borderLeft: `${dashed ? "1px dashed" : "1px solid"} var(--th-gray-100)`, margin: "0 12px", ...style }} />;
  if (!children) return <div style={{ ...line, flex: "none", width: "100%", margin: "16px 0", ...style }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0", ...style }}>
      <span style={line} />
      <span style={{ fontFamily: "var(--th-font-cn)", fontSize: 12, color: "var(--th-gray-300)", whiteSpace: "nowrap" }}>{children}</span>
      <span style={line} />
    </div>
  );
}
```

## divider.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Divider" subtitle="分割线 — 水平 / 带文字 / 垂直 / 虚线" viewport="700x220" -->
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
const { Divider } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ fontFamily: "var(--th-font-cn)", fontSize: 13, color: "var(--th-gray-600)" }}>
    <span>调用量统计</span>
    <Divider />
    <span>费用明细</span>
    <Divider dashed>更早的记录</Divider>
    <div style={{ display: "flex", alignItems: "center" }}>
      <span>编辑</span><Divider vertical /><span>复制</span><Divider vertical /><span style={{ color: "var(--color-danger-fg)" }}>删除</span>
    </div>
  </div>
);</script>
</body>
</html>
```
