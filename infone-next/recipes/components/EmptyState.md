# EmptyState 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## EmptyState.d.ts

```typescript
export interface EmptyStateProps {
  /** Remix Icon class. @default "ri-inbox-line" */
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
   /** Abstract geometric backdrop behind the icon tile — never a figurative
    *  illustration. With an action, defaults to "dots"; without one, defaults
    *  to "none". Explicit values always win. */
  graphic?: "none" | "dots" | "arcs" | "grid";
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
```

## EmptyState.jsx

```jsx
/* EmptyState.jsx — icon + title + description + optional action, centered.
   `graphic` swaps the plain icon circle for an abstract geometric backdrop
   (dots/arcs/grid, drawn from tokens — never a figurative illustration) so a
   results/empty page reads as designed rather than "icon on white". When an
   action is present, dots is the default backdrop; callers can still override
   it with an explicit graphic value. */
export function EmptyState({ icon = "ri-inbox-line", title, description, action, graphic }) {
  const visualGraphic = graphic ?? (action ? "dots" : "none");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 24px", textAlign: "center", fontFamily: "var(--th-font-cn)" }}>
      {visualGraphic === "none" ? (
        <span style={{ width: 48, height: 48, borderRadius: 9999, background: "var(--th-gray-50)", color: "var(--color-fg-subtle)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          <i className={icon} />
        </span>
      ) : (
         <EsGraphic kind={visualGraphic} icon={icon} />
      )}
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>{title}</div>
      {description && <div style={{ fontSize: 12, color: "var(--color-fg-muted)", maxWidth: 280 }}>{description}</div>}
      {action}
    </div>
  );
}

function EsGraphic({ kind, icon }) {
  const size = 112;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {kind === "arcs" && [0, 1, 2].map((i) => (
          <circle key={i} cx={size / 2} cy={size / 2} r={22 + i * 16} fill="none" stroke="var(--color-border)" strokeWidth="1" strokeDasharray={i === 1 ? "3 5" : undefined} opacity={1 - i * 0.22} />
        ))}
        {kind === "dots" && Array.from({ length: 6 }).map((_, row) => Array.from({ length: 6 }).map((__, col) => {
          const cx = 12 + col * 18, cy = 12 + row * 18;
          const d = Math.hypot(cx - size / 2, cy - size / 2);
          if (d > size / 2 - 4) return null;
          return <circle key={`${row}-${col}`} cx={cx} cy={cy} r="2" fill="var(--color-border)" opacity={Math.max(0.15, 1 - d / (size / 2))} />;
        }))}
        {kind === "grid" && (
          <>
            {[24, 48, 72, 96].map((v) => <line key={"v" + v} x1={v} y1="8" x2={v} y2={size - 8} stroke="var(--color-divider)" strokeWidth="1" />)}
            {[24, 48, 72, 96].map((h) => <line key={"h" + h} x1="8" y1={h} x2={size - 8} y2={h} stroke="var(--color-divider)" strokeWidth="1" />)}
            <rect x="8" y="8" width={size - 16} height={size - 16} fill="none" stroke="var(--color-border)" strokeWidth="1" />
          </>
        )}
      </svg>
      <span style={{ position: "relative", width: 48, height: 48, borderRadius: "var(--th-radius-md)", background: "var(--color-surface-raised)", border: "0.5px solid var(--color-border)", boxShadow: "var(--th-shadow-card)", color: "var(--color-fg-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        <i className={icon} />
      </span>
    </div>
  );
}
```

## empty-state.html

```html
<!doctype html>
<!-- @dsCard group="Patterns" name="Empty state" subtitle="Icon tile + title + description + CTA — graphic=dots/arcs/grid 提供抽象几何背景" viewport="760x300" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.row{display:flex;gap:16px}.panel{box-sizing:border-box;padding:12px;width:224px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { EmptyState, Button } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="row">
      <div className="panel"><EmptyState icon="ri-key-2-line" title="暂无令牌" description="创建一个令牌即可开始调用模型接口" action={<Button size="sm">新建令牌</Button>} /></div>
      <div className="panel"><EmptyState graphic="dots" icon="ri-search-line" title="无匹配结果" description="试试换个关键词" /></div>
      <div className="panel"><EmptyState graphic="arcs" icon="ri-radar-line" title="暂无运行记录" description="任务运行后会在这里显示" /></div>
      <div className="panel"><EmptyState graphic="grid" icon="ri-database-2-line" title="暂无数据源" description="接入仓库后开始分析" /></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
