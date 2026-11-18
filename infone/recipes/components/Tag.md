# Tag 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Tag.d.ts

```typescript
import * as React from "react";
export interface TagProps {
  children?: React.ReactNode;
  /** Remix Icon class shown before the label. */
  icon?: string;
  /** neutral = default; cat1…cat6 = fixed CATEGORY tones (vendor, model family, plan tier, region) derived from the chart palette.
   *  teal/pink/blue are compatibility aliases that resolve into the same category palette.
   *  @default "neutral" */
  tone?: "neutral" | "teal" | "pink" | "cat1" | "cat2" | "cat3" | "cat4" | "cat5" | "cat6" | "blue";
  /** Adds an × affordance. @default false */
  closable?: boolean;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export function Tag(props: TagProps): JSX.Element;
```

## Tag.jsx

```jsx
/* Tag.jsx — compact label chip for model tags & filter conditions. Optionally closable.
   cat1…cat6 are CATEGORY tones (vendor, model family, plan tier, region): fixed
   per category, derived from the chart palette, never used for status or links.
   Legacy teal/pink/blue tones are kept as aliases so older pages inherit the
   same chart-category logic instead of brand/status colors. */
const TH_TAG_TONES = {
  neutral: { bg: "var(--th-gray-50)", fg: "var(--th-gray-600)" },
  cat1:    { bg: "var(--th-cat-1-bg)", fg: "var(--th-cat-1-fg)" },
  cat2:    { bg: "var(--th-cat-2-bg)", fg: "var(--th-cat-2-fg)" },
  cat3:    { bg: "var(--th-cat-3-bg)", fg: "var(--th-cat-3-fg)" },
  cat4:    { bg: "var(--th-cat-4-bg)", fg: "var(--th-cat-4-fg)" },
  cat5:    { bg: "var(--th-cat-5-bg)", fg: "var(--th-cat-5-fg)" },
  cat6:    { bg: "var(--th-cat-6-bg)", fg: "var(--th-cat-6-fg)" },
};
TH_TAG_TONES.teal = TH_TAG_TONES.cat2;
TH_TAG_TONES.pink = TH_TAG_TONES.cat3;
TH_TAG_TONES.blue = TH_TAG_TONES.cat1;
export function Tag({ children, icon, tone = "neutral", closable = false, onClose, style }) {
  const t = TH_TAG_TONES[tone] || TH_TAG_TONES.neutral;
  return (
    <span style={{ flexShrink: 0, height: 24, padding: closable ? "0 6px 0 8px" : "0 8px", borderRadius: "var(--th-radius-xs)", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-xs)", lineHeight: 1, background: t.bg, color: t.fg, whiteSpace: "nowrap", ...style }}>
      {icon && <i className={icon} style={{ fontSize: 12 }} />}
      {children}
      {closable && (
        <i className="ri-close-line" onClick={onClose} style={{ fontSize: 12, cursor: "pointer", opacity: 0.6, transition: "opacity var(--th-dur-1) var(--th-ease)" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6} />
      )}
    </span>
  );
}
```

## tag.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Tag" subtitle="模型标签 / 筛选条件 — 图表分类色 + 可删除" viewport="700x160" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Tag } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Tag>默认</Tag>
    <Tag tone="cat1" icon="ri-image-line">视觉</Tag>
    <Tag tone="cat2">函数调用</Tag>
    <Tag tone="cat3">多模态</Tag>
    <Tag tone="cat4">低延迟</Tag>
    <Tag tone="cat5">开源</Tag>
    <Tag tone="cat6" closable>DeepSeek</Tag>
  </div>
);
</script>
</body>
</html>
```
