# InfOne / TokenHub 使用与维护说明

## 适用范围

本设计系统只服务企业管理后台产品线，InfOne 是核心平台，TokenHub 是其中的子产品。官网、IDE 编辑区和独立端界面使用各自的设计体系；只有它们的团队配置、仓库接入、运行记录和用量等后台页面使用本系统。

## 读取顺序

1. 读取 `DESIGN.md`，确定适用范围、核心原则、生成流程和页面档位。
2. 读取 `tokens.css`，直接消费 token，不根据文档重新推测值。
3. 查询 `rules/index.json`，只加载任务命中的专题规则。
4. 查询 `recipes/index.json`；只有工具需要 CSS、token 或选择器清单时才读取 `components.manifest.json`。
5. 只读取匹配的 `recipes/components/` 或 `recipes/pages/`。
6. 需要人工视觉核对时打开 `preview/`。

页面任务至少加载 `rules/page-shells.md` 和 `rules/layout.md`；组件任务至少加载 `rules/foundations.md`。颜色、图表、AI 和换肤规则按 `rules/index.json` 命中。

## 模型上下文边界

- `DESIGN.md` 是核心契约，必须读取。
- `rules/` 按任务读取，未命中时不递归加载整个目录。
- `recipes/` 只加载命中的组件或页面。
- `preview/`、图片、artifact、字体和运行时文件不进入模型上下文。

## 生成与实现

1. 先按页面骨架规则定 D / D+ / B / C。
2. 再按语义建立组件映射。
3. 已有组件直接复用；能力不足先组合或增加向后兼容的可选能力。
4. 确认没有组件且无法组合时才自绘，并使用 token 和最近似组件的几何。
5. 静态 HTML 也使用 recipe 的 HTML 结构，不因技术栈不同而重画组件。
6. 交付时报告复用组件、自绘部分和自绘原因。

生产实现使用 recipe 中的模块化结构，不依赖 `window.TokenHubDesignSystem_019e20`、Babel 或 `preview/runtime/ds-bundle.js`。预览运行时只用于离线视觉验证。

## AI 放置页面标题

1. 先确定页面骨架。D / C 不为放置标题新增 TopNav；已有 TopNav 的 D+ / B 页面可用 `pageTitle` 展示紧凑页面标题。
2. 使用正式 `TopNav pageTitle="页面名称"`，不把标题伪装成导航项或在 context / children 中手写标题。组件统一使用 `--th-text-md`（15px）、600 字重与单行样式，保留 48px 顶栏。
3. 标题在内容区时继续使用 PageHeader；标题进入 TopNav 后省略重复 PageHeader，元信息、搜索、筛选、时间范围和页面操作放在内容工具栏。
4. 不要求迁移既有页面。TopNav 未传 `pageTitle` 时保持现有结构；详见 [页面骨架](rules/page-shells.md) 与 [TopNav recipe](recipes/components/TopNav.md)。
5. TopNav 与 NavRail 品牌行均使用 `--th-space-12`（48px，包含底部分隔线）。组合时两者顶部齐平，画布 padding 从顶栏下方开始；不单独覆盖任一组件高度，不缩放 logo 或标题来补偿对齐。

## AI 选用 Select

1. 先区分普通单选、单路径选择和跨分支筛选。普通单选保留原 Select；单路径用 Cascader；层级筛选用 `Select mode="auto"`。
2. 按完整 options 树的最大深度自动选型：1 级普通、2–3 级级联、≥4 级深层；根计第 1 级，不按过滤结果猜深度。
3. 层级模式统一使用可选叶节点 ID 数组。普通字符串页面不需要迁移；默认不传 mode 时保持原 API。
4. 启用的层级搜索直接复用 SearchBox；普通选择的搜索仍默认关闭。所有尺寸、标签、清除和导航行为见 [Select recipe](recipes/components/Select.md)。
5. 数据树必须完整。异步场景需明确完整层级深度，并由数据适配层实现全子树选择；现组件不提供未加载子树的选择后端。
6. 使用正式 Select，不复制独立试用页中的 FilterSelect / ComplexFilter。搜索、勾选、标签、滚动条和内部动作已在组件中组合。

## 权威关系

- 核心原则和生成流程：`DESIGN.md`。
- 专题设计规则：`rules/*.md`。
- token 实际值：`tokens.css`。
- 组件 API：`recipes/components/` 的组件声明。
- 组件和页面定位：`recipes/index.json`；CSS、token 与选择器机器清单：`components.manifest.json`。
- 渲染参考：`preview/`，不具备规范权威。

出现不一致时，先判断属于哪个层级，不允许派生索引或预览反向覆盖规则。

## 维护规则

1. 设计原则变更：修改 `DESIGN.md` 或对应专题规则，再同步 token、recipe、预览和派生索引。
2. token 保持三层：品牌层 `--brand-50…700`、语义层、共享层。产品只覆盖品牌层。
3. 组件变更必须向后兼容；弃用参数保留并标记 deprecated。
4. 预览显示尺寸、颜色或字号时从 token 或 DOM 反读，不维护第二份硬编码规格。
5. `components.manifest.json`、`components.html` 内嵌目录和 `recipes/index.json` 属于派生目录，不独立定义设计规则。
6. recipe 是组件实现和示例的源；修改后运行 `node infone/scripts/sync-recipes.mjs --write` 同步组件预览、页面预览、派生目录与运行 bundle，再运行 `node infone/scripts/validate-docs.mjs`。不要从 preview 反向覆盖 recipe。
7. `preview/page-patterns/*/index.html` 只保留页面模板、页面逻辑和分页导航；统一加载 `preview/page-runtime/support.js`，并在 `<helmet>` 中各声明一次 `fonts/fonts.css`、`tokens.css` 与 `preview/runtime/ds-bundle.js`。不得重新内联 React、ReactDOM、bundle 或页面运行时。
8. 组件目录的特殊展示高度由 HTML recipe 的 `@dsCard catalogHeight` 声明，同步脚本更新对应 iframe；不直接改派生目录高度。
9. `recipes/pages/*.md` 中的 `./support.js` 与 `./ds-base.js` 是消费端短路径，对应 `preview/page-runtime/` 下的共享文件，不是页面私有副本。

## 保护区

未经明确批准不得：

- 改名或删除共享层 token。
- 破坏性改名、删参或改变既有组件语义。
- 恢复 Sidebar 或 Breadcrumb。
- 加载中文 webfont、放置中文字体文件或替换系统字体栈。
- 把 preview、artifact、历史副本或派生索引提升为规范来源。
- 把截图、编辑器 artifact、一次性比较页面或可由 recipe 重建的独立预览 JSX 提交为正式入口。

## 已知限制

- 校验器可能报告 PingFang SC 缺少字体文件。这是系统字体策略，不上传中文字体，也不为消除提示修改字体栈。
- UI 字形随 Apple、Windows、Android 的系统字体不同而存在差异，这是零下载和零授权风险的既定取舍。
- 预览 bundle 会立即求值组件模块。预览模块顶层不得访问 React context、memo 或 forwardRef；需要时在组件执行后惰性创建。预览失败先查看 `window.TokenHubDesignSystem_019e20.__errors`。

## 同步清单

- `components.html` 的内嵌 token 与 `tokens.css` 一致。
- `components.manifest.json` 与当前组件目录一致。
- `recipes/index.json` 与组件、页面模式和控制台说明一致。
- `manifest.json`、`rules/index.json` 中的路径全部存在。
- recipe、preview 和组件 API 没有重复入口或过期路径。
- 每个页面模式只加载一份 support、字体样式、token 和组件 bundle，且没有公共运行时内联副本。

## 本地试用入口

仓库根目录 `index.html` 是 Open Design 的本地试用入口，由 Git 忽略，不作为规范源提交。正式 Select 实现和示例都维护在 `recipes/components/Select.md`；`components.html` 及 `preview/component-cards/Select/select.html` 由同步脚本生成。试用入口直接调用当前设计系统运行 bundle，不再维护组件副本。
