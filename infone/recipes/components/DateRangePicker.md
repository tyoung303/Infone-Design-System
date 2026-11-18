# DateRangePicker 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## DateRangePicker.d.ts

```typescript
import * as React from "react";
export interface DateRange {
  /** ISO date, e.g. "2026-07-01" */
  start: string;
  end: string;
}
export interface DateRangePickerProps {
  /** Controlled range. Defaults to today ~ today when omitted.
   *  单日期模式（mode="single"）下仅使用 `start` 字段，`end` 与 `start` 相同。 */
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  /** Render with the popover already open (demos). @default false */
  defaultOpen?: boolean;
  /** 控制触发器高度两档：`sm`=28px 紧凑、`md`=32px 松弛。@default "md" */
  size?: "sm" | "md";
  /** 选择模式：`range` 时间段（默认）/ `single` 单日期（非时间段）。@default "range" */
  mode?: "range" | "single";
  style?: React.CSSProperties;
}
export function DateRangePicker(props: DateRangePickerProps): JSX.Element;
```

## DateRangePicker.jsx

```jsx
/* DateRangePicker.jsx — preset shortcuts + a real month-grid calendar in a popover.
   支持两种模式：mode="range" 时间段（默认，点击两次选起止）/ mode="single" 单日期（点击一次即选中并关闭）。
   Sizing/边框/圆角/交互态严格走 token：触发器与控件两档高度 sm=28 / md=32（不消费 --th-ctl-h*），
   边框统一 0.5px solid var(--color-border)、圆角 --th-radius-sm/md；端点用 --color-accent、区间用 --color-accent-soft、
   今日描边用 --color-accent；hover 用 --color-row-hover、focus 用 --th-ring 焦点环。
   伪类通过一次性注入的 <style> 实现，因内联 style 无法写 :hover / :focus-visible。*/
if (typeof document !== "undefined" && !document.getElementById("th-drp-css")) {
  const s = document.createElement("style");
  s.id = "th-drp-css";
  s.textContent = [
    "@keyframes th-menu-in{from{transform:translateY(-4px) scale(0.98);opacity:0}to{transform:none;opacity:1}}",
    /* 触发器：hover 抬一档中性下沉面（前景不变，对比不降）、focus 焦点环 */
    ".th-drp-trigger{transition:background var(--th-dur-1) var(--th-ease),box-shadow var(--th-dur-1) var(--th-ease)}",
    ".th-drp-trigger:hover{background:var(--color-sunken)}",
    ".th-drp-trigger:focus-visible{outline:none;box-shadow:var(--th-ring)}",
    ".th-drp-trigger[aria-expanded=\"true\"]{background:var(--color-sunken);box-shadow:var(--th-shadow-soft)}",
    /* 预设项：真按钮，行 hover 用 --color-row-hover，focus 焦点环 */
    ".th-drp-preset{transition:background var(--th-dur-1) var(--th-ease)}",
    ".th-drp-preset:hover{background:var(--color-row-hover)}",
    ".th-drp-preset:focus-visible{outline:none;box-shadow:var(--th-ring)}",
    /* 月历导航箭头：hover 下沉面、focus 焦点环 */
    ".th-drp-nav{transition:background var(--th-dur-1) var(--th-ease)}",
    ".th-drp-nav:hover{background:var(--color-row-hover)}",
    ".th-drp-nav:focus-visible{outline:none;box-shadow:var(--th-ring)}",
    /* 日格：非端点非区间的空白日 hover 才变色（端点/区间保留其填充），focus 焦点环 */
    ".th-drp-day{transition:background var(--th-dur-1) var(--th-ease)}",
    ".th-drp-day[data-fill=\"none\"]:hover{background:var(--color-row-hover)}",
    ".th-drp-day:focus-visible{outline:none;box-shadow:var(--th-ring)}",
  ].join("");
  document.head.appendChild(s);
}
const TH_DRP_DOW = ["一", "二", "三", "四", "五", "六", "日"];
const TH_DRP_PRESETS = [
  { key: "today", label: "今天", days: 0 },
  { key: "7d", label: "近 7 天", days: 6 },
  { key: "30d", label: "近 30 天", days: 29 },
  { key: "90d", label: "近 90 天", days: 89 },
];
function thDrpFmt(d) { const p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
function thDrpParse(s) { if (!s) return null; const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function thDrpStrip(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function thDrpSameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function thDrpAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function thDrpAddMonth(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
export function DateRangePicker({ value, onChange, defaultOpen = false, size = "md", mode = "range", style }) {
  const single = mode === "single";
  const [open, setOpen] = React.useState(defaultOpen);
  const ref = React.useRef(null);
  const today = new Date();
  const v = value || { start: thDrpFmt(today), end: thDrpFmt(today) };
  const startD = thDrpParse(v.start) || today;
  const endD = thDrpParse(v.end) || startD;
  const [cursor, setCursor] = React.useState(new Date(startD.getFullYear(), startD.getMonth(), 1));
  // range 模式下：false=下一次点击设起点，true=设终点
  const [pickingEnd, setPickingEnd] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  React.useEffect(() => { if (open) { setCursor(new Date(startD.getFullYear(), startD.getMonth(), 1)); setPickingEnd(false); } }, [open]);
  const set = (nv) => { if (onChange) onChange(nv); };
  const pickPreset = (p) => {
    const d = thDrpAddDays(new Date(), -p.days);
    if (single) { set({ start: thDrpFmt(new Date()), end: thDrpFmt(new Date()) }); }
    else { set({ start: thDrpFmt(d), end: thDrpFmt(new Date()) }); }
    setOpen(false);
  };
  const pickDay = (d) => {
    if (single) { set({ start: thDrpFmt(d), end: thDrpFmt(d) }); setOpen(false); return; }
    if (!pickingEnd) { set({ start: thDrpFmt(d), end: d > endD ? thDrpFmt(d) : v.end }); setPickingEnd(true); }
    else { if (d < startD) { set({ start: thDrpFmt(d), end: thDrpFmt(startD) }); } else { set({ start: v.start, end: thDrpFmt(d) }); } setPickingEnd(false); }
  };
  const ctlH = size === "sm" ? 28 : 32;
  const ctlFs = size === "sm" ? "var(--th-text-xs)" : "var(--th-text-base)";
  const presets = single ? TH_DRP_PRESETS.slice(0, 1) : TH_DRP_PRESETS;
  const triggerLabel = single ? v.start : (v.start + " ~ " + v.end);
  // 构建 6×7 月历格（周一起始）
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const cells = []; for (let i = 0; i < 42; i++) cells.push(thDrpAddDays(first, i - offset));
  const inRange = (d) => !single && d >= thDrpStrip(startD) && d <= thDrpStrip(endD);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", fontFamily: "var(--th-font-cn)", ...style }}>
      <button type="button" className="th-drp-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} style={{ height: ctlH, padding: "0 var(--th-space-4)", display: "inline-flex", alignItems: "center", gap: "var(--th-space-2)", background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", cursor: "pointer", fontFamily: "inherit", fontSize: ctlFs, color: "var(--color-fg)" }}>
        <i className={single ? "ri-calendar-event-line" : "ri-calendar-line"} style={{ fontSize: 14, color: "var(--color-fg-muted)" }} />
        <span className="th-nums" style={{ fontSize: "var(--th-text-xs)" }}>{triggerLabel}</span>
        <i className="ri-arrow-down-s-line" style={{ fontSize: 14, color: "var(--color-fg-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--th-dur-1) var(--th-ease)" }} />
      </button>
      {open && (
        <div role="dialog" aria-label={single ? "选择日期" : "选择日期范围"} style={{ position: "absolute", top: "calc(100% + var(--th-space-1))", left: 0, zIndex: "var(--z-dropdown)", display: "flex", background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-md)", boxShadow: "var(--th-shadow-soft)", overflow: "hidden", transformOrigin: "top", animation: "th-menu-in var(--th-dur-2) var(--th-ease)" }}>
          <div style={{ padding: "var(--th-space-4) var(--th-space-1) var(--th-space-1)", borderRight: "0.5px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "var(--th-space-1)" }}>
            {presets.map((p) => (
              <button type="button" key={p.key} className="th-drp-preset" onClick={() => pickPreset(p)}
                style={{ height: ctlH, padding: "0 var(--th-space-4)", border: "none", borderRadius: "var(--th-radius-sm)", display: "flex", alignItems: "center", fontFamily: "inherit", fontSize: "var(--th-text-sm)", color: "var(--color-fg)", whiteSpace: "nowrap", cursor: "pointer", background: "transparent" }}>{p.label}</button>
            ))}
          </div>
          <div style={{ padding: "var(--th-space-4)", display: "flex", flexDirection: "column", gap: "var(--th-space-2)", width: 244 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "var(--th-space-1)" }}>
              <button type="button" className="th-drp-nav" aria-label="上个月" onClick={() => setCursor(thDrpAddMonth(cursor, -1))} style={{ width: ctlH, height: ctlH, border: "none", background: "transparent", borderRadius: "var(--th-radius-sm)", color: "var(--color-fg-muted)", fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><i className="ri-arrow-left-s-line" /></button>
              <div style={{ fontSize: "var(--th-text-sm)", fontWeight: 500, color: "var(--color-fg)" }}>{cursor.getFullYear()} 年 {cursor.getMonth() + 1} 月</div>
              <button type="button" className="th-drp-nav" aria-label="下个月" onClick={() => setCursor(thDrpAddMonth(cursor, 1))} style={{ width: ctlH, height: ctlH, border: "none", background: "transparent", borderRadius: "var(--th-radius-sm)", color: "var(--color-fg-muted)", fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><i className="ri-arrow-right-s-line" /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", fontSize: "var(--th-text-2xs)", color: "var(--color-fg-muted)" }}>
              {TH_DRP_DOW.map((d) => <div key={d} style={{ textAlign: "center", padding: "var(--th-space-1) 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {cells.map((d, i) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const isStart = thDrpSameDay(d, startD);
                const isEnd = thDrpSameDay(d, endD);
                const endpoint = single ? isStart : (isStart || isEnd);
                const within = inRange(d) && !endpoint;
                const isToday = thDrpSameDay(d, today);
                const fill = endpoint ? "endpoint" : (within ? "within" : "none");
                return (
                  <button type="button" key={i} className="th-drp-day" data-fill={fill} onClick={() => pickDay(d)}
                    style={{
                      height: 30, border: "none", cursor: "pointer", fontFamily: "inherit",
                      fontSize: "var(--th-text-xs)", fontVariantNumeric: "tabular-nums",
                      fontWeight: endpoint ? 600 : 400,
                      color: !inMonth ? "var(--color-fg-subtle)" : (endpoint ? "var(--color-cta-fg)" : "var(--color-fg)"),
                      background: endpoint ? "var(--color-cta)" : (within ? "var(--color-accent-soft)" : "transparent"),
                      borderRadius: endpoint ? "var(--th-radius-sm)" : (within ? 0 : "var(--th-radius-sm)"),
                      boxShadow: isToday && !endpoint ? "inset 0 0 0 1px var(--color-accent)" : "none",
                      padding: 0,
                    }}>{d.getDate()}</button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## daterangepicker.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="DateRangePicker" subtitle="日期选择 — 区间 / 单日期，月历网格" viewport="700x420" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../../fonts/remixicon.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;width:calc(100% - 48px);height:372px;padding:var(--th-space-8) var(--th-space-8);display:flex;gap:var(--th-space-8);align-items:flex-start;background:var(--color-surface);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:var(--th-space-8)}.group{display:flex;flex-direction:column;gap:var(--th-space-2)}.label{color:var(--color-fg-muted);font-size:var(--th-text-xs)}.error{margin:var(--th-space-8);padding:var(--th-space-4);font-family:var(--th-font-cn);font-size:var(--th-text-sm);color:var(--color-danger-fg);background:var(--color-danger-soft);border:0.5px solid var(--color-danger-border);border-radius:var(--th-radius-sm)}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { DateRangePicker } = window.TokenHubDesignSystem_019e20 || {};
function Demo() {
  if (!DateRangePicker) return <div className="error">DateRangePicker 组件未加载</div>;
  const [range, setRange] = React.useState({ start: "2026-07-06", end: "2026-07-20" });
  const [day, setDay] = React.useState({ start: "2026-07-15", end: "2026-07-15" });
  return <div className="panel"><div className="group"><span className="label">区间 · md · 展开</span><DateRangePicker value={range} onChange={setRange} defaultOpen /></div><div className="group"><span className="label">单日期 · sm</span><DateRangePicker mode="single" size="sm" value={day} onChange={setDay} /></div></div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
