# Login

根据源文件中的 login 模板整理而成的 InfOne 页面模式。

## 适用场景

当页面需求匹配 login 工作流时使用此模式，并复用所有匹配的 InfOne 具名组件。

## 主题默认

Login 是 C 档独立页，默认生成浅色页面：根容器使用 `background:var(--th-bg)`，卡片使用浅色半透明白表面，且不得主动在 `html`、`body` 或页面根容器上添加 `data-theme="dark"`。只有用户明确要求暗色登录页，或宿主已经提供暗色主题上下文时，才通过 `data-theme="dark"` 让 token 自动派生；不要因为读取到 `tokens.css` 的暗色段、控制台语境或安全登录语义而改成深色背景。

## 必要流程

1. 应用 DESIGN.md 中的页面骨架决策树。
2. 将每个可见控件匹配到具名组件目录。
3. 保留密度、组件嵌套、响应式行为、语义颜色与视觉预算规则。
4. 替换示例文案和业务数据，但不要用原生近似实现替换标准组件。

## Login.dc.html

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
<!-- @template name="Login" description="TokenHub SSO login — brand lockup, single continue CTA, soft blob backdrop" -->
<helmet>
<script src="./ds-base.js"></script>
<style>body{margin:0}@keyframes th-login-blob-noop{0%{opacity:1}100%{opacity:1}}</style>
</helmet>
<div style="position:relative;min-height:100vh;display:flex;flex-direction:column;overflow:hidden;background:var(--th-bg);font-family:var(--th-font-cn)">
<div style="position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;left:8%;top:10%;width:420px;height:420px;background:rgba(88,182,248,0.22)"></div>
<div style="position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;right:6%;top:20%;width:480px;height:480px;background:color-mix(in srgb, var(--th-teal-500) 18%, transparent)"></div>
<div style="position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;left:34%;top:52%;width:360px;height:360px;background:color-mix(in srgb, var(--th-teal-300) 18%, transparent)"></div>
<main style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 40px">
<div style="display:inline-flex;align-items:center;gap:14px;margin-bottom:32px">
<svg width="36" height="50" viewBox="0 0 139 198" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="TokenHub">
<path d="M69.1699 9.6579C69.1699 6.09413 73.4788 4.30953 75.9986 6.82969L134.33 65.17V130.33L69.1699 65.17V9.6579Z" fill="#00AEAA"></path>
<path d="M4 65.1699L69.17 130.33V185.843C69.17 189.407 64.8614 191.191 62.3416 188.671L4 130.33V65.1699Z" fill="#00AEAA"></path>
<path opacity="0.8" d="M134.33 65.1699V130.33L104.578 160.082C103.016 161.644 100.484 161.644 98.9215 160.082L69.1699 130.33L134.33 65.1699Z" fill="#007F7C"></path>
<path opacity="0.8" d="M33.7516 35.4094C35.3136 33.8469 37.8466 33.8467 39.4089 35.4089L69.17 65.1701L4 130.33V65.1701L33.7516 35.4094Z" fill="#69FFFB"></path>
</svg>
<span style="font-family:var(--th-font-brand);font-weight:700;font-size:24px;letter-spacing:-0.01em;color:var(--color-fg)">TokenHub</span>
</div>
<div style="width: 440px; max-width: calc(100% - 32px); border-radius: 18px; box-shadow: 0 20px 60px rgba(15,18,23,0.08); padding: 44px 40px 36px; display: flex; flex-direction: column; gap: 32px; align-items: center; border-width: 0px; background-color: #FFFFFF80">
<h1 style="margin:0;font-family:var(--th-font-cn);font-size:28px;font-weight:700;color:var(--color-fg);letter-spacing:0.3em;text-indent:0.3em">登录</h1>
<button type="button" style="appearance:none;display:flex;align-items:center;width:100%;height:48px;padding:0 18px;background:var(--th-white);border:0.5px solid var(--color-border);border-radius:var(--th-radius-sm);color:var(--color-fg);font-family:var(--th-font-cn);font-size: 13px;font-weight:500;cursor:pointer;position:relative">
<span style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;color:var(--color-fg);font-size:18px"><i class="ri-stack-line"></i></span>
<span style="flex:1;text-align:center;padding-right:28px">使用&nbsp;InfOne&nbsp;继续</span>
</button>
<p style="margin:0;font-size:12px;color:var(--color-fg-muted);text-align:center;font-family:var(--th-font-cn)">点击上方按钮即视为同意<a href="#" style="color:var(--color-fg);text-decoration:none;margin:0 4px;border-bottom:0.5px solid var(--color-border)">服务条款</a>与<a href="#" style="color:var(--color-fg);text-decoration:none;margin:0 4px;border-bottom:0.5px solid var(--color-border)">隐私政策</a></p>
</div>
</main>
<footer style="position:relative;z-index:1;padding:24px;text-align:center;font-family:var(--th-font-ui);font-size:12px;color:var(--color-fg-muted)">TokenHub © 2026</footer>
</div>
</x-dc>
</body>
</html>
```
