# RingGauge 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## RingGauge.d.ts

```typescript
export interface RingGaugeProps {
  /** 0–100. @default 0 */
  value: number;
  /** 语义尺寸档位（推荐使用，优先于 size/thickness）：
   *  "focus"=72/7 页面级焦点比率 · "default"=64/6 详情页关键比率 ·
   *  "compact"=56/5 行内/次要陈列。thickness 随档位绑定，无需另传。 */
  preset?: "focus" | "default" | "compact";
  /** Outer diameter in px. 仅在无 preset 时生效；只应取 56/60/64/72。@default 64 */
  size?: number;
  /** Ring stroke width in px. 仅在无 preset 时生效；未传则按 size/10 自动派生。@default size/10 */
  thickness?: number;
  /** "accent" (default), a semantic role ("success"|"warning"|"danger"), a raw
   *  token ("--th-chart-3"), or "heat" — color derives from the value itself
   *  on the --th-heat-0…4 ramp (use for "how full": quota, disk, rate limit).
   *  @default "accent" */
  tone?: "accent" | "success" | "warning" | "danger" | "heat" | string;
  /** Unit suffix next to the number. @default "%" */
  label?: string;
  /** Sweep in from 0 on mount (560ms). Ignored under prefers-reduced-motion. @default true */
  animate?: boolean;
  /** Custom center content — replaces the default "NN%" text. */
  children?: React.ReactNode;
}
export function RingGauge(props: RingGaugeProps): JSX.Element;
```

## 尺寸规范

RingGauge 的大小不是自由取值，而是**三档语义尺寸**。尺寸与它在页面里的版式角色一一对应，`thickness` 随 `size` 绑定（约 `size/10`），保证不同尺寸下环的视觉粗细观感一致。**优先用 `preset`**，不要各自手写 `size`/`thickness`。

| preset | size / thickness | 中心字号 | 版式角色 | 典型场景 |
|---|---|---|---|---|
| `focus` | 72 / 7 | `--th-text-md`(15) | 页面级焦点，整屏唯一被强调的比率，通常也是整屏热力色唯一落点 | 仪表盘配额环 |
| `default` | 64 / 6 | `--th-text-md`(15) | 与其他信息并排的关键比率 | 详情页比率区块、页面生成器占比 |
| `compact` | 56 / 5 | `--th-text-md`(15) | 次要陈列，一行放多个对比 | 组件卡片、多环并列 |

规则：

1. **只用三档**：`size` 只应落在 56 / 64 / 72（旧代码里的 60 归入 `default` 一档）。不要出现 50、80 等档外数值。
2. **thickness 随 size 绑定**：未显式传入时按 `size/10` 自动派生（56→5、64→6、72→7）。不要出现 `size=72 thickness=4` 这类过细的错误组合。
3. **中心字号只用 token**：≥56 用 `--th-text-md`，<56 用 `--th-text-xs`，不再硬编码 `15`/`12`。`.th-nums` 提供 tabular 数字。
4. **热力色只在 focus/default 焦点位**：`tone="heat"` 整屏只允许出现一次，落在被强调的环上；`compact` 多环并列时不要每个都上热力色。
5. **同屏不与 Progress 重复**：同一个比率二选一——焦点比率用 RingGauge，行内/列表/紧凑线性比率用 `Progress`，不要既画环又画条。
6. **小 value 端点**：环采用平头端点（`strokeLinecap="butt"`），极小值（如 3%）时弧长不会被圆头拉长；仍然接近 0 的比率优先改用 `Progress` 或直接显示数字。

## RingGauge.jsx

```jsx
/* RingGauge.jsx — circular progress for a single ratio: quota used, task
   completion, model capability score. Sweeps from 0 on mount (560ms, the
   count-up duration) unless prefers-reduced-motion. tone="heat" derives the
   ring color from the value itself (low→high on the heat ramp) instead of a
   fixed color — use it for "how full" reads (quota, disk, rate limit). */
export function RingGauge({ value = 0, preset, size, thickness, tone = "accent", label, animate = true, children }) {
  // 三档语义尺寸：焦点 72/7、默认 64/6、紧凑 56/5。preset 优先；
  // 否则用显式 size（旧调用兼容），thickness 未传时按 size/10 派生。
  const PRESETS = { focus: { size: 72, thickness: 7 }, default: { size: 64, thickness: 6 }, compact: { size: 56, thickness: 5 } };
  const p = preset && PRESETS[preset] ? PRESETS[preset] : null;
  size = p ? p.size : size ?? 64;
  thickness = p ? p.thickness : thickness ?? Math.round(size / 10);
  const pct = Math.max(0, Math.min(100, value));
  const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = React.useState(animate && !reduced ? 0 : pct);
  React.useEffect(() => {
    if (!animate || reduced) { setShown(pct); return; }
    let raf, start = null; const dur = 560;
    const tick = (t) => { if (start === null) start = t; const p = Math.min(1, (t - start) / dur); setShown(pct * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct, animate, reduced]);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const ringColor = tone === "heat" ? `var(--th-heat-${Math.min(4, Math.max(0, Math.round(pct / 25)))})` : tone.startsWith("--") ? `var(${tone})` : `var(--color-${tone === "accent" ? "accent" : tone + "-solid"})`;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-data-track)" strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={thickness} strokeLinecap="butt"
          strokeDasharray={c} strokeDashoffset={c - (shown / 100) * c} style={{ transition: reduced ? "none" : "stroke 200ms var(--th-ease)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--th-font-ui)" }}>
        {children ?? <span className="th-nums" style={{ fontSize: size >= 56 ? "var(--th-text-md)" : "var(--th-text-xs)", fontWeight: 600, color: "var(--color-fg)" }}>{Math.round(shown)}{label ?? "%"}</span>}
      </div>
    </div>
  );
}
```

## ring-gauge.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Ring gauge" subtitle="环形进度 — 三档语义尺寸 focus/default/compact，tone=heat 时颜色随数值走热度色阶" viewport="520x220" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:472px;display:flex;gap:24px;align-items:center;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md)}.col{display:flex;flex-direction:column;align-items:center;gap:8px}.lbl{font-family:var(--th-font-ui);font-size:11px;color:var(--color-fg-muted)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { RingGauge } = window.TokenHubDesignSystem_019e20;
function Demo() {
  return (
    <div className="panel">
      <div className="col"><RingGauge value={82} preset="focus" tone="heat" /><span className="lbl">focus 72</span></div>
      <div className="col"><RingGauge value={68} preset="default" tone="accent" /><span className="lbl">default 64</span></div>
      <div className="col"><RingGauge value={92} preset="compact" tone="heat" /><span className="lbl">compact 56</span></div>
      <div className="col"><RingGauge value={82} preset="default"><span className="th-nums" style={{fontSize:"var(--th-text-md)",fontWeight:600}}>8.2</span></RingGauge><span className="lbl">自定义中心</span></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
