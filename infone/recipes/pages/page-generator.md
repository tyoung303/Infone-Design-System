# PageGenerator

根据源文件中的 page generator 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 page generator 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## PageGenerator.dc.html

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
<!-- @template name="Page Generator" description="AI 页面生成工作台 — 流程页配色配方示范：Steps 按状态分色、枚举走分类色、用量列走 heat、构成走 TokenMeter" -->
<helmet>
<script src="./ds-base.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<style>body{margin:0;background:var(--th-bg)}</style>
</helmet>
<div style="display:flex;min-height:100vh;background:var(--th-bg);font-family:var(--th-font-cn);color:var(--color-fg)" data-density="{{ density }}" data-screen-label="页面生成工作台">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="InfDesign" groups="{{ navGroups }}" active="{{ activeNav }}" on-change="{{ setNav }}" user="tianyuan" collapsed="{{ collapsed }}" on-toggle="{{ toggle }}"></x-import>
<main style="flex:1;min-width:0;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="页面生成" meta="{{ headerMeta }}" hint-size="100%,56px">
<div style="display:flex;align-items:center;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Segmented" options="{{ roleOptions }}" value="{{ role }}" on-change="{{ setRole }}" size="sm" hint-size="132px,32px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" size="sm" icon="ri-magic-line" on-click="{{ advance }}" hint-size="96px,32px">{{ ctaLabel }}</x-import>
</div>
</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" title="生成流程" actions="{{ stageChip }}" hint-size="100%,120px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Steps" items="{{ stepItems }}" current="{{ stepCurrent }}" hint-size="100%,60px"></x-import>
</x-import>
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.SectionCard" title="上传与需求" style="{{ uploadCardStyle }}" hint-size="340px,420px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Select" label="使用设计系统" value="{{ system }}" options="{{ systemOptions }}" on-change="{{ setSystem }}" hint-size="100%,64px"></x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Upload" accept=".md,.pdf,.html,.zip" hint="需求文档、截图、Figma 导出或压缩包，只提取功能与信息层级" hint-size="100%,120px"></x-import>
<div style="background:var(--color-surface-quiet);border-radius:6px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px">
<span style="font-size:12px;color:var(--brand-700)">已提取功能点 <b class="th-nums">12</b> 项 / 区块 <b class="th-nums">6</b> 个</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.StatusChip" tone="success" hint-size="64px,22px">可生成</x-import>
</div>
<div style="display:flex;flex-direction:column;gap:8px">
<span style="font-size:12px;color:var(--color-fg-muted)">生成目标</span>
<sc-for list="{{ targets }}" as="t" hint-placeholder-count="3">
<button type="button" onClick="{{ t.select }}" style="all:unset;cursor:pointer;position:relative;display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:6px;border:0.5px solid var(--color-border);background:var(--th-white);font-family:var(--th-font-cn)">
<sc-if value="{{ t.selected }}" hint-placeholder-val="{{ false }}">
<span style="position:absolute;inset:-1px;border-radius:6px;border:1px solid var(--color-accent);background:var(--color-surface-selected);pointer-events:none"></span>
</sc-if>
<i class="{{ t.icon }}" style="position:relative;font-size:15px;line-height:18px;color:var(--color-fg-muted)"></i>
<span style="position:relative;display:flex;flex-direction:column;gap:2px;min-width:0">
<span style="display:flex;align-items:center;gap:6px">
<span style="font-size:13px;font-weight:500">{{ t.title }}</span>
</span>
<span style="font-size:11px;color:var(--color-fg-muted);text-wrap:pretty">{{ t.desc }}</span>
</span>
</button>
</sc-for>
</div>
</x-import>
<section style="flex:4 1 420px;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:12px 16px;display:flex;flex-direction:column;gap:14px;min-width:0">
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
<div style="display:flex;align-items:center;gap:10px;min-width:0">
<span style="font-size:15px;font-weight:600">测试计划详情</span>
<span class="th-nums" style="font-size:12px;color:var(--color-fg-muted)">PLAN-812</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Tag" tone="cat1" hint-size="76px,20px">后台详情页</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.StatusChip" tone="{{ previewTone }}" hint-size="72px,22px">{{ previewLabel }}</x-import>
</div>
<div style="display:flex;gap:8px;flex-shrink:0">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" variant="secondary" size="sm" icon="ri-fullscreen-line" on-click="{{ noop }}" hint-size="72px,32px">放大</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" variant="secondary" size="sm" icon="ri-external-link-line" on-click="{{ noop }}" hint-size="104px,32px">新窗口打开</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" size="sm" icon="ri-edit-line" on-click="{{ noop }}" hint-size="72px,32px">编辑</x-import>
</div>
</div>
<div style="background:var(--color-surface-inset);border-radius:6px;padding:12px 14px;display:flex;flex-direction:column;gap:2px">
<div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:8px">
<span style="font-size:12px;color:var(--color-fg-muted)">页面区块 6 · 按生成顺序</span>
<span class="th-nums" style="font-size:11px;color:var(--color-fg-subtle)">耗时 18.4s</span>
</div>
<sc-for list="{{ blocks }}" as="b" hint-placeholder-count="6">
<div style="display:grid;grid-template-columns:minmax(0,1fr) 84px;gap:10px;align-items:center;padding:7px 0;border-top:0.5px solid var(--color-border)">
<span style="font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ b.name }}<span style="color:var(--color-fg-muted)"> · {{ b.kind }}</span></span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.StatusChip" tone="{{ b.status }}" hint-size="72px,22px">{{ b.statusLabel }}</x-import>
</div>
</sc-for>
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;align-items:center">
<div style="display:flex;flex-direction:column;gap:8px;min-width:0">
<span style="font-size:12px;color:var(--color-fg-muted)">本次生成 token 构成</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.TokenMeter" input="{{ 42800 }}" output="{{ 18600 }}" reasoning="{{ 9400 }}" cached="{{ 12200 }}" hint-size="100%,110px"></x-import>
</div>
<div style="display:flex;align-items:center;gap:14px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.RingGauge" value="{{ 62 }}" tone="heat" size="{{ 60 }}" thickness="{{ 6 }}" hint-size="60px,60px"></x-import>
<div style="display:flex;flex-direction:column;gap:3px;min-width:0">
<span style="font-size:12px;color:var(--color-fg-muted)">本月生成配额</span>
<span class="th-nums" style="font-size:15px;font-weight:600">31 / 50 页</span>
<span style="font-size:11px;color:var(--color-fg-muted)">7 月 1 日重置</span>
</div>
</div>
</div>
</section>
</div>
<section style="background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);overflow:hidden">
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px">
<span style="font-size:13px;font-weight:600">最近生成</span>
<div style="display:flex;align-items:center;gap:10px">
<span style="font-size:12px;color:var(--color-fg-muted)">导出格式 {{ formatsText }}</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.StatusChip" tone="success" hint-size="64px,22px">可导出</x-import>
</div>
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.DataTable" columns="{{ recentColumns }}" rows="{{ recentRows }}" density="{{ density }}" embedded="{{ true }}" hint-size="100%,220px"></x-import>
</section>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;stage&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;options&quot;:[&quot;idle&quot;,&quot;running&quot;,&quot;done&quot;],&quot;default&quot;:&quot;running&quot;,&quot;tsType&quot;:&quot;\&quot;idle\&quot; | \&quot;running\&quot; | \&quot;done\&quot;&quot;,&quot;section&quot;:&quot;流程&quot;},&quot;density&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;options&quot;:[&quot;comfortable&quot;,&quot;compact&quot;],&quot;default&quot;:&quot;comfortable&quot;,&quot;tsType&quot;:&quot;\&quot;comfortable\&quot; | \&quot;compact\&quot;&quot;,&quot;section&quot;:&quot;密度&quot;}}">
class Component extends DCLogic {
  state = { activeNav: "generate", collapsed: false, role: "admin", system: "infone", target: "detail", stage: null };
  get stage() { return this.state.stage ?? this.props.stage ?? "running"; }
  renderVals() {
    const DS = window.TokenHubDesignSystem_019e20 || {};
    const { Tag, StatusChip, Sparkline } = DS;
    const stage = this.stage;
    const stepCurrent = stage === "idle" ? 0 : stage === "running" ? 2 : 4;
    const targetDefs = [
      { key: "detail", title: "后台详情页", kind: "详情", tone: "cat1", icon: "ri-file-list-3-line", desc: "顶部信息、字段详情、操作区与辅助说明。" },
      { key: "list", title: "后台列表页", kind: "列表", tone: "cat2", icon: "ri-table-line", desc: "筛选区、表格、批量操作与分页。" },
      { key: "form", title: "后台表单页", kind: "表单", tone: "cat3", icon: "ri-input-field", desc: "分组表单、校验提示、提交操作。" },
    ];
    return {
      density: this.props.density ?? "comfortable",
      activeNav: this.state.activeNav,
      setNav: (k) => this.setState({ activeNav: k }),
      collapsed: this.state.collapsed,
      toggle: () => this.setState((s) => ({ collapsed: !s.collapsed })),
      navGroups: [
        { title: "工作台", items: [
          { key: "generate", icon: "ri-magic-line", label: "页面生成" },
          { key: "pages", icon: "ri-window-line", label: "我的页面" },
          { key: "export", icon: "ri-download-2-line", label: "导出中心" },
        ] },
        { title: "设计资产", items: [
          { key: "systems", icon: "ri-palette-line", label: "设计系统库" },
          { key: "components", icon: "ri-shapes-line", label: "组件与示例" },
          { key: "examples", icon: "ri-layout-grid-line", label: "示例页面" },
        ] },
      ],
      headerMeta: "已提取功能点 12 项 · 区块 6 个 · 更新于 14:02",
      roleOptions: [{ label: "管理员", value: "admin" }, { label: "成员", value: "member" }],
      role: this.state.role,
      setRole: (v) => this.setState({ role: v }),
      ctaLabel: stage === "done" ? "重新生成" : stage === "running" ? "查看进度" : "开始生成",
      advance: () => this.setState({ stage: stage === "idle" ? "running" : stage === "running" ? "done" : "idle" }),
      noop: () => {},
      stageTone: stage === "done" ? "success" : stage === "running" ? "info" : "neutral",
      stageLabel: stage === "done" ? "已完成" : stage === "running" ? "生成页面 · 3/4" : "等待开始",
      stageChip: StatusChip ? React.createElement(StatusChip, { tone: stage === "done" ? "success" : stage === "running" ? "info" : "neutral" }, stage === "done" ? "已完成" : stage === "running" ? "生成页面 · 3/4" : "等待开始") : null,
      uploadCardStyle: { flex: "1 1 300px", maxWidth: 340, minWidth: 0 },
      stepItems: [
        { title: "解析材料", description: "抽取功能字段" },
        { title: "匹配系统", description: "Token 与组件" },
        { title: "生成页面", description: "输出可编辑稿" },
        { title: "导出交付", description: "下载多格式" },
      ],
      stepCurrent,
      previewTone: stage === "done" ? "success" : stage === "running" ? "warning" : "neutral",
      previewLabel: stage === "done" ? "已生成" : stage === "running" ? "生成中" : "待生成",
      system: this.state.system,
      setSystem: (v) => this.setState({ system: v }),
      systemOptions: [
        { value: "infone", label: "InfOne Design System · v1.8" },
        { value: "infcode", label: "InfCode Console · v0.9" },
      ],
      targets: targetDefs.map((t) => ({
        ...t,
        select: () => this.setState({ target: t.key }),
        selected: this.state.target === t.key,
      })),
      blocks: [
        { name: "页头 · 标题 + 状态 + 操作", kind: "结构", tone: "cat1", status: "success", statusLabel: "已生成" },
        { name: "基本信息 Descriptions", kind: "字段", tone: "cat2", status: "success", statusLabel: "已生成" },
        { name: "用例统计指标行", kind: "指标", tone: "cat4", status: "success", statusLabel: "已生成" },
        { name: "执行记录表格", kind: "表格", tone: "cat3", status: "success", statusLabel: "已生成" },
        { name: "关联缺陷列表", kind: "表格", tone: "cat3", status: "warning", statusLabel: "待确认" },
        { name: "操作日志时间轴", kind: "记录", tone: "cat5", status: "neutral", statusLabel: "未启用" },
      ],
      formatsText: "· HTML · React · Next.js · Vue · PNG",
      recentColumns: [
        { key: "name", label: "页面", width: "1.6fr", render: (r) => React.createElement("span", { style: { fontSize: 13 } }, r.name) },
        { key: "kind", label: "类型", width: "104px", render: (r) => React.createElement("span", { style: { fontSize: 12, color: "var(--color-fg-muted)" } }, r.kind) },
        { key: "status", label: "状态", width: "92px", render: (r) => StatusChip ? React.createElement(StatusChip, { tone: r.status }, r.statusLabel) : r.statusLabel },
        { key: "tokens", label: "Tokens", width: "92px", heat: true, heatValue: (r) => r.tokenValue, render: (r) => r.tokens },
        { key: "trend", label: "近 7 次耗时", width: "96px", render: (r) => Sparkline ? React.createElement(Sparkline, { data: r.series, width: 64, height: 18 }) : null },
        { key: "cost", label: "耗时", width: "84px", align: "right", render: (r) => React.createElement("span", { className: "th-nums", style: { fontSize: 12 } }, r.cost) },
      ],
      recentRows: [
        { id: 1, name: "测试计划详情", kind: "详情", tone: "cat1", status: "success", statusLabel: "已生成", tokens: "83,000", tokenValue: 83000, cost: "18.4s", series: [22, 19, 21, 18, 20, 17, 18] },
        { id: 2, name: "缺陷列表", kind: "列表", tone: "cat2", status: "success", statusLabel: "已生成", tokens: "41,200", tokenValue: 41200, cost: "11.2s", series: [14, 13, 15, 12, 13, 11, 11] },
        { id: 3, name: "新建用例表单", kind: "表单", tone: "cat3", status: "warning", statusLabel: "待确认", tokens: "26,500", tokenValue: 26500, cost: "8.6s", series: [9, 10, 8, 11, 9, 9, 8] },
        { id: 4, name: "成员权限设置", kind: "设置", tone: "cat5", status: "danger", statusLabel: "已失败", tokens: "12,900", tokenValue: 12900, cost: "3.1s", series: [7, 6, 8, 6, 7, 5, 3] },
      ],
    };
  }
}
</script>
</body>
</html>
```
