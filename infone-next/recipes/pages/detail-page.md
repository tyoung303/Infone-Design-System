# DetailPage

根据源文件中的 detail page 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 detail page 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## DetailPage.dc.html

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
<!-- @template name="Detail Page" description="详情页 — 标准骨架 + 头部操作区 + Descriptions + Tab 分区（用量/调用日志/操作记录）" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--th-bg)}</style>
</helmet>
<div style="display:flex;min-height:100vh;background:var(--th-bg);font-family:var(--th-font-cn);color:var(--color-fg)" data-screen-label="令牌详情页">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="InfOne" groups="{{ navGroups }}" active="{{ activeNav }}" on-change="{{ setNav }}" user="admin" collapsed="{{ collapsed }}" on-toggle="{{ toggle }}"></x-import>
<main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="production-web" tags="{{ headerTags }}" actions="{{ headerActions }}" hint-size="100%,56px"></x-import>
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:12px 16px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Descriptions" items="{{ descItems }}" columns="{{ 3 }}" hint-size="100%,120px"></x-import>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Tabs" items="{{ tabItems }}" active="{{ activeTab }}" on-change="{{ setTab }}" hint-size="100%,36px"></x-import>
<sc-if value="{{ showUsage }}" hint-placeholder-val="{{ true }}">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.MetricStrip" items="{{ metrics }}" hint-size="100%,84px"></x-import>
<div style="display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:12px;align-items:start">
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:12px;display:flex;flex-direction:column;gap:12px">
<span style="font-size:12px;color:var(--color-fg-muted)">近 7 日调用趋势</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Chart" type="area" data="{{ usageSeries }}" series="{{ usageSeriesDef }}" height="{{ 130 }}" unit="次" hint-size="100%,140px"></x-import>
</div>
<div style="display:flex;flex-direction:column;gap:12px">
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:12px;display:flex;flex-direction:column;gap:12px">
<span style="font-size:12px;color:var(--color-fg-muted)">本月 Token 构成</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TokenMeter" input="{{ 1284000 }}" output="{{ 386000 }}" reasoning="{{ 142000 }}" cached="{{ 512000 }}" hint-size="100%,120px"></x-import>
</div>
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:12px;display:flex;align-items:center;gap:14px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.RingGauge" value="{{ 40 }}" tone="heat" size="{{ 64 }}" thickness="{{ 6 }}" hint-size="64px,64px"></x-import>
<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
<span style="font-size:12px;color:var(--color-fg-muted)">本月额度</span>
<span class="th-nums" style="font-size:15px;font-weight:600">¥120.00</span>
<span style="font-size:11px;color:var(--color-fg-muted)">配额 ¥300.00</span>
</div>
</div>
</div>
</div>
</sc-if>
<sc-if value="{{ showLogs }}" hint-placeholder-val="{{ false }}">
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);overflow:hidden">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" columns="{{ logColumns }}" rows="{{ logRows }}" embedded="{{ true }}" hint-size="100%,260px"></x-import>
</div>
</sc-if>
<sc-if value="{{ showHistory }}" hint-placeholder-val="{{ false }}">
<div style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:16px;max-width:560px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Timeline" items="{{ historyItems }}" hint-size="100%,240px"></x-import>
</div>
</sc-if>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { activeNav: "tokens", collapsed: false, activeTab: "usage" };
  renderVals() {
    const t = this.state.activeTab;
    return {
      activeNav: this.state.activeNav,
      setNav: (k) => this.setState({ activeNav: k }),
      collapsed: this.state.collapsed,
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      navGroups: [{ title: "令牌中心", items: [
        { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
        { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
        { key: "models", icon: "ri-store-2-line", label: "模型广场" },
      ]},{ title: "系统", items: [
        { key: "users", icon: "ri-team-line", label: "用户管理" },
        { key: "settings", icon: "ri-settings-3-line", label: "系统设置" },
      ]}],
      noop: () => {},
      headerTags: (() => {
        const DS = window.TokenHubDesignSystem_019e20 || {};
        return DS.StatusChip ? React.createElement(DS.StatusChip, { tone: "success" }, "已激活") : null;
      })(),
      headerActions: (() => {
        const DS = window.TokenHubDesignSystem_019e20 || {};
        return DS.Button ? React.createElement(React.Fragment, null,
          React.createElement(DS.Button, { variant: "secondary", size: "sm", icon: "ri-edit-line", onClick: () => {} }, "编辑"),
          React.createElement(DS.Button, { variant: "secondary", size: "sm", icon: "ri-forbid-line", onClick: () => {} }, "禁用令牌"),
        ) : null;
      })(),
      descItems: [
        { label: "密钥", value: "sk-••••3f2a" },
        { label: "可调用模型", value: "全部模型" },
        { label: "创建时间", value: "2026-06-12 10:24" },
        { label: "本月额度", value: "¥120.00 / ¥300.00" },
        { label: "最近调用", value: "2026-07-31 09:03" },
        { label: "创建人", value: "admin" },
      ],
      tabItems: [
        { key: "usage", label: "用量" },
        { key: "logs", label: "调用日志" },
        { key: "history", label: "操作记录" },
      ],
      activeTab: t,
      setTab: (k) => this.setState({ activeTab: k }),
      showUsage: t === "usage", showLogs: t === "logs", showHistory: t === "history",
      metrics: [
        { label: "本月请求", value: 48210, suffix: "次", icon: "ri-pulse-line", delta: 12.4, series: [32, 36, 34, 41, 44, 46, 48] },
        { label: "本月消耗", value: 120, prefix: "¥", icon: "ri-money-cny-circle-line", delta: 8.1, deltaTone: "inverse" },
        { label: "平均延迟", value: 412, suffix: "ms", icon: "ri-timer-line", delta: -5.2, deltaTone: "inverse" },
        { label: "错误率", value: 0.31, suffix: "%", icon: "ri-error-warning-line", delta: -0.08, caption: "近 7 日无告警" },
      ],
      usageSeriesDef: [{ key: "v", name: "调用量" }],
      usageSeries: [
        { label: "07-25", v: 5820 }, { label: "07-26", v: 6410 }, { label: "07-27", v: 6120 },
        { label: "07-28", v: 7240 }, { label: "07-29", v: 7860 }, { label: "07-30", v: 8020 }, { label: "07-31", v: 8730 },
      ],
      logColumns: [
        { key: "time", label: "时间", width: "1.2fr", render: (r) => React.createElement("span", { className: "th-nums", style: { fontSize: 12 } }, r.time) },
        { key: "model", label: "模型", width: "1.4fr", render: (r) => React.createElement("span", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12 } }, r.model) },
        { key: "tokens", label: "Tokens", width: "1fr" },
        { key: "cost", label: "费用", width: "0.9fr", heat: true, heatValue: (r) => r.costValue, render: (r) => r.cost },
        { key: "latency", label: "延迟", width: "0.8fr" },
      ],
      logRows: [
        { id: 1, time: "07-31 09:03:12", model: "claude-sonnet-4-5", tokens: "12,480", cost: "¥0.42", costValue: 0.42, latency: "388ms" },
        { id: 2, time: "07-31 09:01:55", model: "gpt-4o", tokens: "8,032", cost: "¥0.31", costValue: 0.31, latency: "512ms" },
        { id: 3, time: "07-31 08:58:40", model: "deepseek-v3", tokens: "20,115", cost: "¥0.12", costValue: 0.12, latency: "347ms" },
        { id: 4, time: "07-31 08:52:18", model: "claude-sonnet-4-5", tokens: "6,904", cost: "¥0.24", costValue: 0.24, latency: "402ms" },
      ],
      historyItems: [
        { time: "2026-07-28 14:20", title: "调整月额度", description: "¥200.00 → ¥300.00，操作人 admin" },
        { time: "2026-07-02 11:05", title: "触发限流告警", description: "接近月额度 90%，已自动发送通知", tone: "warning" },
        { time: "2026-06-12 10:24", title: "创建令牌", description: "范围：全部模型，操作人 admin", tone: "gray" },
      ],
    };
  }
}
</script>
</body>
</html>
```
