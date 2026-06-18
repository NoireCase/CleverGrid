# memory-clevergrid-v0.8.0

## Project State

CleverGrid 当前版本是 **v0.8.0 - Author Studio MVP**，发布日期为 **2026-06-18**。

当前阶段是从“可玩的静态逻辑推理游戏”推进到“可维护的案件创作工具链”。项目不再只是玩家端页面，而是同时服务玩家和创作者：玩家通过 `index.html` 游玩案件，创作者通过 Tools Hub、Author Studio、Uploader、Validator 和 Library 生成、检查并管理案件。

核心目标是保持轻量、可发布、可维护：使用原生 HTML/CSS/JavaScript，优先支持 GitHub Pages，不引入后端和复杂构建系统。案件数据应以 JSON 为主要事实来源，创作、校验、发布都围绕 JSON 流程展开。

## Architecture

当前正式案件入口是 `case-index.json`。它记录案件顺序、标题、难度和文件路径，并指向 `cases/case-xxx.json`。玩家端加载 `case-index.json` 后，再读取对应的正式案件 JSON。

`cases/*.json` 是当前正式案件数据格式。旧的 `cases/*.js` 和 `cases/manifest.js` 仍可能存在于仓库中，但不应再作为新架构或新功能设计依据。

Tools Hub 位于 `tools/index.html`，负责统一入口和工具导航，不直接承担案件数据处理。

Author Studio 位于 `tools/author-studio.html`，是 v0.8.0 已完成的 MVP，负责让创作者填写基础信息、对象、答案、线索和结构化规则，并导出 Draft JSON。

Validator 当前负责案件结构、字段、规则、答案和 Solver 结果检查。下一阶段应升级为正式 Validator Engine，用于统一支撑 Author Studio、Uploader、Library 和后续 Publisher。

Solver 负责根据结构化规则判断解的状态，包括唯一解、多解、无解或暂不支持。它应作为验证链路中的推理能力，不应被各工具重复实现。

推荐数据流是：

```text
Author Studio
↓
Draft JSON
↓
Validator
↓
Solver
↓
Case Library
↓
Game
```

## User Preferences

CleverGrid 长期设计偏好如下：

- 静态网页优先，保持原生前端和轻量结构。
- GitHub Pages 优先，默认不依赖服务器。
- JSON 单一事实来源，新增案件应围绕 `case-index.json` 和 `cases/*.json`。
- Author Studio 负责创作和 Draft JSON 输出，不承担完整发布系统。
- Validator Engine 负责验证，是下一阶段最重要基础设施。
- Publisher 负责 Draft 到正式 Case 的发布流程，应在 Validator Engine 之后建设。
- AI Generator 后置，应等验证和发布链路稳定后再接入。
- 创作流程应保持人参与确认，避免工具静默改仓库。

## Implemented Features

截至 v0.8.0，Game 已支持多案件游玩、推理网格标记、线索阅读、结案答案提交、本地存档、关卡解锁、笔记、撤销重做和辅助标记。

Creator Tools 已完成 Tools Hub、Case Library、Case Uploader、Case Validator 和 Author Studio MVP。

Author Studio MVP 已支持案件基础信息编辑、嫌疑人/凶器/地点管理、Solution 答案设置、线索编辑、结构化规则编辑、草稿完整性校验、JSON 预览、复制和下载。

Uploader 已支持 JSON 上传、粘贴、格式校验、Solver 校验和入库前检查。Validator 已支持案件库级检查，包括 Case ID、Version、Difficulty、Solution、FullTruth、Rules 和唯一解结果展示。

文档侧已存在 README、CHANGELOG、案件格式规范、AI 生成规范、提示词文档，以及 `docs/architecture-v0.8.0.md`。

## Current Limitations

截至 v0.8.0，正式 Validator Engine 尚未完成。现有 Validator 可用，但还不是完整、模块化、可扩展的验证引擎。

Author Studio 尚未接入唯一解验证。它目前只做草稿级基础校验，不应继续简单堆叠编辑功能来替代验证系统。

Publisher 尚未实现。Draft JSON 到正式案件文件、索引更新、版本管理和发布确认仍需要后续建设。

AI Generator 尚未实现。当前有 AI 生成标准和提示词，但没有集成式 AI 生成入口。

项目仍保留部分旧格式文件，如 `cases/*.js` 和 `cases/manifest.js`，但它们属于旧阶段遗留，不应作为 v0.8.0 之后的默认方案。

## Recommended Next Branch

推荐下一开发分支：

```text
codex/validator-engine
```

原因：v0.8.0 已完成 Author Studio MVP，下一步最需要补齐的是统一、可靠的 Validator Engine。它会成为 Author Studio、Uploader、Library、Publisher 和未来 AI Generator 的共同基础。

## Anti-Patterns

不要再建议或默认采用以下方向：

- 使用 `cases/*.js` 作为新案件主格式。
- 使用 `manifest.js` 作为新案件索引方案。
- 自动 Git 提交或自动创建 PR。
- 工具静默自动修改仓库文件。
- 云同步或账号系统。
- 后端依赖。
- React/Vue 重构。
- 在 Author Studio 上继续堆大量编辑功能来绕过 Validator Engine。

正确方向是先稳定 JSON 数据流和 Validator Engine，再建设 Publisher，最后接入 AI Generator。
