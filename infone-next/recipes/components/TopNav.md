# TopNav 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## 与 NavRail 对齐

TopNav 与 NavRail 顶部 logo / 品牌名称所在整行共用 `--th-space-12`（48px），高度包含底部 0.5px 分隔线，组件自身使用 `box-sizing:border-box` 与 `flex-shrink:0`。两者从同一顶部起点排列，内容垂直居中，底部分隔线处于同一水平线。对齐的是品牌行容器，不是 logo 图形或文字本身的高度；不通过放大 logo、缩放文字或额外上下 padding 补齐。标题、导航项与插槽内容不改变这条高度契约。

## 页面标题

已有 TopNav 的页面可传入 `pageTitle`，在 context 与 tabs 前展示语义化 h1。标题使用 `--th-text-md`（15px）、600 字重、1.3 行高、系统 UI 字体和 `--color-fg`；固定单行，长标题省略并保留完整文本与原生 title 提示。标题所在左组使用剩余宽度，右侧控件不被压缩。顶栏保持 48px，不增加标题带、背景块或选中指示条。

标题进入 TopNav 后，内容区不再重复 PageHeader；元信息、页内搜索、筛选、时间范围和页面主操作仍放内容工具栏。未传 `pageTitle` 时保持原有用法；inline / full 均支持，不改变 NavRail、品牌和账户的职责。

## TopNav.d.ts

```typescript
import * as React from "react";
export interface TopNavItem {
  label: string;
  href?: string;
  /** stable key — passed to onChange instead of the label when present */
  key?: string;
}
export interface TopNavProps {
  /** Required when the bar is mounted ALONE (variant="full") — it is then the
   *  only place the brand appears. Ignored in variant="inline": mounted with a
   *  NavRail the bar must NOT repeat the logo. */
  logoSrc?: string;
  /** @default "Brand" */
  brand?: string;
  /** Optional page heading: compact single-line h1, 15px/600.
   *  Do not repeat the same title in a content-area PageHeader. */
  pageTitle?: string;
  items?: (TopNavItem | string)[];
  /** key (or label) of the active item */
  active?: string;
  /** @default "admin" */
  user?: string;
  onUserClick?: () => void;
  onNotifyClick?: () => void;
  /** fires with the clicked item's key (or label) */
  onChange?: (key: string) => void;
  /**
   * "full"   — standalone 48px bar (tier B): logo + tabs + notify/user chip.
   * "inline" — tier D+: 48px band at the top of the CONTENT column, right of
   *            the NavRail. No logo, no account chip, no glass/shadow.
   * @default "full"
   */
  variant?: "full" | "inline";
  /** Leading slot, before the tabs: project / environment / tenant switcher. */
  context?: React.ReactNode;
  /** Trailing slot after the tabs: domain-level search, filters or status.
   *  Page-level controls stay in PageHeader or the content toolbar. */
  children?: React.ReactNode;
  /** Right group, before (full) or instead of (inline) the account controls —
   *  at most three domain-level controls. Page-level actions stay in PageHeader. */
  actions?: React.ReactNode;
}
export function TopNav(props: TopNavProps): JSX.Element;
```

## TopNav.jsx

```jsx
/* TopNav.jsx — 48px top navigation bar. Two variants:

   variant="full" (default) — the standalone bar for tier B (仅顶栏): logo +
     wordmark on the left, one-level tabs after it, notify + user chip right.
     Surface is the faint nav gray (--color-surface-nav), lightly frosted.

   variant="inline" — tier D+ (`NavRail` + 顶栏): the bar sits INSIDE the
     content column, right of the rail, flush to its top edge. **No logo and no
     user chip** — the rail already carries brand and account; repeating either
     is a violation. No shadow, no rounded corners — just a 48px band on the
     nav surface with a hairline bottom divider.

   The logo rule is the whole difference: mounted ALONE the bar is the only
   place the brand appears, so it always carries logo + wordmark; mounted WITH
   a NavRail it never does.

   The bar carries more than tabs. Three slots take arbitrary content, so
   环境/项目切换、搜索、筛选、域级主操作 all live here instead of being hand-drawn:
     context  — before the tabs (project / environment / tenant switcher)
     children — after the tabs (search field, filter chips, status pill…)
     actions  — right group, before notify + user chip (≤3 controls)
   pageTitle — optional compact 15px/600 h1 before context and tabs, for either
     variant. Omit the duplicate content-area PageHeader when used.
   Page-level controls (time range, page primary button) stay in PageHeader
     or the content toolbar.

   The user chip only fires onUserClick — plug in your own popover (UserPopover).
*/
export function TopNav({
  logoSrc, brand = "Brand", pageTitle, items = [], active, user = "admin",
  onUserClick, onNotifyClick, onChange,
  variant = "full", context, actions, children,
}) {
  const inline = variant === "inline";
  const heading = pageTitle?.trim();
  return (
    <header style={inline ? tnStyles.barInline : tnStyles.bar}>
      <div style={{ ...tnStyles.left, gap: heading ? "var(--space-3)" : (inline ? 24 : 48), ...(heading ? { flex: "1 1 0" } : {}) }}>
        {!inline && (
          <span style={tnStyles.logo}>
            {logoSrc && <img src={logoSrc} style={{ width: 20, height: 29 }} alt="" />}
            <span style={tnStyles.wm}>{brand}</span>
          </span>
        )}
        {heading && <h1 data-topnav-title style={tnStyles.pageTitle} title={heading}>{heading}</h1>}
        {inline && context}
        {items.length > 0 && <nav style={{ ...tnStyles.items, gap: inline ? 28 : 40 }}>
        {items.map((it) => {
          const { label, href, key } = typeof it === "string" ? { label: it } : it;
          const isActive = label === active || (key !== undefined && key === active);
          return (
            <a
              key={key ?? label} href={href || "#"}
              onClick={onChange ? (e) => { e.preventDefault(); onChange(key ?? label); } : undefined}
              style={{
                ...tnStyles.item,
                opacity: isActive ? 1 : 0.72,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {label}
              <span style={{
                ...tnStyles.indicator,
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateX(-50%) scaleX(1)" : "translateX(-50%) scaleX(0.4)",
              }} />
            </a>
          );
        })}
        </nav>}
        {children}
      </div>
      <div style={{ ...tnStyles.right, ...(heading ? { flexShrink: 0 } : {}) }}>
        {actions}
        {!inline && (
          <button type="button" style={tnStyles.iconBtn} aria-label="通知" onClick={onNotifyClick}>
            <i className="ri-notification-3-line" />
          </button>
        )}
        {!inline && (
          <button type="button" style={{ ...tnStyles.userChip, cursor: "pointer" }} onClick={onUserClick} aria-haspopup="dialog">
            <span style={tnStyles.avatar} />
            <span>{user}</span>
            <i className="ri-arrow-down-s-line" style={{ color: "var(--color-fg-muted)" }} />
          </button>
        )}
      </div>
    </header>
  );
}

const barBase = {
  position: "sticky", top: 0, zIndex: "var(--z-nav)",
  height: "var(--th-space-12)", boxSizing: "border-box", width: "100%", flexShrink: 0,
  display: "flex", alignItems: "center", gap: 24,
};

const tnStyles = {
  bar: {
    ...barBase,
    background: "color-mix(in srgb, var(--color-surface-nav) 86%, transparent)",
    borderBottom: "0.5px solid var(--color-divider)",
    backdropFilter: "blur(50px)", WebkitBackdropFilter: "blur(50px)",
    boxShadow: "var(--th-shadow-nav)",
    padding: "0 20px",
  },
  /* tier D+ — no glass, no shadow: it is the top band of the content column,
     on the same nav surface as the rail, divided by a single hairline. */
  barInline: {
    ...barBase,
    background: "var(--color-surface-nav)",
    borderBottom: "0.5px solid var(--color-divider)",
    padding: "0 16px",
  },
  /* logo + nav are ONE left-aligned group: the tabs sit 48px after the wordmark
     and never drift toward the center, whatever the viewport width. */
  left: { display: "flex", alignItems: "center", height: "100%", minWidth: 0, marginRight: "auto" },
  pageTitle: {
    margin: 0, minWidth: 0,
    fontFamily: "var(--th-font-ui)", fontSize: "var(--th-text-md)",
    fontWeight: 600, lineHeight: 1.3, color: "var(--color-fg)",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit", flexShrink: 0 },
  wm: { fontFamily: "var(--th-font-brand)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" },
  items: { display: "flex", alignItems: "center", height: "100%" },
  item: {
    fontFamily: "var(--th-font-ui)", fontWeight: 500, fontSize: 13,
    textDecoration: "none", color: "var(--color-fg)",
    position: "relative", height: "100%", display: "inline-flex", alignItems: "center",
    whiteSpace: "nowrap",
  },
  indicator: {
    position: "absolute", left: "50%", bottom: 0,
    width: "calc(100% + 8px)", height: 2,
    background: "var(--th-teal-500)", borderRadius: "2px 2px 0 0",
    transformOrigin: "center bottom",
    transition: "opacity .2s ease, transform .2s cubic-bezier(0.2, 0.7, 0.2, 1)",
  },
  right: { marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" },
  iconBtn: {
    width: 30, height: 30, borderRadius: "50%",
    background: "var(--th-white)", border: "0.5px solid var(--color-border)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    color: "var(--color-fg)", fontSize: 13,
  },
  userChip: {
    height: 30, padding: "0 10px 0 6px", borderRadius: 6,
    background: "var(--th-white)", border: "0.5px solid var(--color-border)",
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 12, color: "var(--color-fg)", fontFamily: "var(--th-font-cn)", appearance: "none",
  },
  avatar: { width: 20, height: 20, borderRadius: "50%", background: "var(--th-pink-100)", display: "inline-block" },
};
```

## top-navigation.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Top navigation" subtitle="48px 顶栏 — 域级导航、可选 15px 紧凑页面标题" viewport="760x160" catalogHeight="160" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { TopNav } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
    <TopNav
      brand="TokenHub"
      logoSrc="../../../assets/tokenhub-logo.svg"
      active="控制台"
      items={[{ label: "首页" }, { label: "控制台" }, { label: "模型广场" }]}
    />
    <TopNav variant="inline" pageTitle="智能工作台" />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
