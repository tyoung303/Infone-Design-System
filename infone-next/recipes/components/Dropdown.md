# Dropdown 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Dropdown.d.ts

```typescript
import * as React from "react";
export interface DropdownItem {
  key?: string;
  label?: string;
  /** Remix Icon class, e.g. "ri-edit-line" */
  icon?: string;
  /** Pink destructive-action styling. */
  danger?: boolean;
  disabled?: boolean;
  /** Renders a hairline divider instead of a row. */
  divider?: boolean;
  onSelect?: () => void;
}
export interface DropdownProps {
  /** Anchor element. Defaults to a "⋮" ghost icon button. */
  trigger?: React.ReactNode;
  items?: DropdownItem[];
  /** Menu edge alignment relative to trigger. @default "left" */
  align?: "left" | "right";
  /** Fires with the picked item's key (or label). */
  onSelect?: (key: string) => void;
  /** Render with the menu already open (demos). @default false */
  defaultOpen?: boolean;
  /** Render the menu in document.body so table/scroll containers cannot clip it. @default true */
  portal?: boolean;
  /** 默认「更多操作」幽灵图标钮尺寸：`sm`=28px、`md`=32px。@default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function Dropdown(props: DropdownProps): JSX.Element;
```

## Dropdown.jsx

```jsx
/* Dropdown.jsx — keyboard-operable action menu anchored to a button. */
if (typeof document !== "undefined" && !document.getElementById("th-menu-css")) {
  const s = document.createElement("style");
  s.id = "th-menu-css";
  s.textContent = `@keyframes th-menu-in{from{transform:translateY(-4px) scale(.98);opacity:0}to{transform:none;opacity:1}}.th-menu-trigger:focus-visible,.th-menu-item:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}.th-menu-item:hover,.th-menu-item:focus{background:var(--th-gray-50)!important}@media(max-width:600px),(pointer:coarse){.th-menu-trigger{min-width:44px!important;min-height:44px!important}.th-menu-item{min-height:44px!important}}`;
  document.head.appendChild(s);
}
export function Dropdown({ trigger, items = [], align = "left", onSelect, defaultOpen = false, portal = true, size = "md", style }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [menuPos, setMenuPos] = React.useState(null);
  const ref = React.useRef(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const uid = React.useId();
  const menuId = `${uid}-menu`;
  const enabledItems = items.filter((it) => !it.divider && !it.disabled);
  const focusTrigger = () => (triggerRef.current || ref.current?.querySelector(":scope > button"))?.focus();
  const close = (restore = false) => { setOpen(false); if (restore) requestAnimationFrame(focusTrigger); };
  const focusItem = (index) => {
    const nodes = menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])');
    if (!nodes?.length) return;
    nodes[(index + nodes.length) % nodes.length].focus();
  };
  const updateMenuPosition = () => {
    const el = triggerRef.current || ref.current?.querySelector(":scope > button");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Right-align via `right` (not `left` + translateX): the th-menu-in keyframe
    // animates `transform` to `none`, which would wipe out any translateX and let
    // the menu slide off-screen. Anchoring with `right` keeps it pinned.
    setMenuPos(align === "right"
      ? { top: rect.bottom + 6, right: window.innerWidth - rect.right }
      : { top: rect.bottom + 6, left: rect.left });
  };
  const show = (last = false) => { updateMenuPosition(); setOpen(true); requestAnimationFrame(() => { updateMenuPosition(); focusItem(last ? enabledItems.length - 1 : 0); }); };
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target) && (!menuRef.current || !menuRef.current.contains(e.target))) close(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  React.useEffect(() => {
    if (!open || !portal) return;
    const h = () => updateMenuPosition();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => { window.removeEventListener("resize", h); window.removeEventListener("scroll", h, true); };
  }, [open, portal, align]);
  const pick = (it) => { if (it.disabled) return; close(true); it.onSelect?.(); onSelect?.(it.key ?? it.label); };
  const triggerProps = {
    ref: triggerRef, className: "th-menu-trigger", type: "button", "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": menuId,
    onClick: () => open ? close(true) : show(),
    onKeyDown: (e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(e.key === "ArrowUp"); } },
  };
  const triggerNode = trigger
    ? React.cloneElement(trigger, { ...triggerProps, ref: undefined, className: [trigger.props.className, triggerProps.className].filter(Boolean).join(" ") })
    : <button {...triggerProps} aria-label="更多操作" style={{ width: size === "sm" ? 28 : 32, height: size === "sm" ? 28 : 32, padding: 0, border: 0, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "var(--color-fg-muted)", background: open ? "var(--th-gray-50)" : "transparent", cursor: "pointer" }}><i className="ri-more-2-line" aria-hidden="true" style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, lineHeight: 1, fontWeight: "normal" }} /></button>;
  const onMenuKeyDown = (e) => {
    const nodes = [...menuRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')];
    const current = nodes.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    if (e.key === "Tab") { close(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? nodes.length - 1 : e.key === "ArrowDown" ? current + 1 : current - 1;
    focusItem(next);
  };
  const menu = open && (
        <div ref={menuRef} id={menuId} role="menu" onKeyDown={onMenuKeyDown} style={{ position: portal ? "fixed" : "absolute", top: portal ? menuPos?.top : "calc(100% + 6px)", ...(portal ? { left: align === "right" ? undefined : menuPos?.left, right: align === "right" ? menuPos?.right : undefined } : { [align === "right" ? "right" : "left"]: 0 }), zIndex: "var(--z-dropdown)", minWidth: 160, padding: 6, background: "var(--th-white)", border: "var(--th-border-card)", borderRadius: "var(--th-radius-sm)", boxShadow: "var(--th-shadow-soft)", transformOrigin: "top", animation: "th-menu-in .16s var(--th-ease)" }}>
          {items.map((it, i) => it.divider
            ? <div key={i} role="separator" style={{ height: 1, margin: "6px 4px", background: "var(--color-border)" }} />
            : (
              <button className="th-menu-item" type="button" role="menuitem" tabIndex={-1} aria-disabled={it.disabled || undefined} key={it.key ?? it.label} onClick={() => pick(it)}
                style={{ width: "100%", height: 32, padding: "0 10px", border: 0, borderRadius: "var(--th-radius-xs)", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13, whiteSpace: "nowrap", cursor: it.disabled ? "not-allowed" : "pointer", opacity: it.disabled ? 0.5 : 1, color: it.danger ? "var(--color-danger-fg)" : "var(--color-fg)", background: "transparent", transition: "background .15s" }}>
                {it.icon && <i className={it.icon} aria-hidden="true" style={{ fontSize: 14 }} />}
                {it.label}
              </button>
            ))}
        </div>
      );
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", fontFamily: "var(--th-font-cn)", ...style }}>
      {triggerNode}
      {portal && typeof ReactDOM !== "undefined" ? ReactDOM.createPortal(menu, document.body) : menu}
    </div>
  );
}
```

## dropdown.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Dropdown" subtitle="操作菜单 — sm=28px / md=32px" viewport="700x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;height:212px;padding:24px 26px;display:flex;gap:28px;align-items:flex-start;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}.group{display:flex;flex-direction:column;gap:8px}.label{color:var(--color-fg-muted);font-size:12px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Dropdown, Button } = window.TokenHubDesignSystem_019e20;
const items = [
  { label: "编辑", icon: "ri-edit-line" },
  { label: "复制密钥", icon: "ri-file-copy-line" },
  { label: "重置", icon: "ri-reset-left-line", disabled: true },
  { divider: true },
  { label: "删除", icon: "ri-delete-bin-line", danger: true },
];
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <div className="group"><span className="label">sm · 28px</span><Dropdown size="sm" items={items} defaultOpen /></div>
    <div className="group"><span className="label">md · 32px</span><Dropdown items={items} /></div>
    <div className="group"><span className="label">自定义触发器 · sm</span><Dropdown items={items} trigger={<Button variant="secondary" size="sm" icon="ri-arrow-down-s-line" iconPosition="right">更多操作</Button>} /></div>
  </div>
);
</script>
</body>
</html>
```
