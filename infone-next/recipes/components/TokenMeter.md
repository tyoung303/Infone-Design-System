# TokenMeter 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## TokenMeter.d.ts

```typescript
export interface TokenMeterProps {
  /** Prompt tokens. @default 0 */
  input?: number;
  /** Completion tokens. @default 0 */
  output?: number;
  /** Reasoning/thinking tokens billed separately. @default 0 */
  reasoning?: number;
  /** Cache-hit tokens (usually discounted). @default 0 */
  cached?: number;
  /** Show the bar against a quota instead of as a 100% split. */
  max?: number;
  /** Bar thickness in px. @default 8 */
  height?: number;
  /** Show the per-segment legend under the bar. @default true */
  legend?: boolean;
}
export function TokenMeter(props: TokenMeterProps): JSX.Element;
```

## TokenMeter.jsx

```jsx
/* TokenMeter.jsx — one request's or one period's token split (input /
   output / reasoning / cached) as a single segmented bar plus a legend.
   Pass `max` to show consumption against a quota instead of a 100% split.

   Numbers are in the UI font with tabular numerals (.th-nums), NOT in
   IBM Plex Mono: mono is reserved for code, URLs, keys and model IDs
   (原则 3). A token count is a figure, not code — setting it in mono made
   it read as a different kind of thing from the same figure in
   MetricStrip or a table cell.

   Segment colors use the chart palette by reading order. TokenMeter is a
   compact data visualization in table/detail contexts, so it uses
   --th-chart-1…4 for visible buckets and the data track for quota remainder.
   Segment order is unchanged (输入 → 输出 → 推理 → 缓存). */
const TM_SEGS = [
  { key: "input", label: "输入", color: "var(--th-chart-1)" },
  { key: "output", label: "输出", color: "var(--th-chart-2)" },
  { key: "reasoning", label: "推理", color: "var(--th-chart-3)" },
  { key: "cached", label: "缓存命中", color: "var(--th-chart-4)" },
];
export function TokenMeter({ input = 0, output = 0, reasoning = 0, cached = 0, max, height = 8, legend = true }) {
  const vals = { input, output, reasoning, cached };
  const total = input + output + reasoning + cached;
  const scale = max || total || 1;
  const segs = TM_SEGS.filter((s) => vals[s.key] > 0);
  const fmt = (n) => n.toLocaleString("en-US");
  return (
    <div style={{ fontFamily: "var(--th-font-cn)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span className="th-nums" style={{ fontSize: "var(--th-text-md)", fontWeight: 600, color: "var(--color-fg)" }}>{fmt(total)}<span style={{ fontSize: "var(--th-text-xs)", fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 4 }}>tokens</span></span>
        {max && <span className="th-nums" style={{ fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)" }}>配额 {fmt(max)}</span>}
      </div>
      <div style={{ display: "flex", width: "100%", height, borderRadius: 999, overflow: "hidden", background: "var(--color-data-track)" }}>
        {segs.map((s) => (
          <div key={s.key} title={`${s.label} ${fmt(vals[s.key])}`} style={{ width: `${(vals[s.key] / scale) * 100}%`, background: s.color, transition: "width var(--th-dur-3) var(--th-ease-out)" }} />
        ))}
      </div>
      {legend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
          {segs.map((s) => (
            <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flex: "none" }} />
              {s.label}
              <span className="th-nums" style={{ color: "var(--color-fg)" }}>{fmt(vals[s.key])}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

## token-meter.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Token meter" subtitle="输入/输出/推理/缓存 token 分段条，色取图表色阶，可对配额显示" viewport="480x300" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:20px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}.panel{width:432px;display:flex;flex-direction:column;gap:20px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { TokenMeter } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <TokenMeter input={12480} output={3260} reasoning={1840} cached={5120} />
      <TokenMeter input={640000} output={210000} cached={95000} max={2000000} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
