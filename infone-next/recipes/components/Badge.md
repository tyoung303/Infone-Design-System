# Badge 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Badge.d.ts

```typescript
import * as React from "react";
export interface BadgeProps {
  /** Element the badge attaches to; omit to render the badge standalone. */
  children?: React.ReactNode;
  /** Numeric count; hidden when 0/undefined. */
  count?: number;
  /** Show a plain dot instead of a count. @default false */
  dot?: boolean;
  /** Counts above this render as "max+". @default 99 */
  max?: number;
  /** What kind of attention the count needs — maps to the status -solid rung:
   *  "danger" unread/error, "warning" pending/awaiting approval, "success"
   *  done, "info" informational, "neutral" no urgency.
   *  ("teal"|"blue"|"gray" are deprecated aliases for info/info/neutral.)
   *  @default "danger" */
  tone?: "danger" | "warning" | "success" | "info" | "neutral" | "teal" | "blue" | "gray";
  style?: React.CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
```

## Badge.jsx

```jsx
/* Badge.jsx — count / dot marker, wraps children or renders standalone.

   A badge is a STATUS MARKER, not a decoration and not a control: its color
   says what kind of attention the count needs. So the tone set maps onto the
   status triad's -solid rung (filled shape carrying white 10px/600 text),
   plus one neutral. Never the brand hue — a badge is not clickable, and the
   brand color is reserved for things that are (原则 1). Never --th-blue-*
   either: that is a legacy decorative accent one hue-step from the brand
   blue, so a blue badge reads as "almost the brand color", which is the
   least legible thing a marker can do.
   teal / blue / gray are kept as deprecated aliases so existing call sites
   keep working; new code uses danger / warning / success / info / neutral. */
const TH_BADGE_TONES = {
  danger:  "var(--color-danger-solid)",   // unread, error, must act now
  warning: "var(--color-warning-solid)",  // pending, awaiting approval
  success: "var(--color-success-solid)",  // done, ready to collect
  info:    "var(--color-info-solid)",     // informational count
  neutral: "var(--th-gray-500)",          // no urgency (5.2:1 under white text)
  teal: "var(--color-info-solid)",        // deprecated → info
  blue: "var(--color-info-solid)",        // deprecated → info
  gray: "var(--th-gray-500)",             // deprecated → neutral
};
export function Badge({ children, count, dot = false, max = 99, tone = "danger", style }) {
  const bg = TH_BADGE_TONES[tone] || TH_BADGE_TONES.danger;
  const show = dot || (typeof count === "number" && count > 0);
  const label = typeof count === "number" ? (count > max ? max + "+" : String(count)) : "";
  const mark = show && (
    <span style={dot
      ? { position: children ? "absolute" : "static", top: -2, right: -2, width: 8, height: 8, borderRadius: 999, background: bg, boxShadow: children ? "0 0 0 1.5px var(--th-white)" : "none" }
      : { position: children ? "absolute" : "static", top: -8, right: 0, transform: children ? "translateX(50%)" : "none", minWidth: 16, height: 16, padding: "0 5px", borderRadius: 999, background: bg, color: "var(--color-bg)", fontFamily: "var(--th-font-ui)", fontSize: 10, fontWeight: 600, lineHeight: "16px", textAlign: "center", boxShadow: children ? "0 0 0 1.5px var(--th-white)" : "none", display: "inline-block" }} />
  );
  const markWithText = typeof count === "number" && !dot ? React.cloneElement(mark, {}, label) : mark;
  if (!children) return markWithText || null;
  return <span style={{ position: "relative", display: "inline-flex", ...style }}>{children}{markWithText}</span>;
}
```

## badge.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Badge" subtitle="计数 / 小红点 — 语气由状态决定：未读 danger、待办 warning、已完成 success、纯信息 info、无紧迫 neutral" viewport="760x230" -->
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
const { Badge } = window.TokenHubDesignSystem_019e20;
const box = { width: 36, height: 36, borderRadius: "var(--th-radius-xs)", background: "var(--th-gray-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--th-gray-500)", fontSize: 17 };
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ display: "flex", gap: 32, alignItems: "center" }}>
    <Badge count={5}><span style={box}><i className="ri-notification-3-line" /></span></Badge>
    <Badge count={128}><span style={box}><i className="ri-mail-line" /></span></Badge>
    <Badge dot><span style={box}><i className="ri-message-3-line" /></span></Badge>
    <Badge dot tone="success"><span style={box}><i className="ri-cpu-line" /></span></Badge>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--th-font-cn)", fontSize: 13, color: "var(--th-gray-600)" }}>
      {[["danger", "未读消息", 5], ["warning", "待审批", 12], ["success", "已出账", 3], ["info", "版本更新", 2], ["neutral", "历史归档", 41]].map(([t, label, n]) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{label} <Badge count={n} tone={t} /></span>
      ))}
    </div>
  </div>
);</script>
</body>
</html>
```
