# Steps 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Steps.d.ts

```typescript
import * as React from "react";
export interface StepItem {
  title: string;
  description?: string;
}
export interface StepsProps {
  items?: StepItem[];
  /** 0-based index of the active step; earlier steps render as done. @default 0 */
  current?: number;
  style?: React.CSSProperties;
}
export function Steps(props: StepsProps): JSX.Element;
```

## Steps.jsx

```jsx
/* Steps.jsx — onboarding / flow progress. Steps keep the BRAND color: unlike
   NavRail / Tree / Pager, a step list is not "where am I in the app" but "how
   far along is this task" — it reads as progress, the same thing a Progress bar
   shows, and progress is on the brand's budget (原则 1). So:
      done    = brand-50 tint + brand-600 check
      current = brand-600 disc + white number
      upcoming= faint gray + subtle number
    Connector is brand-400 up to the current step, gray-100 after it. */
export function Steps({ items = [], current = 0, style }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", fontFamily: "var(--th-font-cn)", ...style }}>
      {items.map((it, i) => {
        const done = i < current, active = i === current;
        const circle = done
          ? { background: "var(--th-teal-50)", color: "var(--th-teal-600)" }
          : active
            ? { background: "var(--brand-600)", color: "var(--color-bg)" }
            : { background: "var(--th-gray-50)", color: "var(--color-fg-subtle)" };
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ flex: 1, height: 1, margin: "12px 8px 0", minWidth: 24, background: i <= current ? "var(--th-teal-400)" : "var(--th-gray-100)", transition: "background .2s" }} />}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", maxWidth: 140 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, transition: "background .2s, color .2s", ...circle }}>
                {done ? <i className="ri-check-line" style={{ fontSize: 14 }} /> : i + 1}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--th-teal-600)" : done ? "var(--color-fg)" : "var(--color-fg-muted)" }}>{it.title}</div>
                {it.description && <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 2 }}>{it.description}</div>}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

## steps.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Steps" subtitle="接入引导 / 流程进度 — 完成打勾、当前薄荷色、后续置灰" viewport="700x200" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:28px 32px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Steps } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Steps current={2} items={[
      { title: "创建令牌", description: "生成 API 密钥" },
      { title: "替换地址", description: "指向网关端点" },
      { title: "发起请求", description: "验证连通性" },
      { title: "查看用量", description: "监控消费" },
    ]} />
  </div>
);
</script>
</body>
</html>
```
