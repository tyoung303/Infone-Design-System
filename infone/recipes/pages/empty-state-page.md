# EmptyStatePage

根据源文件中的 empty state page 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 empty state page 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## EmptyStatePage.dc.html

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
<style data-infone-responsive>
@media (max-width: 900px) {
  [style*="grid-template-columns:minmax(0,1fr) 292px"],
  [style*="grid-template-columns:minmax(0,1fr) 280px"] { grid-template-columns: minmax(0, 1fr) !important; }
}
@media (max-width: 680px) {
  [style*="grid-template-columns:minmax(0,1fr) 92px 84px"] { grid-template-columns: minmax(0, 1fr) !important; }
}
</style>
</head>
<body>
<x-dc>
<!-- @template name="Empty State Page" description="空状态页 — 标准骨架 + 首次进入无数据的整页引导（EmptyState + 快速上手入口）" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--th-bg)}</style>
</helmet>
<div style="display:flex;min-height:100vh;background:var(--th-bg);font-family:var(--th-font-cn);color:var(--color-fg)" data-screen-label="空状态引导页">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="InfOne" groups="{{ navGroups }}" active="{{ activeNav }}" on-change="{{ setNav }}" user="admin" collapsed="{{ collapsed }}" on-toggle="{{ toggle }}"></x-import>
<main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="令牌管理" hint-size="100%,56px"></x-import>
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:48px 16px;display:flex;justify-content:center">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.EmptyState" icon="ri-key-2-line" title="还没有令牌" description="创建第一把令牌后，即可用统一密钥调用全部上游模型。" action="{{ emptyAction }}" hint-size="320px,180px"></x-import>
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
<sc-for list="{{ guides }}" as="g" hint-placeholder-count="3">
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);padding:12px;display:flex;flex-direction:column;gap:8px">
<span style="width:32px;height:32px;border-radius:8px;background:var(--th-teal-50);color:var(--th-teal-600);display:inline-flex;align-items:center;justify-content:center;font-size:16px"><i class="{{ g.icon }}"></i></span>
<div style="font-size:13px;font-weight:600">{{ g.title }}</div>
<div style="font-size:12px;color:var(--color-fg-muted);line-height:1.5">{{ g.desc }}</div>
</div>
</sc-for>
</div>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { activeNav: "tokens", collapsed: false };
  renderVals() {
    const DS = window.TokenHubDesignSystem_019e20 || {};
    return {
      activeNav: this.state.activeNav,
      setNav: (k) => this.setState({ activeNav: k }),
      collapsed: this.state.collapsed,
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      navGroups: [{ title: "令牌中心", items: [
        { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
        { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
        { key: "models", icon: "ri-store-2-line", label: "模型广场" },
      ]}],
      emptyAction: DS.Button ? React.createElement(DS.Button, { icon: "ri-add-line", onClick: () => {} }, "新建令牌") : null,
      guides: [
        { icon: "ri-key-2-line", title: "创建令牌", desc: "为团队或环境分别发放密钥，支持按模型限定范围。" },
        { icon: "ri-swap-line", title: "替换接口地址", desc: "将 SDK 的 base URL 指向 TokenHub 网关，一行改动。" },
        { icon: "ri-line-chart-line", title: "查看用量", desc: "调用后在用量日志中跟踪请求、消耗与延迟。" },
      ],
    };
  }
}
</script>
</body>
</html>
```
