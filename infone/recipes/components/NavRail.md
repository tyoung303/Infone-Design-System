# NavRail 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## 顶部品牌行

logo 与品牌名称所在整行高度使用 `--th-space-12`（48px），与 TopNav 共用同一 token。高度包含底部 0.5px 分隔线，使用 `box-sizing:border-box`、`flex-shrink:0`，内容垂直居中。展开、图标收起、悬停展开及 compact 密度均保持该高度；D+ 组合中与右侧 TopNav 顶部齐平、底部分隔线对齐，不通过改动 logo 或字形尺寸补偿。

## NavRail.d.ts

```typescript
import type { ReactNode } from "react";

export interface NavRailItem {
  key: string;
  icon: string;
  label: string;
  /** Right-aligned adornment inside the item (e.g. a Badge count). */
  trailing?: ReactNode;
  /** Second-level items shown indented under this one. When present, the
   *  parent row becomes a disclosure (click expands/collapses, no navigation
   *  of its own) — give the parent a `key` but expect `onChange` to fire
   *  only for children. Auto-expands on mount if `active` matches a child. */
  children?: NavRailItem[];
}
export interface NavRailGroup {
  title: string;
  items: NavRailItem[];
}
export interface NavRailProps {
  logoSrc?: string;
  /** Wordmark next to the logo. @default "Brand" */
  brand?: string;
  groups: NavRailGroup[];
  active?: string;
  onChange?: (key: string) => void;
  /** Label on the account chip at the bottom. @default "admin" */
  user?: string;
  /** Collapses the rail to 64px (icons only). @default false */
  collapsed?: boolean;
  onToggle?: () => void;
  onUserClick?: () => void;
  onNotifyClick?: () => void;
  /** Extra block above the account band (e.g. an environment switcher). */
  footer?: ReactNode;
  /** Item height 40px → 32px. @default "comfortable" */
  density?: "comfortable" | "compact";
  /** Collapse interaction: "icon" keeps a 64px icon rail in the layout;
   *  "hover" pulls the rail out of the layout (12px edge strip) and floats it
   *  back over the canvas on pointer hover. @default "icon" */
  collapseMode?: "icon" | "hover";
}
/** Page skeleton tier D: 240px full-height rail carrying brand + nav + account.
 *  Never mount alongside TopNav. */
export function NavRail(props: NavRailProps): JSX.Element;
```

## NavRail.jsx

```jsx
import { ScrollArea } from "./ScrollArea";

/* NavRail.jsx — 240px full-height left rail that carries brand, navigation AND
   account in one column (page skeleton tier D). Use INSTEAD of TopNav+Sidebar
   when navigation has only one level: there is no second row of top-level
   domains to switch between, so a 48px top bar would carry nothing but the
   logo and the user chip.

   Not a card: it is the page frame — full height, square corners, a single
   1px right border, no shadow, and the SAME faint gray surface as the canvas
   (--color-surface-nav); only content cards are white. Three stacked bands
   (brand 48px / nav flex:1 / account) keep the brand and account positions
   fixed across tiers.

   Spacing inside the nav is ZERO: items stack flush and groups are separated
   by a full-width hairline, never by a gap.

   density: "comfortable" (default) | "compact" — item height 40px → 32px.

   collapseMode — two collapse interactions, both driven by `collapsed`:
     "icon"  (default) 240px → 64px icon rail; still in the layout.
     "hover" 240px → a 12px edge strip: the rail leaves the layout and floats
             back over the canvas while the pointer is on the strip. For pages
             that need every pixel of width. */
export function NavRail({
  logoSrc, brand = "Brand", groups = [], active, onChange,
  user = "admin", collapsed = false, onToggle, onUserClick, onNotifyClick, footer,
  density = "comfortable", collapseMode = "icon",
}) {
  const compact = density === "compact";
  const [peek, setPeek] = React.useState(false);
  const hidden = collapsed && collapseMode === "hover";
  const mini = collapsed && !hidden;
  const [open, setOpen] = React.useState(() => {
    const s = new Set();
    groups.forEach((g) => g.items.forEach((it) => {
      if (it.children?.some((c) => c.key === active)) s.add(it.key);
    }));
    return s;
  });
  const toggle = (key) => setOpen((s) => {
    const n = new Set(s);
    n.has(key) ? n.delete(key) : n.add(key);
    return n;
  });

  const rail = (floating) => (
    <aside style={{
      ...nrStyles.rail,
      width: mini ? 64 : 240,
      ...(floating ? {
        position: "absolute", left: 0, top: 0, bottom: 0, zIndex: "var(--z-dropdown)",
        borderRight: "none", boxShadow: "var(--th-shadow-modal)",
        transform: peek ? "translateX(0)" : "translateX(-100%)",
        opacity: peek ? 1 : 0, pointerEvents: peek ? "auto" : "none",
        transition: "transform var(--th-dur-2) var(--th-ease), opacity var(--th-dur-1) var(--th-ease)",
      } : null),
    }}>
      <div style={{ ...nrStyles.brand, justifyContent: mini ? "center" : "flex-start", padding: mini ? 0 : "0 16px" }}>
        {logoSrc && <img src={logoSrc} style={{ width: 20, height: 29 }} alt="" />}
        {!mini && <span style={nrStyles.wm}>{brand}</span>}
      </div>
      <ScrollArea style={nrStyles.nav}>
        {groups.map((g, gi) => (
          <div key={g.title} style={{
            ...nrStyles.group,
            padding: mini ? "8px" : compact ? "8px 10px 6px" : "10px 10px 8px",
            borderTop: gi ? "0.5px solid var(--color-divider)" : "none",
          }}>
            {!mini && <div style={nrStyles.heading}>{g.title}</div>}
            <div style={nrStyles.list}>
              {g.items.map((it) => {
                const hasKids = !!it.children?.length;
                const isActive = it.key === active;
                const isOpen = open.has(it.key) && !mini;
                const kidActive = hasKids && it.children.some((c) => c.key === active);
                return (
                  <div key={it.key} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <button
                      type="button"
                      onClick={() => (hasKids ? toggle(it.key) : onChange?.(it.key))}
                      title={it.label}
                      style={{
                        ...nrStyles.item,
                        height: compact ? 32 : 40,
                        background: isActive ? "var(--color-nav-selected)" : "transparent",
                        fontWeight: isActive ? 500 : 400,
                        justifyContent: mini ? "center" : "flex-start",
                        padding: mini ? 0 : "0 10px",
                        width: mini ? 48 : "100%",
                        marginLeft: mini ? "auto" : 0,
                        marginRight: mini ? "auto" : 0,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--color-row-hover)"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <i className={it.icon} style={{ ...nrStyles.icon, color: "var(--color-fg)", opacity: isActive || kidActive ? 1 : 0.75 }} />
                      {!mini && <span style={{ flex: 1, minWidth: 0, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>}
                      {!mini && it.trailing}
                      {!mini && hasKids && (
                        <i className="ri-arrow-down-s-line" style={{ ...nrStyles.icon, fontSize: 12, color: "var(--color-fg-muted)", transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform var(--th-dur-1) var(--th-ease)" }} />
                      )}
                    </button>
                    {hasKids && isOpen && (
                      <div style={nrStyles.sublist}>
                        {it.children.map((c) => {
                          const cActive = c.key === active;
                          return (
                            <button
                              key={c.key} type="button" onClick={() => onChange?.(c.key)} title={c.label}
                              style={{
                                ...nrStyles.subitem,
                                height: compact ? 28 : 32,
                                background: cActive ? "var(--color-nav-selected)" : "transparent",
                                color: cActive ? "var(--color-fg)" : "var(--color-fg-muted)",
                                fontWeight: cActive ? 500 : 400,
                              }}
                              onMouseEnter={(e) => { if (!cActive) e.currentTarget.style.background = "var(--color-row-hover)"; }}
                              onMouseLeave={(e) => { if (!cActive) e.currentTarget.style.background = "transparent"; }}
                            >
                              <span style={{ ...nrStyles.dot, background: cActive ? "var(--color-fg)" : "var(--th-gray-200)" }} />
                              <span style={{ lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
      {footer}
      <div style={{ ...nrStyles.foot, flexDirection: mini ? "column" : "row" }}>
        {!mini && (
          <button type="button" style={nrStyles.chip} onClick={onUserClick} aria-haspopup="dialog">
            <span style={nrStyles.avatar} />
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>{user}</span>
            <i className="ri-arrow-up-s-line" style={{ color: "var(--color-fg-muted)" }} />
          </button>
        )}
        {mini && <span style={{ ...nrStyles.avatar, width: 24, height: 24 }} />}
        <button type="button" style={nrStyles.iconBtn} aria-label="通知" onClick={onNotifyClick}>
          <i className="ri-notification-3-line" />
        </button>
        <button type="button" style={nrStyles.iconBtn} aria-label={collapsed ? "展开导航" : "收起导航"} onClick={onToggle}>
          <i className={collapsed ? "ri-side-bar-line" : "ri-side-bar-fill"} />
        </button>
      </div>
    </aside>
  );

  if (!hidden) return rail(false);
  return (
    <div style={nrStyles.strip} onMouseEnter={() => setPeek(true)} onMouseLeave={() => setPeek(false)}>
      <span style={{ ...nrStyles.handle, opacity: peek ? 0 : 1 }} />
      <button
        type="button" onClick={onToggle} aria-label="展开导航" title="展开导航"
        onFocus={() => setPeek(true)} onBlur={() => setPeek(false)}
        style={nrStyles.stripBtn}
      >
        <i className="ri-side-bar-line" />
      </button>
      {rail(true)}
    </div>
  );
}

const nrStyles = {
  rail: {
    position: "sticky", top: 0, alignSelf: "flex-start",
    height: "100vh", maxHeight: "100vh",
    background: "var(--color-surface-nav)",
    borderRight: "0.5px solid var(--color-border)",
    display: "flex", flexDirection: "column", flexShrink: 0,
    transition: "width var(--th-dur-2) var(--th-ease)",
  },
  strip: { position: "relative", width: 12, flexShrink: 0, alignSelf: "stretch", background: "var(--color-surface-nav)", borderRight: "0.5px solid var(--color-border)" },
  handle: {
    position: "absolute", left: 4, top: 56, bottom: 56, width: 4, borderRadius: 2,
    background: "var(--th-gray-100)", transition: "opacity var(--th-dur-1) var(--th-ease)", pointerEvents: "none",
  },
  stripBtn: {
    position: "absolute", left: 6, top: 12, width: 24, height: 24, borderRadius: "var(--th-radius-sm)",
    appearance: "none", border: "0.5px solid var(--color-border)", background: "var(--th-white)",
    color: "var(--color-fg)", cursor: "pointer", fontSize: 14,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    boxShadow: "var(--th-shadow-card)",
  },
  brand: {
    height: "var(--th-space-12)", boxSizing: "border-box", flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
    borderBottom: "0.5px solid var(--color-divider)",
  },
  wm: { fontFamily: "var(--th-font-brand)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", whiteSpace: "nowrap" },
  nav: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 0, padding: 0 },
  group: { display: "flex", flexDirection: "column", gap: 0 },
  heading: { height: 24, display: "flex", alignItems: "center", padding: "0 10px", marginBottom: 4, fontFamily: "var(--th-font-cn)", fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1, whiteSpace: "nowrap" },
  list: { display: "flex", flexDirection: "column", gap: 0 },
  sublist: { display: "flex", flexDirection: "column", gap: 0, paddingLeft: 24 },
  /* Nav icons sit in a fixed 16px box with line-height 1. A bare <i> inherits
     the button's line-height, so the glyph box is taller than the box the
     label's baseline is centered in — that half-pixel-to-2px mismatch is why
     the icon looked to float above the text. The glyph itself is 14px: at 16
     it out-weighed the 12px label. Every icon in the rail (item, chevron)
     shares this box. */
  icon: { fontSize: 14, width: 16, height: 16, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  subitem: {
    appearance: "none", border: "none", textAlign: "left",
    display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--th-radius-xs)", padding: "0 10px",
    fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-xs)", lineHeight: 1,
    background: "transparent", cursor: "pointer", transition: "background var(--th-dur-1) var(--th-ease)",
  },
  dot: { width: 4, height: 4, borderRadius: "50%", flexShrink: 0 },
  item: {
    appearance: "none", border: "none", textAlign: "left",
    display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--th-radius-xs)",
    fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-xs)", lineHeight: 1, color: "var(--color-fg)",
    background: "transparent", cursor: "pointer", transition: "background var(--th-dur-1) var(--th-ease)",
  },
  foot: { borderTop: "0.5px solid var(--color-border)", padding: 10, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  iconBtn: {
    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
    background: "var(--th-white)", border: "0.5px solid var(--color-border)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    color: "var(--color-fg)", fontSize: 13, cursor: "pointer",
  },
  chip: {
    height: 30, padding: "0 8px 0 6px", borderRadius: "var(--th-radius-sm)", flex: 1, minWidth: 0,
    background: "var(--th-white)", border: "0.5px solid var(--color-border)",
    display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
    fontSize: 12, color: "var(--color-fg)", fontFamily: "var(--th-font-cn)", appearance: "none", cursor: "pointer",
  },
  avatar: { width: 20, height: 20, borderRadius: "50%", background: "var(--th-pink-100)", display: "inline-block", flexShrink: 0 },
};
```

## nav-rail.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="NavRail" subtitle="Full-height left rail — brand + nav + account (skeleton tier D), icon or hover-peek collapse" viewport="360x460" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../../fonts/remixicon.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.frame{height:100vh;display:flex;overflow:hidden}.stub{flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px}.stub span{border-radius:6px;background:var(--th-white);border:var(--th-border-card)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { NavRail, Segmented } = window.TokenHubDesignSystem_019e20;
const GROUPS = [
  { title: "运行", items: [
    { key: "runs", icon: "ri-play-circle-line", label: "运行记录" },
    { key: "queue", icon: "ri-stack-line", label: "任务队列" },
  ]},
  { title: "接入", items: [
    { key: "repo", icon: "ri-git-repository-line", label: "仓库接入", children: [
      { key: "repo-github", label: "GitHub" },
      { key: "repo-gitlab", label: "GitLab" },
      { key: "repo-local", label: "本地仓库" },
    ]},
    { key: "keys", icon: "ri-key-2-line", label: "密钥与令牌" },
  ]},
  { title: "治理", items: [
    { key: "team", icon: "ri-team-line", label: "团队配置" },
    { key: "usage", icon: "ri-pie-chart-line", label: "用量与配额" },
  ]},
];
function Demo() {
  const [active, setActive] = React.useState("runs");
  const [collapsed, setCollapsed] = React.useState(false);
  const [mode, setMode] = React.useState("icon");
  return (
    <div className="frame">
      <NavRail logoSrc="../../../assets/tokenhub-logo.svg" brand="InfOne" groups={GROUPS}
        active={active} onChange={setActive} user="chen@infone.ai" collapseMode={mode}
        collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      {/* try clicking 仓库接入 to see the second-level disclosure */}
      <div className="stub">
        <Segmented size="sm" value={mode} onChange={setMode} options={[
          { value: "icon", label: "icon 收起" },
          { value: "hover", label: "hover 收起" },
        ]} />
        <span style={{flex:1}}></span>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
