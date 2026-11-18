# Transfer 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Transfer.d.ts

```typescript
import * as React from "react";
export interface TransferItem { key: string; label: React.ReactNode; }
export interface TransferProps {
  items: TransferItem[];
  /** Controlled keys in the right list. */
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  onChange?: (targetKeys: string[]) => void;
  /** [left, right] panel titles. @default ["可选", "已选"] */
  titles?: [string, string];
  /** Panel height in px. @default 260 */
  height?: number;
  style?: React.CSSProperties;
}
export function Transfer(props: TransferProps): JSX.Element;
```

## Transfer.jsx

```jsx
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Scrollbar } from "./Scrollbar";

/* Transfer.jsx — dual-list shuttle for assigning models / members. */
if (typeof document !== "undefined" && !document.getElementById("th-transfer-css")) {
  const s = document.createElement("style");
  s.id = "th-transfer-css";
  s.textContent = `.th-transfer-list{scrollbar-width:none;-ms-overflow-style:none}.th-transfer-list::-webkit-scrollbar{width:0;height:0;display:none}`;
  document.head.appendChild(s);
}
function ThTransferList({ title, items, checked, onToggle, onToggleAll }) {
  const allOn = items.length > 0 && items.every((it) => checked.has(it.key));
  const viewRef = React.useRef(null);
  return (
    <div style={{ flex: 1, minWidth: 0, border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", background: "var(--th-white)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
       <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: "var(--th-border-hairline)", background: "var(--th-bg)" }}>
        <Checkbox checked={allOn} indeterminate={!allOn && checked.size > 0} onChange={onToggleAll} aria-label={`${title}全选`} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--th-gray-900)", flex: 1 }}>{title}</span>
        <span style={{ fontSize: 11, color: "var(--th-gray-300)" }}>{checked.size ? checked.size + "/" : ""}{items.length} 项</span>
      </div>
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <div ref={viewRef} className="th-transfer-list" style={{ position: "absolute", inset: 0, overflowY: "auto", padding: 4 }}>
          {items.map((it) => (
            <div key={it.key} style={{ display: "flex", minWidth: 0, padding: "6px 8px", borderRadius: "var(--th-radius-xs)", fontSize: 13, color: "var(--th-gray-900)" }}>
              <Checkbox style={{ width: "100%", minWidth: 0 }} checked={checked.has(it.key)} onChange={() => onToggle(it.key)} label={<span style={{ display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>} />
            </div>
          ))}
          {!items.length && <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: "var(--th-gray-250)" }}>暂无数据</div>}
        </div>
        <Scrollbar targetRef={viewRef} axis="y" reveal="hover" />
      </div>
    </div>
  );
}
export function Transfer({ items = [], targetKeys, defaultTargetKeys = [], onChange, titles = ["可选", "已选"], height = 260, style }) {
  const [innerTarget, setInnerTarget] = React.useState(defaultTargetKeys);
  const target = targetKeys ?? innerTarget;
  const [checked, setChecked] = React.useState(new Set());
  const setTarget = (next) => { if (!targetKeys) setInnerTarget(next); onChange && onChange(next); };
  const left = items.filter((it) => !target.includes(it.key));
  const right = items.filter((it) => target.includes(it.key));
  const toggle = (k) => setChecked((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleAll = (list) => (on) => setChecked((p) => { const n = new Set(p); list.forEach((it) => on ? n.add(it.key) : n.delete(it.key)); return n; });
  const move = (toRight) => {
    const pool = (toRight ? left : right).filter((it) => checked.has(it.key)).map((it) => it.key);
    if (!pool.length) return;
    setTarget(toRight ? [...target, ...pool] : target.filter((k) => !pool.includes(k)));
    setChecked((p) => { const n = new Set(p); pool.forEach((k) => n.delete(k)); return n; });
  };
  const leftSel = left.filter((it) => checked.has(it.key)).length;
  const rightSel = right.filter((it) => checked.has(it.key)).length;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "stretch", height, fontFamily: "var(--th-font-cn)", ...style }}>
      <ThTransferList title={titles[0]} items={left} checked={new Set(left.filter((it) => checked.has(it.key)).map((it) => it.key))} onToggle={toggle} onToggleAll={toggleAll(left)} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
        <Button size="sm" icon="ri-arrow-right-line" aria-label="移到已选" disabled={leftSel === 0} onClick={() => move(true)} />
        <Button size="sm" icon="ri-arrow-left-line" aria-label="移回可选" disabled={rightSel === 0} onClick={() => move(false)} />
      </div>
      <ThTransferList title={titles[1]} items={right} checked={new Set(right.filter((it) => checked.has(it.key)).map((it) => it.key))} onToggle={toggle} onToggleAll={toggleAll(right)} />
    </div>
  );
}
```

## transfer.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Transfer" subtitle="穿梭框 — 分配可用模型 / 成员" viewport="760x340" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Transfer } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Transfer titles={["全部模型", "已授权"]} height={250} defaultTargetKeys={["deepseek-v3", "qwen-max"]} items={[
      { key: "deepseek-v3", label: "DeepSeek V3" },
      { key: "deepseek-r1", label: "DeepSeek R1" },
      { key: "qwen-max", label: "Qwen Max" },
      { key: "qwen-plus", label: "Qwen Plus" },
      { key: "glm-4", label: "GLM-4" },
      { key: "kimi-k2", label: "Kimi K2" },
    ]} />
  </div>
);</script>
</body>
</html>
```
