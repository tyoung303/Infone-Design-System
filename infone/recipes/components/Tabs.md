# Tabs 组件说明

本说明将组件 API、React 实现和独立 HTML 示例整合为一个可按需读取的设计系统条目。声明章节是 API 权威，实现章节是可复用模式。

## Tabs.d.ts

```typescript
export interface TabItem {
  key: string;
  label: string;
}
export interface TabsProps {
  items: TabItem[];
  active?: string;
  onChange?: (key: string) => void;
  size?: "default" | "sm";
}
export function Tabs(props: TabsProps): JSX.Element;
```

## Tabs.jsx

```jsx
/* Tabs.jsx — underline tab row, brand active indicator. */
export function Tabs({ items = [], active, onChange, size = "default" }) {
  const compact = size === "sm";
  return (
    <div role="tablist" style={{ display: "flex", gap: compact ? "var(--th-space-6)" : "var(--th-space-8)", fontFamily: "var(--th-font-cn)" }}>
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key} onClick={() => onChange?.(it.key)}
            role="tab" aria-selected={isActive}
            style={{
              appearance: "none", border: "none", background: "transparent", cursor: "pointer",
              padding: compact ? "var(--th-space-2) 2px" : "var(--th-space-4) 2px", fontSize: "var(--th-text-base)", fontWeight: isActive ? 600 : 400,
              whiteSpace: "nowrap", flexShrink: 0,
              color: isActive ? "var(--color-fg)" : "var(--color-fg-muted)",
              borderBottom: isActive ? "2px solid var(--brand-500)" : "2px solid transparent",
              transition: "color var(--th-dur-1) var(--th-ease), border-color var(--th-dur-1) var(--th-ease)",
            }}
          >{it.label}</button>
        );
      })}
    </div>
  );
}
```

## tabs.html

```html
<!doctype html>
<!-- @dsCard group="Components" name="Tabs" subtitle="Underline tab row — brand-blue active indicator" viewport="400x100" -->
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../tokens.css">
<script src="../../preview/runtime/ds-bundle.js"></script>
<style>body{margin:0;background:var(--th-bg)}.panel{box-sizing:border-box;padding:24px;width:352px}</style>
</head>
<body>
<div id="root"></div>
<script src="../../preview/runtime/react.production.min.js"></script>
<script src="../../preview/runtime/react-dom.production.min.js"></script>
<script src="../../preview/runtime/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const { Tabs } = window.TokenHubDesignSystem_019e20;
function Demo() {
  const [v, setV] = React.useState("tokens");
  return (
    <div className="panel">
      <Tabs active={v} onChange={setV} items={[
        { key: "tokens", label: "令牌管理" },
        { key: "usage", label: "使用记录" },
        { key: "billing", label: "账单" },
      ]} />
      <div style={{ marginTop: "var(--th-block-gap)", color: "var(--color-fg-muted)", fontSize: "var(--th-text-xs)" }}>
        内容区小尺寸
      </div>
      <Tabs size="sm" active={v} onChange={setV} items={[
        { key: "tokens", label: "概览" },
        { key: "usage", label: "事件" },
      ]} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
</script>
</body>
</html>
```

## 使用说明

### 页面级 Tabs（默认）

用于同一页面下的主要内容分区，通常放在 `PageHeader` 下方。默认尺寸使用 `size="default"`，建议控制在 5 个以内，标签保持单行。

```jsx
<Tabs
  items={[{ key: "tokens", label: "令牌管理" }, { key: "usage", label: "使用记录" }]}
  active={activeTab}
  onChange={setActiveTab}
/>
```

### 内容区 Tabs（小尺寸）

用于卡片、详情区块或表格上方的局部内容切换，不承担页面级导航。调用时传入 `size="sm"`，它使用更紧凑的间距和垂直内边距，但仍保留相同的键盘焦点、激活指示条和 `role="tablist"` 语义。

```jsx
<Tabs
  size="sm"
  items={[{ key: "overview", label: "概览" }, { key: "events", label: "事件" }]}
  active={sectionTab}
  onChange={setSectionTab}
/>
```

### 绘制规范

- Tabs 容器不绘制整条灰色底线，避免与内容边界或卡片边框重复。
- 仅激活项绘制 `2px` 品牌蓝指示条，使用 `--brand-500`，未激活项保持透明底边。
- 默认尺寸使用 `--th-space-8` 项间距和 `--th-space-4` 垂直内边距；`size="sm"` 使用 `--th-space-6` 项间距和 `--th-space-2` 垂直内边距。
- 标签使用 `--th-text-base`、`--color-fg` / `--color-fg-muted`，禁止换行并保持固定高度。
- 内容区小 Tabs 只用于局部切换，不替代 `NavRail` 或页面级导航。
