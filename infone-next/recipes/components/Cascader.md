# Cascader 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## 与 Select 层级筛选的边界

本组件选择一条完整路径，`value` 是路径数组，不是多个选项。跨分支多选、父子全选联动、可删除标签、全局搜索和深层返回定位使用 [Select](Select.md) 的 `mode="auto"`：1 级普通选择、2–3 级级联多选、≥4 级最多两列逐级导航。

Select 的触发器无点击激活态、20px 标签和父级部分选择规则只属于 Select 的多选组合，不改变 Cascader 既有单路径 API。

## Cascader.d.ts

```typescript
import * as React from "react";
export interface CascaderOption { value: string; label: React.ReactNode; children?: CascaderOption[]; }
export interface CascaderProps {
  options: CascaderOption[];
  /** Controlled value path, e.g. ["deepseek", "v3"]. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (valuePath: string[], labelPath: React.ReactNode[]) => void;
  /** @default "请选择" */
  placeholder?: string;
  /** Trigger width in px. @default 260 */
  width?: number;
  /** Label join separator. @default " / " */
  separator?: string;
  /** 控制高度两档：`sm`=28px 紧凑、`md`=32px 松弛。@default "md" */
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function Cascader(props: CascaderProps): JSX.Element;
```

## Cascader.jsx

```jsx
import { Scrollbar } from "./Scrollbar";

/* Cascader.jsx — cascading columns select (vendor → series → model). */
if (typeof document !== "undefined" && !document.getElementById("th-cascader-css")) {
  const s = document.createElement("style");
  s.id = "th-cascader-css";
  s.textContent = `.th-cascader-col{scrollbar-width:none;-ms-overflow-style:none}.th-cascader-col::-webkit-scrollbar{width:0;height:0;display:none}`;
  document.head.appendChild(s);
}
function CascaderColumn({ col, depth, hoverPath, path, onPick }) {
  const viewRef = React.useRef(null);
  return (
    <div style={{ position: "relative", minWidth: 130, borderLeft: depth ? "1px solid var(--th-gray-50)" : "none" }}>
      <div ref={viewRef} className="th-cascader-col" style={{ maxHeight: 240, overflowY: "auto", padding: 4 }}>
        {col.map((opt) => {
          const active = hoverPath[depth] === opt.value;
          const isLeafPicked = path[depth] === opt.value && depth === path.length - 1;
          return (
            <div key={opt.value} onClick={() => onPick(opt, depth)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: "var(--th-radius-xs)", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", background: active ? "var(--color-nav-selected)" : "transparent", color: "var(--color-fg)", fontWeight: isLeafPicked ? 500 : 400 }}>
              <span style={{ flex: 1 }}>{opt.label}</span>
              {opt.children && opt.children.length > 0 && <i className="ri-arrow-right-s-line" style={{ fontSize: 14, color: "var(--color-fg-muted)" }} />}
              {isLeafPicked && <i className="ri-check-line" style={{ fontSize: 14 }} />}
            </div>
          );
        })}
      </div>
      <Scrollbar targetRef={viewRef} axis="y" reveal="hover" />
    </div>
  );
}

export function Cascader({ options = [], value, defaultValue = [], onChange, placeholder = "请选择", width = 260, separator = " / ", size = "md", style }) {
  const [inner, setInner] = React.useState(defaultValue);
  const path = value ?? inner;
  const [open, setOpen] = React.useState(false);
  const [hoverPath, setHoverPath] = React.useState([]);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const labelsOf = (p) => { let opts = options, out = []; for (const v of p) { const hit = opts.find((o) => o.value === v); if (!hit) break; out.push(hit.label); opts = hit.children || []; } return out; };
  const columns = [];
  { let opts = options; columns.push(opts); for (const v of hoverPath) { const hit = opts.find((o) => o.value === v); if (hit && hit.children && hit.children.length) { columns.push(hit.children); opts = hit.children; } else break; } }
  const pick = (opt, depth) => {
    const next = [...hoverPath.slice(0, depth), opt.value];
    setHoverPath(next);
    if (!opt.children || !opt.children.length) {
      if (value === undefined) setInner(next);
      onChange && onChange(next, labelsOf(next));
      setOpen(false);
    }
  };
  const labels = labelsOf(path);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block", width, fontFamily: "var(--th-font-cn)", ...style }}>
      <button onClick={() => { setOpen((v) => !v); setHoverPath(path.slice(0, -1)); }}
        style={{ width: "100%", height: size === "sm" ? 28 : 32, padding: "0 10px", display: "flex", alignItems: "center", gap: 8, border: `0.5px solid ${open ? "var(--th-teal-500)" : "var(--color-border)"}`, borderRadius: "var(--th-radius-sm)", background: "var(--th-white)", cursor: "pointer", fontFamily: "inherit", fontSize: size === "sm" ? 12 : 13, transition: "border-color .15s" }}>
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: labels.length ? "var(--th-gray-900)" : "var(--th-gray-250)" }}>{labels.length ? labels.join(separator) : placeholder}</span>
        <i className="ri-arrow-down-s-line" style={{ fontSize: 14, color: "var(--color-fg-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50, display: "flex", background: "var(--th-white)", border: "var(--th-border-card)", borderRadius: "var(--th-radius-sm)", boxShadow: "var(--th-shadow-soft)", overflow: "hidden" }}>
          {columns.map((col, depth) => (
            <CascaderColumn key={depth} col={col} depth={depth} hoverPath={hoverPath} path={path} onPick={pick} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## cascader.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Cascader" subtitle="级联选择 — sm=28px / md=32px" viewport="700x320" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0}.panel{box-sizing:border-box;padding:24px 26px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);margin:24px;display:flex;flex-direction:column;gap:18px}.row{display:flex;align-items:center;gap:12px}.label{width:92px;color:var(--color-fg-muted);font-size:12px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Cascader } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel" style={{ height: 250 }}>
    <div className="row"><span className="label">sm · 28px</span><Cascader size="sm" defaultValue={["deepseek", "v3"]} width={280} options={[
      { value: "deepseek", label: "DeepSeek", children: [
        { value: "v3", label: "DeepSeek V3" },
        { value: "r1", label: "DeepSeek R1" },
      ]},
      { value: "qwen", label: "通义千问", children: [
        { value: "max", label: "Qwen Max" },
        { value: "plus", label: "Qwen Plus" },
        { value: "turbo", label: "Qwen Turbo" },
      ]},
      { value: "zhipu", label: "智谱 AI", children: [
        { value: "glm4", label: "GLM-4" },
      ]},
    ]} /></div>
    <div className="row"><span className="label">md · 32px</span><Cascader defaultValue={["qwen", "max"]} width={280} options={[
      { value: "deepseek", label: "DeepSeek", children: [
        { value: "v3", label: "DeepSeek V3" },
        { value: "r1", label: "DeepSeek R1" },
      ]},
      { value: "qwen", label: "通义千问", children: [
        { value: "max", label: "Qwen Max" },
        { value: "plus", label: "Qwen Plus" },
        { value: "turbo", label: "Qwen Turbo" },
      ]},
      { value: "zhipu", label: "智谱 AI", children: [
        { value: "glm4", label: "GLM-4" },
      ]},
    ]} /></div>
  </div>
);</script>
</body>
</html>
```
