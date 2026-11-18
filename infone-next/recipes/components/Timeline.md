# Timeline 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Timeline.d.ts

```typescript
import * as React from "react";
export interface TimelineItem {
  /** Monospace timestamp above the title. */
  time?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Dot color. Omit for the default brand-blue accent; "teal" is the legacy alias value. */
  tone?: "teal" | "gray" | "danger" | "success" | "warning";
}
export interface TimelineProps {
  items: TimelineItem[];
  style?: React.CSSProperties;
}
export function Timeline(props: TimelineProps): JSX.Element;
```

## Timeline.jsx

```jsx
/* Timeline.jsx — vertical event feed (audit log, release notes). */
/* Node ring colors are painted shapes → -solid rung, never -fg. */
const TH_TL_TONES = { teal: "var(--color-accent)", gray: "var(--th-gray-250)", danger: "var(--color-danger-solid)", success: "var(--color-success-solid)", warning: "var(--color-warning-solid)" };
export function Timeline({ items = [], style }) {
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", ...style }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 10, flex: "none" }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, marginTop: 5, flex: "none", background: "var(--th-white)", border: `2px solid ${TH_TL_TONES[it.tone] || TH_TL_TONES.teal}` }} />
            {i < items.length - 1 && <span style={{ width: 0, flex: 1, borderLeft: "1px solid var(--th-gray-100)", margin: "4px 0" }} />}
          </div>
          <div style={{ paddingBottom: i < items.length - 1 ? 22 : 0, minWidth: 0 }}>
            {it.time && <div className="th-nums" style={{ fontSize: 11, color: "var(--th-gray-300)", marginBottom: 2 }}>{it.time}</div>}
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--th-gray-900)", lineHeight: 1.5 }}>{it.title}</div>
            {it.description && <div style={{ fontSize: 12, color: "var(--th-gray-400)", lineHeight: 1.5, marginTop: 3 }}>{it.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## timeline.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Timeline" subtitle="时间轴 — 审计日志、发布记录" viewport="700x320" -->
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
const { Timeline } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Timeline items={[
      { time: "07-20 09:32", title: "创建 API Key「prod-gateway」", description: "操作人：li.wei@infone.ai", tone: "gray" },
      { time: "07-19 18:05", title: "模型 deepseek-v3 价格调整", description: "输出价格 ¥10.00 → ¥8.00 / 百万 tokens", tone: "warning" },
      { time: "07-18 11:47", title: "密钥「test-old」已吊销", tone: "danger" },
      { time: "07-15 10:00", title: "账户充值 ¥2,000.00", tone: "success" },
    ]} />
  </div>
);</script>
</body>
</html>
```
