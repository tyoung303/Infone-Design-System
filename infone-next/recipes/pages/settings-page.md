# SettingsPage

根据源文件中的 settings page 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 settings page 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## SettingsPage.dc.html

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
<!-- @template name="Settings Page" description="个人设置页 — D 档骨架（NavRail，无顶栏）+ 基本信息/安全设置/通知设置分卡" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--th-bg)}</style>
</helmet>
<div style="display:flex;min-height:100vh;background:var(--th-bg);font-family:var(--th-font-cn);color:var(--color-fg)" data-screen-label="个人设置页">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="InfOne" groups="{{ navGroups }}" active="{{ activeNav }}" on-change="{{ setNav }}" user="admin@infone.ai"></x-import>
<main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="个人设置" hint-size="100%,56px"></x-import>
<div style="width:100%;max-width:720px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" title="基本信息" hint-size="100%,280px">
<div style="display:flex;align-items:center;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Avatar" name="admin" size="48" hint-size="48px,48px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" variant="secondary" size="sm" icon="ri-image-edit-line" on-click="{{ noop }}" hint-size="96px,32px">更换头像</x-import>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TextField" label="昵称" value="{{ nick }}" on-change="{{ setNick }}" hint-size="100%,58px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TextField" label="邮箱" value="{{ email }}" on-change="{{ setEmail }}" hint-size="100%,58px"></x-import>
<div style="display:flex;justify-content:flex-end"><x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" size="sm" on-click="{{ noop }}" hint-size="64px,32px">保存</x-import></div>
</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" title="安全设置" hint-size="100%,180px">
<div style="display:flex;flex-direction:column">
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:0.5px solid var(--color-border)">
<div>
<div style="font-size:13px">登录密码</div>
<div style="font-size:12px;color:var(--color-fg-muted);margin-top:2px">上次修改于 2026-05-18</div>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" variant="secondary" size="sm" on-click="{{ noop }}" hint-size="72px,32px">修改</x-import>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0">
<div>
<div style="font-size:13px">两步验证</div>
<div style="font-size:12px;color:var(--color-fg-muted);margin-top:2px">登录时需要额外的一次性验证码</div>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Switch" checked="{{ mfa }}" on-change="{{ setMfa }}" hint-size="40px,24px"></x-import>
</div>
</div>
</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" title="通知设置" hint-size="100%,220px">
<div style="display:flex;flex-direction:column">
<sc-for list="{{ notices }}" as="n" hint-placeholder-count="3">
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:0.5px solid var(--color-border)">
<div>
<div style="font-size:13px">{{ n.label }}</div>
<div style="font-size:12px;color:var(--color-fg-muted);margin-top:2px">{{ n.desc }}</div>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Switch" checked="{{ n.on }}" on-change="{{ n.toggle }}" hint-size="40px,24px"></x-import>
</div>
</sc-for>
</div>
</x-import>
</div>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { activeNav: "profile", nick: "admin", email: "admin@example.com", mfa: true,
    notices: { quota: true, error: true, weekly: false } };
  renderVals() {
    const N = [
      { key: "quota", label: "额度告警", desc: "月额度使用达 80% / 100% 时通知" },
      { key: "error", label: "调用异常", desc: "错误率超阈值或上游不可用时通知" },
      { key: "weekly", label: "每周用量周报", desc: "每周一发送上周消耗汇总" },
    ];
    return {
      activeNav: this.state.activeNav,
      setNav: (k) => this.setState({ activeNav: k }),
      navGroups: [{ title: "账户", items: [
        { key: "profile", icon: "ri-user-settings-line", label: "个人设置" },
        { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
        { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
      ]}],
      noop: () => {},
      nick: this.state.nick, setNick: (e) => this.setState({ nick: e.target.value }),
      email: this.state.email, setEmail: (e) => this.setState({ email: e.target.value }),
      mfa: this.state.mfa, setMfa: (v) => this.setState({ mfa: v }),
      notices: N.map((n) => ({ label: n.label, desc: n.desc, on: this.state.notices[n.key],
        toggle: (v) => this.setState((s) => ({ notices: { ...s.notices, [n.key]: v } })) })),
    };
  }
}
</script>
</body>
</html>
```
