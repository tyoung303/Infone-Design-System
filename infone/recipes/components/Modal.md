# Modal 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Modal.d.ts

```typescript
export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  /** Rendered right-aligned in the footer strip — usually cancel + primary Button. */
  footer?: React.ReactNode;
  /** @default 440 */
  width?: number;
  /** @default true */
  closeOnEscape?: boolean;
  /** @default true */
  closeOnOverlayClick?: boolean;
  /** Receives focus after the modal opens. Defaults to the first focusable element. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Receives focus after the modal closes. Defaults to the element focused before opening. */
  returnFocusRef?: React.RefObject<HTMLElement>;
}
export function Modal(props: ModalProps): JSX.Element;
```

## Modal.jsx

```jsx
/* Modal.jsx — accessible dialog with focus containment and responsive bounds. */
if (typeof document !== "undefined" && !document.getElementById("th-modal-css")) {
  const s = document.createElement("style");
  s.id = "th-modal-css";
  s.textContent = `
    @keyframes th-modal-scrim{from{opacity:0}to{opacity:1}}
    @keyframes th-modal-in{from{transform:translateY(10px) scale(.97);opacity:0}to{transform:none;opacity:1}}
    .th-modal-scrim{box-sizing:border-box;padding:24px}
    .th-modal-dialog{max-width:100%;max-height:calc(100dvh - 48px)}
    .th-modal-body{min-height:0;overflow-y:auto;scrollbar-gutter:stable}
    .th-modal-close{width:32px;height:32px;flex:0 0 32px;margin:-7px -8px -7px 8px;border-radius:var(--th-radius-sm)}
    .th-modal-close:hover{color:var(--color-fg)!important;background:var(--color-row-hover)!important}
    @media(max-width:600px){
      .th-modal-scrim{align-items:flex-end!important;padding:12px}
      .th-modal-dialog{width:100%!important;max-height:calc(100dvh - 24px)}
      .th-modal-close{width:44px;height:44px;flex-basis:44px;margin:-12px -12px -12px 4px}
      .th-modal-foot{padding-bottom:max(12px,env(safe-area-inset-bottom))!important}
      .th-modal-foot>*{min-height:44px}
    }
    @media(prefers-reduced-motion:reduce){.th-modal-scrim,.th-modal-dialog{animation:none!important}}
  `;
  document.head.appendChild(s);
}
const modalFocusable = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = 440,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  initialFocusRef,
  returnFocusRef,
}) {
  const dialogRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current || dialogRef.current?.querySelector(".th-modal-body")?.querySelector(modalFocusable) || dialogRef.current?.querySelector(modalFocusable) || dialogRef.current;
      target?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      const target = returnFocusRef?.current || previousFocusRef.current;
      requestAnimationFrame(() => target?.isConnected && target.focus());
    };
  }, [open]);

  if (!open) return null;
  const handleKeyDown = (event) => {
    if (event.key === "Escape" && closeOnEscape) {
      event.preventDefault();
      onClose?.();
      return;
    }
    if (event.key !== "Tab") return;
    const items = [...dialogRef.current.querySelectorAll(modalFocusable)];
    if (!items.length) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return (
    <div
      className="th-modal-scrim"
      style={modalStyles.scrim}
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className="th-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={{ ...modalStyles.dialog, width }}
        onKeyDown={handleKeyDown}
      >
        <header style={modalStyles.head}>
          <div>
            <div id={titleId} style={modalStyles.title}>{title}</div>
            {description && <div id={descriptionId} style={modalStyles.desc}>{description}</div>}
          </div>
          <button className="th-modal-close" type="button" aria-label="关闭弹窗" style={modalStyles.x} onClick={onClose}>
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </header>
        <div className="th-modal-body" style={modalStyles.body}>{children}</div>
        {footer && <footer className="th-modal-foot" style={modalStyles.foot}>{footer}</footer>}
      </div>
    </div>
  );
}
const modalStyles = {
  scrim: { position: "fixed", inset: 0, zIndex: "var(--z-overlay)", background: "color-mix(in srgb, var(--color-fg) 32%, transparent)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "th-modal-scrim var(--th-dur-1) var(--th-ease)" },
  dialog: { background: "var(--color-surface-raised)", borderRadius: "var(--th-radius-lg)", boxShadow: "var(--th-shadow-modal)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--th-font-cn)", animation: "th-modal-in .28s var(--th-ease-spring)" },
  head: { padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "0.5px solid var(--color-border)" },
  title: { fontSize: 15, fontWeight: 600, color: "var(--color-fg)" },
  desc: { fontSize: 12, color: "var(--color-fg-muted)", marginTop: 4 },
  x: { appearance: "none", padding: 0, border: "none", background: "transparent", fontSize: 14, color: "var(--color-fg-muted)", cursor: "pointer", display: "inline-grid", placeItems: "center" },
  body: { padding: "16px", display: "flex", flexDirection: "column", flex: "1 1 auto", gap: 12 },
  foot: { padding: "12px 16px", display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "0.5px solid var(--color-border)", background: "var(--th-bg)" },
};
```

## modal.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Modal" subtitle="Centered dialog — scrim, header/body/footer slots" viewport="480x360" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;display:flex;align-items:center;justify-content:center;height:360px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Modal, Button, TextField } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="panel">
      <Button onClick={() => setOpen(true)}>打开弹窗</Button>
      <Modal
        open={open}
        title="新建令牌"
        description="密钥仅在创建时显示一次，请妥善保存"
        onClose={() => setOpen(false)}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>取消</Button><Button onClick={() => setOpen(false)}>创建</Button></>}
      >
        <TextField label="名称" placeholder="例如：production-web" />
      </Modal>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
