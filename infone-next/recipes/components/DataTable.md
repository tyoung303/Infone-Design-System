# DataTable 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## DataTable.d.ts

```typescript
export interface DataTableTreeMeta {
  /** Nesting depth of the row, 0 for top-level. */
  depth: number;
  /** Whether this row has children. */
  hasChildren: boolean;
  /** Current expand state (false when no children). */
  expanded: boolean;
  /** Toggle this row's expand state. No-op when it has no children. */
  toggle: () => void;
}
export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  /** CSS grid track width, e.g. "1.6fr" or "120px". @default "1fr" */
  width?: string;
  /** Cell content. In a tree table the name column also receives the row's
   *  tree meta so it can render the title (1-line/2-line, weight) while the
   *  table owns the indent + chevron affordance around it. */
  render?: (row: T, tree?: DataTableTreeMeta) => React.ReactNode;
  /** Marks this as the tree column: the table wraps its content with the
   *  depth indent and expand/collapse chevron. Exactly one column sets this
   *  when `variant="tree"` is selected. @default false */
  treeColumn?: boolean;
  /** Marks pure numeric, percentage, amount, duration or timestamp columns, including mixed metric cells that need right alignment. Defaults to right alignment and tabular numeric treatment. */
  numeric?: boolean;
  /** Marks row operation columns. Defaults to center alignment; render Button/Dropdown actions inside. */
  action?: boolean;
  /** Explicit cell/header alignment override. Usually omit it and use numeric/action/heat semantics instead. */
  align?: "left" | "center" | "right";
  /** Paint the cell on the --th-heat-0…4 ramp by value. `true` scales across the
   *  rows in view; pass {min,max} to pin the scale (e.g. to a quota). */
  heat?: boolean | { min?: number; max?: number };
  /** Numeric value used for the heat scale when the cell renders formatted text. */
  heatValue?: (row: T) => number;
  /** Shows a sort affordance icon in the header; active state comes from the table's sortKey/sortDir. @default false */
  sortable?: boolean;
}
export interface DataTableTree {
  /** Row field holding the array of child rows. @default "children" */
  childKey?: string;
  /** @deprecated Use DataTableProps.defaultExpandedKeys instead. */
  defaultExpandedKeys?: (string | number)[];
  /** Indent added per depth level, in px. @default 16 */
  indentStep?: number;
}
export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Visual/behavioral table variant. @default "default"; use "tree" for hierarchical rows. */
  variant?: "default" | "tree";
  /** @default "id" */
  rowKey?: string;
  /** Configures hierarchical data when `variant="tree"`: rows nest via `childKey`, the
   *  column with `treeColumn:true` gets an indent + expand/collapse chevron,
   *  and rows flatten by expand state. Levels read by indent only — no
   *  connector lines, no per-level fills required. */
  tree?: DataTableTree;
  /** Controlled expanded row keys for `variant="tree"`. */
  expandedKeys?: (string | number)[];
  /** Initial expanded row keys. Omit to expand every branch. */
  defaultExpandedKeys?: (string | number)[];
  /** Called after a tree row is expanded or collapsed. */
  onExpandedChange?: (keys: (string | number)[]) => void;
  /** Row height/padding preset. @default "comfortable" */
  density?: "comfortable" | "compact";
  /** Zebra-stripe odd rows with the canvas tint. @default false */
  striped?: boolean;
  /** Row hover highlight (--color-row-hover). @default true */
  hoverable?: boolean;
  /** Rows enter with a 28ms stagger on mount. Ignored under prefers-reduced-motion. @default true */
  animate?: boolean;
  /** The table IS a card by default (own border, 8px radius, shadow, white fill).
   *  Pass `embedded` when it sits inside another card: drops the border, radius,
   *  shadow and background so the outlines don't double up and the head row's
   *  radius doesn't fight the card's. @default false */
  embedded?: boolean;
  /** key of the column currently sorted — highlights its header icon. */
  sortKey?: string;
  /** @default "asc" */
  sortDir?: "asc" | "desc";
  /** Called with the column key when a sortable header is clicked. The table does not
   *  sort rows itself — the caller re-sorts `rows` and updates sortKey/sortDir. */
  onSort?: (key: string) => void;
  /** Accessible label for the horizontal scrolling table region. @default "数据表格" */
  ariaLabel?: string;
}
export function DataTable(props: DataTableProps): JSX.Element;
```

## DataTable.jsx

```jsx
import { Scrollbar } from "./Scrollbar";

/* DataTable.jsx — generic grid table: header row + data rows, column-driven.
   density: "comfortable" (default) | "compact" — row geometry comes from the
   density tokens, so a data-density="compact" ancestor tightens it too.
   Rows enter with a 28ms stagger on mount (disabled under reduced motion).
    Alignment defaults are semantic: text/status columns left, `numeric:true`
    columns right, `action:true` columns center, and heat columns right.
    Treat mixed metric cells (for example a progress bar + percentage text)
    as numeric too. Use `align` only for an intentional exception; header and
    cells must match.

   A column with heat:true paints its numeric cell on the --th-heat-0…4 ramp,
   so a usage column reads as "more/less" at a glance.
   embedded: the table IS a card by default (own border/radius/shadow). Pass
   embedded when it sits inside another card, so the borders don't double up
   and the head row's radius doesn't fight the card's.
   Head row carries no fill — a flat tint either reads too heavy on its own
   or blends into the page once lightened. It differentiates from body rows
   by type only (muted color, medium weight) plus an optional sort affordance
   icon per column (columns pass sortable:true; sortKey/sortDir/onSort on the
   table drive the active state — the component never sorts rows itself).
   The head's own hairline replaces the first body row's top border so the
   line isn't drawn twice.
   Horizontal overflow stays inside the table viewport. The native bar is
   hidden and the shared Scrollbar renders the overlay thumb; DataTable does
   not draw or style a private scrollbar.
   tree: select variant:"tree", pass a tree config to nest rows via childKey,
   and mark one column treeColumn:true — the table flattens rows by expand state and wraps that
   column's content with a depth indent + chevron (levels read by indent
   only, step from tree.indentStep). The treeColumn render receives the
   row's tree meta ({depth,hasChildren,expanded,toggle}) so the caller owns
   the title while the table owns the affordance. */
const HEAT_STEPS = 5;
if (typeof document !== "undefined" && !document.getElementById("th-data-table-css")) {
  const s = document.createElement("style");
  s.id = "th-data-table-css";
  s.textContent = `.th-data-table-scroll{scrollbar-width:none;-ms-overflow-style:none}.th-data-table-scroll::-webkit-scrollbar{width:0;height:0;display:none}.th-data-table-scroll:focus-visible,.th-data-table-sort:focus-visible{outline:2px solid var(--color-accent);outline-offset:-2px}.th-data-table-sort:focus-visible{outline-offset:2px}.th-data-table-expander{width:24px;height:24px;flex:0 0 auto;border:0;border-radius:var(--th-radius-sm);background:transparent;color:var(--color-fg-muted);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background var(--th-dur-1) var(--th-ease),color var(--th-dur-1) var(--th-ease)}.th-data-table-expander:hover{background:var(--color-row-hover);color:var(--color-fg)}.th-data-table-expander:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}.th-data-table-expander i{font-size:14px;font-weight:normal;line-height:1}`;
  document.head.appendChild(s);
}
function heatIndex(v, min, max) {
  if (!Number.isFinite(v) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  const t = (v - min) / (max - min);
  return Math.max(0, Math.min(HEAT_STEPS - 1, Math.round(t * (HEAT_STEPS - 1))));
}
 export function DataTable({ columns, rows, rowKey = "id", variant = "default", tree, expandedKeys, defaultExpandedKeys, onExpandedChange, density = "comfortable", striped = false, hoverable = true, animate = true, embedded = false, sortKey, sortDir = "asc", onSort, ariaLabel = "数据表格" }) {
   const viewportRef = React.useRef(null);
   const treeCfg = variant === "tree" ? (tree || {}) : null;
  const [hoverIdx, setHoverIdx] = React.useState(null);
   const childKey = treeCfg?.childKey || "children";
   const indentStep = treeCfg?.indentStep ?? 16;
  const [innerExpanded, setInnerExpanded] = React.useState(() => {
    if (!treeCfg) return new Set();
    const seed = defaultExpandedKeys ?? treeCfg.defaultExpandedKeys;
    if (seed) return new Set(seed);
    const keys = [];
    const walk = (list) => list.forEach((r) => { const kids = r[childKey]; if (kids && kids.length) { keys.push(r[rowKey]); walk(kids); } });
    walk(rows);
    return new Set(keys);
  });
  const expanded = React.useMemo(() => expandedKeys === undefined ? innerExpanded : new Set(expandedKeys), [expandedKeys, innerExpanded]);
  const toggle = React.useCallback((key) => {
    const next = new Set(expanded);
    next.has(key) ? next.delete(key) : next.add(key);
    if (expandedKeys === undefined) setInnerExpanded(next);
    onExpandedChange?.([...next]);
  }, [expanded, expandedKeys, onExpandedChange]);
  const flatRows = React.useMemo(() => {
    if (!treeCfg) return rows.map((r) => ({ row: r, depth: 0, hasChildren: false }));
    const out = [];
    const walk = (list, depth) => list.forEach((r) => {
      const kids = r[childKey];
      const hasChildren = Array.isArray(kids) && kids.length > 0;
      const isOpen = hasChildren && expanded.has(r[rowKey]);
      out.push({ row: r, depth, hasChildren });
      if (isOpen) walk(kids, depth + 1);
    });
    walk(rows, 0);
    return out;
   }, [treeCfg, rows, expanded, childKey, rowKey]);
  const compact = density === "compact";
  const frTotal = columns.reduce((sum, c) => {
    const width = c.width || "1fr";
    return width.endsWith("fr") ? sum + (parseFloat(width) || 1) : sum;
  }, 0);
  const columnWidth = (column) => {
    const width = column.width || "1fr";
    if (!width.endsWith("fr")) return width;
    return frTotal > 0 ? `${((parseFloat(width) || 1) / frTotal) * 100}%` : undefined;
  };
  const columnAlign = (column) => column.align || (column.action ? "center" : column.numeric || column.heat ? "right" : "left");
  const heatRange = React.useMemo(() => {
    const out = {};
    const scan = flatRows.map((f) => f.row);
    columns.forEach((c) => {
      if (!c.heat) return;
      const vals = scan.map((r) => Number(c.heatValue ? c.heatValue(r) : r[c.key])).filter(Number.isFinite);
      const cfg = typeof c.heat === "object" ? c.heat : {};
      out[c.key] = { min: cfg.min ?? Math.min(...vals, 0), max: cfg.max ?? Math.max(...vals, 0) };
    });
    return out;
  }, [columns, flatRows]);
  return (
    <div style={embedded ? dtStyles.plain : dtStyles.card} data-density={compact ? "compact" : undefined}>
      <div style={dtStyles.scrollShell}>
      <div ref={viewportRef} className="th-data-table-scroll" tabIndex={0} role="region" aria-label={`${ariaLabel}，可横向滚动`} style={dtStyles.scroller}>
      <table style={dtStyles.table}>
      <colgroup>{columns.map((c) => <col key={c.key} style={{ width: columnWidth(c) }} />)}</colgroup>
      <thead><tr style={dtStyles.headRow}>
        {columns.map((c) => {
          const active = c.sortable && sortKey === c.key;
          return (
            <th key={c.key} scope="col" aria-sort={active ? (sortDir === "desc" ? "descending" : "ascending") : undefined}
              style={{ ...dtStyles.headCell, textAlign: columnAlign(c) }}>
              {c.sortable && onSort ? <button className="th-data-table-sort" type="button" onClick={() => onSort(c.key)} aria-label={`按${c.label}排序`} style={{ ...dtStyles.sortButton, color: active ? "var(--color-fg)" : "inherit", justifyContent: columnAlign(c) === "right" ? "flex-end" : columnAlign(c) === "center" ? "center" : "flex-start" }}><span>{c.label}</span>
              {c.sortable && <i className={active ? (sortDir === "desc" ? "ri-arrow-down-s-line" : "ri-arrow-up-s-line") : "ri-expand-up-down-line"}
                aria-hidden="true" style={{ fontSize: 14, color: active ? "var(--color-fg)" : "var(--color-fg-subtle)" }} />}</button> : c.label}
            </th>
          );
        })}
      </tr></thead>
      <tbody className={animate ? "th-stagger" : undefined}>
      {flatRows.map(({ row: r, depth, hasChildren }, i) => {
        const isOpen = hasChildren && expanded.has(r[rowKey]);
   const treeMeta = treeCfg ? { depth, hasChildren, expanded: isOpen, toggle: () => hasChildren && toggle(r[rowKey]) } : undefined;
        return (
        <tr key={r[rowKey]} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
          style={{ height: "var(--th-row-h)", fontSize: compact ? "var(--th-text-xs)" : "var(--th-text-base)", background: hoverable && hoverIdx === i ? "var(--color-row-hover)" : striped && i % 2 === 1 ? "var(--th-bg)" : "transparent", transition: "background var(--th-dur-1) var(--th-ease)" }}>
          {columns.map((c) => {
            const content = c.render ? c.render(r, treeMeta) : r[c.key];
             if (treeCfg && c.treeColumn) {
              return (
                <td key={c.key} style={{ ...dtStyles.cell, textAlign: columnAlign(c) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, paddingLeft: depth * indentStep }}>
                    {hasChildren ? (
                      <button type="button" className="th-data-table-expander" aria-expanded={isOpen} aria-label={isOpen ? "折叠" : "展开"} onClick={() => toggle(r[rowKey])}>
                        <i className={isOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} aria-hidden="true" />
                      </button>
                    ) : <span style={{ width: 24, height: 24, flex: "0 0 auto" }} aria-hidden="true" />}
                    <div style={{ minWidth: 0, flex: 1 }}>{content}</div>
                  </div>
                </td>
              );
            }
            if (!c.heat) return <td key={c.key} style={{ ...dtStyles.cell, ...(c.numeric ? dtStyles.numericCell : null), textAlign: columnAlign(c) }}>{content}</td>;
            const range = heatRange[c.key] || { min: 0, max: 0 };
            const step = heatIndex(Number(c.heatValue ? c.heatValue(r) : r[c.key]), range.min, range.max);
            return (
              <td key={c.key} style={{ ...dtStyles.cell, ...dtStyles.numericCell, textAlign: columnAlign(c) }}>
                <span style={{ ...dtStyles.heatCell, background: `var(--th-heat-${step})`, color: step >= 3 ? "var(--th-gray-900)" : "var(--color-fg)" }}>{content}</span>
              </td>
            );
          })}
        </tr>
        );
      })}
      </tbody></table></div>
      <Scrollbar targetRef={viewportRef} axis="x" reveal="hover" />
      </div>
    </div>
  );
}
const dtStyles = {
  card: { overflow: "hidden", borderRadius: "var(--th-radius-md)", background: "var(--th-white)", border: "var(--th-border-card)", boxShadow: "var(--th-shadow-card)", fontFamily: "var(--th-font-cn)" },
  plain: { fontFamily: "var(--th-font-cn)" },
  scrollShell: { position: "relative", minWidth: 0 },
  scroller: { width: "100%", overflowX: "auto", overscrollBehaviorInline: "contain" },
  table: { width: "100%", minWidth: 640, borderCollapse: "collapse", tableLayout: "fixed" },
  headRow: { height: 40, background: "transparent", color: "var(--color-fg-muted)", fontSize: "var(--th-text-xs)", fontWeight: 500 },
  headCell: { padding: "0 16px", borderBottom: "0.5px solid var(--color-border)", fontWeight: 500, whiteSpace: "nowrap" },
  sortButton: { width: "100%", minHeight: 32, display: "inline-flex", alignItems: "center", gap: 4, padding: 0, border: 0, background: "transparent", color: "inherit", font: "inherit", cursor: "pointer" },
  cell: { padding: "var(--th-row-pad-y) 12px", borderTop: "0.5px solid var(--color-border)", overflowWrap: "anywhere" },
  numericCell: { fontFamily: "var(--th-font-ui)", fontVariantNumeric: "tabular-nums" },
  heatCell: { display: "inline-block", minWidth: 56, padding: "2px 8px", borderRadius: "var(--th-radius-sm)", fontVariantNumeric: "tabular-nums", transition: "background var(--th-dur-1) var(--th-ease)" },
};
```

## 滚动规范

- 表格宽度超过容器时，`DataTable` 内部 viewport 继续负责原生滚动语义和触控板、滚轮、键盘操作。
- 原生横向滚动条必须隐藏，并调用既有 `Scrollbar targetRef={viewportRef} axis="x" reveal="hover"` 展示浮层滑块。
- `Scrollbar` 必须作为 viewport 的同级元素放在 `position: relative` 的非滚动 shell 内；不得在 `DataTable` 内自绘或单独定制另一套滑块。
- 内容未溢出时 `Scrollbar` 自动返回 `null`，调用方无需额外判断，也无需新增控制属性。

## data-table.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Data table" subtitle="Column-driven grid table — 无底色表头 + 排序图标、comfortable/compact 密度、hover 行底色、斑马纹、列级热度、卡内嵌（embedded）、tree 层级（缩进 + 展开折叠）" viewport="980x980" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../../fonts/remixicon.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:512px}.tree-demo{width:932px}.card{background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);overflow:hidden}.card>h4{margin:0;padding:12px 16px;font-family:var(--th-font-cn);font-size:var(--th-text-md);font-weight:600}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { DataTable, StatusChip, Button, Dropdown, Progress } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [sortKey, setSortKey] = React.useState("name");
  const [sortDir, setSortDir] = React.useState("asc");
  const onSort = (key) => { if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const rows = [
    { id: 1, name: "production-web", key: "sk-••••3f2a", status: "active" },
    { id: 2, name: "staging-batch", key: "sk-••••91cd", status: "limited" },
    { id: 3, name: "old-key", key: "sk-••••00aa", status: "revoked" },
  ];
  const usage = [
    { id: 1, name: "claude-sonnet-4", calls: 128400, tokens: 42_100_000 },
    { id: 2, name: "gpt-4o-mini", calls: 64200, tokens: 18_600_000 },
    { id: 3, name: "deepseek-v3", calls: 21800, tokens: 6_300_000 },
    { id: 4, name: "qwen-max", calls: 4200, tokens: 900_000 },
  ];
  const orgRows = [
    { id: "org", name: "InfOne 科技", meta: "组织 · 4 部门", owner: "李行", members: 128, budget: 62, status: "on", updated: "10-12 09:20", children: [
      { id: "d1", name: "研发中心", meta: "部门 · 3 组", owner: "王工", members: 64, budget: 78, status: "on", updated: "10-12 08:41", children: [
        { id: "p1", name: "陈思远", meta: "资深工程师", owner: "—", members: 1, budget: 46, status: "on", updated: "10-11 22:03" },
        { id: "p2", name: "赵敏", meta: "工程师", owner: "—", members: 1, budget: 91, status: "risk", updated: "10-12 07:55" },
      ] },
      { id: "d2", name: "增长部", meta: "部门 · 2 组", owner: "周涛", members: 32, budget: 54, status: "on", updated: "10-11 19:12", children: [
        { id: "p3", name: "孙悦", meta: "运营专家", owner: "—", members: 1, budget: 33, status: "off", updated: "10-09 14:20" },
      ] },
    ] },
  ];
  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DataTable
        columns={[
          { key: "name", label: "名称", width: "1.4fr", sortable: true },
          { key: "key", label: "密钥", width: "1.2fr", render: (r) => <code>{r.key}</code> },
          { key: "status", label: "状态", width: "0.8fr", sortable: true, render: (r) => <StatusChip tone={r.status === "active" ? "success" : r.status === "limited" ? "warning" : "danger"}>{r.status === "active" ? "已激活" : r.status === "limited" ? "限速中" : "已禁用"}</StatusChip> },
        ]}
        rows={rows}
        ariaLabel="API 令牌"
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort}
      />
      <DataTable density="compact" striped
        columns={[
          { key: "name", label: "名称 (compact + striped)", width: "1.4fr" },
          { key: "key", label: "密钥", width: "1.2fr", render: (r) => <code>{r.key}</code> },
          { key: "status", label: "状态", width: "0.8fr", render: (r) => <StatusChip tone="success">已激活</StatusChip> },
        ]}
        rows={rows}
      />
      <DataTable density="compact"
        columns={[
          { key: "name", label: "模型 (heat 列)", width: "1.4fr" },
          { key: "calls", label: "调用量", width: "1fr", heat: true, render: (r) => r.calls.toLocaleString("en-US") },
          { key: "tokens", label: "Token", width: "1fr", heat: true, render: (r) => (r.tokens / 1e6).toFixed(1) + "M", heatValue: (r) => r.tokens },
        ]}
        rows={usage}
      />
      <div className="card">
        <h4>卡内嵌表格（embedded）</h4>
        <DataTable embedded density="compact"
          columns={[
            { key: "name", label: "名称", width: "1.4fr" },
            { key: "key", label: "密钥", width: "1.2fr", render: (r) => <code>{r.key}</code> },
            { key: "status", label: "状态", width: "0.8fr", render: (r) => <StatusChip tone="success">已激活</StatusChip> },
          ]}
          rows={rows}
        />
      </div>
      <div className="tree-demo">
      <DataTable
        variant="tree"
        tree={{ childKey: "children" }}
        rowKey="id"
        ariaLabel="组织架构"
        columns={[
          { key: "name", label: "名称", width: "240px", treeColumn: true, render: (r, t) => (
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: "var(--color-fg)", fontWeight: t.depth === 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
              {r.meta && <span style={{ color: "var(--color-fg-muted)", fontSize: "var(--th-text-xs)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.meta}</span>}
            </div>
          ) },
          { key: "owner", label: "责任人", width: "96px" },
          { key: "members", label: "成员", width: "72px", numeric: true, render: (r) => <span style={{ fontFamily: "var(--th-font-ui)", fontVariantNumeric: "tabular-nums" }}>{r.members}</span> },
          { key: "budget", label: "预算使用", width: "136px", numeric: true, render: (r) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <div style={{ width: 56 }}><Progress value={r.budget} size="sm" tone={r.budget >= 90 ? "warning" : "accent"} /></div>
              <span style={{ minWidth: 32, fontFamily: "var(--th-font-ui)", fontVariantNumeric: "tabular-nums", fontSize: "var(--th-text-xs)", color: "var(--color-fg-muted)", textAlign: "right" }}>{r.budget}%</span>
            </div>
          ) },
          { key: "status", label: "状态", width: "88px", render: (r) => <StatusChip tone={r.status === "on" ? "success" : r.status === "risk" ? "warning" : "neutral"}>{r.status === "on" ? "正常" : r.status === "risk" ? "预警" : "冻结"}</StatusChip> },
          { key: "updated", label: "更新时间", width: "120px", numeric: true, render: (r) => <span style={{ fontFamily: "var(--th-font-ui)", fontVariantNumeric: "tabular-nums", color: "var(--color-fg-muted)" }}>{r.updated}</span> },
          { key: "ops", label: "操作", width: "148px", action: true, align: "center", render: (r) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {r.members === 1 ? (
                <>
                  <Button variant="link" size="sm">查看</Button>
                  <Button variant="link" size="sm">编辑</Button>
                </>
              ) : r.id === "d1" || r.id === "d2" ? (
                <>
                  <Button variant="ghost" size="sm" icon="ri-eye-line" aria-label="查看" />
                  <Dropdown size="sm" align="right" items={[
                    { label: "编辑", icon: "ri-pencil-line" },
                    { label: "添加成员", icon: "ri-user-add-line" },
                    { divider: true },
                    { label: "删除", icon: "ri-delete-bin-line", danger: true },
                  ]} />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" icon="ri-eye-line" aria-label="查看" />
                  <Button variant="ghost" size="sm" icon="ri-pencil-line" aria-label="编辑" />
                </>
              )}
            </div>
          ) },
        ]}
        rows={orgRows}
      />
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```
