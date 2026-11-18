# NavRailTopbarConsole

根据源文件中的 nav-rail-topbar-console 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 nav-rail-topbar-console 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## NavRailTopbarConsole.dc.html

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
<!-- @template name="Nav Rail + Topbar Console (D+ 档)" description="层级更多的后台骨架：240px NavRail 导轨 + 内容列顶部 48px 内嵌顶栏（项目切换 + 一级域 tab），导航与画布同层微弱灰、卡片白" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--color-bg)}</style>
</helmet>
<div style="display:flex;min-height:100vh;background:var(--color-bg)">
  <x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="InfOne" groups="{{ groups }}" active="{{ active }}" onChange="{{ setActive }}" user="chen@infone.ai" collapsed="{{ collapsed }}" onToggle="{{ toggle }}"></x-import>
  <div style="flex:1;min-width:0;display:flex;flex-direction:column">
    <x-import component-from-global-scope="TokenHubDesignSystem_019e20.TopNav" hint-size="100%,48px" variant="inline" items="{{ domains }}" active="{{ domain }}" onChange="{{ setDomain }}" context="{{ projectSwitcher }}" actions="{{ topActions }}"></x-import>
    <main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
      <x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" hint-size="100%,56px" title="部署概览" actions="{{ headerActions }}"></x-import>
      <x-import component-from-global-scope="TokenHubDesignSystem_019e20.MetricStrip" hint-size="100%,84px" items="{{ metrics }}"></x-import>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">
        <x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" hint-size="100%,180px" title="生产部署" subtitle="6 小时前 · main">
          <x-import component-from-global-scope="TokenHubDesignSystem_019e20.Descriptions" hint-size="100%,120px" items="{{ deployItems }}" column="1"></x-import>
        </x-import>
        <x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" hint-size="100%,180px" title="配额" subtitle="本月">
          <x-import component-from-global-scope="TokenHubDesignSystem_019e20.TokenMeter" hint-size="100%,120px" input="{{ tokIn }}" output="{{ tokOut }}" reasoning="{{ tokReason }}" max="{{ tokQuota }}"></x-import>
        </x-import>
      </div>
      <x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" hint-size="100%,300px" columns="{{ columns }}" rows="{{ rows }}"></x-import>
    </main>
  </div>
</div>

</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { active: "deploys", collapsed: false, domain: "build" };
  renderVals() {
    const NS = window.TokenHubDesignSystem_019e20 || {};
    const { Button, StatusChip, Tag } = NS;
    const h = React.createElement;
    return {
      active: this.state.active,
      collapsed: this.state.collapsed,
      domain: this.state.domain,
      setActive: (k) => this.setState({ active: k }),
      setDomain: (k) => this.setState({ domain: k }),
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      domains: [
        { key: "build", label: "构建" },
        { key: "observe", label: "观测" },
        { key: "usage", label: "用量" },
        { key: "settings", label: "设置" },
      ],
      projectSwitcher: h("button", {
        type: "button",
        style: {
          height: 30, padding: "0 8px", borderRadius: 6, flexShrink: 0,
          background: "var(--th-white)", border: "0.5px solid var(--color-border)",
          display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
          fontSize: 12, color: "var(--color-fg)", fontFamily: "var(--th-font-cn)", cursor: "pointer",
        },
      },
        h("span", { style: { width: 16, height: 16, borderRadius: 4, background: "var(--th-teal-50)", display: "inline-block", flexShrink: 0 } }),
        h("span", { style: { fontFamily: "var(--th-font-mono)" } }, "infone/gateway"),
        h("i", { className: "ri-arrow-down-s-line", style: { color: "var(--color-fg-muted)" } }),
      ),
      topActions: Button ? h(Button, { size: "sm", icon: "ri-rocket-line" }, "部署") : null,
      groups: [
        { title: "构建", items: [
          { key: "deploys", label: "部署记录", icon: "ri-git-commit-line" },
          { key: "branches", label: "分支", icon: "ri-git-branch-line" },
          { key: "logs", label: "构建日志", icon: "ri-terminal-box-line" },
        ]},
        { title: "运行", items: [
          { key: "runtime", label: "运行时", icon: "ri-pulse-line" },
          { key: "domains", label: "域名", icon: "ri-global-line" },
          { key: "keys", label: "环境变量", icon: "ri-key-2-line" },
        ]},
        { title: "治理", items: [
          { key: "team", label: "团队与权限", icon: "ri-team-line" },
          { key: "quota", label: "配额", icon: "ri-pie-chart-line" },
        ]},
      ],
      headerActions: Button ? h(React.Fragment, null,
        h(Button, { variant: "ghost", size: "sm", icon: "ri-history-line" }, "回滚"),
        h(Button, { variant: "secondary", size: "sm", icon: "ri-external-link-line" }, "访问"),
      ) : null,
      metrics: [
        { label: "本周部署", value: 42, suffix: "次", icon: "ri-git-commit-line", delta: 8.2, caption: "较上周", series: [4, 6, 5, 9, 7, 6, 5] },
        { label: "平均构建", value: "1m 48s", icon: "ri-timer-line", delta: -6.4, deltaTone: "inverse", caption: "较上周" },
        { label: "边缘请求", value: 3.4, suffix: "M", icon: "ri-earth-line", delta: 12.1, caption: "较上周" },
        { label: "错误率", value: "0.14%", icon: "ri-error-warning-line", delta: -0.03, deltaTone: "inverse", caption: "较上周" },
      ],
      deployItems: [
        { label: "地址", value: h("span", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12 } }, "gateway-27ebf064.infone.app") },
        { label: "状态", value: StatusChip ? h(StatusChip, { tone: "success" }, "运行中") : "运行中" },
        { label: "提交", value: h("span", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12 } }, "1a1748a") },
        { label: "触发", value: "chen@infone.ai · 推送 main" },
      ],
      tokIn: 3120000,
      tokOut: 1840000,
      tokReason: 640000,
      tokQuota: 8000000,
      columns: [
        { key: "branch", label: "分支", width: "1.4fr", render: (r) => h("span", { style: { fontFamily: "var(--th-font-mono)", fontSize: 12 } }, r.branch) },
        { key: "env", label: "环境", width: "96px", render: (r) => Tag ? h(Tag, { tone: r.env[0] }, r.env[1]) : r.env[1] },
        { key: "author", label: "提交人", width: "1fr" },
        { key: "at", label: "更新", width: "104px", align: "right" },
        { key: "st", label: "状态", width: "92px", render: (r) => StatusChip ? h(StatusChip, { tone: r.st[0] }, r.st[1]) : r.st[1] },
      ],
      rows: [
        { id: 1, branch: "main", env: ["cat1", "生产"], author: "chen@infone.ai", at: "6 小时前", st: ["success", "已部署"] },
        { id: 2, branch: "feat/auth-flow", env: ["cat2", "预览"], author: "li@infone.ai", at: "22 分钟前", st: ["running", "构建中"] },
        { id: 3, branch: "fix/sse-drop", env: ["cat2", "预览"], author: "wu@infone.ai", at: "1 天前", st: ["success", "已部署"] },
        { id: 4, branch: "chore/prisma", env: ["cat2", "预览"], author: "chen@infone.ai", at: "2 天前", st: ["danger", "已失败"] },
      ],
    };
  }
}

</script>
</body>
</html>
```
