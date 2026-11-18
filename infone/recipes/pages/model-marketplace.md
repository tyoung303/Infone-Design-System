# ModelMarketplace

根据源文件中的 model marketplace 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 model marketplace 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## ModelMarketplace.dc.html

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
<!-- @template name="Model Marketplace" description="TokenHub 模型广场 — D 档骨架（NavRail，无顶栏）、vendor filter、pricing card grid、model detail modal" -->
<helmet>
<script src="./ds-base.js"></script>
<style>body{margin:0}</style>
</helmet>
<div style="display:flex;height:100vh;background:var(--th-bg);font-family:var(--th-font-cn)" data-screen-label="模型广场">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.NavRail" hint-size="240px,100vh" logo-src="../../assets/tokenhub-logo.svg" brand="TokenHub" groups="{{ navGroups }}" active="{{ activeNav }}" on-change="{{ setNav }}" user="admin@infone.ai"></x-import>
<main style="flex:1;min-width:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:12px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.PageHeader" variant="page" title="模型广场" hint-size="100%,56px"></x-import>
<div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
<div style="flex:1;display:flex;align-items:center;gap:10px;height:40px;padding:0 16px;background:var(--th-white);border:0.5px solid var(--color-border);border-radius:var(--th-radius-sm)">
<i class="ri-search-line" style="color:var(--color-fg-muted)"></i>
<input placeholder="模糊搜索模型名称" value="{{ search }}" oninput="{{ onSearch }}" style="flex:1;border:none;outline:none;background:transparent;font-size: 13px;font-family:var(--th-font-cn);color:var(--color-fg)">
</div>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" icon="ri-file-copy-line" hint-size="120px,40px">{{ copyLabel }}</x-import>
</div>
<sc-if value="{{ hasSelection }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
<span style="font-size:12px;color:var(--color-fg-muted)">已选模型</span>
<sc-for list="{{ selectedTags }}" as="t" hint-placeholder-count="2">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Tag" tone="{{ t.tone }}" closable="{{ true }}" on-close="{{ t.onRemove }}" hint-size="120px,24px">{{ t.name }}</x-import>
</sc-for>
</div>
</sc-if>
<sc-if value="{{ showCompare }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;flex-direction:column;gap:8px">
<span style="font-size:12px;color:var(--color-fg-muted)">已选模型对比</span>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.ModelCompare" models="{{ compareModels }}" rows="{{ compareRows }}" highlight="{{ compareHighlight }}" hint-size="100%,220px"></x-import>
</div>
</sc-if>
<div style="display:flex;gap:12px;align-items:flex-start;flex-shrink:0">
<aside style="width:240px;flex-shrink:0;background:var(--th-white);border:var(--th-border-card);border-radius:var(--th-radius-md);box-shadow:var(--th-shadow-card);padding:18px;align-self:start;position:sticky;top:0">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.VendorFilter" vendors="{{ vendors }}" active="{{ activeVendor }}" on-change="{{ setVendor }}" on-reset="{{ resetVendor }}" hint-size="100%,300px"></x-import>
</aside>
<div style="flex:1;min-width:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px">
<sc-for list="{{ visibleModels }}" as="m" hint-placeholder-count="6">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.ModelPriceCard" vendor-icon="{{ m.icon }}" vendor-color="{{ m.color }}" name="{{ m.name }}" prices="{{ m.prices }}" selected="{{ m.selected }}" on-toggle-select="{{ m.onToggle }}" on-copy="{{ m.onCopy }}" on-view="{{ m.onView }}" hint-size="100%,196px"></x-import>
</sc-for>
</div>
</div>
</main>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.ModelDetailModal" open="{{ detailOpen }}" name="{{ detailModel.name }}" vendor-icon="{{ detailModel.icon }}" vendor-color="{{ detailModel.color }}" endpoints="{{ detailModel.endpoints }}" prices="{{ detailModel.prices }}" currency="{{ currency }}" on-currency-change="{{ setCurrency }}" on-close="{{ closeDetail }}" hint-size="640px,500px"></x-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script>
class Component extends DCLogic {
  state = { activeNav: "models", activeVendor: "all", search: "", selected: new Set(), detailIndex: null, currency: "USD" };

  MODELS = [
    { vendor: "OpenAI", name: "gpt-5-mini", icon: "ri-openai-fill", color: "var(--color-fg)", input: 0.04, output: 0.32 },
    { vendor: "OpenAI", name: "gpt-5.3-codex", icon: "ri-openai-fill", color: "var(--color-fg)", input: 1.75, output: 14 },
    { vendor: "OpenAI", name: "gpt-5.5", icon: "ri-openai-fill", color: "var(--color-fg)", input: 5, output: 40 },
    { vendor: "Anthropic", name: "claude-opus-4-7", icon: "ri-anthropic-fill", color: "#D97757", input: 4.5, output: 22.5 },
    { vendor: "Anthropic", name: "claude-sonnet-4-6", icon: "ri-anthropic-fill", color: "#D97757", input: 3, output: 15 },
    { vendor: "DeepSeek", name: "deepseek-v3.2", icon: "ri-cpu-line", color: "#00AEAA", input: 0.27, output: 1.1 },
    { vendor: "Google", name: "gemini-2.5-pro", icon: "ri-google-fill", color: "#5E81F4", input: 1.25, output: 5 },
  ];
  CNY_RATE = 7.2;

  VENDOR_TONE = { OpenAI: "cat3", Anthropic: "cat2", DeepSeek: "cat1", Google: "cat5" };

  vendorTone(modelName) {
    const m = this.MODELS.find((x) => x.name === modelName);
    return (m && this.VENDOR_TONE[m.vendor]) || "cat6";
  }

  fmt(v) {
    return this.state.currency === "USD" ? "$" + v.toFixed(4) : "¥" + (v * this.CNY_RATE).toFixed(4);
  }

  renderVals() {
    const self = this;
    const vendorCounts = {};
    this.MODELS.forEach((m) => { vendorCounts[m.vendor] = (vendorCounts[m.vendor] || 0) + 1; });
    const vendorMeta = {
      OpenAI: { icon: "ri-openai-fill", color: "var(--color-fg)" },
      Anthropic: { icon: "ri-anthropic-fill", color: "#D97757" },
      DeepSeek: { icon: "ri-cpu-line", color: "#00AEAA" },
      Google: { icon: "ri-google-fill", color: "#5E81F4" },
    };
    const vendors = [{ key: "all", label: "全部供应商", count: this.MODELS.length }].concat(
      Object.keys(vendorCounts).map((v) => ({ key: v, label: v, count: vendorCounts[v], icon: vendorMeta[v]?.icon, iconColor: vendorMeta[v]?.color }))
    );
    const filtered = this.MODELS.filter((m) =>
      (this.state.activeVendor === "all" || m.vendor === this.state.activeVendor) &&
      (!this.state.search || m.name.toLowerCase().includes(this.state.search.toLowerCase()))
    );
    const visibleModels = filtered.map((m, i) => ({
      name: m.name, icon: m.icon, color: m.color,
      prices: [{ label: "输入价格", value: self.fmt(m.input) }, { label: "补全价格", value: self.fmt(m.output) }],
      selected: this.state.selected.has(m.name),
      onToggle: () => this.setState((s) => { const n = new Set(s.selected); n.has(m.name) ? n.delete(m.name) : n.add(m.name); return { selected: n }; }),
      onCopy: () => navigator.clipboard?.writeText(m.name),
      onView: () => this.setState({ detailIndex: this.MODELS.indexOf(m) }),
    }));
    const dm = this.state.detailIndex != null ? this.MODELS[this.state.detailIndex] : null;
    return {
      activeNav: this.state.activeNav,
      setNav: (k) => this.setState({ activeNav: k }),
      navGroups: [{ title: "令牌中心", items: [
        { key: "tokens", icon: "ri-key-2-line", label: "令牌管理" },
        { key: "quota", icon: "ri-pie-chart-2-line", label: "额度管理" },
        { key: "models", icon: "ri-store-2-line", label: "模型广场" },
      ]},{ title: "系统", items: [
        { key: "users", icon: "ri-team-line", label: "用户管理" },
        { key: "settings", icon: "ri-settings-3-line", label: "系统设置" },
      ]}],
      vendors,
      activeVendor: this.state.activeVendor,
      setVendor: (k) => this.setState({ activeVendor: k }),
      resetVendor: () => this.setState({ activeVendor: "all", search: "" }),
      search: this.state.search,
      onSearch: (e) => this.setState({ search: e.target.value }),
      selectedCount: this.state.selected.size,
      hasSelection: this.state.selected.size > 0,
      selectedTags: Array.from(this.state.selected).map((name) => ({
        name,
        tone: self.vendorTone(name),
        onRemove: () => this.setState((s) => { const n = new Set(s.selected); n.delete(name); return { selected: n }; }),
      })),
      showCompare: this.state.selected.size >= 2,
      compareHighlight: Array.from(this.state.selected)[0] || "",
      compareModels: Array.from(this.state.selected).slice(0, 4).map((name) => {
        const m = self.MODELS.find((x) => x.name === name) || {};
        return { name, meta: m.vendor, icon: m.icon, color: m.color };
      }),
      compareRows: [
        { label: "输入价 / 1M", values: Object.fromEntries(Array.from(this.state.selected).map((name) => { const m = self.MODELS.find((x) => x.name === name); return [name, m ? self.fmt(m.input) : null]; })) },
        { label: "补全价 / 1M", values: Object.fromEntries(Array.from(this.state.selected).map((name) => { const m = self.MODELS.find((x) => x.name === name); return [name, m ? self.fmt(m.output) : null]; })) },
        { label: "供应商", values: Object.fromEntries(Array.from(this.state.selected).map((name) => { const m = self.MODELS.find((x) => x.name === name); return [name, m ? m.vendor : null]; })) },
        { label: "OpenAI 兼容", values: Object.fromEntries(Array.from(this.state.selected).map((name) => [name, true])) },
      ],
      copyLabel: this.state.selected.size > 0 ? `复制 ${this.state.selected.size}` : "复制",
      visibleModels,
      detailOpen: !!dm,
      detailModel: dm ? {
        name: dm.name, icon: dm.icon, color: dm.color,
        endpoints: [{ name: "openai", path: "/v1/chat/completions", method: "POST" }],
        prices: [{ label: "输入价格", value: self.fmt(dm.input) }, { label: "补全价格", value: self.fmt(dm.output) }],
      } : { name: "", icon: "", color: "", endpoints: [], prices: [] },
      currency: this.state.currency,
      setCurrency: (c) => this.setState({ currency: c }),
      closeDetail: () => this.setState({ detailIndex: null }),
    };
  }
}
</script>
</body>
</html>
```
