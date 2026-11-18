# PageHeader 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

页面标题位于内容区时使用本组件：D 使用 page，D+ 使用 inline。已有 TopNav 时也可通过其 `pageTitle` 展示 15px 紧凑标题；此时省略重复 PageHeader，将元信息、筛选和页面操作放入内容工具栏。PageHeader 现有默认字号、密度和 API 不变；不要把完整 PageHeader 嵌入 TopNav。详见 [TopNav](TopNav.md)。

## PageHeader.d.ts

```typescript
import * as React from "react";
export interface PageHeaderProps {
  title: React.ReactNode;
  /** @deprecated Ignored since density v2 — a page has a main title only. Put
   *  supporting facts in `meta`, warnings in a Banner. */
  description?: React.ReactNode;
  /** Inline stats next to the title, e.g. "共 128 条 · 更新于 14:02". */
  meta?: React.ReactNode;
  /** Tag / StatusChip nodes shown right after the title. */
  tags?: React.ReactNode;
  /** Right-aligned buttons. `children` works the same way. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** @deprecated Ignored — tier D/D+ locate the page through the NavRail. */
  breadcrumb?: React.ReactNode;
  /** Shows a back arrow before the title when provided. */
  onBack?: () => void;
  density?: "comfortable" | "compact";
  /** Vertical room the header claims. "page" — 56px band (44 compact), title
   *  optically centered: use on tier D pages that have NO top bar, where a
   *  tight header would sit crowded against the viewport edge. "inline"
   *  (default) — the tight row, for tier D+ where a 48px TopNav sits above. */
  variant?: "inline" | "page";
  /** Hairline under the header — use when the content below is not a card. */
  divider?: boolean;
  style?: React.CSSProperties;
}
export function PageHeader(props: PageHeaderProps): JSX.Element;
```

## PageHeader.jsx

```jsx
import { Button } from "./Button";

/* PageHeader.jsx — ONE row at the top of a content area: page title, inline
   tags and meta, right-aligned actions. Single line by design.

   No subtitle. A page gets a main title and nothing under it: the explanatory
   second line is where stale restating copy collects, and it pushes the real
   content 40px down. What needs saying goes into `meta` on the same row
   (counts, 更新时间), into a `Banner` when it is a warning, or into the section
   itself. `description` is still accepted and IGNORED so older pages do not break.

   No breadcrumb either — tier D/D+ locate the page through the rail.
   Pass actions as the `actions` prop or as children.

   variant — how much vertical room the header claims:
     "page" (D 档, no top bar) — the header band is 56px tall (44px compact) with
       the title optically centered. Without a 48px nav band above it the title
       would otherwise sit ~23px from the viewport top and the page feels
       crowded at the very edge. Nothing else changes: same 18px/600 title.
     "inline" (D+ 档, a TopNav sits above) — the current tight row: the bar
       already supplies the breathing room, so a tall header would double it. */
export function PageHeader({
  title, description, meta, tags, actions, children,
  breadcrumb, onBack, density = "comfortable", divider = false, variant = "inline", style,
}) {
  const compact = density === "compact";
  const page = variant === "page";
  const right = actions || children;
  return (
    <div style={{
      fontFamily: "var(--th-font-cn)", display: "flex", flexDirection: "column",
      justifyContent: "center",
      minHeight: page ? (compact ? 44 : 56) : undefined,
      gap: compact ? 2 : 3,
      paddingBottom: divider ? (compact ? 6 : 8) : 0,
      borderBottom: divider ? "0.5px solid var(--color-border)" : "none",
      ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {onBack && (
          <Button variant="ghost" size="sm" height={26} icon="ri-arrow-left-line" onClick={onBack} aria-label="返回" style={{ width: 26, padding: 0, flex: "none" }} />
        )}
        <h1 style={{ margin: 0, fontSize: compact ? "var(--th-text-md)" : "var(--th-text-lg)", fontWeight: 600, lineHeight: 1.3, color: "var(--color-fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
        {tags && <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>{tags}</div>}
        {meta && <div className="th-nums" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", minWidth: 0, whiteSpace: "nowrap", overflow: "hidden" }}>{meta}</div>}
        {right && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flex: "none" }}>{right}</div>}
      </div>
    </div>
  );
}
```

## page-header.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="PageHeader" subtitle="页面头 — 单行标题 + 元信息 + 操作，取代问候语区块" viewport="900x330" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;padding:24px;background:var(--th-bg)}.card{background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:var(--th-card-pad)}.wrap{display:flex;flex-direction:column;gap:20px}.cap{font-size:var(--th-text-2xs);color:var(--color-fg-subtle);margin-bottom:6px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { PageHeader, Button, Tag, StatusChip } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="wrap">
    <div>
      <div className="cap">列表页 — 标题 + 元信息 + 主操作</div>
      <PageHeader
        title="令牌管理"
        meta={<><span>共 128 个</span><span>·</span><span>更新于 14:02</span></>}
        divider
        actions={<><Button variant="secondary" size="sm" icon="ri-download-2-line">导出</Button><Button size="sm" icon="ri-add-line">新建令牌</Button></>}
      />
    </div>
    <div>
      <div className="cap">详情页 — 返回 + 状态 + 元信息</div>
      <PageHeader
        title="production-web"
        onBack={() => {}}
        tags={<><StatusChip tone="success">已激活</StatusChip><Tag>全部模型</Tag></>}
        meta={<><span>创建于 2026-05-12</span><span>·</span><span>最近调用 3 分钟前</span></>}
        actions={<Button variant="secondary" size="sm" icon="ri-edit-line">编辑</Button>}
      />
    </div>
    <div className="card" data-density="compact">
      <div className="cap">compact — 卡内小节标题</div>
      <PageHeader density="compact" title="调用明细" meta={<span>近 7 天</span>} actions={<Button variant="ghost" size="sm" icon="ri-refresh-line">刷新</Button>} />
    </div>
  </div>
);</script>
</body>
</html>
```
