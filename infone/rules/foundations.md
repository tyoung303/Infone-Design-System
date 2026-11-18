# 基础规则

本文件定义字体、密度、间距、卡片、标题、控件、图标和动效。页面骨架、颜色、数据图形和换肤分别由其他专题规则定义。

## 字体与数字

- UI 文本使用 `--th-font-cn` / `--th-font-ui` 系统字体栈。
- Sora 700 只用于品牌 wordmark，不用于页面标题、卡片标题、正文、表单标签或数字。
- IBM Plex Mono 只用于代码、URL、密钥和模型 ID。
- 金额、次数、token 数、耗时、时间戳和百分比使用 UI 字体栈并添加 `.th-nums`。
- 数字不得使用 `--th-font-mono`。

字号只使用 11、12、13、15、18、24、32、48：

| 字号 | 用途 |
| --- | --- |
| 11 | 表格次行、数值次级行、图表坐标和图例等密集次级信息 |
| 12 | 导航、标签、说明和辅助信息 |
| 13 | 正文、表单标签、卡片标题 |
| 15 | TopNav 紧凑页面标题、小节标题和强调正文 |
| 18 | PageHeader 默认页面标题、MetricStrip 默认数值 |
| 24 | 重要数据大字 |
| 32 / 48 | 仅营销体系的大标题，不用于常驻后台 |

compact 只收紧几何，不把普通文本、标签和说明缩到 11px。

## 密度

comfortable 是概览、表单和详情页默认值；compact 用于列表、日志和对比场景。

| token / 规则 | comfortable | compact |
| --- | --- | --- |
| `--th-row-h` | 36px | 32px |
| `--th-row-pad-y` | 8px | 6px |
| 表格和筛选控件 | 28px，size=sm | 28px，size=sm |
| 表单和详情控件 | 32px，size=md | 32px，size=md |
| 卡内 padding | 12px | 12px |
| 字段间距 | 12px | 8px |
| 卡片间距 | 12px | 8px |

Select、Cascader、Dropdown、TextField、SearchBox、InputNumber、DateRangePicker、CopyField 和 VendorFilter 显式使用 28 / 32px 两档，不消费可能被 compact 重声明的 `--th-ctl-h*`。

常驻后台、列表、详情、设置和分析页的卡内 padding 恒为 12px。登录、注册、找回密码、错误页和明确需要松弛阅读的单任务终点页可以使用 16px，并允许克制的光斑、更大圆角和更重阴影；不得把页面做成展示板。

画布层 padding 和 gap 为 12px。区块节奏只使用 8 / 12 / 16，不写 14 / 18 / 20 / 24 等临时值。正文 line-height 不超过 1.5。

## PageHeader 与 SectionCard

- 标准页面的内容区标题使用 PageHeader；已有 TopNav 时允许使用其 `pageTitle` 承载标题，不重复渲染 PageHeader。
- D 档使用 `variant="page"`，标题带 56px，compact 为 44px。
- D+ 使用默认 inline；TopNav 已提供顶部缓冲，不再叠加高标题带。
- TopNav 标题固定使用 `--th-text-md`（15px）、600 字重、1.3 行高、UI 字体和 `--color-fg`，单行紧凑展示，不套用 PageHeader 的 18px 默认标题或高标题带。标题进入顶栏后，元信息、页内筛选与操作保留在内容工具栏。
- PageHeader 只有主标题。数量、更新时间等事实进入同行 meta；警示使用 Banner；分区说明写在分区内。
- PageHeader 的 description 属于废弃能力，示例不得使用。
- 返回上一层使用 `onBack`，不使用 Breadcrumb。
- 页面主操作最多 1 个，次操作最多 2 个。

卡片标题使用 `SectionCard title`；卡内分组使用 `SectionCard embedded title`。同级模块标题必须由同一组件渲染，不手写标题行。

## 卡片和边界

- 卡片外框统一使用 `border:var(--th-border-card)` 和 `border-radius:var(--th-radius-md)`。
- `--color-border` 用于卡内线和控件描边，不用于卡片外框。
- 卡片静置态不使用阴影。下拉、popover 和 hover 使用 `--th-shadow-soft`；Modal 和 Drawer 使用 `--th-shadow-modal`。
- 卡内分区使用通栏 0.5px 分隔线，各区块自行承担 12px padding，不靠大 gap 拉开。
- 一张卡最多使用一种 inset 或 quiet 内嵌底色。

DataTable、MetricStrip、ModelCompare 和 AccountCard 自带卡片边界：

1. 无标题和工具栏时直接放置。
2. 需要外部标题、筛选或分页时由外卡提供边界，内部组件传 embedded。

一个边界只画一次，圆角只属于最外层。卡内不得再嵌套第二层描边圆角盒子。

## Select 筛选状态与几何

- Select 三种模式统一使用 28 / 32px 触发器与 12px 横向 padding。普通模式不变，级联和深层模式的内部动作不重复叠加按钮 padding。
- 点击或展开触发器不增加品牌色边框、光圈、灰底；保留独立的键盘 focus-visible。鼠标打开菜单不预激活首项。
- 多选触发器内 Tag 为 20px，固定单行并使用 +N 项收起溢出项；这是 Select 组合内的尺寸，不改变普通 Tag 默认值。
- 层级列表外围 4px，选项 padding 8px 10px、元素 gap 8px。标题与列表之间不叠加留白，标题到首行内容为 8px。
- 搜索仅将命中字符改为品牌色；位置态保持中性，勾选表达选择。详细模式区间和父子规则见 [Select](../recipes/components/Select.md)。

## Segmented 分段控制器

- sm / md 两档统一使用 `--color-surface-inset` 作为容器背景，与页面画布拉开层次。
- 选中滑块使用 `--color-surface`，选中与未选中文字分别使用 `--color-fg` 和 `--color-fg-muted`；不套用导航位置态的 `--color-nav-selected`。
- 页面及组合组件直接复用 [Segmented](../recipes/components/Segmented.md)，不覆盖为旧的 quiet 背景；尺寸、圆角和交互遵循组件 recipe。

## 控件标签

固定高度控件的标签不得换行：

- Button、Tabs、Segmented、Tag、StatusChip、Steps、Pager 和 Chip 使用 `white-space:nowrap`。
- Button 不写固定宽度，宽度由 padding 撑开；sm 为 28px 高和 12px 横向 padding，md 为 32px 高和 16px 横向 padding。
- 中文标签不超过 6 字，英文不超过 14 个字符；过长时精简文案或使用图标按钮 + Tooltip。
- 工具栏拥挤时允许横向溢出或降级为 link，不压扁按钮。
- 表格行内操作使用 link 或图标按钮，不在 36px 行中放两个实心按钮。
- Tag、StatusChip、Badge 等 span 类控件必须由组件自身设置 nowrap、flex-shrink:0 和 line-height:1，消费页不负责补丁。
- 确认是多行表面时才显式使用 normal，并在代码中说明原因。

## 图标

图标尺寸只使用 12、14、16、20：

| 尺寸 | 用途 |
| --- | --- |
| 12 | Tag 图标、关闭、Checkbox 勾、涨跌箭头和 NavRail 展开箭头 |
| 14 | 默认行内图标、28–32px 图标按钮、卡标题和状态提示 |
| 16 | 36–40px 图标底、LogoLockup 32–47 |
| 20 | B / C 结果页、EmptyState、Upload 和 LogoLockup 48 以上 |

热区由 28 / 32px 控件提供，不能靠放大图标撑热区。默认使用 Remix Icon line 变体；fill 只用于已选中、已完成和品牌/供应商标识。

伴随文本的图标使用 `--color-fg-muted`；可点击图标使用 `--color-fg`；状态图标使用对应语义色。不得直接写灰阶数字。

禁止用放大的图标充当插画。空状态使用 EmptyState 的 dots、arcs 或 grid 图形。

## 动效

只允许以下时机：

- 内容入场 `.th-in`。
- 列表入场 `.th-stagger`，每项 28ms。
- 浮层入场 `.th-in-overlay`。
- 按压 `.th-press`。
- 卡片浮起 `.th-lift`。
- 等待和流式 `.th-shimmer`、`.th-spin`、`.th-caret`。

常规时长只使用 150、200、280ms。数字 count-up 560ms 是唯一超过 280ms 的非等待动效，只运行一次。无弹簧、视差和滚动驱动；等待结束后循环动画必须停止。

## 文案

- 简体中文、省略主语、陈述句。
- CTA 使用 2–4 字动宾结构。
- 品牌默认展示为 InfOne，具体项目可以替换。
- 不使用 emoji、感叹号、无意义问候和重复副标题。
- 阿拉伯数字和人民币使用统一格式，表格数字加 `.th-nums`。
