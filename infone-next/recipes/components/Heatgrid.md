# Heatgrid 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Heatgrid.d.ts

```typescript
export interface HeatgridCell { v: number; label?: string }
export interface HeatgridProps {
  /** Row-major flat list. Plain numbers or {v,label} (label shown in the cell's title tooltip). */
  data: number[] | HeatgridCell[];
  /** Cells per row before wrapping — 7 reads as a week. @default 7 */
  columns?: number;
  /** Cell edge in px. @default 12 */
  cellSize?: number;
  /** Gap between cells in px. @default 3 */
  gap?: number;
  /** Pin the intensity scale instead of deriving it from the data's own range (e.g. to a fixed quota). */
  min?: number;
  max?: number;
}
export function Heatgrid(props: HeatgridProps): JSX.Element;
```

## Heatgrid.jsx

```jsx
/* Heatgrid.jsx — calendar/activity intensity grid (usage per day, cost per
   hour bucket). Cells paint on the --th-heat-0…4 ramp: intensity ("more/
   less"), never status. Wraps to `columns` per row (default 7 — a week). */
export function Heatgrid({ data = [], columns = 7, cellSize = 12, gap = 3, min, max }) {
  const vals = data.map((d) => (typeof d === "number" ? d : d.v)).filter(Number.isFinite);
  const lo = min ?? Math.min(...vals, 0);
  const hi = max ?? Math.max(...vals, 0);
  const step = (v) => { if (!Number.isFinite(v) || hi <= lo) return 0; return Math.max(0, Math.min(4, Math.round(((v - lo) / (hi - lo)) * 4))); };
  return (
    <div className="th-stagger" style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`, gap, width: "fit-content" }}>
      {data.map((d, i) => {
        const v = typeof d === "number" ? d : d.v;
        const t = typeof d === "object" ? d.label : undefined;
        const s = step(v);
        return <div key={i} title={t ? `${t}: ${v}` : String(v)} style={{ width: cellSize, height: cellSize, borderRadius: 3, background: `var(--th-heat-${s})`, transition: "background var(--th-dur-1) var(--th-ease)" }} />;
      })}
    </div>
  );
}
```

## heatgrid.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Heatgrid" subtitle="活跃度/用量强度网格 — 单一暖色调阶梯，7 列成周，可固定 min/max" viewport="360x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:312px;display:flex;flex-direction:column;gap:16px}.k{font-family:var(--th-font-ui);font-size:11px;color:var(--color-fg-muted)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Heatgrid } = window.TokenHubDesignSystem_019e20;
const days = Array.from({length:35},(_,i)=>({v: Math.max(0, Math.round(Math.sin(i/3)*40+40+ (i%7===0?30:0))), label: `第${i+1}天`}));
function Demo() {
  return (
    <div className="panel">
      <span className="k">近 5 周调用量</span>
      <Heatgrid data={days} columns={7} cellSize={16} gap={4} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
