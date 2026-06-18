# CleverGrid Architecture Report v0.8.0

## 1. Project Overview

CleverGrid 是一个纯前端、静态网页形式的逻辑推理网格游戏，同时提供面向案件创作者的轻量工具链。

当前版本为 **v0.8.0 - Author Studio MVP**，发布日期为 **2026-06-18**。

项目核心目标是让玩家可以直接在浏览器中游玩逻辑案件，也让创作者能够通过工具完成案件草稿、校验、入库和发布前检查。项目保持无后端、无构建工具、适配 GitHub Pages 的方向。

---

## 2. Current Architecture

### 玩家端

玩家端入口是 `index.html`。它负责加载案件库、展示案件列表、进入推理界面、记录玩家标记、提交最终答案，并使用浏览器本地存储保存进度。

### Creator Tools

Creator Tools 位于 `tools/`，包括工具中心、案件库、上传器、校验器和 Author Studio。它们服务于案件创建、导入、检查和维护，不改变玩家端主流程。

### 数据流

当前正式案件由 `case-index.json` 管理顺序与元信息，再指向 `cases/case-xxx.json`。游戏通过案件索引读取正式案件。创作端则先生成 Draft JSON，再经过 Validator 和 Solver 检查，最后进入 Case Library，成为玩家端可读取的正式案件。

---

## 3. Repository Structure

```text
CleverGrid/
├── index.html
├── src/
├── cases/
├── tools/
├── docs/
└── tests/
```

`index.html` 是玩家入口，负责展示游戏和加载案件。

`src/` 存放核心前端逻辑，包括游戏交互、案件加载、案件库工具、校验逻辑和解题器。

`cases/` 存放正式案件数据。当前使用 `case-001.json` 到 `case-005.json` 这类独立 JSON 文件。

`tools/` 存放创作者工具页面，包括 Tools Hub、Library、Uploader、Validator 和 Author Studio。

`docs/` 存放案件格式、案例模板、AI 生成规范和提示词文档。

`tests/` 存放当前工具链相关测试和坏案例样本，用于验证上传、案件库、难度标准和异常数据。

---

## 4. Creator Workflow

当前实际创作流程是：

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

Author Studio 用于创建案件草稿。Draft JSON 是创作输出。Validator 检查字段、结构、规则和答案一致性。Solver 用于判断规则是否能推导出有效解。通过检查后，案件进入 Case Library，并最终被玩家端游戏读取。

---

## 5. Implemented Features

### Game

已实现多案件游玩、推理网格标记、线索阅读、结案答案提交、本地存档、关卡解锁、笔记、撤销重做和辅助标记。

### Tools Hub

已实现统一工具入口，集中跳转到案件库、上传器、校验器和 Author Studio。

### Library

已实现正式案件库浏览、案件索引读取、难度显示、搜索和案件基础信息检查。

### Uploader

已实现 JSON 上传、粘贴、格式校验、Solver 检查和入库前检查。符合条件时可生成正式案件文件。

### Validator

已实现案件库级检查，包括 Case ID、Version、Difficulty、Solution、FullTruth、Rules 和 Solver 唯一解结果展示。

### Author Studio

已实现 MVP：基础信息编辑、嫌疑人/凶器/地点管理、Solution 设置、线索编辑、结构化规则编辑、草稿完整性校验、JSON 预览、复制与下载。

---

## 6. Current Limitations

当前尚未实现完整的 **Validator Engine**。现有 Validator 可用，但还不是独立、系统化、可扩展的规则引擎。

**Unique Solution Verification in Author Studio** 尚未接入。Author Studio 当前做基础草稿校验，不直接完成唯一解判断。

**Publisher** 尚未实现。Draft 到正式 Case 的发布流程仍需要工具配合和人工确认。

**AI Generator** 尚未实现。当前已有 AI 生成规范和提示词文档，但没有集成式生成工具。

---

## 7. Roadmap

### Phase 2

建设 Validator Engine，重点包括结构化规则解析、自动逻辑推导、冲突检测、唯一解验证和规则覆盖率分析。

### Phase 3

建设 Publisher，负责 Draft 到 Case 的转换、案件文件生成、发布流程管理和版本控制。

### Phase 4

建设 AI Generator，支持 AI 辅助生成案件、线索、规则和初稿，并接入现有校验流程。

---

## 8. Recommended Next Development Branch

推荐新分支名称：

```text
codex/validator-engine
```

原因是当前 v0.8.0 已完成 Author Studio MVP，下一阶段最关键的瓶颈不是继续扩展编辑界面，而是补齐正式 Validator Engine。它会直接提升 Author Studio、Uploader、Library 和后续 Publisher 的可靠性，是 Phase 2 最合理的主线分支。
