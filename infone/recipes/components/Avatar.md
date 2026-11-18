# Avatar 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Avatar.d.ts

```typescript
import * as React from "react";
export interface AvatarProps {
  /** Shows the first character when no src. Empty name falls back to a user icon. */
  name?: string;
  src?: string;
  /** "sm" 24 / "md" 32 / "lg" 40, or an exact pixel number. @default "md" */
  size?: "sm" | "md" | "lg" | number;
  /** @default "pink" (matches the nav user chip) */
  tone?: "pink" | "teal" | "gray";
  style?: React.CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
```

## Avatar.jsx

```jsx
/* Avatar.jsx — circular avatar: image, or first character on the pink-50 tint (matches nav user chip). */
const TH_AVATAR_TONES = {
  pink: { bg: "var(--th-pink-50)", fg: "var(--th-pink-600)" },
  teal: { bg: "var(--th-teal-50)", fg: "var(--th-teal-600)" },
  gray: { bg: "var(--th-gray-50)", fg: "var(--color-fg-muted)" },
};
const TH_AVATAR_SIZES = { sm: 24, md: 32, lg: 40 };
export function Avatar({ name = "", src, size = "md", tone = "pink", style }) {
  const px = typeof size === "number" ? size : (TH_AVATAR_SIZES[size] || 32);
  const t = TH_AVATAR_TONES[tone] || TH_AVATAR_TONES.pink;
  const base = { width: px, height: px, borderRadius: "var(--th-radius-full)", flex: "none", ...style };
  if (src) return <img src={src} alt={name} style={{ ...base, objectFit: "cover" }} />;
  return (
    <span style={{ ...base, display: "inline-flex", alignItems: "center", justifyContent: "center", background: t.bg, color: t.fg, fontFamily: "var(--th-font-cn)", fontWeight: 500, fontSize: Math.round(px * 0.42), textTransform: "uppercase", userSelect: "none" }}>
      {name ? [...name][0] : <i className="ri-user-6-line" style={{ fontSize: Math.round(px * 0.5) }} />}
    </span>
  );
}
```

## avatar.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Avatar" subtitle="圆形头像 — 首字符 / 图片 / 兜底图标，pink / brand-blue / gray 三种底色" viewport="700x160" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;display:flex;gap:18px;align-items:center;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Avatar } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Avatar name="admin" size="sm" />
    <Avatar name="admin" />
    <Avatar name="admin" size="lg" />
    <Avatar name="王" tone="pink" size="lg" />
    <Avatar tone="gray" size="lg" />
  </div>
);
</script>
</body>
</html>
```
