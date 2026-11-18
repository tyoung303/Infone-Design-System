# InfOne Next Design System

> 独立草稿：由当前 InfOne 本地规范完整复制。下列产品范围、组件和视觉规则为继承基线；后续修改只作用于本目录。分支维护和调整步骤见 [FORK.md](FORK.md)。

## 1. 适用范围

本系统服务词元无限的企业管理后台产品线，以 InfOne 为核心平台。InfOne 平台包含 TokenHub 等子产品；具体项目可以替换产品名称、品牌色阶和 logo，但共享同一套组件、页面骨架与交互规则。

| 场景 | 是否使用 | 边界 |
| --- | --- | --- |
| 企业管理后台 | 是 | 浏览器登录后的 SaaS 管理界面，包括 InfOne、TokenHub 及其他产品的后台侧 |
| 官网 | 否 | 营销页、产品介绍、定价与公开内容使用官网设计体系 |
| IDE / 独立端 | 部分 | 编辑区、面板与对话跟随宿主主题；团队配置、仓库接入、运行记录、用量等后台页面使用本系统 |

## 2. 权威来源与读取顺序

设计判断以本文件和 `rules/` 中的专题规则为准；两者分工而不是互相复制：

1. 必读本文件，确定适用范围、页面骨架、核心原则和生成流程。
2. 读取 `tokens.css`，直接消费现有 token，不从文档重新推测取值。
3. 根据 `rules/index.json` 加载任务命中的专题规则。
4. 查询 `recipes/index.json`，只读取命中的组件或页面 recipe；只有工具需要 CSS、token 或选择器清单时才读取 `components.manifest.json`。
5. `preview/` 只用于人工渲染核对，不进入模型上下文，也不反向定义规范。

组件 props、默认值和状态以对应 `recipes/components/` 的“组件声明”为准；设计原则以本文件和专题规则为准；token 实际值以 `tokens.css` 为准。

## 3. 核心原则

所有页面必须满足以下规则。需求与规则冲突时应明确指出，不得静默偏离。

1. **品牌蓝只给交互和进度。**主按钮、链接、开关、勾选、输入焦点、Tab 指示条、进度和 Steps 使用品牌色。NavRail、Tree、Cascader、Pager 等位置态使用中性 `--color-nav-selected`，不得使用品牌 tint。图表、分类和状态使用各自语义色。
2. **黑白灰建立层级。**画布和导航使用 `--color-bg` / `--color-surface-nav`，内容卡片使用白色表面。灰阶保持纯中性，不自行加入冷暖色相。
3. **只经 token 取值。**颜色、字体、间距、圆角、描边、阴影和动效都从现有 token 取得，不写裸 hex 新色，不为单页新造 token。
4. **组件优先。**页面骨架、导航、标题、按钮、输入、标签、状态、表格、图表和浮层必须先查具名组件。使用 token 手绘近似组件仍属于重画。
5. **字体各司其职。**UI 文本使用系统字体栈；Sora 700 只用于品牌 wordmark；IBM Plex Mono 只用于代码、URL、密钥和模型 ID。金额、次数、token 数、耗时、时间戳和百分比使用 UI 字体栈加 `.th-nums`，不得使用 mono 字体。
6. **密度不靠缩字。**comfortable 用于概览、表单和详情；compact 用于列表、日志和对比。compact 只收紧行高与间距，不把常规文本压到 11px。
7. **信息色按语义使用。**只有页面真实存在状态、分类、强度、构成或数据图形语义时才要求上色，不为满足配额添加装饰。每屏先确定一个扫读主键，避免同时强调所有字段。
8. **对比度满足 WCAG AA。**正文文字对比度不低于 4.5:1。主按钮使用 `--color-cta`（默认 `--brand-600`）和白色标签；`brand-500` 不作为白字按钮填充。
9. **动效只服务状态变化。**内容入场、列表入场、浮层入场、按压、卡片浮起和等待/流式可以使用规定工具类；等待结束后动画必须停止，并支持 `prefers-reduced-motion`。
10. **默认浅色。**没有明确需求或宿主主题时使用浅色；暗色只通过 `data-theme="dark"` 派生，不手写第二套样式。
11. **文案克制。**简体中文、省略主语、陈述句；CTA 使用 2–4 字动宾结构；不使用 emoji 和感叹号。

详细的字体、密度、卡片、图标、控件和动效规则见 [基础规则](rules/foundations.md)，颜色规则见 [颜色规则](rules/color.md)。

## 4. 生成流程

页面按四个阶段推进，顺序不可颠倒。

### 4.1 判断页面骨架

先依据 [页面骨架](rules/page-shells.md) 确定 D、D+、B 或 C 档：

- 已登录常驻页在产品级统一选择 D 或 D+。
- 需要并列一级域、项目、环境切换，或跨页恒在的域级入口时使用 D+。
- 整组页面都不需要顶栏时使用 D。
- 单任务终点使用 B；无会话页面使用 C。
- 无法判断导航层级时先询问；临时评估按 D+ 检查，不逐页随意切档。

骨架确定后先搭 NavRail、TopNav、PageHeader、画布和表面层级，再进入组件填充。

### 4.2 建立组件映射

按界面语义查询组件，而不是按外观或 CSS 类名查询：

- 框架：NavRail、TopNav、PageHeader、SectionCard。
- 筛选与输入：VendorFilter、SearchBox、Select、Cascader、DateRangePicker、TextField、InputNumber、Textarea。
- 动作与标记：Button、Tag、StatusChip、Badge、Switch、Checkbox。
- 数据与结构：DataTable、Pager、MetricStrip、Chart、Sparkline、RingGauge、Heatgrid。
- 浮层与反馈：Modal、Drawer、Tooltip、Toast、Banner、Popconfirm、EmptyState、Skeleton。

进入实现前记录：直接复用什么、组合实现什么、确认缺失什么。

### 4.3 复用、扩展或兜底

按以下优先级处理：

1. 已有组件：直接使用，保留默认结构、尺寸、状态、密度、响应式行为和交互。
2. 组件只差少量能力：先用现有 props、slots 或组合；仍不足时新增向后兼容的可选能力。
3. 确实没有组件且无法合理组合：才允许自绘。自绘必须使用 token，并参照最近似组件的高度、padding、字重、图标、描边和状态。

禁止引入外部 UI 库的默认视觉；禁止在页面里覆写组件内部样式以制造新变体；静态 HTML 也必须使用 recipe 中的 HTML 结构。

### 4.4 交付报告

页面交付时报告：

1. 实际复用的具名组件。
2. 自绘部分。
3. 每个自绘部分查过哪些组件、缺少什么能力、参照哪个组件，以及是否应把能力升级回设计系统。

出现与已有组件同职责的裸结构时，缺少上述记录即判违规。

## 5. 页面与组件的关键契约

### 5.1 页面骨架

- D：NavRail 240px，全高，无 TopNav；PageHeader 使用 `variant="page"`。
- D+：NavRail + 内容列顶部 48px `TopNav variant="inline"`；页面标题可使用 TopNav 的 `pageTitle`，或在内容区使用默认 inline PageHeader。
- TopNav 与 NavRail 品牌行共用 `--th-space-12`（48px，含底部分隔线），D+ 组合中顶部齐平、内容垂直居中、底边对齐，不随密度或收起状态变化。
- B：单独的 `TopNav variant="full"` + 居中内容，适合结果页和向导终点。
- C：无导航，仅 logo 和主体内容，适合登录、注册、找回密码及未登录错误页。
- A 和 Sidebar 已移除；左导航只有 NavRail。

D 与 D+ 是产品级决定，不得按单个页面混用。已有 TopNav 的页面允许通过 `pageTitle` 承载页面标题，使用 15px（`--th-text-md`）、600 字重的紧凑单行样式，不在内容区重复标题。时间范围和页面主操作仍属于 PageHeader 或内容工具栏。详细判断和尺寸见 [页面骨架](rules/page-shells.md)。

### 5.2 PageHeader 与 SectionCard

- 标准页面的内容区标题使用 PageHeader；D 档使用高标题带，D+ 使用 inline。标题已进入 TopNav 时省略重复 PageHeader，元信息、筛选和操作放在内容工具栏。
- PageHeader 只有主标题；数量、更新时间等事实进入同行 meta，不写副标题说明，不使用面包屑。
- 页面主操作最多 1 个，次操作最多 2 个。
- 卡片标题和卡内小节标题使用 SectionCard；卡内分组传 embedded，不手写漂移的标题行。

### 5.3 密度与尺寸

- 画布 padding 和卡片间距为 12px。
- 常驻后台卡片 padding 为 12px；16px 只用于登录、注册、找回密码、错误页等特殊视觉页面和明确需要松弛阅读的单任务终点页。
- 区块节奏只使用 8、12、16；字号只使用 11、12、13、15、18、24、32、48。
- 11px 只用于表格次行、图表坐标和图例等密集次级信息。
- 卡片与常规控件圆角 6px，标签与导航项 4px，浮层 8px；特殊 C 档品牌卡可例外，但必须注明。

### 5.4 Steps

Steps 表达流程进度，不是导航位置态：

- 已完成：brand-50 背景 + brand-600 勾。
- 当前：brand-600 实心 + 白字。
- 未开始：中性灰。
- 连接线：brand-400。

不得用 success 色替代已完成步骤，也不得把步骤改成四张可选卡片。

### 5.5 卡片边界

DataTable、MetricStrip、ModelCompare 和 AccountCard 自带卡片边界。它们要么直接放置，要么由外卡提供标题和工具栏并传 embedded；一个边界只画一次。

卡片外框统一使用 `var(--th-border-card)` 和 `var(--th-radius-md)`。卡内分区使用中性底色或分隔线，不嵌套第二层描边圆角盒子。

### 5.6 Select 层级筛选

- AI 创建层级筛选时使用 `Select mode="auto"`：完整数据树 1 级使用普通选择，2–3 级使用级联多选，≥4 级使用最多两列的逐级导航；搜索和当前展开路径不改变模式。
- 未传 mode 的既有 Select 保留普通单选与字符串值契约；auto / cascade / drilldown 使用叶节点 ID 数组。
- 选择与浏览分离；父级仅在所有可选后代选满时勾选，部分选择为空框加数量。默认“全部”是空值展示，不是菜单项。
- 所有模式保留 28 / 32px；点击触发器无持续激活边框或光圈，键盘焦点仍可见。搜索命中只改变品牌色文字。
- 需要一条完整路径时使用 Cascader；需要跨分支多选时使用 Select。浮层内部路径定位属于筛选导航，不恢复页面 Breadcrumb 组件。

完整 API、间距和行为以 [Select](recipes/components/Select.md) 为准。

## 6. 按任务加载专题规则

| 任务 | 必须加载 |
| --- | --- |
| 任意页面或组件 | [基础规则](rules/foundations.md) |
| 页面、控制台、导航 | [页面骨架](rules/page-shells.md) + [响应式布局](rules/layout.md) |
| 颜色、状态、分类、主题视觉 | [颜色规则](rules/color.md) |
| 图表、分析、数据表、预览区 | [数据图形](rules/data-visualization.md) |
| Agent、模型输出、token、成本 | [AI 原生形态](rules/ai-native.md) |
| 品牌替换、暗色、多产品 | [换肤规则](rules/theming.md) |

机器检索以 `rules/index.json` 为入口。未命中专题规则时不得递归加载整个 `rules/`。

## 7. 完成前检查

### 结构

- [ ] 已先确定 D / D+ / B / C，且同一产品的常驻页档位一致。
- [ ] 页面标题使用 PageHeader 或 TopNav `pageTitle`；顶栏标题为 15px 紧凑样式且不重复；卡片和卡内小节标题使用 SectionCard；没有面包屑。
- [ ] NavRail、TopNav、PageHeader 的职责没有交叉，账户和通知没有重复出现。
- [ ] 主内容区使用 `flex:1; min-width:0`，窄宽两态均无溢出。

### 组件

- [ ] 每个元素已完成语义查询和组件映射。
- [ ] 已有组件没有被 token + 裸结构重画。
- [ ] 自绘部分有完整说明，并参照最近似组件。
- [ ] 自带边界的组件没有双描边、双圆角。

### 视觉与内容

- [ ] 无裸 hex 新色；主按钮使用 `--color-cta`；导航位置态无品牌色。
- [ ] 数字使用 UI 字体栈 + `.th-nums`，没有使用 mono。
- [ ] 字号、间距、圆角、图标和动效符合专题规则。
- [ ] 只在存在语义时使用状态、分类、强度和数据图形；视觉预算未超。
- [ ] 文案简洁，没有 emoji、感叹号、无意义问候和重复说明。

### 可访问性与运行

- [ ] 正文对比度满足 WCAG AA，交互有 hover、focus-visible、active 和 disabled 状态。
- [ ] 固定高度控件标签不换行，窄容器中不被压扁。
- [ ] 等待以外没有常驻动画，reduced motion 生效。
- [ ] 预览运行时 `window.TokenHubDesignSystem_019e20.__errors` 为空。

## 8. 维护边界

- 设计原则变更：先改本文件或对应专题规则，再同步 token、recipe、预览和派生索引。
- 组件变更：保持既有 API 向后兼容，再同步 recipe、预览和索引。
- 不把 preview、历史页面副本、派生索引或 artifact 当作规范来源。
- 不恢复 Sidebar 或 Breadcrumb，不加载中文 webfont，不让产品覆盖共享层 token。
