# Tree 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

**适用边界**：`Tree` 用于权限分配、级联勾选和紧凑层级导航，节点以一个主标签为核心。层级记录同时具有状态、负责人、数量、时间或操作等多列属性时，使用 `DataTable variant="tree"`，不要把 `Tree` 扩展成表格。

## Tree.d.ts

```typescript
import * as React from "react";
export interface TreeNode {
  key: string;
  title: React.ReactNode;
  /** Remix Icon class before the title. */
  icon?: string;
  /** Right-aligned node in the row. */
  extra?: React.ReactNode;
  children?: TreeNode[];
}
export interface TreeProps {
  data: TreeNode[];
  /** Show cascading checkboxes. @default false */
  checkable?: boolean;
  /** Defaults to all keys expanded. */
  defaultExpandedKeys?: string[];
  /** Collapse consecutive single-child levels at this depth. Omit to keep the full tree. */
  ellipsisDepth?: number;
  /** Controlled checked keys. */
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (keys: string[]) => void;
  onSelect?: (key: string) => void;
  style?: React.CSSProperties;
}
export function Tree(props: TreeProps): JSX.Element;
```

### 深层级省略

`ellipsisDepth` 未传时保留完整层级；传入数字后，从该层级开始压缩连续的单子节点路径。省略项显示为“显示 N 个中间层级”，展开后同一位置显示“收起中间层级”。省略项不是目录节点，不触发 `onSelect`。

该能力只影响展示，不改变 `data`、节点 key、勾选关系或真实层级语义。只在用户需要深层路径压缩时启用；普通层级导航不要默认传入。压缩逻辑仅作用于连续的单子节点路径，遇到分支节点后停止。

## Tree.jsx

```jsx
import { Checkbox } from "./Checkbox";

/* Tree.jsx — compact hierarchy navigation and permission selection with optional cascading checkboxes. */
function thTreeCollect(node, out) { out.push(node.key); (node.children || []).forEach((c) => thTreeCollect(c, out)); return out; }
export function Tree({ data = [], checkable = false, defaultExpandedKeys, ellipsisDepth, checkedKeys, defaultCheckedKeys = [], onCheck, onSelect, style }) {
  const allKeys = React.useMemo(() => data.reduce((a, n) => thTreeCollect(n, a), []), [data]);
  const [expanded, setExpanded] = React.useState(new Set(defaultExpandedKeys ?? allKeys));
  const [innerChecked, setInnerChecked] = React.useState(new Set(defaultCheckedKeys));
  const checked = checkedKeys ? new Set(checkedKeys) : innerChecked;
  const [selected, setSelected] = React.useState(null);
  const [ellipsisExpanded, setEllipsisExpanded] = React.useState(new Set());
  const nodeRefs = React.useRef(new Map());
  const parentKeys = React.useMemo(() => {
    const parents = new Map();
    const walk = (nodes, parent) => nodes.forEach((node) => { if (parent) parents.set(node.key, parent); walk(node.children || [], node.key); });
    walk(data, null);
    return parents;
  }, [data]);
  const setChecked = (next) => { if (!checkedKeys) setInnerChecked(next); onCheck && onCheck([...next]); };
  const toggleCheck = (node, shouldCheck = !checked.has(node.key)) => {
    const keys = thTreeCollect(node, []);
    const next = new Set(checked);
    keys.forEach((k) => shouldCheck ? next.add(k) : next.delete(k));
    setChecked(next);
  };
  const focusNode = (key) => nodeRefs.current.get(key)?.focus();
  const toggleExpanded = (node) => {
    if (!(node.children || []).length) return;
    setExpanded((previous) => { const next = new Set(previous); next.has(node.key) ? next.delete(node.key) : next.add(node.key); return next; });
  };
  const toggleEllipsis = (key) => setEllipsisExpanded((previous) => {
    const next = new Set(previous);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const getSingleChildChain = (node) => {
    const chain = [node];
    let current = node;
    while ((current.children || []).length === 1) {
      current = current.children[0];
      chain.push(current);
    }
    return chain;
  };
  const renderNode = (node, depth, index, siblingCount, visualDepth = depth, visibleParentKey) => {
    const kids = node.children || [];
    const chain = ellipsisDepth != null && depth === ellipsisDepth ? getSingleChildChain(node) : [node];
    const isEllipsisPath = chain.length > 2;
    const isEllipsisOpen = ellipsisExpanded.has(node.key);
    const terminal = chain[chain.length - 1];
    const hiddenCount = Math.max(0, chain.length - 2);
    const isOpen = expanded.has(node.key);
    const descendantKeys = thTreeCollect(node, []);
    const selectedKeys = descendantKeys.filter((key) => checked.has(key));
    const isChecked = checkable && selectedKeys.length === descendantKeys.length;
    const indeterminate = checkable && selectedKeys.length > 0 && !isChecked;
    return (
      <div key={node.key}>
        <div role="treeitem" tabIndex={selected === node.key || (selected === null && allKeys[0] === node.key) ? 0 : -1}
          aria-level={depth + 1} aria-posinset={index + 1} aria-setsize={siblingCount} aria-selected={selected === node.key}
          aria-expanded={kids.length ? isOpen : undefined} aria-checked={checkable ? isChecked : undefined}
          ref={(element) => element ? nodeRefs.current.set(node.key, element) : nodeRefs.current.delete(node.key)}
          onClick={() => { setSelected(node.key); onSelect?.(node.key); }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") { event.preventDefault(); if (kids.length && !isOpen) toggleExpanded(node); else if (isEllipsisPath && !isEllipsisOpen) toggleEllipsis(node.key); else if (kids.length) focusNode(kids[0].key); }
            if (event.key === "ArrowLeft") { event.preventDefault(); if (isEllipsisPath && isEllipsisOpen) toggleEllipsis(node.key); else if (kids.length && isOpen) toggleExpanded(node); else if (visibleParentKey || parentKeys.has(node.key)) focusNode(visibleParentKey || parentKeys.get(node.key)); }
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(node.key); onSelect?.(node.key); }
          }}
          style={{ boxSizing: "border-box", display: "flex", alignItems: "center", gap: 6, minHeight: 30, paddingLeft: visualDepth * 20 + 4, paddingRight: 8, borderRadius: "var(--th-radius-xs)", cursor: "pointer", background: selected === node.key ? "var(--color-nav-selected)" : "transparent", color: "var(--color-fg)", fontWeight: selected === node.key ? 500 : 400, lineHeight: 1, transition: "background .15s" }}>
           <button type="button" aria-label={isOpen ? "折叠" : "展开"} onClick={(event) => { event.stopPropagation(); toggleExpanded(node); }}
             style={{ appearance: "none", width: 24, height: 24, padding: 0, border: 0, background: "transparent", color: "var(--color-fg-muted)", visibility: kids.length ? "visible" : "hidden", cursor: kids.length ? "pointer" : "default", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
             <i className="ri-arrow-right-s-line" aria-hidden="true" style={{ display: "block", fontSize: 14, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform var(--th-dur-1) var(--th-ease)" }} />
           </button>
          {checkable && (
            <span onClick={(event) => event.stopPropagation()}>
               <Checkbox checked={isChecked} indeterminate={indeterminate} onChange={() => toggleCheck(node, !isChecked)} aria-label={`选择${node.title}`} />
            </span>
          )}
           {node.icon && <i className={node.icon} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, fontSize: 14, lineHeight: 1, color: "var(--color-fg-muted)" }} />}
           <span style={{ minWidth: 0, fontFamily: "var(--th-font-cn)", fontSize: 13, color: "inherit", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{node.title}</span>
          {node.extra && <span style={{ marginLeft: "auto" }}>{node.extra}</span>}
        </div>
          {isOpen && isEllipsisPath && (
             <div role="presentation" style={{ boxSizing: "border-box", display: "flex", alignItems: "center", minHeight: 30, paddingLeft: visualDepth * 20 + 34, paddingRight: 8, lineHeight: 1 }}>
               <button type="button" aria-label={isEllipsisOpen ? "收起中间层级" : `显示 ${hiddenCount} 个中间层级`} aria-expanded={isEllipsisOpen} onClick={(event) => { event.stopPropagation(); toggleEllipsis(node.key); }}
                  style={{ appearance: "none", minHeight: 24, padding: 0, border: 0, background: "transparent", color: "var(--color-link)", cursor: "pointer", font: "inherit", textDecoration: "underline", textDecorationColor: "var(--color-border)", textUnderlineOffset: 3 }}>
                {isEllipsisOpen ? "收起中间层级" : `显示 ${hiddenCount} 个中间层级`} <span aria-hidden="true">···</span>
              </button>
            </div>
          )}
          {isOpen && (!isEllipsisPath || isEllipsisOpen) && kids.map((c, childIndex) => renderNode(c, depth + 1, childIndex, kids.length, visualDepth + 1))}
          {isOpen && isEllipsisPath && !isEllipsisOpen && renderNode(terminal, depth + chain.length - 1, 0, 1, visualDepth + 2, node.key)}
      </div>
    );
  };
  return <div role="tree" aria-multiselectable={checkable ? true : undefined} style={{ fontFamily: "var(--th-font-cn)", ...style }}>{data.map((n, index) => renderNode(n, 0, index, data.length))}</div>;
}
```

```jsx usage
<Tree
  ellipsisDepth={1}
  data={resourceTree}
  onSelect={(key) => openResource(key)}
/>
```

## tree.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Tree" subtitle="树形控件 — 权限选择 / 紧凑层级导航，级联勾选" viewport="700x430" -->
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
const { Tree, StatusChip } = window.TokenHubDesignSystem_019e20;
ReactDOM.createRoot(document.getElementById("root")).render(
  <div className="panel">
    <Tree checkable defaultCheckedKeys={["console", "keys", "keys-prod", "keys-test", "usage"]} data={[
      { key: "console", title: "控制台", icon: "ri-dashboard-line", children: [
        { key: "keys", title: "API Keys 管理", icon: "ri-key-2-line", children: [
          { key: "keys-prod", title: "生产环境 Keys", icon: "ri-shield-check-line" },
          { key: "keys-test", title: "测试环境 Keys", icon: "ri-flask-line" },
        ]},
        { key: "usage", title: "用量分析", icon: "ri-line-chart-line" },
        { key: "billing", title: "费用账单", icon: "ri-wallet-3-line", extra: <StatusChip tone="warning" dot={false}>敏感</StatusChip> },
      ]},
      { key: "admin", title: "管理后台", icon: "ri-settings-3-line", children: [
        { key: "members", title: "成员管理", icon: "ri-team-line", children: [
          { key: "organization", title: "组织架构", icon: "ri-node-tree", children: [
            { key: "department", title: "产品研发中心", children: [
              { key: "team", title: "平台产品部", children: [
                { key: "roles", title: "角色权限", icon: "ri-shield-user-line" },
              ]},
            ]},
          ]},
        ]},
        { key: "audit", title: "审计日志", icon: "ri-file-list-3-line" },
      ]},
    ]} ellipsisDepth={1} />
  </div>
);</script>
</body>
</html>
```
