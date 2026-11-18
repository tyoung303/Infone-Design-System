# NavRailConsole

根据源文件中的 nav rail console 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 nav rail console 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## NavRailConsole.dc.html

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
<!-- @template name="Nav Rail Console (D 档)" description="仅侧导航骨架：240px NavRail 承载品牌 + 导航 + 账户，右侧为运行记录内容区" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--th-bg)}</style>
</helmet>
<div style="display:flex;min-height:100vh;background:var(--th-bg)">
  <x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="InfOne" groups="{{ groups }}" active="{{ active }}" onChange="{{ setActive }}" user="chen@infone.ai" collapsed="{{ collapsed }}" onToggle="{{ toggle }}"></x-import>
  <main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
    <x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" hint-size="100%,56px" variant="page" title="运行记录" actions="{{ headerActions }}"></x-import>
    <x-import component-from-global-scope="TokenHubDesignSystem_019e20.MetricStrip" hint-size="100%,84px" items="{{ metrics }}"></x-import>
    <x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" hint-size="100%,320px" columns="{{ columns }}" rows="{{ rows }}"></x-import>
  </main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { active: "runs", collapsed: false };
  renderVals() {
    const { Button, StatusChip } = window.TokenHubDesignSystem_019e20 || {};
    const h = React.createElement;
    return {
      active: this.state.active,
      collapsed: this.state.collapsed,
      setActive: (k) => this.setState({ active: k }),
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      groups: [
        { title: "运行", items: [
          { key: "runs", label: "运行记录", icon: "ri-play-circle-line" },
          { key: "queue", label: "任务队列", icon: "ri-stack-line" },
          { key: "logs", label: "日志流", icon: "ri-terminal-box-line" },
        ]},
        { title: "接入", items: [
          { key: "repo", label: "仓库接入", icon: "ri-git-repository-line" },
          { key: "keys", label: "密钥与令牌", icon: "ri-key-2-line" },
        ]},
        { title: "治理", items: [
          { key: "team", label: "团队配置", icon: "ri-team-line" },
          { key: "usage", label: "用量与配额", icon: "ri-pie-chart-line" },
        ]},
      ],
      headerActions: Button ? h(React.Fragment, null,
        h(Button, { variant: "ghost", size: "sm", icon: "ri-filter-3-line" }, "筛选"),
        h(Button, { size: "sm", icon: "ri-add-line" }, "新建运行"),
      ) : null,
      metrics: [
        { label: "运行次数", value: 1284, suffix: "次", icon: "ri-play-circle-line", delta: 12.4, caption: "较上周", series: [12, 18, 15, 24, 22, 31, 28] },
        { label: "平均耗时", value: "4m 22s", icon: "ri-timer-line", delta: -8.1, deltaTone: "inverse", caption: "较上周" },
        { label: "消耗 tokens", value: 41.2, suffix: "M", icon: "ri-copper-coin-line", delta: 6.8, deltaTone: "inverse", caption: "较上周" },
      ],
      columns: [
        { key: "task", label: "任务", width: "1.6fr" },
        { key: "repo", label: "仓库", width: "1.1fr", render: (r) => h("span", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12, color: "var(--color-fg-muted)" } }, r.repo) },
        { key: "dur", label: "耗时", width: "84px", align: "right" },
        { key: "tok", label: "Tokens", width: "104px", align: "right", render: (r) => h("span", { className: "th-nums" }, r.tok.toLocaleString()) },
        { key: "st", label: "状态", width: "92px", render: (r) => StatusChip ? h(StatusChip, { tone: r.st[0] }, r.st[1]) : r.st[1] },
      ],
      rows: [
        { id: 1, task: "重构 auth 中间件", repo: "infone/gateway", dur: "4m 12s", tok: 182400, st: ["success", "已完成"] },
        { id: 2, task: "补齐 billing 单测", repo: "infone/billing", dur: "6m 05s", tok: 246100, st: ["running", "进行中"] },
        { id: 3, task: "迁移 Prisma schema", repo: "infone/core", dur: "2m 41s", tok: 98700, st: ["success", "已完成"] },
        { id: 4, task: "修复 SSE 断流", repo: "infone/gateway", dur: "1m 08s", tok: 41200, st: ["danger", "已失败"] },
        { id: 5, task: "接入 DeepMap 索引", repo: "infone/deepmap", dur: "8m 33s", tok: 512900, st: ["success", "已完成"] },
      ],
    };
  }
}
</script>
</body>
</html>
```
