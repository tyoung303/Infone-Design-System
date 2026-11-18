# ErrorPage

根据源文件中的 error page 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 error page 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## ErrorPage.dc.html

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
<!-- @template name="Error Page" description="TokenHub 错误页 — 404/403/500, soft blob backdrop, brand lockup, single CTA" -->
<helmet>
<script src="./ds-base.js"></script>
<style>body{margin:0}</style>
</helmet>
<div style="position:relative;min-height:100vh;display:flex;flex-direction:column;overflow:hidden;background:var(--th-bg);font-family:var(--th-font-cn)">
<div style="position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; left: 108px; top: 120px; width: 420px; height: 420px; background-color: #93E8FF2E"></div>
<div style="position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;right:6%;top:20%;width:480px;height:480px;background:color-mix(in srgb, var(--th-teal-500) 14%, transparent)"></div>
<header style="position:relative;z-index:1;padding:24px 32px;display:flex;align-items:center;gap:10px">
<img src="../../assets/tokenhub-logo.svg" style="width:22px" alt="">
<span style="font-family:var(--th-font-brand);font-weight:700;font-size:18px;color:var(--color-fg)">TokenHub</span>
</header>
<main style="position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 20px 24px 60px; text-align: center; color: #191A1C">


<h1 style="font-size:22px;font-weight:600;margin:0;color:var(--color-fg)">{{ title }}</h1>
<p style="font-size: 13px;color:var(--color-fg-muted);max-width:360px;margin:0;line-height:1.5">{{ description }}</p>
<div style="display:flex;gap:12px;margin-top:8px">
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" on-click="{{ goHome }}" hint-size="112px,40px">返回首页</x-import>
<x-import component-from-global-scope="TokenHubDesignSystem_019e20.Button" variant="secondary" on-click="{{ contactSupport }}" hint-size="112px,40px">联系支持</x-import>
</div>
</main>
<footer style="position:relative;z-index:1;padding:16px;text-align:center;font-family:var(--th-font-ui);font-size:12px;color:var(--color-fg-muted)">TokenHub © 2026</footer>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;errorType&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;default&quot;:&quot;404&quot;,&quot;tsType&quot;:&quot;\&quot;404\&quot;|\&quot;403\&quot;|\&quot;500\&quot;&quot;,&quot;options&quot;:[&quot;404&quot;,&quot;403&quot;,&quot;500&quot;]}}">
class Component extends DCLogic {
  CONTENT = {
    "404": { icon: "ri-compass-3-line", code: "404", title: "页面不存在", description: "你访问的地址可能已被移动或删除，检查链接是否正确。" },
    "403": { icon: "ri-shield-cross-line", code: "403", title: "无访问权限", description: "当前账号没有权限查看此页面，如需访问请联系管理员开通。" },
    "500": { icon: "ri-error-warning-line", code: "500", title: "服务器错误", description: "服务暂时不可用，我们已收到告警并正在处理，请稍后重试。" },
  };
  renderVals() {
    const c = this.CONTENT[this.props.errorType || "404"];
    return {
      ...c,
      goHome: () => { window.location.href = "../console-dashboard/index.html"; },
      contactSupport: () => {},
    };
  }
}
</script>
</body>
</html>
```
