# Skeleton 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Skeleton.d.ts

```typescript
export type SkeletonVariant = "line" | "card" | "avatar" | "row";
export interface SkeletonProps {
  /** @default "line" */
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  /** Number of blocks to repeat. @default 1 */
  count?: number;
  style?: React.CSSProperties;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
```

## Skeleton.jsx

```jsx
/* Skeleton.jsx — shimmering placeholder blocks for loading states. */
export function Skeleton({ variant = "line", width, height, count = 1, style }) {
  const dims = {
    line:   { width: width || "100%", height: height || 14, borderRadius: 6 },
    card:   { width: width || "100%", height: height || 170, borderRadius: "var(--th-radius-md)" },
    avatar: { width: width || 36, height: height || 36, borderRadius: 9999 },
    row:    { width: width || "100%", height: height || 44, borderRadius: "var(--th-radius-sm)" },
  };
  const d = dims[variant] || dims.line;
  return (
    <div style={{ display: "flex", flexDirection: variant === "line" ? "column" : "row", gap: 8, ...style }}>
      {Array.from({ length: count }).map((_, i) => <span key={i} className="th-skel" style={d} />)}
    </div>
  );
}
if (typeof document !== "undefined" && !document.getElementById("th-skel-css")) {
  const s = document.createElement("style");
  s.id = "th-skel-css";
  s.textContent = `.th-skel{display:block;flex-shrink:0;background:linear-gradient(90deg,var(--th-gray-50) 25%,var(--th-gray-100) 37%,var(--th-gray-50) 63%);background-size:400% 100%;animation:th-skel-shimmer 1.6s ease-in-out infinite}@keyframes th-skel-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`;
  document.head.appendChild(s);
}
```

## skeleton.html

```html
<!doctype html>
<!-- @dsCard group="Patterns" name="Loading skeleton" subtitle="Shimmering placeholder blocks — line / row / card / avatar" viewport="360x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:312px;display:flex;flex-direction:column;gap:16px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Skeleton } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton variant="avatar" />
        <Skeleton variant="line" count={2} style={{ flex: 1 }} />
      </div>
      <Skeleton variant="row" count={3} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
