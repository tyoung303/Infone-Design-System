# InfOne Next 分支与修改指南

## 当前状态

- 本包是 `infone/` 当前本地文件的独立副本，稳定 ID 为 `infone-next`，显示名暂为 InfOne Next。
- 复制时仓库 HEAD：`be5d89750b8943d896a265a0cf6278b0fd7eccaf`。复制以本地文件为准，未仅从 Git 历史导出。
- 包含全部规则、token、组件与页面 recipe、目录、字体及许可、图片、预览运行时和维护脚本；操作系统元数据、编辑器会话与临时产物不属于规范。
- 两个目录不使用软链接或共享可写文件，也不自动相互同步。新调整只写本目录。
- 初始视觉、组件 API、示例产品名称与 Logo 保留 InfOne / TokenHub。名称是草稿名，并未完成新品牌设计。
- 已继承 Select 三种模式、Segmented 背景、TopNav 15px 标题及与 NavRail 品牌行共用 48px 高度。TopNav 自由组合搜索、筛选与操作仍是尚未落地的建议，未在复制时擅自加入。

## 从哪里开始改

| 修改目标 | 权威文件 |
| --- | --- |
| 新名称、说明、Logo 入口 | `manifest.json`、`brand.json`；素材放 `assets/` |
| 定位、产品范围、核心原则、AI 生成流程 | `DESIGN.md`、`USAGE.md` |
| 颜色、字体、间距、圆角、主题 | `tokens.css`，同步 `brand.json` 和相应 `rules/` |
| 页面骨架、布局、导航职责 | `rules/page-shells.md`、`rules/layout.md` |
| 组件 API、样式、交互、示例 | `recipes/components/*.md` |
| 页面模板与完整流程 | `recipes/pages/*.md` |
| AI 检索、组件选型与规则路由 | `recipes/index.json`、`rules/index.json` |

建议依次确定新规范的定位与品牌，再调整 token 与专题规则，接着修改组件和页面模式，最后同步派生预览。初始阶段保留组件名、CSS token 名和文件结构，便于比较差异。

这是设计系统分支：修改共享 token 的值属于新规范源的维护，不等于允许业务页面自行覆盖共享 token。若要改变原有禁止条款，应同时修订原则、专题规则、组件说明和目录中的生成规则。

## 生成与工程检查

在仓库根目录执行：

```sh
npm run sync:next         # 仅重新生成本副本的 recipe 派生文件
npm run check:sync:next   # 检查本副本派生文件是否与源一致
npm run verify:agent     # 同步并检查已注册的两套设计系统
```

若单独复制此文件夹到其他位置，在本包根目录使用：

```sh
node scripts/sync-recipes.mjs --write
node scripts/validate-docs.mjs
```

上述脚本需要 Node.js 20 或以上。仓库 Harness 位于上级目录，独立拷出本包时不会随包携带。

修改组件时以 recipe 为源，不直接修改生成的组件卡片、页面预览或 `preview/runtime/ds-bundle.js`。基础预览和包身份说明也应随对应规范变更同步。工程检查只检查文件归属和源码/目录一致性，不代表视觉或交互验收。

## 预览与使用

- 组件入口：[components.html](components.html)。
- 分类预览：[preview/components.html](preview/components.html)；页面模式：[preview/pages.html](preview/pages.html)。
- 将整个 `infone-next/` 目录作为新的本地设计系统导入，入口清单为 `manifest.json`。在目标项目中选择新系统；外部工具的已导入快照需重新导入或刷新，修改本地文件不会自动更新旧快照。
- `infone-next` 与 `infone` 的包 ID 已分开。样例运行时命名空间和 CSS token 前缀暂保持兼容；两套预览各自在独立页面使用，不能在同一个页面同时加载两套 runtime/token。
- 仓库现有发布流水线只发布 `infone/`，本副本未配置远端发布，也未执行上传或提交。

## 后续给 AI 的修改指令示例

> 本次只修改 infone-next，保留 infone 原版。以 infone-next/DESIGN.md 为原则，以 recipes 为组件源，把 TopNav 改为可组合顶部工作栏：允许标题、Tab、搜索、筛选和操作；保留 48px 高度及 15px 标题。同步规则、组件、AI 目录和预览，并运行 npm run verify:agent。
