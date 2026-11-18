# StatusChip 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## StatusChip.d.ts

```typescript
export type StatusChipTone =
  | "success" | "warning" | "danger" | "info" | "neutral"
  | "primary" | "purple" | "orange" | "magenta";
export interface StatusChipProps {
  /** @default "neutral" */
  tone?: StatusChipTone;
  /** "solid" is the filled quiet-surface pill; "plain" drops the background and
   *  horizontal padding for a backgroundless dot + toned label. @default "solid" */
  variant?: "solid" | "plain";
  children: React.ReactNode;
  /** @deprecated The leading dot is always rendered. Accepted and ignored. */
  dot?: boolean;
  /** Escape hatch for layout only (margin/alignment). Never override whiteSpace or flexShrink. */
  style?: React.CSSProperties;
}
export function StatusChip(props: StatusChipProps): JSX.Element;
```

## StatusChip.jsx

```jsx
/* StatusChip.jsx — neutral chip. Status tones: success/warning/danger/info/neutral.
   Display tones (categorization, not status): primary/purple/orange/magenta.
   Never wraps and never shrinks: a fixed-height pill whose label folds to a second
   line overflows its own background. Callers must not need to re-add nowrap.

   The surface is intentionally neutral; meaning is carried by the text and the
   leading dot in currentColor. The `dot` prop is kept for source compatibility
   but is ignored because the dot is now always rendered.

   variant="plain" drops the quiet surface and horizontal padding for a
   backgroundless pill — just the currentColor dot and the toned label — for use
   inline in dense tables or alongside other text where a filled chip is too heavy. */
const TH_CHIP_TONES = {
  success: { bg: "var(--color-surface-quiet)", fg: "var(--color-success-fg)" },
  warning: { bg: "var(--color-surface-quiet)", fg: "var(--color-warning-fg)" },
  danger:  { bg: "var(--color-surface-quiet)", fg: "var(--color-danger-fg)" },
  info:    { bg: "var(--color-surface-quiet)", fg: "var(--color-info-fg)" },
  neutral: { bg: "var(--color-surface-quiet)", fg: "var(--color-fg-muted)" },
    // Display tones — non-semantic categorization, anchored to the chart palette hues
    // (--th-chart-*) and darkened to L≈0.50–0.53 for AA text contrast on the quiet
    // surface (chart series sit at L≈0.66–0.75, too light for text). Declared inline on
    // purpose: these are not semantic --color-*-fg roles. Hues follow the chart anchors
    // — orange→chart-10 (55), primary→chart-1 indigo (272), purple→chart-11 violet
    // (300), magenta→chart-8 (348) — and stay spaced from each other and the semantic
    // tones: danger 14 · orange 55 · warning 71 · success 156 · info ~230 · primary 272 · purple 300 · magenta 348.
    primary: { bg: "var(--color-surface-quiet)", fg: "color-mix(in srgb, var(--th-chart-1) 78%, var(--color-fg))" },
    purple:  { bg: "var(--color-surface-quiet)", fg: "color-mix(in srgb, var(--th-chart-11) 78%, var(--color-fg))" },
    orange:  { bg: "var(--color-surface-quiet)", fg: "color-mix(in srgb, var(--th-chart-10) 78%, var(--color-fg))" },
    magenta: { bg: "var(--color-surface-quiet)", fg: "color-mix(in srgb, var(--th-chart-8) 78%, var(--color-fg))" },
};
export function StatusChip({ tone = "neutral", variant = "solid", children, style }) {
  const t = TH_CHIP_TONES[tone] || TH_CHIP_TONES.neutral;
  const plain = variant === "plain";
  return (
    <span style={{ height: 22, padding: plain ? 0 : "0 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--th-font-ui)", fontSize: 11, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap", flexShrink: 0, background: plain ? "transparent" : t.bg, color: t.fg, ...style }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor", flex: "0 0 auto" }} />
      {children}
    </span>
  );
}
```

## status-chip.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Status chip" subtitle="Neutral chip with same-color dot; solid + plain variants, status + display tones" viewport="360x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;display:flex;flex-direction:column;gap:12px}.row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { StatusChip } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <div className="row">
        <StatusChip tone="success">已激活</StatusChip>
        <StatusChip tone="warning">限速中</StatusChip>
        <StatusChip tone="danger">已禁用</StatusChip>
        <StatusChip tone="info">处理中</StatusChip>
        <StatusChip tone="neutral">草稿</StatusChip>
        <StatusChip tone="primary">生产</StatusChip>
        <StatusChip tone="purple">测试</StatusChip>
        <StatusChip tone="orange">灰度</StatusChip>
        <StatusChip tone="magenta">实验</StatusChip>
      </div>
      <div className="row">
        <StatusChip variant="plain" tone="success">已激活</StatusChip>
        <StatusChip variant="plain" tone="warning">限速中</StatusChip>
        <StatusChip variant="plain" tone="danger">已禁用</StatusChip>
        <StatusChip variant="plain" tone="info">处理中</StatusChip>
        <StatusChip variant="plain" tone="neutral">草稿</StatusChip>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
