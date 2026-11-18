# Collapse 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Collapse.d.ts

```typescript
import * as React from "react";
export interface CollapseItem { key?: string; label: React.ReactNode; content: React.ReactNode; /** Right-aligned extra node in the header. */ extra?: React.ReactNode; }
export interface CollapseProps {
  items: CollapseItem[];
  /** Only one panel open at a time. @default false */
  accordion?: boolean;
  defaultOpenKeys?: string[];
  style?: React.CSSProperties;
}
export function Collapse(props: CollapseProps): JSX.Element;
```

## Collapse.jsx

```jsx
/* Collapse.jsx — accordion panels for FAQ / advanced params. */
export function Collapse({ items = [], accordion = false, defaultOpenKeys = [], style }) {
  const [open, setOpen] = React.useState(new Set(defaultOpenKeys));
  const toggle = (k) => setOpen((prev) => {
    const next = new Set(accordion ? [] : prev);
    if (prev.has(k)) next.delete(k); else next.add(k);
    return next;
  });
  return (
    <div style={{ border: "var(--th-border-card)", borderRadius: "var(--th-radius-md)", background: "var(--th-white)", overflow: "hidden", fontFamily: "var(--th-font-cn)", ...style }}>
      {items.map((it, i) => {
        const k = it.key ?? String(i), isOpen = open.has(k);
        return (
          <div key={k} style={{ borderTop: i ? "1px solid var(--th-gray-50)" : "none" }}>
            <button onClick={() => toggle(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "var(--th-gray-900)", textAlign: "left" }}>
              <i className="ri-arrow-right-s-line" style={{ fontSize: 14, color: "var(--color-fg-muted)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .18s var(--th-ease)" }} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.extra}
            </button>
            <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows .22s var(--th-ease)" }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ padding: "0 18px 16px 44px", fontSize: 13, lineHeight: 1.7, color: "var(--th-gray-500)" }}>{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## collapse.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Collapse" subtitle="折叠面板 — FAQ、高级设置" viewport="700x300" -->
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
const { Collapse, StatusChip } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div style={{ margin: 24 }}>
    <Collapse accordion defaultOpenKeys={["1"]} items={[
      { key: "1", label: "如何获取 API Key？", content: "进入「API Keys」页面，点击右上角「创建密钥」。密钥仅在创建时完整展示一次，请妥善保存。" },
      { key: "2", label: "计费方式是怎样的？", extra: <StatusChip tone="info">按量计费</StatusChip>, content: "按输入 / 输出 token 分别计价，每小时汇总一次并从账户余额中扣除。" },
      { key: "3", label: "支持哪些模型？", content: "接入 DeepSeek、Qwen、GLM、Kimi 等主流厂商模型，可在模型广场查看完整列表与价格。" },
    ]} />
  </div>
);</script>
</body>
</html>
```
