# Select 组件说明

组件 API、React 实现和独立 HTML 示例的规范源。包含普通选择、级联多选及深层筛选。

## Select.d.ts

```typescript
export interface SelectOption {
  /** 在完整树中唯一，不按当前层级重复。 */
  value: string;
  label: string;
  disabled?: boolean;
  children?: SelectOption[];
}
export type SelectMode = "single" | "auto" | "cascade" | "drilldown";
export interface SelectProps {
  label?: string;
  /** single 为字符串；auto/cascade/drilldown 为可选叶节点 ID 数组。 */
  value?: string | string[];
  options: SelectOption[];
  onChange?: ((value: string) => void) | ((values: string[]) => void);
  /** @default "single"。AI 层级筛选使用 auto；不传时保留原单选 API。 */
  mode?: SelectMode;
  /** 完整树最大深度，根计第 1 级；不能小于 options 的实际深度。 */
  hierarchyDepth?: number;
  /** 级联/深层菜单的根标题。@default "选项" */
  rootLabel?: string;
  /** single 默认“请选择”；其他模式默认“全部”。 */
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** 固定高度：sm=28px；md=32px。@default "md" */
  size?: "sm" | "md";
  "aria-label"?: string;
  /** 控制清空入口；层级模式中不影响逐项取消选择。@default true */
  allowClear?: boolean;
  /** 普通选择默认 false；级联/深层默认 true，复用 SearchBox。 */
  searchable?: boolean;
}
export function Select(props: Omit<SelectProps, "mode" | "value" | "onChange"> & { mode?: "single"; value?: string; onChange?: (value: string) => void }): JSX.Element;
export function Select(props: Omit<SelectProps, "mode" | "value" | "onChange"> & { mode: "auto" | "cascade" | "drilldown"; value?: string[]; onChange?: (values: string[]) => void }): JSX.Element;
```

## AI 选型与兼容

| 场景 | 用法 | 菜单与值 |
| --- | --- | --- |
| 原有普通单选 | 不传 mode，或 `mode="single"` | 原 Select；`value` / `onChange` 为字符串 |
| 1 级筛选 | `mode="auto"` | 普通 Select；数组最多一项 |
| 2–3 级筛选 | `mode="auto"`，解析为 cascade | 默认一列，逐级展开，桌面最多三列；叶节点数组 |
| ≥4 级筛选 | `mode="auto"`，解析为 drilldown | 默认一列，最多两列，继续深入时显示最近两层；叶节点数组 |

- AI 应优先使用 `mode="auto"`，判断依据是**完整 options 树的最大深度**，根节点计第 1 级；不使用当前路径、搜索结果或某一个较浅分支的深度。
- 显式 `cascade` 仅适用于 2–3 级，`drilldown` 仅适用于 ≥4 级；不符合区间时报错，不截断数据。普通 Select 的既有字符串 API 不变。
- `auto` 的数组值契约始终稳定，即使 1 级复用普通选择也返回零项或一项数组。已有字符串值页面无需迁移。
- 完整树尚未确定时不要猜模式，可提供已知完整深度 `hierarchyDepth`。本实现仍要求完整可选树；它没有内置异步加载，接入时必须由数据适配层保证父级全选作用于整个子树，不能只选择已加载节点。
- `Cascader` 用于选择**一条路径**；跨分支多选和父子联动使用本组件，见 [Cascader 边界](Cascader.md)。

```jsx-example
const [selected, setSelected] = React.useState([]);
<Select mode="auto" options={organizationTree} value={selected} onChange={setSelected}
  size="sm" label="组织范围" rootLabel="组织" placeholder="全部" />
```

## 层级选择与导航

- 复选框选择/取消整个可选子树；父级名称和箭头进入下一级；叶节点名称切换该项。浏览与选择互不影响，勾选即生效且不关闭菜单。
- 所有可选后代叶节点选满，父级才勾选；部分选择时父级为空复选框并显示“已选 N 项”。不使用半选勾号，禁用项及禁用分支不参与全选计算。
- 默认空数组显示“全部”，无清除图标，菜单不增加“全部”选项；选中后才显示清除入口。路径页“返回第一级”仅改变浏览位置。
- 完整分支合并成“名称 · N 项”标签；删除该标签取消整个分支。删除单项仅取消该项，并同步祖先状态。
- 触发器固定单行，放不下的标签折叠为“+N 项”；点击查看全部已选叶节点。已选列表按“名称 · 所属路径”单行展示，长路径省略中段，点击查看完整路径并可定位。
- 深层模式最多两列；顶部保留返回、路径定位和当前层数。省略的祖先可展开，点击任一祖先直接进入对应分支；返回恢复该层滚动位置。
- 窄屏只显示当前一列，通过返回/路径导航访问上级。定位只滚动菜单的实际列表，不拉动外层页面。

## 外观与交互状态

- 两档触发器 28 / 32px，左右 padding 均为 `--th-space-4`（12px）。内部 Ghost 动作不叠加独立按钮 padding 或灰色 hover 底。
- 鼠标点击/菜单展开不出现品牌色边框、激活光圈或触发器底色变化，与普通 Select 一致；键盘 `focus-visible` 保留可见焦点提示。
- 触发器内复用中性 Tag，高度为 `calc(var(--th-space-6) + var(--th-space-1))`（20px），普通 Tag 默认高度不变。
- 列表外留白 4px，行 padding 8px 10px，元素间距 8px。列标题不加底部 padding，其后列表不重复加顶部 padding；标题到首行内容间距为 8px。
- 当前展开分支使用中性 `--color-nav-selected`；实际 hover 使用 `--color-row-hover`。鼠标打开菜单不默认激活首项；浏览位置、勾选与键盘焦点分别表达。
- 方向键/Home/End 导航、右键进入、左键返回；Space 勾选，Enter 按当前控件语义执行；Escape 清空搜索或返回路径视图，再关闭菜单并恢复触发器焦点。

## 搜索配置

- 普通 Select 的 `searchable` 默认 `false`；层级多选默认 `true`，允许显式关闭，启用时均复用 `SearchBox size="sm"`。
- 搜索覆盖所有层级的名称和值，不只查当前列；只将命中字符改为品牌色 `--color-accent`，不加高亮底色。
- 搜索结果可勾选，也可定位到原层级。勾选搜索结果中的父级仍选择整个分支，不仅选择匹配结果；清空搜索恢复此前浏览位置。
- 无结果有文字提示，当前选择不变；关闭菜单后清空搜索词。已选列表支持按完整路径搜索。

## 复用与生产接入

层级实现是 Select 的内部组合，复用 SearchBox、Checkbox、Tag、Scrollbar、Button，不要求页面再实现 FilterSelect 或复制试用页样式。组件样式使用 `th-select-filter-*` 命名空间，不依赖试用页的布局类，也不新增共享 token。

React/ReactDOM 由宿主提供；有 ReactDOM 时浮层 portal 到 body，无 ReactDOM 时在组件内保留同一 fixed 浮层。生产工程按现有 recipe 模块化接入约定提供 React，并可从 `react-dom` 导入 ReactDOM；不要依赖预览全局组件命名空间。

## 普通选择状态（兼容）

- 鼠标打开无默认活动项，未选可用项实际 hover 使用 `--th-gray-50`；键盘导航有独立活动项反馈。
- 已选项使用 `--th-teal-50`，禁用项不可选；清除返回空字符串。
- 筛选用 `placeholder="全部"` 配合空值，“全部”不加入 options；普通表单仍可使用有业务意义的真实“全部模型”值。

## Select.jsx

```jsx
import { Scrollbar } from "./Scrollbar";
import { SearchBox } from "./SearchBox";
import { Checkbox } from "./Checkbox";
import { Tag } from "./Tag";
import { Button } from "./Button";

/* Select.jsx — accessible combobox/listbox with keyboard navigation. */
if (typeof document !== "undefined" && !document.getElementById("th-select-css")) {
  const s = document.createElement("style");
  s.id = "th-select-css";
  s.textContent = `.th-select-trigger{box-sizing:border-box;appearance:none;-webkit-appearance:none;line-height:1}.th-select-trigger:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}.th-select-option:not([aria-disabled="true"]):not([aria-selected="true"]):hover,.th-select-option[data-active="true"]:not([aria-selected="true"]){background:var(--th-gray-50)}.th-select-option[aria-selected="true"]{background:var(--th-teal-50)}.th-select-listbox{scrollbar-width:none;-ms-overflow-style:none}.th-select-listbox::-webkit-scrollbar{width:0;height:0;display:none}@media(pointer:coarse){.th-select-trigger{height:44px!important}.th-select-option{min-height:44px!important}}`;
  document.head.appendChild(s);
}
function SingleSelect({ label, value, options = [], onChange, placeholder = "请选择", disabled = false, required = false, invalid = false, size = "md", allowClear = true, searchable = false, "aria-label": ariaLabel }) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [keyboardNavigation, setKeyboardNavigation] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const ref = React.useRef(null);
  const listRef = React.useRef(null);
  const uid = React.useId();
  const labelId = `${uid}-label`;
  const listId = `${uid}-listbox`;
  const iconStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", width: 14, height: 14, fontSize: 14, lineHeight: 1 };
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visible = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !normalizedQuery || `${o.label} ${o.value}`.toLocaleLowerCase().includes(normalizedQuery));
  const enabled = visible.filter(({ o }) => !o.disabled);
  const current = options.find((o) => o.value === value);
  const close = () => { setOpen(false); setActiveIndex(-1); setKeyboardNavigation(false); setSearchQuery(""); };
  const activate = (index) => {
    if (!enabled.length) return;
    const next = (index + enabled.length) % enabled.length;
    setActiveIndex(next);
    requestAnimationFrame(() => {
      const item = listRef.current?.querySelector(`[data-enabled-index="${next}"]`);
      if (!item || !listRef.current) return;
      if (item.offsetTop < listRef.current.scrollTop) listRef.current.scrollTop = item.offsetTop;
      if (item.offsetTop + item.offsetHeight > listRef.current.scrollTop + listRef.current.clientHeight) listRef.current.scrollTop = item.offsetTop + item.offsetHeight - listRef.current.clientHeight;
    });
  };
  const show = (direction = 1, fromKeyboard = false) => {
    if (disabled || !enabled.length) return;
    setOpen(true);
    setKeyboardNavigation(fromKeyboard);
    if (!fromKeyboard) { setActiveIndex(-1); return; }
    const selected = enabled.findIndex(({ o }) => o.value === value);
    activate(selected >= 0 ? selected : direction > 0 ? 0 : enabled.length - 1);
  };
  const choose = (entry) => {
    if (!entry || entry.o.disabled) return;
    onChange?.(entry.o.value);
    close();
  };
  const search = (nextQuery) => {
    setSearchQuery(nextQuery);
    const normalized = nextQuery.trim().toLocaleLowerCase();
    const hasEnabledMatch = options.some((o) => !o.disabled && (!normalized || `${o.label} ${o.value}`.toLocaleLowerCase().includes(normalized)));
    setActiveIndex(hasEnabledMatch ? 0 : -1);
  };
  const highlightMatch = (label) => {
    const text = String(label);
    if (!normalizedQuery) return text;
    const normalizedText = text.toLocaleLowerCase();
    const parts = [];
    let cursor = 0;
    let matchIndex = normalizedText.indexOf(normalizedQuery);
    if (matchIndex < 0) return text;
    while (matchIndex >= 0) {
      if (matchIndex > cursor) parts.push(text.slice(cursor, matchIndex));
      const matchEnd = matchIndex + normalizedQuery.length;
      parts.push(<mark key={`${matchIndex}-${matchEnd}`} style={{ padding: 0, background: "transparent", color: "var(--color-accent)" }}>{text.slice(matchIndex, matchEnd)}</mark>);
      cursor = matchEnd;
      matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
  };
  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) close(); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const onKeyDown = (event) => {
    if (disabled) return;
    if (event.key === "Escape") { if (open) event.preventDefault(); close(); return; }
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) { event.preventDefault(); show(event.key === "ArrowUp" ? -1 : 1, true); return; }
    if (!open) return;
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowDown") { setKeyboardNavigation(true); activate(activeIndex + 1); }
    if (event.key === "ArrowUp") { setKeyboardNavigation(true); activate(activeIndex - 1); }
    if (event.key === "Home") { setKeyboardNavigation(true); activate(0); }
    if (event.key === "End") { setKeyboardNavigation(true); activate(enabled.length - 1); }
    if (event.key === "Enter" || event.key === " ") choose(enabled[activeIndex >= 0 ? activeIndex : 0]);
  };
  return (
    <div ref={ref} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--th-font-cn)" }}>
      {label && <span id={labelId} style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{label}{required ? " *" : ""}</span>}
      <button className="th-select-trigger" type="button" role="combobox" aria-label={label ? undefined : ariaLabel} aria-labelledby={label ? labelId : undefined}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && activeIndex >= 0 ? `${uid}-option-${enabled[activeIndex].i}` : undefined}
        aria-invalid={invalid || undefined} aria-required={required || undefined} disabled={disabled} onKeyDown={onKeyDown} onClick={() => open ? close() : show(1, false)} style={{
        boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", height: size === "sm" ? 28 : 32, minHeight: size === "sm" ? 28 : 32, padding: "0 12px", lineHeight: 1,
        borderRadius: "var(--th-radius-sm)", border: "0.5px solid var(--color-border)", background: "var(--th-white)",
        fontSize: size === "sm" ? 12 : 13, fontFamily: "var(--th-font-cn)", color: current ? "var(--color-fg)" : "var(--color-fg-subtle)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current ? current.label : placeholder}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none" }}>
          {current && allowClear && !disabled && <span role="button" tabIndex={0} aria-label="清除当前选项" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); onChange?.(""); close(); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange?.(""); close(); } }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, color: "var(--color-fg-muted)", cursor: "pointer" }}><i className="ri-close-line" aria-hidden="true" style={iconStyle} /></span>}
          <i className="ri-arrow-down-s-line" aria-hidden="true" style={{ ...iconStyle, color: "var(--color-fg-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
        </span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--th-white)", border: "0.5px solid var(--color-border)", borderRadius: "var(--th-radius-sm)", boxShadow: "var(--th-shadow-soft)", zIndex: "var(--z-dropdown)" }}>
          {searchable && (
            <div style={{ padding: "4px 4px 0" }}>
              <SearchBox size="sm" value={searchQuery} onChange={search} onSearch={() => choose(enabled[activeIndex] || enabled[0])} placeholder="搜索选项" aria-label="搜索选项" style={{ width: "100%" }} />
            </div>
          )}
          <div ref={listRef} id={listId} role="listbox" aria-labelledby={label ? labelId : undefined} className="th-select-listbox" style={{ padding: 4, maxHeight: 220, overflowY: "auto" }}>
            {visible.length > 0 ? visible.map(({ o, i: optionIndex }) => {
              const enabledIndex = enabled.findIndex((entry) => entry.i === optionIndex);
              return <div className="th-select-option" id={`${uid}-option-${optionIndex}`} key={o.value} role="option" aria-selected={o.value === value} aria-disabled={o.disabled || undefined}
                data-enabled-index={enabledIndex >= 0 ? enabledIndex : undefined} data-active={keyboardNavigation && enabledIndex === activeIndex || undefined}
                onMouseEnter={() => { if (enabledIndex < 0) return; setKeyboardNavigation(false); activate(enabledIndex); }} onMouseDown={(e) => e.preventDefault()} onClick={() => choose({ o, i: optionIndex })} style={{
                minHeight: 34, display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: 6, fontSize: 13, cursor: o.disabled ? "not-allowed" : "pointer",
                color: o.disabled ? "var(--color-fg-subtle)" : o.value === value ? "var(--th-teal-700)" : "var(--color-fg)",
              }}>{highlightMatch(o.label)}</div>;
            }) : <div role="status" style={{ minHeight: 34, display: "flex", alignItems: "center", padding: "8px 10px", color: "var(--color-fg-muted)", fontSize: 12 }}>无匹配选项</div>}
          </div>
          <Scrollbar targetRef={listRef} axis="y" reveal="hover" />
        </div>
      )}
    </div>
  );
}

/* Complex filter composition: SearchBox + Checkbox + Tag + Scrollbar + Button.
   Host supplies React, and ReactDOM for body portals; no preview namespace is used. */
function h(...args){return React.createElement(...args);}
if(typeof document!=="undefined"&&!document.getElementById("th-select-filter-css")){
  const style=document.createElement("style");style.id="th-select-filter-css";
  style.textContent=".th-select-filter{position:relative;min-width:0;width:100%}\n.th-select-filter-trigger{display:flex;align-items:center;gap:calc(var(--th-space-4) / 2);width:100%;height:32px;padding:0 var(--th-space-4);background:var(--th-white);border:.5px solid var(--color-border);border-radius:var(--th-radius-sm);font-size:var(--th-text-base);line-height:1;cursor:pointer}\n.th-select-filter[data-size=\"sm\"] .th-select-filter-trigger{height:28px;font-size:var(--th-text-xs)}\n.th-select-filter-tags{display:flex;align-items:center;gap:var(--th-space-1);min-width:0;flex:0 1 auto}\n.th-select-filter-tag-label{max-width:104px}.th-select-filter-icon{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;font-size:14px;line-height:1;flex:none;color:var(--color-fg-muted)}\n.th-select-filter-toggle,.th-select-filter-clear,.th-select-filter-more{flex:none}.th-select-filter-tag-hit{display:inline-flex;flex:none;cursor:pointer}.th-select-filter-tag-hit:focus-visible{outline:2px solid var(--color-accent);outline-offset:1px;border-radius:var(--th-radius-xs)}\n.th-select-filter-placeholder{flex:1;text-align:left;color:var(--color-fg-subtle);white-space:nowrap}\n.th-select-filter-more{white-space:nowrap}\n.th-select-filter-toggle .th-select-filter-icon{transition:transform var(--th-dur-1) var(--th-ease)}.th-select-filter-toggle[aria-expanded=\"true\"] .th-select-filter-icon{transform:rotate(180deg)}\n.th-select-filter-popup{position:fixed;z-index:var(--z-dropdown);display:flex;flex-direction:column;min-height:0;background:var(--th-white);border:.5px solid var(--color-border);border-radius:var(--th-radius-sm);box-shadow:var(--th-shadow-soft);font-family:var(--th-font-cn);font-size:var(--th-text-base);line-height:var(--leading-body)}\n.th-select-filter-search{padding:var(--th-space-1) var(--th-space-1) 0;flex:none}\n.th-select-filter-columns{display:flex;min-height:0;flex:1}\n.th-select-filter-col{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column}.th-select-filter-col+.th-select-filter-col{border-left:.5px solid var(--color-border)}\n.th-select-filter-col-title{display:block;padding:var(--th-space-2) calc(var(--th-space-1) + var(--th-space-3)) 0;font-size:var(--th-text-xs);color:var(--color-fg-muted);font-weight:400;flex:none}\n.th-select-filter-viewport{padding:var(--th-space-1);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;min-height:0;max-height:220px;flex:1}.th-select-filter-viewport::-webkit-scrollbar{display:none}\n.th-select-filter-col-title+.th-select-filter-list-shell .th-select-filter-viewport{padding-top:0}\n.th-select-filter-list-shell{position:relative;display:flex;min-height:0;flex:1}\n.th-select-filter-row{display:flex;align-items:center;gap:var(--th-space-2);min-height:var(--th-row-h);padding:var(--th-space-2) var(--th-space-3);border-radius:var(--th-radius-xs);color:var(--color-fg);background:transparent}\n.th-select-filter-row[data-path=\"true\"]{background:var(--color-nav-selected)}.th-select-filter-row:has(:focus-visible){outline:2px solid var(--color-accent);outline-offset:-2px}\n.th-select-filter-row[data-disabled=\"true\"]{color:var(--color-fg-muted)}\n.th-select-filter-row-action{flex:1;min-width:0;align-self:stretch}.th-select-filter-row-label{white-space:normal}\n.th-select-filter-row-label{flex:1;min-width:0;overflow-wrap:anywhere}.th-select-filter-row-label>span{display:block}.th-select-filter-count{font-size:var(--th-text-xs);white-space:nowrap;color:var(--color-fg-muted)}\n.th-select-filter-context{display:block;color:var(--color-fg-muted);font-size:var(--th-text-xs);overflow-wrap:anywhere;margin-top:var(--th-space-1)}\n.th-select-filter-match{background:transparent;color:var(--color-accent);padding:0}\n.th-select-filter-footer{display:flex;flex:none;align-items:center;justify-content:space-between;gap:var(--th-space-2);padding:var(--th-space-1) var(--th-space-1) var(--th-space-1) calc(var(--th-space-1) + var(--th-space-3));border-top:.5px solid var(--color-border)}\n.th-select-filter-footer-text{font-size:var(--th-text-xs);color:var(--color-fg-muted);white-space:nowrap}\n.th-select-filter-empty{padding:var(--th-space-6);color:var(--color-fg-muted);font-size:var(--th-text-base)}\n.th-select-filter-empty strong{display:block;color:var(--color-fg);font-weight:500;margin-bottom:var(--th-space-1)}\n.th-select-filter-selected-head{display:flex;align-items:center;justify-content:space-between;gap:var(--th-space-2);padding:var(--th-space-1);border-bottom:.5px solid var(--color-border)}\n.th-select-filter-selected-row{display:flex;align-items:center;gap:var(--th-space-2);padding:var(--th-space-2) var(--th-space-3);border-radius:var(--th-radius-xs)}\n.th-select-filter-selected-copy{display:flex;align-items:baseline;gap:var(--th-space-2);flex:1;min-width:0;white-space:nowrap}.th-select-filter-selected-copy>span{display:block}.th-select-filter-selected-copy .th-select-filter-context{margin-top:0;white-space:nowrap}.th-select-filter-mobile-path{display:none}\n\n.th-select-filter-pathbar{display:flex;align-items:center;gap:var(--th-space-1);padding:var(--th-space-1) var(--th-space-3);border-bottom:.5px solid var(--color-border);flex:none;min-width:0}\n.th-select-filter-path-items{display:flex;align-items:center;gap:var(--th-space-1);min-width:0;flex:1}\n.th-select-filter-path-items>button{min-width:0;flex:0 1 auto}.th-select-filter-path-items>button:first-child{flex:none}\n.th-select-filter-path-items .th-select-filter-icon{font-size:var(--th-text-xs)}\n.th-select-filter-path-depth{color:var(--color-fg-muted);font-size:var(--th-text-xs);white-space:nowrap;flex:none}\n.th-select-filter-inline-context{color:var(--color-fg-muted);font-size:var(--th-text-xs)}\n.th-select-filter-path-number{display:block;min-width:var(--th-space-6);color:var(--color-fg-muted);font-size:var(--th-text-xs);flex:none}\n.th-select-filter-path-label{display:block;white-space:normal;overflow-wrap:anywhere;min-width:0;flex:1;text-align:left}\n.th-select-filter-path-heading{display:block;color:var(--color-fg-muted);font-size:var(--th-text-xs);padding:var(--th-space-2) calc(var(--th-space-1) + var(--th-space-3)) 0}\n.th-select-filter-search-locate{flex:none;align-self:center}\n.th-select-filter-popup[data-mode=\"drilldown\"] .th-select-filter-selected-copy{min-width:0}\n.th-select-filter-selected-copy{text-align:left}.th-select-filter-selected-copy>span{min-width:0}\n\n.th-select-filter-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}\n\n@media(hover:hover){.th-select-filter-trigger:hover{border-color:var(--color-border)}.th-select-filter-row:not([data-disabled=\"true\"]):hover,.th-select-filter-selected-row:hover{background:var(--color-row-hover)}}\n@media(max-width:767px){.th-select-filter-col[data-last=\"false\"]{display:none}.th-select-filter-col+.th-select-filter-col{border-left:0}.th-select-filter-mobile-path{display:flex;align-items:center;gap:var(--th-space-2);padding:var(--th-space-1) var(--th-space-2);border-top:.5px solid var(--color-border)}}\n@media(pointer:coarse){.th-select-filter-trigger,.th-select-filter[data-size=\"sm\"] .th-select-filter-trigger{height:44px}.th-select-filter-row{min-height:44px}}\n@media(prefers-reduced-motion:reduce){.th-select-filter-toggle .th-select-filter-icon{transition:none}}\n.th-select-filter,.th-select-filter-popup{font-family:var(--th-font-cn)}\n.th-select-filter *,.th-select-filter-popup,.th-select-filter-popup *{box-sizing:border-box}\n.th-select-filter button:focus-visible,.th-select-filter-popup button:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}\n.th-select-filter[data-disabled=\"true\"]{opacity:.55}.th-select-filter[data-disabled=\"true\"] .th-select-filter-trigger{cursor:not-allowed}\n.th-select-filter-trigger[aria-invalid=\"true\"]{border-color:var(--color-danger-fg)}\n.th-select-filter-label{display:block;font-size:var(--th-text-xs);color:var(--color-fg-muted);margin-bottom:var(--th-space-2)}\n.th-select-filter-truncate{display:block;min-width:0;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.th-select-filter-fill{flex:1 1 0;min-width:0}\n.th-select-filter-actions{display:flex;align-items:center;gap:var(--th-space-2)}\n";document.head.appendChild(style);
}
function getTreeDepth(nodes){return nodes.length?Math.max(...nodes.map(node=>1+getTreeDepth(node.children||[]))):0;}
function resolveFilterMode(options,{mode='auto',hierarchyDepth}={}){
  const measured=getTreeDepth(options);
  if(hierarchyDepth!==undefined&&(!Number.isInteger(hierarchyDepth)||hierarchyDepth<Math.max(1,measured)))throw new Error('hierarchyDepth 必须为完整树的深度，且不得小于已提供树的深度。');
  const depth=Math.max(1,hierarchyDepth||measured);
  const resolved=depth===1?'single':depth<=3?'cascade':'drilldown';
  if(mode!=='auto'&&mode!==resolved)throw new Error('筛选模式与层级不符：'+depth+' 级应使用 '+resolved+'，建议 mode="auto"。');
  return {mode:resolved,depth};
}
function createOptionModel(options){
  const index=new Map();
  const copy=(nodes,parents=[],blocked=false)=>nodes.map(source=>{
    const node={...source,blocked:blocked||!!source.disabled};
    if(index.has(node.value))throw new Error('筛选选项 value 必须唯一：'+node.value);
    node.path=[...parents,node];index.set(node.value,node);
    node.children=source.children?.length?copy(source.children,node.path,node.blocked):[];
    node.leafIds=node.blocked?[]:node.children.length?node.children.flatMap(child=>child.leafIds):[node.value];
    return node;
  });
  return {roots:copy(options),index};
}
function leaves(node){return node.leafIds;}
function summary(nodes,chosen){return nodes.flatMap(node=>{const ids=leaves(node);if(!ids.length)return [];if(ids.every(id=>chosen.has(id)))return [{node,ids,label:node.children.length?node.label+' · '+ids.length+' 项':node.label}];return node.children.length?summary(node.children,chosen):[];});}
function shortPath(nodes){return nodes.length>3?[nodes[0].label,'…',...nodes.slice(-2).map(node=>node.label)].join(' / '):nodes.map(node=>node.label).join(' / ');}
function Highlight({text,query}){const needle=query.trim().toLocaleLowerCase();if(!needle)return text;const lower=text.toLocaleLowerCase();let start=0,at=lower.indexOf(needle),parts=[];while(at>=0){if(at>start)parts.push(text.slice(start,at));parts.push(h('mark',{className:'th-select-filter-match',key:at},text.slice(at,at+needle.length)));start=at+needle.length;at=lower.indexOf(needle,start);}parts.push(text.slice(start));return parts;}
function Icon({name}){return h('i',{className:'th-select-filter-icon ri-'+name,'aria-hidden':true});}
function Scrolling({children,className='',scrollKey='',positions}){
  const ref=React.useRef(null);
  React.useLayoutEffect(()=>{if(ref.current)ref.current.scrollTop=positions?.get(scrollKey)||0;},[scrollKey,positions]);
  return h('div',{className:'th-select-filter-list-shell '+className},h('div',{className:'th-select-filter-viewport th-select-filter-fill',ref,onScroll:event=>positions?.set(scrollKey,event.currentTarget.scrollTop)},children),h(Scrollbar,{targetRef:ref,axis:'y',reveal:'hover'}));
}
function HierarchicalSelect({label,size="md",value,onChange,model,mode,depth,disabled=false,required=false,invalid=false,allowClear=true,searchable=true,placeholder='全部',rootLabel='选项',ariaLabel}){
  const id=React.useId();
  const [open,setOpen]=React.useState(false);
  const accessibleLabel=label||ariaLabel||'筛选范围';
  React.useEffect(()=>{if(disabled)setOpen(false);},[disabled]);
  const [path,setPath]=React.useState([]),[query,setQuery]=React.useState(''),[view,setView]=React.useState('options');
  const [pathContext,setPathContext]=React.useState(null);
  const [geometry,setGeometry]=React.useState(null),[fit,setFit]=React.useState(1),[announcement,setAnnouncement]=React.useState('');
  const rootRef=React.useRef(null),triggerRef=React.useRef(null),menuRef=React.useRef(null);
  const scrollPositions=React.useRef(new Map()),pendingFocus=React.useRef(null);
  const deep=mode==='drilldown';
  const embeddedActionStyle={padding:0,border:0,borderRadius:0,background:'transparent',boxShadow:'none',transform:'none',fontWeight:400,fontSize:'inherit',color:'var(--color-fg)',gap:'var(--th-space-2)',lineHeight:'inherit'};
  const chosen=React.useMemo(()=>new Set(value),[value]);
  const tags=React.useMemo(()=>summary(model.roots,chosen),[model,chosen]);
  const normalized=query.trim().toLocaleLowerCase();
  const found=React.useMemo(()=>[...model.index.values()].filter(node=>(node.label+' '+node.value).toLocaleLowerCase().includes(normalized)),[model,normalized]);
  const selectedNodes=value.map(key=>model.index.get(key)).filter(Boolean);
  const pathNodes=path.map(key=>model.index.get(key)).filter(Boolean);
  const columns=[{nodes:model.roots,title:rootLabel,key:'root',depth:0}];
  for(const node of pathNodes){if(node.children.length)columns.push({nodes:node.children,title:node.label,key:node.value,depth:columns.length});else break;}
  const visibleColumns=deep?columns.slice(-2):columns;
  const close=(restore=false)=>{setOpen(false);setQuery('');setView('options');if(restore)document.getElementById(id+'-trigger')?.focus();};
  const reveal=(nextView='options')=>{if(disabled)return;if(!open&&nextView==='options')setPath([]);setView(nextView);setQuery('');setOpen(true);};
  const update=(next,message)=>{if(disabled)return;onChange?.([...next]);setAnnouncement(message+'，共选择 '+next.size+' 项');};
  const toggle=node=>{const ids=leaves(node);if(!ids.length)return;const all=ids.every(key=>chosen.has(key)),next=new Set(chosen);ids.forEach(key=>all?next.delete(key):next.add(key));update(next,(all?'已取消 ':'已选择 ')+node.label);};
  const remove=ids=>{const next=new Set(chosen);ids.forEach(key=>next.delete(key));update(next,'已移除选项');};
  const goPath=(next,focusValue=null,scroll=false)=>{pendingFocus.current={value:focusValue,scroll};setPath(next);setQuery('');setView('options');};
  const browse=node=>goPath(node.path.map(item=>item.value));
  const locate=node=>{if(node.children.length)browse(node);else goPath(node.path.slice(0,-1).map(item=>item.value),node.value,true);setAnnouncement('已定位 '+node.path.map(item=>item.label).join(' / '));};
  const back=()=>goPath(path.slice(0,-1),path[path.length-1]);
  const clear=()=>update(new Set(),'已清空，恢复全部范围');
  const showPath=node=>{setPathContext({node,view,query});setQuery('');setView('path');requestAnimationFrame(()=>menuRef.current?.querySelector('.th-select-filter-selected-head button')?.focus());};
  const returnFromPath=()=>{setView(pathContext?.view||'options');setQuery(pathContext?.query||'');requestAnimationFrame(()=>menuRef.current?.querySelector('input')?.focus());};
  const removeSelected=node=>{remove([node.value]);requestAnimationFrame(()=>{const next=menuRef.current?.querySelector('.th-select-filter-selected-row button')||menuRef.current?.querySelector('.th-select-filter-selected-head button');next?.focus();});};
  React.useLayoutEffect(()=>{
    const measure=()=>{
      const box=triggerRef.current;if(!box)return;
      const ctx=document.createElement('canvas').getContext('2d'),style=getComputedStyle(box);
      const token=name=>parseFloat(style.getPropertyValue(name));
      const label=box.querySelector('.th-select-filter-tag-label'),labelStyle=label?getComputedStyle(label):null;
      ctx.font=labelStyle?labelStyle.font:token('--th-text-xs')+'px '+style.fontFamily;
      const tagGap=token('--th-space-1'),controlGap=parseFloat(style.columnGap);
      const clearWidth=box.querySelector('.th-select-filter-clear')?.getBoundingClientRect().width||0;
      const toggleWidth=value.length?(box.querySelector('.th-select-filter-toggle')?.getBoundingClientRect().width||14):0;
      // Tag's closable geometry remains owned by Tag; reserve a conservative
      // allowance for its padding, close icon and internal gap.
      const widths=tags.map(tag=>Math.min(104,ctx.measureText(tag.label).width)+33);
      const contentWidth=box.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
      const available=Math.max(0,contentWidth-clearWidth-toggleWidth-controlGap*2);
      const total=widths.reduce((a,b)=>a+b,0)+Math.max(0,widths.length-1)*tagGap;
      if(total<=available){setFit(tags.length);return;}
      const moreWidth=ctx.measureText('+'+value.length+' 项').width;
      let used=0,count=0;
      for(const width of widths){const next=used+(count?tagGap:0)+width;if(next+controlGap+moreWidth>available)break;used=next;count++;}
      setFit(count);
    };
    measure();const observer=new ResizeObserver(measure);if(triggerRef.current)observer.observe(triggerRef.current);return()=>observer.disconnect();
  },[tags,size]);


  React.useLayoutEffect(()=>{
    if(!open){setGeometry(null);return;}
    const place=()=>{
      const rect=triggerRef.current.getBoundingClientRect(),narrow=window.innerWidth<768;
      const columnCount=view==='options'&&!normalized?visibleColumns.length:1;
      const desiredWidth=narrow?rect.width:Math.max(rect.width,columnCount*240);
      const width=Math.min(desiredWidth,window.innerWidth-32);
      const left=Math.max(16,Math.min(rect.left,window.innerWidth-width-16));
      const roomBelow=window.innerHeight-rect.bottom-20,above=roomBelow<240&&rect.top>roomBelow;
      const maxHeight=Math.max(120,Math.min(390,above?rect.top-20:roomBelow));
      setGeometry({left,width,maxHeight,...(above?{bottom:window.innerHeight-rect.top+4}:{top:rect.bottom+4})});
    };
    place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    const observer=new ResizeObserver(place);observer.observe(triggerRef.current);
    return()=>{observer.disconnect();window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
  },[open,path.length,view,!!normalized,visibleColumns.length]);
  React.useLayoutEffect(()=>{
    if(!open||!menuRef.current||!pendingFocus.current)return;
    const pending=pendingFocus.current;pendingFocus.current=null;
    const region=menuRef.current.querySelector('.th-select-filter-col[data-last="true"]');
    const rows=region?[...region.querySelectorAll('.th-select-filter-row')]:[];
    const target=(rows.find(row=>row.dataset.nodeValue===pending.value)||rows[0])?.querySelector('.th-select-filter-row-action');
    target?.focus({preventScroll:true});
    if(pending.scroll&&target){
      const viewport=target.closest('.th-select-filter-viewport');
      if(viewport){
        const rowRect=target.closest('.th-select-filter-row').getBoundingClientRect(),viewportRect=viewport.getBoundingClientRect();
        const delta=rowRect.top<viewportRect.top?rowRect.top-viewportRect.top:rowRect.bottom>viewportRect.bottom?rowRect.bottom-viewportRect.bottom:0;
        viewport.scrollTop+=delta;
      }
    }
  },[open,path,view,normalized]);
  React.useEffect(()=>{
    if(!open)return;
    const outside=event=>{if(!rootRef.current?.contains(event.target)&&!menuRef.current?.contains(event.target))close();};
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);};
  },[open]);
  const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(view==='path')returnFromPath();else if(query)setQuery('');else close(true);}};
  const keyRow=(event,node,columnDepth)=>{
    if(event.key===' '){event.preventDefault();toggle(node);}
    if(event.key==='ArrowRight'&&node.children.length){event.preventDefault();browse(node);}
    if(event.key==='ArrowLeft'&&columnDepth>0&&!normalized){event.preventDefault();goPath(path.slice(0,columnDepth-1),path[columnDepth-1]);}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();const region=event.currentTarget.closest('.th-select-filter-viewport');
      const buttons=[...region.querySelectorAll('.th-select-filter-row-action:not(:disabled)')];
      const index=buttons.indexOf(event.currentTarget);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
      buttons[next]?.focus();
    }
  };
  const renderRow=(node,columnDepth,search=false)=>{
    const ids=leaves(node),count=ids.filter(key=>chosen.has(key)).length,full=ids.length>0&&count===ids.length,branch=!!node.children.length;
    return h('div',{key:node.value,className:'th-select-filter-row','data-node-value':node.value,'data-path':!search&&path.includes(node.value)?'true':undefined,'data-disabled':!ids.length?'true':undefined},
      h(Checkbox,{checked:full,disabled:!ids.length,'aria-label':(full?'取消选择 ':'选择 ')+node.path.map(n=>n.label).join(' / ')+(branch?'全部可选子项':'')+(count&&!full?'，已选 '+count+' / '+ids.length+' 项':''),onChange:()=>toggle(node)}),
      h(Button,{variant:'ghost',size:'md',height:'auto',style:{...embeddedActionStyle,minHeight:0,flex:1,justifyContent:'flex-start',textAlign:'left',fontSize:'var(--th-text-base)',lineHeight:'var(--leading-body)'},type:'button',className:'th-select-filter-row-action',disabled:!ids.length&&!branch,onClick:()=>branch?browse(node):toggle(node),onKeyDown:event=>keyRow(event,node,columnDepth),'aria-label':branch?'查看 '+node.label+' 的下一级':(full?'取消选择 ':'选择 ')+node.label,'aria-expanded':branch&&!search?path.includes(node.value):undefined},
        h('span',{className:'th-select-filter-row-label'},h('span',null,h(Highlight,{text:node.label,query})),search&&h('span',{className:'th-select-filter-context'},h(Highlight,{text:shortPath(node.path.slice(0,-1))||'第一级',query}))),
        !ids.length?h('span',{className:'th-select-filter-count'},'已停用'):branch&&count>0&&!full?h('span',{className:'th-select-filter-count'},'已选 '+count+' 项'):null,
        branch&&!search&&h(Icon,{name:'arrow-right-s-line'})),
      search&&h(Button,{variant:'ghost',size:'sm',height:'var(--th-space-8)',style:{...embeddedActionStyle,width:'var(--th-space-8)'},className:'th-select-filter-search-locate',icon:'ri-map-pin-line','aria-label':'定位 '+node.label+' 所在层级',onClick:()=>locate(node)}));
  };
  const renderPathbar=()=>{
    const recent=pathNodes.slice(-2);
    return h('div',{className:deep?'th-select-filter-pathbar':'th-select-filter-mobile-path'},
      h(Button,{variant:'ghost',size:'sm',height:'var(--th-space-8)',style:{...embeddedActionStyle,width:'var(--th-space-8)',flex:'none'},icon:'ri-arrow-left-line','aria-label':'返回上一级',onClick:back}),
      h('nav',{className:'th-select-filter-path-items','aria-label':'当前筛选层级'},
        h(Button,{variant:'ghost',size:'sm',style:embeddedActionStyle,onClick:()=>goPath([]),'aria-label':'返回第一级'+rootLabel},rootLabel),
        pathNodes.length>2&&h(React.Fragment,null,h(Icon,{name:'arrow-right-s-line'}),h(Button,{variant:'ghost',size:'sm',style:embeddedActionStyle,icon:'ri-more-line','aria-label':'展开全部 '+pathNodes.length+' 级路径',onClick:()=>showPath(pathNodes[pathNodes.length-1])})),
        recent.map((node,index)=>h(React.Fragment,{key:node.value},h(Icon,{name:'arrow-right-s-line'}),h(Button,{variant:'ghost',size:'sm',style:embeddedActionStyle,'aria-current':index===recent.length-1?'location':undefined,'aria-label':index===recent.length-1?'查看 '+node.label+' 的完整路径':'返回 '+node.label,onClick:()=>index===recent.length-1?showPath(node):browse(node)},h('span',{className:'th-select-filter-truncate'},node.label))))),
      deep&&h('span',{className:'th-select-filter-path-depth th-nums'},'第 '+columns.length+' 级'));
  };
  const visible=tags.slice(0,fit),visibleLeafCount=visible.reduce((total,tag)=>total+tag.ids.length,0),hiddenCount=value.length-visibleLeafCount;
  let body;
  if(view==='path'&&pathContext){
    body=h(React.Fragment,null,
      h('div',{className:'th-select-filter-selected-head'},h(Button,{variant:'ghost',size:'sm',icon:'ri-arrow-left-line',onClick:returnFromPath},pathContext.view==='selected'?'返回已选':'返回列表'),h(Button,{variant:'ghost',size:'sm',onClick:()=>locate(pathContext.node)},'定位此项')),
      h('span',{className:'th-select-filter-path-heading'},'完整路径 · 点击层级直接进入'),
      h(Scrolling,{scrollKey:'path:'+pathContext.node.value,positions:scrollPositions.current},
        h('div',{className:'th-select-filter-row'},h(Button,{variant:'ghost',size:'sm',style:{...embeddedActionStyle,justifyContent:'flex-start',flex:1},onClick:()=>goPath([])},'返回第一级')),
        pathContext.node.path.map((node,index)=>h('div',{className:'th-select-filter-row',key:node.value},
          h('span',{className:'th-select-filter-path-number th-nums'},index+1),
          h(Button,{variant:'ghost',size:'sm',height:'auto',style:{...embeddedActionStyle,flex:1,minHeight:'var(--th-space-8)',textAlign:'left'},onClick:()=>locate(node),'aria-label':node.children.length?'进入 '+node.label:'定位 '+node.label},h('span',{className:'th-select-filter-path-label'},node.label),h(Icon,{name:'arrow-right-s-line'}))))));
  }else if(view==='selected'){
    const matches=selectedNodes.filter(node=>node.path.map(n=>n.label).join(' / ').toLocaleLowerCase().includes(normalized));
    body=h(React.Fragment,null,
      h('div',{className:'th-select-filter-selected-head'},h(Button,{variant:'ghost',size:'sm',icon:'ri-arrow-left-line',onClick:()=>{setView('options');setQuery('');requestAnimationFrame(()=>menuRef.current?.querySelector('input')?.focus());}},'返回选项'),h('span',{className:'th-select-filter-footer-text'},'已选 '+value.length+' 项')),
      h(Scrolling,{scrollKey:'selected:'+normalized,positions:scrollPositions.current},matches.length?matches.map(node=>h('div',{className:'th-select-filter-selected-row',key:node.value},
        h(Button,{variant:'ghost',size:'sm',height:'auto',style:{...embeddedActionStyle,flex:1,minWidth:0,justifyContent:'flex-start',lineHeight:'var(--leading-body)'},className:'th-select-filter-selected-copy',onClick:()=>showPath(node),'aria-label':'查看 '+node.path.map(n=>n.label).join(' / ')+' 的完整路径'},
          h('span',{className:'th-select-filter-truncate'},h(Highlight,{text:node.label,query}),node.path.length>1&&h('span',{className:'th-select-filter-inline-context'},' · ',h(Highlight,{text:shortPath(node.path.slice(0,-1)),query})))),
        h(Button,{variant:'ghost',size:'sm',icon:'ri-close-line','aria-label':'移除 '+node.label,onClick:()=>removeSelected(node)}))):h('div',{className:'th-select-filter-empty',role:'status'},h('strong',null,value.length?'无匹配选项':'尚未选择选项'),value.length?'换个关键词，已选内容不会改变。':'返回选项后勾选需要的范围。')));
  }else if(normalized){
    body=h(React.Fragment,null,h('div',{className:'th-select-filter-col-title'},'搜索所有层级 · 父级勾选覆盖整个分支'),
      h(Scrolling,{scrollKey:'search:'+normalized,positions:scrollPositions.current},found.length?found.map(node=>renderRow(node,0,true)):h('div',{className:'th-select-filter-empty',role:'status'},h('strong',null,'无匹配选项'),'换个关键词，或清空搜索查看全部选项。')));
  }else{
    body=h(React.Fragment,null,path.length>0&&renderPathbar(),
      h('div',{className:'th-select-filter-columns'},visibleColumns.map(column=>h('div',{className:'th-select-filter-col',key:column.key,'data-last':column.depth===columns.length-1?'true':'false'},
        h('span',{className:'th-select-filter-col-title'},column.title),
        h(Scrolling,{scrollKey:'column:'+column.key,positions:scrollPositions.current},column.nodes.map(node=>renderRow(node,column.depth)))))));
  }
  const popup=open&&geometry?h('div',{className:'th-select-filter-popup','data-mode':mode,id:id+'-menu',ref:menuRef,role:'dialog','aria-label':accessibleLabel+'选项',style:geometry,onKeyDownCapture:escape},
    searchable&&view!=='path'&&h('div',{className:'th-select-filter-search'},h('label',{className:'th-select-filter-sr-only'},'搜索选项'),h(SearchBox,{size:'sm',value:query,onChange:setQuery,onSearch:()=>{if(view==='options'&&normalized&&found.length){const node=found.find(item=>leaves(item).length);if(node)toggle(node);}},placeholder:view==='selected'?'搜索已选项':'搜索所有层级','aria-label':view==='selected'?'搜索已选项':'搜索所有层级'})),body,
    h('div',{className:'th-select-filter-footer'},h('span',{className:'th-select-filter-footer-text'},'勾选即生效'),h('div',{className:'th-select-filter-actions'},allowClear&&h(Button,{variant:'ghost',size:'sm',disabled:!value.length,onClick:clear},'清空'),view==='options'&&h(Button,{variant:'ghost',size:'sm',onClick:()=>{setView('selected');setQuery('');requestAnimationFrame(()=>menuRef.current?.querySelector('input')?.focus());}},'查看已选'+(value.length?' '+value.length:''))))):null;
  return h('div',{className:'th-select-filter',ref:rootRef,'data-size':size,'data-filter-mode':mode,'data-hierarchy-depth':depth,'data-disabled':disabled?'true':undefined,onKeyDownCapture:escape},
    label&&h('label',{className:'th-select-filter-label',htmlFor:id+'-trigger'},label,required?' *':''),
    h('div',{className:'th-select-filter-trigger',ref:triggerRef,'data-open':String(open),'aria-invalid':invalid||undefined,onClick:event=>{if(event.target===event.currentTarget)open?close():reveal();}},
      visible.length>0&&h('div',{className:'th-select-filter-tags'},visible.map(tag=>h('span',{className:'th-select-filter-tag-hit',key:tag.node.value,role:'button',tabIndex:disabled?-1:0,'aria-disabled':disabled||undefined,'aria-label':'移除 '+tag.node.label+(tag.ids.length>1?'全部 '+tag.ids.length+' 项':''),onClick:event=>{if(!event.target.closest('i')){remove(tag.ids);requestAnimationFrame(()=>document.getElementById(id+'-trigger')?.focus());}},onKeyDown:event=>{if(['Enter',' ','Delete','Backspace'].includes(event.key)){event.preventDefault();remove(tag.ids);requestAnimationFrame(()=>document.getElementById(id+'-trigger')?.focus());}}},h(Tag,{tone:'neutral',closable:!disabled,style:{height:'calc(var(--th-space-6) + var(--th-space-1))'},onClose:()=>{remove(tag.ids);requestAnimationFrame(()=>document.getElementById(id+'-trigger')?.focus());}},h('span',{className:'th-select-filter-tag-label th-select-filter-truncate'},tag.label))))),
      hiddenCount>0&&h(Button,{variant:'ghost',size:'sm',height:'100%',style:{...embeddedActionStyle,fontSize:'var(--th-text-xs)'},type:'button',className:'th-select-filter-more',disabled,onClick:()=>reveal('selected'),'aria-label':'查看全部 '+value.length+' 个已选项，另有 '+hiddenCount+' 项未展示'},'+'+hiddenCount+' 项'),
      value.length>0&&allowClear&&!disabled&&h(Button,{variant:'ghost',size,type:'button',height:'100%',style:{...embeddedActionStyle,width:'var(--th-space-6)',marginLeft:'auto'},className:'th-select-filter-clear','aria-label':'清空'+accessibleLabel,onClick:()=>{clear();document.getElementById(id+'-trigger')?.focus();}},h(Icon,{name:'close-line'})),
      h(Button,{variant:'ghost',size,height:'100%',style:{...embeddedActionStyle,flex:value.length?'0 0 14px':1,minWidth:14,justifyContent:value.length?'center':'space-between'},type:'button',className:'th-select-filter-toggle',disabled,'aria-invalid':invalid||undefined,id:id+'-trigger','aria-haspopup':'dialog','aria-expanded':open,'aria-controls':open?id+'-menu':undefined,'aria-label':accessibleLabel+(value.length?'，已选 '+value.length+' 项':'，'+placeholder),onClick:()=>open?close():reveal(),onKeyDown:event=>{if(event.key==='ArrowDown'){event.preventDefault();reveal();requestAnimationFrame(()=>menuRef.current?.querySelector('input')?.focus());}}},!value.length?h('span',{className:'th-select-filter-placeholder'},placeholder):null,h(Icon,{name:'arrow-down-s-line'}))),
    h('span',{className:'th-select-filter-sr-only',role:'status','aria-live':'polite'},announcement),popup&&(typeof ReactDOM!=='undefined'?ReactDOM.createPortal(popup,document.body):popup));
}

/** Default single mode preserves the existing string API. Adaptive modes use leaf-ID arrays. */
export function Select({mode="single",hierarchyDepth,options=[],value,onChange,rootLabel="选项",...props}){
  const resolved=React.useMemo(()=>mode==="single"?{mode:"single",depth:1}:resolveFilterMode(options,{mode,hierarchyDepth}),[mode,hierarchyDepth,options]);
  const model=React.useMemo(()=>resolved.mode==="single"?null:createOptionModel(options),[options,resolved.mode]);
  if(mode==="single"){
    if(Array.isArray(value))throw new Error('普通 Select 使用 string value；数组值请显式传 mode="auto"。');
    return h(SingleSelect,{...props,options,value,onChange});
  }
  if(value!==undefined&&!Array.isArray(value))throw new Error('auto/cascade/drilldown 使用叶节点 value 数组。');
  const selected=value||[];
  if(resolved.mode==="single"){
    if(selected.length>1)throw new Error('1 级普通选择最多一项；不可静默丢弃多选值。');
    return h(SingleSelect,{...props,placeholder:props.placeholder??"全部",options,value:selected[0]||"",onChange:next=>onChange?.(next?[next]:[])});
  }
  return h(HierarchicalSelect,{...props,searchable:props.searchable??true,placeholder:props.placeholder??"全部",options,value:selected,onChange,model,mode:resolved.mode,depth:resolved.depth,rootLabel,ariaLabel:props["aria-label"]});
}
```

## select.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Select" subtitle="普通 / 级联 / 深层筛选 — 28px / 32px，自动选型" viewport="960x1120" catalogHeight="1120" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="../../tokens.css">
<style>
body{margin:0;background:var(--th-white);color:var(--color-fg);font-family:var(--th-font-cn)}
.panel{box-sizing:border-box;padding:var(--th-space-6);max-width:960px;margin:auto}
h1{margin:0 0 var(--th-space-4);font-size:var(--th-text-lg);font-weight:600}
h2{margin:0 0 var(--th-space-4);font-size:var(--th-text-md);font-weight:600}
p{margin:0 0 var(--th-space-6);color:var(--color-fg-muted);font-size:var(--th-text-xs)}
.examples{display:flex;flex-wrap:wrap;gap:var(--th-space-6)}.example{flex:1 1 280px;min-width:0}
section{padding-bottom:var(--th-space-6);margin-bottom:var(--th-space-6)}.tree-stage{min-height:360px}
.example-caption{display:block;margin-bottom:var(--th-space-2);color:var(--color-fg-muted);font-size:var(--th-text-xs)}
@media(max-width:767px){.tree-stage{min-height:420px}}
</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/ds-bundle.js"></script>
<script>
const {Select}=window.TokenHubDesignSystem_019e20;
const h=React.createElement;
const OPTIONS = [
  {value:'engineering',label:'研发中心',children:[
    {value:'platform',label:'平台研发'},
    {value:'client',label:'客户端',children:[{value:'web',label:'Web 团队'},{value:'desktop',label:'桌面团队'},{value:'mobile',label:'移动团队'}]},
    {value:'infra',label:'基础架构'},
    {value:'legacy',label:'旧版维护',disabled:true}
  ]},
  {value:'product',label:'产品设计',children:[{value:'strategy',label:'产品规划'},{value:'ux',label:'交互设计'},{value:'design-system',label:'设计系统'}]},
  {value:'operations',label:'业务运营',children:[{value:'content',label:'内容运营'},{value:'growth',label:'用户增长'},{value:'support',label:'客户服务'}]}
];

const DEEP_LABELS=['示例集团','国际业务','亚太大区','中国区','华东区域','上海分部','技术中心','平台研发部','数据平台','检索服务组','搜索工程组'];
const deepBranch=DEEP_LABELS.reduceRight((child,label,index)=>({value:'deep-'+index,label,children:[child,{value:'deep-peer-'+index,label:'协作团队'}]}),{value:'deep-leaf',label:'搜索研发'});
const DEEP_OPTIONS=[deepBranch,{value:'deep-design',label:'产品设计',children:[{value:'deep-ux',label:'交互设计'},{value:'deep-system',label:'设计系统'}]}];
const FOUR_OPTIONS=[
  {value:'four-engineering',label:'研发中心',children:[
    {value:'four-platform',label:'平台产品',children:[
      {value:'four-data',label:'数据服务',children:[{value:'four-stream',label:'数据流水线'},{value:'four-query',label:'查询引擎'}]},
      {value:'four-infra',label:'基础服务',children:[{value:'four-gateway',label:'API 网关'},{value:'four-access',label:'访问控制'}]}
    ]},
    {value:'four-client',label:'客户端',children:[{value:'four-web',label:'Web 团队'},{value:'four-desktop',label:'桌面团队'}]}
  ]},
  {value:'four-product',label:'产品设计',children:[{value:'four-ux',label:'交互设计'},{value:'four-system',label:'设计系统'}]}
];
const FLAT_OPTIONS=OPTIONS.map(({value,label})=>({value,label}));

const TWO_OPTIONS=OPTIONS.map(node=>({...node,children:node.children.flatMap(child=>child.children||[child])}));
function Demo(){
  const [values,setValues]=React.useState({flatSmall:'',flatMedium:'',cascadeSmall:[],cascadeMedium:['platform','web','design-system','content','growth'],deepSmall:[],deepMedium:['four-stream','four-gateway']});
  const field=(key,label,size,options,mode='auto')=>h(Select,{mode,size,label,rootLabel:'组织',placeholder:'全部',options,value:values[key],onChange:next=>setValues(previous=>({...previous,[key]:next})),searchable:true});
  const example=(caption,child)=>h('div',{className:'example'},h('span',{className:'example-caption'},caption),child);
  return h('main',{className:'panel'},h('h1',null,'Select'),h('p',null,'普通选择、级联多选与深层筛选，统一复用正式 Select。'),
    h('section',{className:'tree-stage'},h('h2',null,'深层筛选 · ≥4 级'),h('div',{className:'examples'},example('sm · 28px · 12 级',field('deepSmall','组织范围','sm',DEEP_OPTIONS)),example('md · 32px · 4 级',field('deepMedium','参与团队','md',FOUR_OPTIONS))),h('p',null,'逐级进入最多两列；搜索“搜索研发”可直达第 12 级。')),
    h('section',{className:'tree-stage'},h('h2',null,'级联筛选 · 2–3 级'),h('div',{className:'examples'},example('sm · 28px · 2 级',field('cascadeSmall','组织范围','sm',TWO_OPTIONS)),example('md · 32px · 3 级',field('cascadeMedium','参与团队','md',OPTIONS)))),
    h('section',null,h('h2',null,'普通选择 · 1 级'),h('div',{className:'examples'},example('sm · 28px · 可搜索',field('flatSmall','组织','sm',FLAT_OPTIONS,'single')),example('md · 32px · 原单选 API',field('flatMedium','组织','md',FLAT_OPTIONS,'single')))),
    h('p',null,'空值显示全部；只有实际选择后才显示清除按钮。层级勾选即生效，切换路径保留选择。示例为完整静态数据。'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(Demo));
</script>
</body>
</html>
```
