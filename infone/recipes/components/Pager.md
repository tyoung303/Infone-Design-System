# Pager 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Pager.d.ts

```typescript
export interface PagerProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}
export function Pager(props: PagerProps): JSX.Element;
```

## Pager.jsx

```jsx
/* Pager.jsx — pagination control; the current page is a NEUTRAL pill (--color-nav-selected + weight 700), never brand-tinted: it says where you are, not what to click. */
function buildPagerItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 4) [2, 3, 4, 5].forEach((n) => set.add(n));
  if (current >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((n) => set.add(n));
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

export function Pager({ page, totalPages, onChange }) {
  const items = buildPagerItems(page, totalPages);
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));
  const btn = { appearance: "none", border: "none", background: "transparent", borderRadius: 8, fontFamily: "var(--th-font-cn)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--th-font-cn)" }}>
      <button style={{ ...btn, width: 32, height: 32, color: "var(--color-fg)", opacity: page === 1 ? 0.35 : 1, cursor: page === 1 ? "default" : "pointer" }} onClick={prev} disabled={page === 1} aria-label="上一页">
        <i className="ri-arrow-left-s-line" style={{ fontSize: 16 }} />
      </button>
      {items.map((it, i) => {
        if (it === "…") return <span key={"e" + i} style={{ minWidth: 24, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-fg-muted)", fontSize: 13 }}>…</span>;
        const isActive = it === page;
        return (
          <button
            key={it} onClick={() => onChange(it)}
            style={{ ...btn, minWidth: 32, height: 32, padding: "0 6px", fontSize: 13, fontFeatureSettings: '"tnum"', background: isActive ? "var(--color-nav-selected)" : "transparent", color: "var(--color-fg)", fontWeight: isActive ? 700 : 500 }}
          >{it}</button>
        );
      })}
      <button style={{ ...btn, width: 32, height: 32, color: "var(--color-fg)", opacity: page === totalPages ? 0.35 : 1, cursor: page === totalPages ? "default" : "pointer" }} onClick={next} disabled={page === totalPages} aria-label="下一页">
        <i className="ri-arrow-right-s-line" style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}
```

## pager.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Pager" subtitle="Text pagination — neutral active pill, ellipsis collapse" viewport="500x100" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:32px;display:flex;align-items:center;justify-content:center}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Pager } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [page, setPage] = React.useState(4);
  return <div className="panel"><Pager page={page} totalPages={12} onChange={setPage} /></div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
