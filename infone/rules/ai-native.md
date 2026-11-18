# AI 原生形态

涉及模型输出、Agent 运行、token 和成本时优先使用现有 AI 组件：

- StreamingText：流式输出；光标只在流式期间存在，结束即消失。
- ThinkingBlock：推理过程折叠；进行中显示 shimmer 和计时，结束后收起。
- AgentTimeline：Agent 运行轨迹；每步标注类型与耗时，只有运行中步骤显示 spinner，原始报文放入 inset 面板。
- TokenMeter：输入、输出、推理和缓存 token 的构成。
- CostBreakdown：成本构成；合计模块使用轻量摘要表面 `--color-surface-quiet`；数据表中的合计行仍使用 `--color-table-total`。
- ModelCompare：模型能力矩阵；推荐列使用 quiet 表面，不使用品牌色填整列。

统一约束：

- 等待和流式是唯一允许常驻动画的场景；结束后必须停止 shimmer、spinner 和 caret。
- token 数、耗时、金额和百分比使用 UI 字体栈 + `.th-nums`，不得使用 mono。
- 原始报文、代码、URL、密钥和模型 ID 才使用 IBM Plex Mono。
- AI 输出区可以使用 `--color-surface-quiet`，但它是静态表面，不带交互描边。
- 不把四类 token 或成本拆成四张单数字卡；优先使用构成组件。
- 模型和供应商身份使用 LogoLockup 或已收录的 vendor token，不直接写官方 hex。
