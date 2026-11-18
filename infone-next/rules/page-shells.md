# 页面骨架

D、D+、B、C 先按会话和任务结构判断，再搭壳。D 与 D+ 是产品级决定，不按单个页面切换。

## 判断顺序

1. 没有会话：C。
2. 已登录，但当前页是单任务终点且只有一个正确后续动作：B。
3. 常驻页需要两个以上并列一级域、项目或环境切换，或需要跨页恒在的域级入口：D+。
4. 整组常驻页都不需要上述结构：D。

需求说不清导航层级时先询问；临时评估按 D+ 检查，不默认通栏顶栏，也不逐页回落 D。

| 档位 | 结构 | 适用 |
| --- | --- | --- |
| D | NavRail 240px + 12px 画布，无 TopNav | 结构简单且整组不需要域级顶栏的常驻后台 |
| D+ | NavRail + 内容列顶部 48px inline TopNav + 12px 画布 | 一级域、项目、环境切换或跨页恒在入口 |
| B | full TopNav + 居中内容，max-width 640px | 结果页、支付完成、引导终点、已登录错误页 |
| C | 无导航，仅 logo 和主体 | 登录、注册、找回密码、未登录错误页 |

A 和 Sidebar 已移除。存量 A 迁到 D；确需一级域切换时迁到 D+。

## 通用契约

1. 先定档、再搭壳、后填内容。组件填充阶段不得改变档位。
2. D / D+ 在产品级统一；列表、详情、设置、分析、表单和空状态不能各自选档。
3. 导航和画布同层，使用 `--color-surface-nav`；只有内容卡片是白色。
4. 导航无圆角、无阴影，只以 0.5px 分隔线连接画布。
5. 导航项间距为 0，分组通过通栏分隔线而不是大 gap 分开。
6. 页面标题可在 PageHeader 或已有 TopNav 的 `pageTitle` 中展示，二者不重复。顶栏标题为 15px（`--th-text-md`）、600 字重、1.3 行高的紧凑单行样式，使用 UI 字体与 `--color-fg`，不增加标题带或改变顶栏 48px 高度。
7. 账户和通知只出现一次：D / D+ 位于 NavRail 底部，B 位于 full TopNav。
8. TopNav 与 NavRail 的 logo / 品牌名称整行必须等高，统一使用 `--th-space-12`（48px），包含底部分隔线（border-box），不随密度或导航收起而改变。D+ 两者顶部齐平、内容垂直居中、底部分隔线对齐；内容区 padding 从顶栏下方开始，不能给 TopNav 的外层增加顶部偏移。

## D

- NavRail 240px，收起后 64px；贴视口左侧，全高。
- 品牌区 48px；导航区 flex:1 并独立滚动；账户区固定在底部。
- active 位置态使用中性 `--color-nav-selected`、`--color-fg` 和 500 字重。
- 内容区使用 `flex:1; min-width:0; padding:12px`。
- PageHeader 必须使用 `variant="page"`，标题带 56px，compact 为 44px。
- 不允许 TopNav、重复账户横条或面包屑。

NavRail 二级选项通过 children 表示，最多两级；子项使用缩进和圆点，不再增加第三层。收起模式必须保留可见的恢复入口。

## D+

- NavRail 与 D 完全一致。
- TopNav 只位于导轨右侧的内容列顶部，不跨过 NavRail。
- 使用 `variant="inline"`，高 48px，无 logo、账户、圆角和阴影。
- context 最多 1 个项目、环境或租户切换器。
- tab 可以为空；actions 最多 3 个控件，最多 1 个实心域级动作。
- 标题在内容区时，PageHeader 使用默认 inline；标题进入 TopNav 时省略重复 PageHeader，元信息和页内操作转入内容工具栏。

TopNav 可承担：

1. 并列一级域、项目或环境切换。
2. 跨页恒在的域级功能入口。
3. 当前页面的紧凑标题，通过 `pageTitle` 传入；标题位于 context 和 tabs 之前，不作为导航项，不带选中指示条。

本页搜索、本页筛选、时间范围、导出、刷新和页面主按钮属于 PageHeader 或内容工具栏，不进入 TopNav。允许标题进入顶栏不改变这些控件的职责，也不改变产品级 D / D+ 定档。

域级入口必须同时满足：

- 在该域每一页都是同一入口。
- 不作用于当前页数据。
- 不需要成为页面视觉主操作。

## B

- 单独使用 `TopNav variant="full"`。
- TopNav 必须带 logo 和 wordmark。
- 内容居中，最大宽度 640px。
- 不显示 NavRail，不暗示用户可以在任务结束前跳去其他模块。
- 适合复制密钥、重试、返回列表等只有一个正确后续动作的场景。

## C

- 不显示 TopNav 和 NavRail。
- 使用当前蓝色 logo 资源 `assets/tokenhub-logo.svg`。
- 默认浅色。
- 登录、注册、找回密码和未登录错误页可以使用 16px padding、克制光斑、较大圆角和较重阴影，但不能使用跨画布渐变或堆叠多层装饰。
- 只有需求或宿主明确暗色时随 dark token 派生。

## PageHeader

- 标题在内容区时，D 使用 page；D+ 使用 inline。已有 TopNav 并使用 `pageTitle` 时不再渲染重复 PageHeader。
- 标题只有一行，meta 放数量和更新时间。
- 页面主操作 1 个，次操作不超过 2 个。
- 返回上一层使用 onBack。
- 不使用 description 和 Breadcrumb。
