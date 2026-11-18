# 数据图形

页面精致感来自清晰的数据表达，不来自装饰插画。先回答业务问题，再选择组件。

## 专用组件

- Sparkline：表格、卡角和指标条中的趋势。
- RingGauge：单一比率、配额、完成度和评分。
- Heatgrid：按天或小时分桶的活跃度。
- TrendDelta：行内涨跌；成本、延迟和错误率使用 inverse。
- Progress：单条进度。
- TokenMeter：token 或其他总量的构成。
- CostBreakdown：成本构成。
- DataTable heat 列：快速识别用量或强度。

已有专用组件时不使用 Chart 重新实现。

## Chart 选型

带坐标轴或分片的通用图形使用 Chart：

| 问题 | type |
| --- | --- |
| 连续时间趋势 | line、spline、step |
| 时间总量和构成 | area、stackedArea |
| 离散分类比较 | bar、groupedBar、stackedBar |
| 分类名长或项目多 | hbar、stackedHbar |
| 一个量和一个率 | combo + 右轴 |
| 占比不超过 6 项 | pie、donut |
| 两个数值的相关性 | scatter、bubble |
| 3–8 维能力比较 | radar |
| 逐级流失 | funnel |
| 从起点到终点的增减 | waterfall |
| 分布和长尾 | boxplot |
| 多层级占比 | treemap |

规则：

- 系列按顺序使用 `--th-chart-1…12`。
- 网格和空轨使用 `--color-data-track`。
- 坐标和图例可以使用 11px muted 文本。
- 数字使用 UI 字体栈和 `.th-nums`。
- 不自绘 SVG，不引入其他图表库。
- 不使用 3D、阴影和渐变填充；柱子圆角不超过 2px。
- 饼图超过 6 片改用 hbar 或 treemap。
- 双 Y 轴只用于一个量和一个率且量级差至少 10 倍。
- 系列超过 6 个时只强调重点系列，其余使用数据墨色。
- 除 waterfall 的增减外，图表不借用状态色。

Chart 不是卡片，宽度充满容器；需要标题和工具栏时由外层 SectionCard 提供边界。

## DataTable

- 文本、标签和状态左对齐；数字、金额、百分比和时间戳右对齐；操作列居中。
- 混合指标列按数值列对齐，表头和内容方向一致。
- 数值和状态列可以固定 84–92px，名称列使用剩余空间。
- 有强度语义的列可以设置 heat；没有强度语义时不为了颜色启用。

层级数据使用 DataTable 的 `variant="tree"`：

- treeColumn 负责缩进和展开/折叠。
- 默认缩进步长 16px，可通过 indentStep 调整。
- 层级只使用缩进，不画连接线、不按级铺底色、不塞头像。
- 状态仍使用 StatusChip，操作仍使用 Button + Dropdown。
- 不为树表创建第二个组件。

## 预览区和占位区

- Skeleton 只用于真实加载过程。
- 内容就绪后必须展示可读摘要：对象名、状态、分类和关键数值。
- 没有真实缩略图时使用 inset 清单，不使用几条灰色骸架占满最大区域。
- 预览头部显示对象身份和版本，避免用户不知道当前查看对象。
- 空状态使用 EmptyState 的抽象图形，不用放大图标或手绘具象插画。
