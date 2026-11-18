# Tooltip 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Tooltip.d.ts

```typescript
import * as React from "react";
export interface TooltipProps {
  /** Hint text; renders children unwrapped if empty */
  text?: string;
  children?: React.ReactNode;
  /** @default "top" */
  placement?: "top" | "right";
  /** @default true */
  inline?: boolean;
}
export function Tooltip(props: TooltipProps): JSX.Element;
```

## Tooltip.jsx

```jsx
/* Tooltip.jsx — shared truncation / hint tooltip.
   Dark gray-800 background, 12px white text, soft shadow, small arrow.
*/
export function Tooltip({ text, children, placement = "top", inline = true }) {
  const [show, setShow] = React.useState(false);
  if (text == null || text === "") return <>{children}</>;

  const Tag = inline ? "span" : "div";
  return (
    <Tag
      style={{ position: "relative", display: inline ? "inline-flex" : "block", alignItems: "center", maxWidth: "100%", minWidth: 0 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            ...(placement === "top"
              ? { left: "50%", bottom: "calc(100% + 8px)", transform: "translateX(-50%)" }
              : { left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)" }),
            background: "var(--th-gray-800)", color: "var(--color-bg)",
            fontFamily: "var(--th-font-cn)", fontSize: 12, lineHeight: 1.2,
            padding: "7px 10px", borderRadius: 6, whiteSpace: "nowrap", maxWidth: 360,
            pointerEvents: "none", boxShadow: "var(--th-shadow-soft)", zIndex: "var(--z-tooltip)",
          }}
        >{text}</span>
      )}
    </Tag>
  );
}
```

## tooltip.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Tooltip" subtitle="Dark hint bubble — hover to preview" viewport="500x140" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:60px;display:flex;gap:40px;align-items:center;justify-content:center}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Tooltip } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <Tooltip text="令牌 ID：sk-abc123...xyz789">
        <span style={{border:"0.5px solid var(--color-border)",borderRadius:8,padding:"8px 14px",fontSize:13}}>悬停查看完整令牌</span>
      </Tooltip>
      <Tooltip text="右侧提示" placement="right">
        <span style={{border:"0.5px solid var(--color-border)",borderRadius:8,padding:"8px 14px",fontSize:13}}>右侧方向</span>
      </Tooltip>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
