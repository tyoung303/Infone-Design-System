# SectionCard 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## SectionCard.d.ts

```typescript
export interface SectionCardProps {
  /** Header title. Always renders at var(--th-text-sm)/600 — the one canonical
   *  card-title size, so it can never drift from another module's hand-rolled title. */
  title?: string;
  subtitle?: string;
  /** Remix Icon class shown to the left of the title. */
  icon?: string;
  /** Right-aligned header content (buttons, a Segmented, a status chip…). */
  actions?: React.ReactNode;
  /** Drop the card's own border/radius/shadow/background when it sits inside another card. @default false */
  embedded?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function SectionCard(props: SectionCardProps): JSX.Element;
```

## SectionCard.jsx

```jsx
/* SectionCard.jsx — the one shared "card with a header" wrapper. Every page
   that needs a titled block (a form section, a workflow panel, a generated
   result pane…) should reach for this instead of hand-rolling its own title
   style — that drift (13px here, 14 there, a bare h4 elsewhere) is exactly
   why the same page can end up with mismatched card-title sizes. The title
   is always var(--th-text-sm) / 600, full stop.
   embedded: drop own border/radius/shadow when nested inside another card
   (see DESIGN.md 组件嵌套) — head/body structure stays the same. */
export function SectionCard({ title, subtitle, icon, actions, embedded = false, children, style }) {
  return (
    <div style={{ ...(embedded ? scStyles.plain : scStyles.card), ...style }}>
      {(title || actions) && (
        <div style={scStyles.head}>
          <div style={scStyles.headText}>
            {icon && <i className={icon} style={scStyles.icon} />}
            <div style={scStyles.titleWrap}>
              {title && <h4 style={scStyles.title}>{title}</h4>}
              {subtitle && <span style={scStyles.subtitle}>{subtitle}</span>}
            </div>
          </div>
          {actions && <div style={scStyles.actions}>{actions}</div>}
        </div>
      )}
      {children != null && <div style={scStyles.body}>{children}</div>}
    </div>
  );
}
const scStyles = {
  card: { borderRadius: "var(--th-radius-md)", background: "var(--th-white)", border: "var(--th-border-card)", boxShadow: "var(--th-shadow-card)", fontFamily: "var(--th-font-cn)", display: "flex", flexDirection: "column" },
  plain: { fontFamily: "var(--th-font-cn)", display: "flex", flexDirection: "column" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "var(--th-card-pad)", borderBottom: "0.5px solid var(--color-border)" },
  headText: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  icon: { fontSize: 14, color: "var(--color-fg-muted)", flexShrink: 0 },
  titleWrap: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  title: { margin: 0, fontFamily: "var(--th-font-cn)", fontSize: "var(--th-text-sm)", fontWeight: 600, color: "var(--color-fg)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  subtitle: { fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)" },
  actions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  body: { padding: "var(--th-card-pad)", display: "flex", flexDirection: "column", gap: "var(--th-stack-gap)" },
};
```

## section-card.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Section card" subtitle="标题区固定 var(--th-text-sm)/600 的通用卡片外壳 — 任何模块标题都从这里取，不再各写各的字号" viewport="560x420" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../../fonts/remixicon.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:512px;display:flex;flex-direction:column;gap:16px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { SectionCard, Button } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <SectionCard title="生成流程" subtitle="解析材料 · 匹配系统 · 生成页面 · 导出交付">
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>四步流程内容占位。</div>
      </SectionCard>
      <SectionCard title="上传与需求" icon="ri-upload-cloud-2-line" actions={<Button size="sm" variant="secondary">重新上传</Button>}>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)" }}>标题区始终 var(--th-text-sm)，无论有没有图标或右侧操作。</div>
      </SectionCard>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
