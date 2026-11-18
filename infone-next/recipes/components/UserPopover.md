# UserPopover 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## 绘制规范

`UserPopover` 是挂在 `TopNav` 用户触发器上的账户信息浮层，不是模态框，也不是页面卡片。

- **结构**：顶部为头像、姓名、角色和退出操作；中部为用户 ID、用户名、账户状态、最近登录四行信息；底部为可选的“管理账户信息”操作。
- **容器**：白色 `--color-surface-raised`，外框使用 `--th-border-card`，圆角使用唯一浮层档 `--th-radius-lg`（8px），浮起阴影使用 `--th-shadow-soft`；禁止自定义阴影、14px/12px 圆角和裸色值。
- **尺寸与间距**：桌面宽度 360px，窄屏宽度为 `视口宽度 - 16px`；内边距 12px，区块间距 12px，触发器与浮层间距 8px；操作热区至少 44px，退出按钮可用 28px 高的紧凑控件。
- **定位**：使用触发器 `getBoundingClientRect()` 的 fixed 坐标，优先向下展示；底部空间不足时翻转到触发器上方，并保持距视口边缘至少 8px。
- **颜色**：头像只使用 `--color-surface-selected` 与 `--color-accent`；状态使用 `--color-surface-quiet` 与 `--color-success-fg`；退出登录是低强调会话操作，调用 `Button variant="ghost"`，不手写危险色按钮。品牌色不用于静态信息行。
- **交互**：点击浮层外部、按 Escape 关闭；滚动和 resize 重新定位；所有按钮定义 hover、active 和 `:focus-visible`，焦点环统一使用 `--th-ring`，hover 使用 `--color-row-hover`，不得降低文字对比度。
- **动效**：仅使用 `.th-in-overlay` 语义，时长取 `--th-dur-1/2/3`；遵守 `prefers-reduced-motion: reduce`，不使用弹簧库和常驻动画。
- **无障碍**：浮层使用 `role="dialog"` 和 `aria-label="用户账户信息"`；触发器使用 `aria-haspopup="dialog"` 并同步 `aria-expanded`；退出按钮提供明确的 `aria-label`。

设计系统中已经有该组件，原有实现和规范存在漂移；以上规则是本次统一后的 canonical 绘制规范。

## UserPopover.d.ts

```typescript
import * as React from "react";
export interface UserPopoverUser {
  name?: string;
  id?: string;
  role?: string;
  lastLogin?: string;
}
export interface UserPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  user?: UserPopoverUser;
  onClose?: () => void;
  onLogout?: () => void;
  onManageAccount?: () => void;
}
export function UserPopover(props: UserPopoverProps): JSX.Element | null;
```

## UserPopover.jsx

```jsx
import { Button } from "./Button";
import { Divider } from "./Divider";
import { StatusChip } from "./StatusChip";

/* UserPopover.jsx — account popover anchored to a trigger element's rect. */
export function UserPopover({ open, anchorEl, user, onClose, onLogout, onManageAccount }) {
  const [pos, setPos] = React.useState(null);
  const cardRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!open || !anchorEl) return;
    const update = () => {
      const r = anchorEl.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 16);
      const height = cardRef.current?.offsetHeight || 280;
      const top = r.bottom + 8 + height > window.innerHeight ? Math.max(8, r.top - height - 8) : r.bottom + 8;
      setPos({ top, left: Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8), width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open, anchorEl]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !pos) return null;
  const u = user || {};
  const name = u.name || "user";
  const id = u.id || "";
  const role = u.role || "普通用户";
  const last = u.lastLogin || "";
  const initial = (name || "U").charAt(0).toUpperCase();

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: "var(--z-nav)", background: "transparent" }} onMouseDown={onClose} />
      <div ref={cardRef} className="th-user-popover" role="dialog" aria-label="用户账户信息" style={{ ...upStyles.card, top: pos.top, left: pos.left, width: pos.width }} onMouseDown={(e) => e.stopPropagation()}>
        <header style={upStyles.head}>
          <span style={upStyles.avatar}>{initial}</span>
          <div style={upStyles.identity}>
            <div style={upStyles.name}>{name}</div>
            <div style={upStyles.role}>{role}</div>
          </div>
          <Button variant="ghost" size="sm" icon="ri-logout-box-r-line" onClick={onLogout} aria-label="退出登录">
            退出
          </Button>
        </header>
        <div style={{ margin: "14px 0" }}><Divider /></div>
        <div style={upStyles.body}>
          {id && <UPRow icon="ri-id-card-line" label="用户 ID" value={id} />}
          <UPRow icon="ri-user-line" label="用户名" value={name} />
          <UPRow icon="ri-shield-check-line" label="账户状态" value={<StatusChip tone="success">已激活</StatusChip>} />
          {last && <UPRow icon="ri-time-line" label="最近登录" value={last} />}
        </div>
        <div style={{ margin: "14px 0" }}><Divider /></div>
        <button type="button" className="th-user-popover-action" style={upStyles.manageBtn} onClick={onManageAccount}>
          <span style={upStyles.manageLeft}><i className="ri-settings-3-line" /><span>管理账户信息</span></span>
          <i className="ri-arrow-right-s-line" style={upStyles.rowIcon} />
        </button>
      </div>
    </>
  );
}

function UPRow({ icon, label, value }) {
  return (
    <div style={upStyles.row}>
      <span style={upStyles.rowLeft}><i className={icon} style={upStyles.rowIcon} /><span style={upStyles.rowLabel}>{label}</span></span>
      <span style={upStyles.rowValue}>{value}</span>
    </div>
  );
}

const upStyles = {
  card: {
    position: "fixed", zIndex: "var(--z-dropdown)", boxSizing: "border-box",
    background: "var(--color-surface-raised)", border: "var(--th-border-card)", borderRadius: "var(--th-radius-lg)",
    boxShadow: "var(--th-shadow-soft)", padding: "12px", fontFamily: "var(--th-font-cn)",
  },
  head: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: "50%", background: "var(--color-surface-selected)", color: "var(--color-accent)",
    fontFamily: "var(--th-font-ui)", fontWeight: 600, fontSize: 16,
    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  identity: { display: "flex", flexDirection: "column", minWidth: 0, flex: 1 },
  name: { fontFamily: "var(--th-font-ui)", fontSize: 15, fontWeight: 600, color: "var(--color-fg)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  role: { fontSize: 12, color: "var(--color-fg-muted)", marginTop: 4 },
  divider: { height: 1, background: "var(--color-border)", margin: "14px 0" },
  body: { display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  rowLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
  rowIcon: { color: "var(--color-fg-muted)", fontSize: 14 },
  rowLabel: { fontSize: 13, color: "var(--color-fg)" },
  rowValue: { fontSize: 13, color: "var(--color-fg)", textAlign: "right", fontVariantNumeric: "tabular-nums" },
  statusChip: { display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", background: "var(--color-surface-quiet)", color: "var(--color-success-fg)", borderRadius: "var(--th-radius-xs)", fontSize: 12, whiteSpace: "nowrap" },
  manageBtn: { appearance: "none", width: "100%", minHeight: 44, padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface-inset)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", color: "var(--color-fg)", fontFamily: "var(--th-font-cn)", fontSize: 13, cursor: "pointer" },
  manageLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
};

if (typeof document !== "undefined" && !document.getElementById("user-popover-states")) {
  const s = document.createElement("style"); s.id = "user-popover-states";
  s.textContent = `.th-user-popover-action:hover{background:var(--color-row-hover)!important}.th-user-popover-action:focus-visible{outline:none;box-shadow:var(--th-ring)}@media (prefers-reduced-motion:reduce){.th-user-popover{animation:none!important}}`;
  document.head.appendChild(s);
}
```

## user-popover.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="User popover" subtitle="Account card anchored to a trigger chip — click the demo chip" viewport="420x260" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:40px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { UserPopover } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [open, setOpen] = React.useState(true);
  const ref = React.useRef(null);
  const [anchor, setAnchor] = React.useState(null);
  React.useEffect(() => setAnchor(ref.current), []);
  return (
    <div className="panel">
      <button ref={ref} onClick={() => setOpen(v => !v)} style={{height:28,padding:"0 10px 0 6px",borderRadius:"var(--th-radius-sm)",background:"var(--th-white)",border:"0.5px solid var(--color-border)",display:"inline-flex",alignItems:"center",gap:8,fontSize:12,cursor:"pointer"}}>
        <span style={{width:20,height:20,borderRadius:"50%",background:"var(--th-pink-100)",display:"inline-block"}} />admin<i className="ri-arrow-down-s-line" />
      </button>
       <UserPopover open={open} anchorEl={anchor} user={{ name: "admin", id: "10086", role: "普通用户", lastLogin: "2026-05-25 14:30" }} onClose={() => setOpen(false)} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
