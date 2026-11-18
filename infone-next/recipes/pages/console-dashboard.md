# ConsoleDashboard

根据源文件中的 console dashboard 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 console dashboard 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## ConsoleDashboard.dc.html

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
<!-- @template name="Console Dashboard" description="TokenHub console shell — D 档骨架（NavRail）、account cards、token table、new-token modal" -->
<helmet>
<script src="./ds-base.js"></script>
<style>body{margin:0}</style>
</helmet>
<div style="display:flex;height:100vh;background:var(--th-bg);font-family:var(--th-font-cn)">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="TokenHub" groups="{{ sidebarGroups }}" active="{{ activeKey }}" on-change="{{ setActive }}" user="admin" collapsed="{{ collapsed }}" on-toggle="{{ toggle }}"></x-import>
<div style="flex:1;min-width:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="控制台概览" meta="{{ headerMeta }}" hint-size="100%,56px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" size="sm" icon="ri-add-line" on-click="{{ openNewToken }}" hint-size="88px,28px">新建令牌</x-import>
</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.MetricStrip" items="{{ metrics }}" hint-size="100%,84px"></x-import>
<div style="border-radius:var(--th-radius-md);padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;border:var(--th-border-card);background:var(--th-white);box-shadow:var(--th-shadow-card)">
<span style="font-size:12px;color:var(--color-fg-muted);flex-shrink:0">接口地址</span><x-import component-from-global-scope="TokenHubDesignSystem_019e20.CopyField" value="http://localhost:3000/v1/chat/completions" style="flex:1;min-width:0" hint-size="100%,32px"></x-import>
</div>
<div style="display:grid;grid-template-columns:minmax(0,1fr) 292px;gap:12px;align-items:start;flex-shrink:0">
<div style="border-radius:var(--th-radius-md);background:var(--th-white);border:var(--th-border-card);box-shadow:var(--th-shadow-card);overflow:hidden">
<div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid var(--color-border)">
<div style="display:flex;gap:10px;align-items:center">
<i class="ri-key-2-line" style="font-size:16px"></i>
<span style="font-size:13px;font-weight:500">令牌管理</span>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" size="sm" icon="ri-add-line" on-click="{{ openNewToken }}" hint-size="88px,32px">新建令牌</x-import>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" columns="{{ tokenColumns }}" rows="{{ tokenRows }}" embedded="{{ true }}" hint-size="100%,220px"></x-import>
</div>
<div style="display:flex;flex-direction:column;gap:12px">
<div style="border-radius:var(--th-radius-md);background:var(--th-white);border:var(--th-border-card);box-shadow:var(--th-shadow-card);padding:12px;display:flex;flex-direction:column;gap:12px">
<span style="font-size:12px;color:var(--color-fg-muted)">本月额度使用</span>
<div style="display:flex;align-items:center;gap:14px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.RingGauge" value="{{ quotaPct }}" tone="heat" size="{{ 72 }}" thickness="{{ 7 }}" hint-size="72px,72px"></x-import>
<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
<span class="th-nums" style="font-size:15px;font-weight:600;color:var(--color-fg)">¥1,204.50</span>
<span style="font-size:11px;color:var(--color-fg-muted)">配额 ¥1,800.00</span>
</div>
</div>
<div style="padding:8px 10px;border-radius:6px;background:var(--color-surface-inset);font-size:11px;color:var(--color-fg-muted);line-height:1.5">按当前速率预计 8 月 21 日耗尽</div>
</div>
<div style="border-radius:var(--th-radius-md);background:var(--th-white);border:var(--th-border-card);box-shadow:var(--th-shadow-card);padding:12px;display:flex;flex-direction:column;gap:12px">
<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
<span style="font-size:12px;color:var(--color-fg-muted)">近 5 周调用活跃度</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TrendDelta" value="{{ 12.4 }}" size="sm" hint-size="48px,16px"></x-import>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Heatgrid" data="{{ activity }}" columns="{{ 7 }}" cell-size="{{ 14 }}" gap="{{ 4 }}" hint-size="130px,90px"></x-import>
</div>
<div style="border-radius:var(--th-radius-md);background:var(--th-white);border:var(--th-border-card);box-shadow:var(--th-shadow-card);padding:12px;display:flex;flex-direction:column;gap:12px">
<span style="font-size:12px;color:var(--color-fg-muted)">本月成本构成</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.CostBreakdown" items="{{ costItems }}" density="compact" hint-size="100%,150px"></x-import>
</div>
</div>
</div>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Modal" open="{{ modalOpen }}" title="新建令牌" description="密钥仅在创建时显示一次，请妥善保存" on-close="{{ closeNewToken }}" footer="{{ modalFooter }}" hint-size="440px,320px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TextField" label="名称" placeholder="例如：production-web" value="{{ newTokenName }}" on-change="{{ setNewTokenName }}" hint-size="100%,58px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Select" label="可调用模型" value="{{ newTokenScope }}" on-change="{{ setNewTokenScope }}" options="{{ scopeOptions }}" hint-size="100%,58px"></x-import>
</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Drawer" open="{{ drawerOpen }}" title="令牌详情" description="{{ drawerDesc }}" on-close="{{ closeDrawer }}" width="380" hint-size="0px,0px">
<div style="display:flex;align-items:center;gap:8px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.StatusChip" tone="{{ drawerTone }}" hint-size="64px,22px">{{ drawerStatus }}</x-import>
<span style="font-size:12px;color:var(--color-fg-muted)">{{ drawerScope }}</span>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.CopyField" label="密钥" value="{{ drawerKey }}" secret="{{ true }}" hint-size="100%,60px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Progress" label="本月额度" caption="{{ drawerQuotaCaption }}" value="{{ drawerQuotaPct }}" hint-size="100%,40px"></x-import>
</x-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = {
    activeKey: "tokens",
    collapsed: false,
    modalOpen: false,
    newTokenName: "",
    newTokenScope: "all",
    tokenRows: [
      { id: 1, name: "production-web", scope: "全部模型", key: "sk-••••3f2a", fullKey: "sk-Xk92mPqL7vN3wRt8aB5cD1eF6gH03f2a", status: "active", used: 120, quota: 300 },
      { id: 2, name: "staging-batch", scope: "OpenAI 系列", key: "sk-••••91cd", fullKey: "sk-Qw45nRtY2uI8oP1aS6dF9gH3jK791cd", status: "limited", used: 264, quota: 300 },
      { id: 3, name: "old-key", scope: "自定义", key: "sk-••••00aa", fullKey: "sk-Zx78cVbN4mL2kJ9hG5fD3sA1qW600aa", status: "revoked", used: 0, quota: 100 },
    ],
    drawerToken: null,
  };

  statusLabel(s) { return { active: "已激活", limited: "限速中", revoked: "已禁用" }[s] || s; }
  statusTone(s) { return { active: "success", limited: "warning", revoked: "danger" }[s] || "neutral"; }

  renderVals() {
    const self = this;
    return {
      activeKey: this.state.activeKey,
      setActive: (k) => this.setState({ activeKey: k }),
      collapsed: this.state.collapsed,
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      sidebarGroups: [
        { title: "令牌中心", items: [
          { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
          { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
          { key: "models", icon: "ri-store-2-line", label: "模型广场" },
        ]},
        { title: "系统", items: [
          { key: "users", icon: "ri-team-line", label: "用户管理" },
          { key: "settings", icon: "ri-settings-3-line", label: "系统设置" },
        ]},
      ],
      copyEndpoint: () => navigator.clipboard?.writeText("http://localhost:3000/v1/chat/completions"),
      headerMeta: React.createElement(React.Fragment, null,
        React.createElement("span", null, "共 3 个令牌"),
        React.createElement("span", null, "·"),
        React.createElement("span", null, "更新于 14:02")),
      metrics: [
        { label: "账户余额", value: 300, prefix: "¥", icon: "ri-money-cny-circle-line", caption: "低于 ¥100 时提醒" },
        { label: "本月消耗", value: 1204.5, prefix: "¥", icon: "ri-line-chart-line", delta: 6.8, deltaTone: "inverse", series: [820, 910, 880, 1010, 1120, 1160, 1204] },
        { label: "今日调用", value: 42318, suffix: "次", icon: "ri-pulse-line", delta: 12.4, series: [12, 18, 15, 22, 26, 24, 31] },
        { label: "令牌数量", value: 3, suffix: "个", icon: "ri-key-2-line", caption: "1 个限速中" },
      ],
      tokenColumns: [
        { key: "name", label: "名称", width: "1.6fr", render: (r) => React.createElement("div", null,
            React.createElement("div", { style: { fontWeight: 500 } }, r.name),
            React.createElement("div", { style: { fontSize: 11, color: "var(--color-fg-muted)" } }, r.scope)) },
        { key: "key", label: "密钥", width: "1.4fr", render: (r) => React.createElement("code", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12 } }, r.key) },
        { key: "used", label: "用量", width: "84px", heat: true, heatValue: (r) => r.used, render: (r) => "¥" + r.used.toFixed(0) },
        { key: "status", label: "状态", width: "92px", render: (r) => {
            const DS = window.TokenHubDesignSystem_019e20 || {};
            return DS.StatusChip ? React.createElement(DS.StatusChip, { tone: self.statusTone(r.status) }, self.statusLabel(r.status)) : self.statusLabel(r.status);
          } },
        { key: "ops", label: "", width: "48px", render: (r) => {
            const DS = window.TokenHubDesignSystem_019e20 || {};
            return DS.Dropdown ? React.createElement(DS.Dropdown, { align: "right", items: [
              { key: "detail", label: "查看详情", icon: "ri-eye-line", onSelect: () => self.setState({ drawerToken: r }) },
              { key: "edit", label: "编辑", icon: "ri-edit-line" },
              { divider: true },
              { key: "revoke", label: "禁用令牌", icon: "ri-forbid-line", danger: true },
            ] }) : null;
          } },
      ],
      tokenRows: this.state.tokenRows,
      quotaPct: 67,
      activity: [18,26,22,31,29,12,9, 24,33,28,36,34,15,11, 30,41,38,44,40,19,14, 36,48,45,52,47,22,16, 42,55,51,58,54,26,20].map((v, i) => ({ v, label: "第" + (i + 1) + "天" })),
      costItems: [
        { label: "claude-sonnet-4", value: 742.1 },
        { label: "gpt-4o-mini", value: 316.4 },
        { label: "deepseek-v3", value: 102.8 },
        { label: "其他", value: 43.2 },
      ],
      drawerOpen: !!this.state.drawerToken,
      drawerDesc: this.state.drawerToken ? this.state.drawerToken.name : "",
      drawerTone: this.statusTone(this.state.drawerToken?.status),
      drawerStatus: this.statusLabel(this.state.drawerToken?.status || ""),
      drawerScope: this.state.drawerToken?.scope || "",
      drawerKey: this.state.drawerToken?.fullKey || "",
      drawerQuotaCaption: this.state.drawerToken ? `¥${this.state.drawerToken.used.toFixed(2)} / ¥${this.state.drawerToken.quota.toFixed(2)}` : "",
      drawerQuotaPct: this.state.drawerToken ? Math.round((this.state.drawerToken.used / this.state.drawerToken.quota) * 100) : 0,
      closeDrawer: () => this.setState({ drawerToken: null }),
      modalOpen: this.state.modalOpen,
      openNewToken: () => this.setState({ modalOpen: true, newTokenName: "", newTokenScope: "all" }),
      closeNewToken: () => this.setState({ modalOpen: false }),
      newTokenName: this.state.newTokenName,
      setNewTokenName: (e) => this.setState({ newTokenName: e.target.value }),
      newTokenScope: this.state.newTokenScope,
      setNewTokenScope: (v) => this.setState({ newTokenScope: v }),
      scopeOptions: [
        { value: "all", label: "全部模型" },
        { value: "openai", label: "OpenAI 系列" },
        { value: "anthropic", label: "Anthropic 系列" },
        { value: "custom", label: "自定义" },
      ],
      modalFooter: React.createElement(React.Fragment, null,
        React.createElement(window.TokenHubDesignSystem_019e20?.Button ? window.TokenHubDesignSystem_019e20.Button : "button",
          { variant: "ghost", onClick: () => this.setState({ modalOpen: false }) }, "取消"),
        React.createElement(window.TokenHubDesignSystem_019e20?.Button ? window.TokenHubDesignSystem_019e20.Button : "button",
          { onClick: () => {
              const name = this.state.newTokenName || "untitled";
              this.setState((s) => ({ modalOpen: false, tokenRows: [...s.tokenRows, { id: Date.now(), name, scope: "全部模型", key: "sk-••••" + Math.random().toString(16).slice(2, 6), status: "active" }] }));
            } }, "创建")),
    };
  }
}
</script>
</body>
</html>
```
