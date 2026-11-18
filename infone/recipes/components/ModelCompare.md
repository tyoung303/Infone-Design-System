# ModelCompare 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## ModelCompare.d.ts

```typescript
export interface ModelCompareModel {
  /** Column key AND displayed name — row values are looked up by it. */
  name: string;
  /** Secondary line under the name (vendor, context window…). */
  meta?: string;
  /** Remix Icon class for the vendor mark. */
  icon?: string;
  color?: string;
}
export interface ModelCompareRow {
  label: string;
  /** Keyed by model name. `true` → check, `false`/missing → dash, else text. */
  values: Record<string, string | number | boolean | null>;
}
export interface ModelCompareProps {
  models: ModelCompareModel[];
  rows: ModelCompareRow[];
  /** Model name whose column gets the quiet brand tint (the recommended pick). */
  highlight?: string;
  /** The matrix IS a card by default. Pass `embedded` when it sits inside another
   *  card: drops border, radius, shadow and fill so the outlines don't double up. @default false */
  embedded?: boolean;
}
export function ModelCompare(props: ModelCompareProps): JSX.Element;
```

## ModelCompare.jsx

```jsx
/* ModelCompare.jsx — capability matrix: models across the top, attributes
   down the side. Values render as text, or as a check/dash when boolean.
   The attribute column is sunken (--color-surface-inset) so the eye reads
   rows; a highlighted model column takes the quiet brand tint. */
export function ModelCompare({ models = [], rows = [], highlight, embedded = false }) {
  return (
    <div style={{ border: embedded ? "none" : "var(--th-border-card)", borderRadius: embedded ? 0 : "var(--th-radius-md)", background: embedded ? "transparent" : "var(--th-white)", boxShadow: embedded ? "none" : "var(--th-shadow-card)", overflow: "hidden", fontFamily: "var(--th-font-cn)" }}>
      <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${models.length}, 1fr)` }}>
        <div style={{ background: "var(--color-table-head)", borderBottom: "0.5px solid var(--color-border)" }} />
        {models.map((m, i) => (
          <div key={m.name} style={{ padding: "10px 14px", background: highlight === m.name ? "var(--color-surface-quiet)" : "var(--color-table-head)", borderBottom: "0.5px solid var(--color-border)", borderLeft: "0.5px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              {m.icon && <i className={m.icon} style={{ fontSize: 14, color: m.color || "var(--color-fg-muted)", flex: "none" }} />}
              <span style={{ fontFamily: "var(--th-font-mono)", fontSize: "var(--th-text-base)", fontWeight: 600, color: "var(--color-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
            </span>
            {m.meta && <span style={{ fontSize: "var(--th-text-2xs)", color: "var(--color-fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.meta}</span>}
          </div>
        ))}
        {rows.map((r, ri) => (
          <React.Fragment key={r.label}>
            <div style={{ padding: "9px 14px", background: "var(--color-surface-inset)", borderTop: ri ? "0.5px solid var(--color-border)" : "none", fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", display: "flex", alignItems: "center" }}>{r.label}</div>
            {models.map((m) => {
              const v = r.values?.[m.name];
              return (
                <div key={m.name} className="th-nums" style={{ padding: "9px 14px", borderTop: ri ? "0.5px solid var(--color-border)" : "none", borderLeft: "0.5px solid var(--color-border)", background: highlight === m.name ? "var(--color-surface-quiet)" : "transparent", fontSize: "var(--th-text-base)", color: "var(--color-fg)", display: "flex", alignItems: "center", minWidth: 0 }}>
                  {v === true ? <i className="ri-check-line" style={{ color: "var(--color-success-fg)", fontSize: 14 }} />
                    : v === false || v == null ? <span style={{ color: "var(--color-fg-subtle)" }}>—</span>
                    : <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
```

## model-compare.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Model compare" subtitle="能力矩阵：模型为列、属性为行；勾/横线/文本三种取值，推荐列用 quiet tint" viewport="760x400" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.wrap{box-sizing:border-box;padding:20px;width:720px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { ModelCompare } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="wrap">
      <ModelCompare
        highlight="claude-sonnet-4"
        models={[
          { name: "claude-sonnet-4", meta: "Anthropic · 200K", icon: "ri-anthropic-fill", color: "var(--color-fg)" },
          { name: "gpt-4o-mini", meta: "OpenAI · 128K", icon: "ri-openai-fill", color: "var(--color-fg)" },
          { name: "deepseek-v3", meta: "DeepSeek · 64K", icon: "ri-cpu-line", color: "var(--th-cat-5-fg)" },
        ]}
        rows={[
          { label: "输入价 / 1M", values: { "claude-sonnet-4": "$3.00", "gpt-4o-mini": "$0.15", "deepseek-v3": "$0.27" } },
          { label: "视觉输入", values: { "claude-sonnet-4": true, "gpt-4o-mini": true, "deepseek-v3": false } },
          { label: "工具调用", values: { "claude-sonnet-4": true, "gpt-4o-mini": true, "deepseek-v3": true } },
          { label: "推理模式", values: { "claude-sonnet-4": true, "gpt-4o-mini": false, "deepseek-v3": true } },
          { label: "p95 延迟", values: { "claude-sonnet-4": "1.4s", "gpt-4o-mini": "0.7s", "deepseek-v3": "2.1s" } },
        ]}
      />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
