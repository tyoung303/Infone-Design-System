# UsageAnalytics

根据源文件中的 usage analytics 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 usage analytics 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## UsageAnalytics.dc.html

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
<!-- @template name="Usage Analytics" description="用量分析 — D 档骨架（NavRail）、PageHeader + 时间范围、MetricStrip、趋势图、请求日志表与详情抽屉" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--color-bg)}</style>
</helmet>
<div data-density="compact" data-screen-label="用量分析" style="display:flex;min-height:100vh;background:var(--color-bg);font-family:var(--th-font-cn);color:var(--color-fg)">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="TokenHub" groups="{{ navGroups }}" active="{{ activeKey }}" on-change="{{ setActive }}" user="admin" collapsed="{{ collapsed }}" on-toggle="{{ toggle }}" density="comfortable"></x-import>
<main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" hint-size="100%,44px" variant="page" title="用量分析" meta="{{ headerMeta }}" actions="{{ headerActions }}"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.MetricStrip" hint-size="100%,64px" items="{{ metrics }}"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" title="请求量趋势" actions="{{ trendTabs }}" hint-size="100%,220px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Chart" type="area" data="{{ chartData }}" series="{{ chartSeries }}" height="{{ 140 }}" hint-size="100%,150px"></x-import>
</x-import>
<section style="background:var(--color-surface);border:var(--th-border-card);border-radius:var(--th-radius-md);overflow:hidden">
<div style="height:36px;flex-shrink:0;padding:0 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:0.5px solid var(--color-divider)">
<span style="font-size:var(--th-text-sm);font-weight:600">请求日志</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" variant="ghost" size="sm" icon="ri-filter-3-line" hint-size="72px,28px">筛选</x-import>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" columns="{{ logColumns }}" rows="{{ logRows }}" density="compact" embedded="{{ true }}" hint-size="100%,320px"></x-import>
<div style="padding:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:0.5px solid var(--color-divider)">
<span style="font-size:var(--th-text-xs);color:var(--color-fg-muted)">显示第 1 – 10 条，共 128 条</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Pager" page="{{ page }}" total-pages="13" on-change="{{ setPage }}" hint-size="200px,28px"></x-import>
</div>
</section>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Drawer" open="{{ logDrawerOpen }}" title="请求详情" description="{{ logDrawerDesc }}" on-close="{{ closeLogDrawer }}" width="440" hint-size="0px,0px">
<div style="display:flex;flex-direction:column;gap:8px">
<div style="display:flex;justify-content:space-between;gap:12px;font-size:var(--th-text-sm)"><span style="color:var(--color-fg-muted)">用户</span><span>{{ logDrawerUser }}</span></div>
<div style="display:flex;justify-content:space-between;gap:12px;font-size:var(--th-text-sm)"><span style="color:var(--color-fg-muted)">模型</span><code style="font-family:var(--th-font-mono);font-size:var(--th-text-xs)">{{ logDrawerModel }}</code></div>
<div style="display:flex;justify-content:space-between;gap:12px;font-size:var(--th-text-sm)"><span style="color:var(--color-fg-muted)">Token 用量</span><span class="th-nums">{{ logDrawerTokens }}</span></div>
<div style="display:flex;justify-content:space-between;gap:12px;font-size:var(--th-text-sm)"><span style="color:var(--color-fg-muted)">花费</span><span class="th-nums">{{ logDrawerCost }}</span></div>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.CodeBlock" label="请求体" code="{{ logDrawerCode }}" max-height="260" hint-size="100%,200px"></x-import>
</x-import>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { activeKey: "usage", collapsed: false, metric: "requests", page: 1, dateRange: { start: "2026-05-01", end: "2026-06-08" }, drawerLog: null };
  renderVals() {
    const self = this;
    const DS = window.TokenHubDesignSystem_019e20 || {};
    const h = React.createElement;
    const seed = { requests: [12,18,15,22,28,24,30,26,34,31,38,35,40,44], cost: [2,3,2.4,3.8,4.1,3.6,4.8,4.2,5.1,4.9,5.6,5.2,6,6.4] };
    const days = ["05-01","05-02","05-03","05-04","05-05","05-06","05-07","05-08","05-09","05-10","05-11","05-12","05-13","05-14"];
    return {
      activeKey: this.state.activeKey,
      setActive: (k) => this.setState({ activeKey: k }),
      collapsed: this.state.collapsed,
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      navGroups: [
        { title: "令牌中心", items: [
          { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
          { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
          { key: "usage", icon: "ri-line-chart-line", label: "用量分析" },
        ]},
        { title: "系统", items: [
          { key: "users", icon: "ri-team-line", label: "用户管理" },
          { key: "settings", icon: "ri-settings-3-line", label: "系统设置" },
        ]},
      ],
      headerMeta: h("span", null, "共 18,204 次请求"),
      headerActions: h(React.Fragment, null,
        DS.DateRangePicker ? h(DS.DateRangePicker, { value: this.state.dateRange, onChange: (v) => this.setState({ dateRange: v }) }) : null,
        DS.Button ? h(DS.Button, { variant: "secondary", size: "sm", icon: "ri-download-2-line" }, "导出") : null),
      metrics: [
        { label: "总请求数", value: 18204, suffix: "次", icon: "ri-pulse-line", delta: 12.4, caption: "较上周期", series: [12,18,15,22,28,24,30] },
        { label: "总花费", value: 1369.86, prefix: "¥", icon: "ri-money-cny-circle-line", delta: 8.1, deltaTone: "inverse", caption: "较上周期" },
        { label: "平均延迟", value: 620, suffix: "ms", icon: "ri-timer-line", delta: -4.2, deltaTone: "inverse", caption: "较上周期" },
        { label: "错误率", value: 0.32, suffix: "%", icon: "ri-error-warning-line", delta: -0.1, deltaTone: "inverse", caption: "较上周期" },
      ],
      metric: this.state.metric,
      setMetric: (k) => this.setState({ metric: k }),
      metricTabs: [{ key: "requests", label: "请求量" }, { key: "cost", label: "花费" }],
      trendTabs: DS.Tabs ? h(DS.Tabs, { active: this.state.metric, onChange: (k) => this.setState({ metric: k }), items: [{ key: "requests", label: "请求量" }, { key: "cost", label: "花费" }] }) : null,
      chartData: seed[this.state.metric].map((v, i) => ({ label: days[i], v })),
      chartSeries: [{ key: "v", name: this.state.metric === "cost" ? "花费" : "请求量", color: this.state.metric === "cost" ? "var(--th-chart-3)" : "var(--th-chart-1)" }],
      logColumns: [
        { key: "time", label: "时间", width: "1.3fr", render: (r) => h("span", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12, color: "var(--color-fg-muted)" } }, r.time) },
        { key: "user", label: "用户", width: "1fr", render: (r) => h("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } },
            DS.Avatar ? h(DS.Avatar, { name: r.user, size: "sm", tone: r.user === "admin" ? "pink" : "gray" }) : null, r.user) },
        { key: "model", label: "模型", width: "1.2fr", render: (r) => h("code", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12 } }, r.model) },
        { key: "tokens", label: "Token", width: "96px", align: "right", heat: true, heatValue: (r) => r.tokenValue, render: (r) => r.tokens },
        { key: "cost", label: "花费", width: "84px", align: "right", render: (r) => h("span", { className: "th-nums" }, r.cost) },
        { key: "status", label: "状态", width: "88px", render: (r) => {
            const tone = r.status === "active" ? "success" : "warning";
            const label = r.status === "active" ? "成功" : "限速";
            return DS.StatusChip ? h(DS.StatusChip, { tone }, label) : label;
          } },
        { key: "ops", label: "", width: "40px", render: (r) => DS.Button
            ? h(DS.Button, { variant: "ghost", size: "sm", icon: "ri-eye-line", onClick: () => self.setState({ drawerLog: r }) })
            : null },
      ],
      logRows: [
        { id: 1, time: "06-08 14:06", user: "admin", model: "claude-sonnet-4-5", tokens: "1,231", tokenValue: 1231, cost: "¥0.029", status: "active" },
        { id: 2, time: "06-08 13:52", user: "u6jvl3yw9", model: "gpt-4o-mini", tokens: "412", tokenValue: 412, cost: "¥0.004", status: "active" },
        { id: 3, time: "06-08 12:20", user: "ulukhxkde", model: "deepseek-v3.2", tokens: "8,647", tokenValue: 8647, cost: "¥0.049", status: "limited" },
        { id: 4, time: "06-08 11:17", user: "ulukhxkde", model: "claude-haiku-4-5", tokens: "620", tokenValue: 620, cost: "¥0.004", status: "active" },
        { id: 5, time: "06-08 09:45", user: "admin", model: "gemini-2.5-pro", tokens: "3,320", tokenValue: 3320, cost: "¥0.019", status: "active" },
        { id: 6, time: "06-08 09:12", user: "u6jvl3yw9", model: "claude-sonnet-4-5", tokens: "2,184", tokenValue: 2184, cost: "¥0.051", status: "active" },
        { id: 7, time: "06-08 08:40", user: "houfang", model: "deepseek-v3.2", tokens: "5,902", tokenValue: 5902, cost: "¥0.033", status: "active" },
        { id: 8, time: "06-08 08:03", user: "gaoyang", model: "gpt-4o-mini", tokens: "738", tokenValue: 738, cost: "¥0.007", status: "limited" },
      ],
      page: this.state.page,
      setPage: (p) => this.setState({ page: p }),
      logDrawerOpen: !!this.state.drawerLog,
      logDrawerDesc: this.state.drawerLog?.time || "",
      logDrawerUser: this.state.drawerLog?.user || "",
      logDrawerModel: this.state.drawerLog?.model || "",
      logDrawerTokens: this.state.drawerLog?.tokens || "",
      logDrawerCost: this.state.drawerLog?.cost || "",
      logDrawerCode: this.state.drawerLog ? JSON.stringify({ model: this.state.drawerLog.model, messages: [{ role: "user", content: "…" }], stream: true }, null, 2) : "",
      closeLogDrawer: () => this.setState({ drawerLog: null }),
    };
  }
}
</script>
</body>
</html>
```
