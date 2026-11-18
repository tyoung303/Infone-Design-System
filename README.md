# Design Specifications

设计规范集中托管仓库。每套设计规范使用独立的顶层目录，目录名即稳定的设计系统 ID。

## 设计规范

- [`infone/`](infone/)：InfOne 企业管理后台设计规范。
- [`infone-next/`](infone-next/)：基于 InfOne 的独立本地草稿；[修改指南](infone-next/FORK.md)。尚未配置远端发布。

仓库中的 `infone/` 只托管可直接消费的设计规范，不包含原始采集源文件或扫描证据。
仓库根目录的 Harness 与 `infone/scripts/` 只负责维护、派生同步和工程卫生检查，不属于设计规范的模型上下文。

该副本独立托管于 [GitHub](https://github.com/tyoung303/Infone-Design-System)，
不再关联原 GitLab 仓库。团队成员可以通过 Pull Request 审核规范更新。
当前未配置 GitHub 自动发布流水线。

## 维护与校验

设计师可以直接用自然语言描述修改目标；Agent 负责把意图落到正确的规则、token 或 recipe，
再自动同步预览和运行时文件。开始修改前请先阅读根目录 `AGENTS.md`。

```bash
npm run setup:hooks    # 每个 clone 初始化一次；npm prepare 也会自动安装
npm run verify:agent   # Agent 日常修改：自动同步并校验工作区
npm run verify:commit  # 提交前：校验 staged 变更和派生文件
npm run verify:ci      # CI：全量校验
npm run verify:repository:ci # 完整工程门禁与报告
npm run test:harness   # 验证 Harness 本身
```

仓库使用版本化的 `.githooks/pre-commit`。启用后，每次 `git commit` 都会在 Git index
临时快照中运行 Harness 自测和 `verify:commit`；任一检查失败都会阻止 commit。Git 自带的
`--no-verify` 可以绕过本地 hook，因此后续配置 GitHub Actions 时，
应将 `npm run verify:repository:ci` 设为合并前必须通过的检查，并上传完整报告。

禁止独立维护组件卡片、页面模式预览和 `preview/runtime/ds-bundle.js`。修改预览效果时，
应回到对应的 `recipes/components/*.md` 或 `recipes/pages/*.md`，再由同步脚本重建派生内容。

仓库检查负责生成文件边界、新文件白名单，以及截图、日志、备份和临时产物排除。
Open Design 与 AI 对话生成的 `.od-frames/`、`.od-skills/`、`od-design-system/`
和 `*.artifact.json` 只保留在本地，不进入 Git。
工程门禁不启动浏览器、不渲染预览，也不判断颜色、间距、文案、组件行为或视觉质量。

## 多设计规范扩展

根 Harness 通过 `harness/contract.json` 注册设计规范包，目前注册 `infone` 与 `infone-next`。新增规范时，
在 contract 中声明包根目录、关键设计原则文件、使用说明、canonical/derived 路径和维护脚本即可；
共享 Harness 不应写死具体包名。关键设计原则文件是必需且不能为空，但其设计内容仍由人工评审负责。
