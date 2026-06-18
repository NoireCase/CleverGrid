# CleverGrid

一个基于 Web 的逻辑推理网格游戏（Logic Grid Puzzle）。

玩家需要阅读案件线索，在推理网格中标记嫌疑人、凶器和地点之间的关系，最终提交“凶手 + 凶器 + 地点”的结案答案。

---

## 项目简介

CleverGrid 是一个轻量级静态网页推理游戏，同时也是一个面向逻辑推理案件创作者的创作工具链。

项目当前服务两类用户：

### 玩家

* 游玩逻辑推理案件
* 阅读线索并完成推理
* 使用推理网格记录分析过程
* 提交最终结案答案

### 创作者

* 编写案件
* 校验案件
* 管理案件库
* 使用 Author Studio 创建案件草稿

---

## 在线体验

如果已启用 GitHub Pages，可直接访问项目 Pages 地址。

本地也可以直接打开：

```text
index.html
```

进行游玩。

---

## 当前功能

### 游戏功能

* 多案件推理玩法
* 嫌疑人、凶器、地点三类对象
* 逻辑推理网格标记
* 钢笔、铅笔、橡皮擦工具
* 线索列表与线索划掉
* 拖拽卡片提交结案答案
* 本地浏览器存档
* 关卡完成后解锁下一案
* 暂存 / 读取笔记
* 撤销 / 重做
* 智能辅助标记

### Creator Tools

* Tools Hub 工具中心
* Case Library 正式案件库管理
* Case Uploader AI 案件上传与校验
* Case Validator 案件完整性检查
* Author Studio 可视化案件编辑器（MVP）

### Author Studio MVP

* 案件基础信息编辑
* 嫌疑人管理
* 凶器管理
* 地点管理
* Solution 答案设置
* 线索编辑器
* 结构化线索规则编辑
* 草稿完整性校验
* JSON 草稿预览
* JSON 导出

---

## 快速开始

### 玩家游玩

1. 下载或克隆仓库
2. 打开项目目录
3. 使用浏览器打开：

```text
index.html
```

推荐：

* Chrome
* Edge

---

### 本地预览

如果浏览器限制本地文件访问，可以启动任意静态服务器：

```text
http://localhost:端口号/index.html
```

---

## 项目结构

```text
CleverGrid/
├── index.html
├── case-index.json
├── data.js
├── cases/
│   ├── case-001.json
│   ├── case-002.json
│   └── ...
├── assets/
│   └── styles.css
├── src/
│   ├── app.js
│   ├── case-loader.js
│   ├── case-library.js
│   ├── validator.js
│   └── solver.js
├── tools/
│   ├── index.html
│   ├── author-studio.html
│   ├── library.html
│   ├── validator.html
│   ├── uploader.html
│   └── migrate-cases.html
├── docs/
│   ├── ai-case-generation.md
│   ├── case-schema.md
│   ├── case-template.md
│   ├── example-case.md
│   └── prompts/
├── tests/
├── .github/
└── LICENSE
```

---

## Creator Workflow

当前推荐案件制作流程：

```text
AI / Author Studio
        ↓
Case Draft
        ↓
Case Validator
        ↓
Solver 验证
        ↓
加入案件库
        ↓
试玩验证
        ↓
发布
```

---

## 工具中心

### Tools Hub

统一管理所有创作工具。

```text
tools/index.html
```

---

### Author Studio

可视化案件编辑器（MVP）。

```text
tools/author-studio.html
```

支持：

* 基础信息编辑
* 对象编辑
* 答案设置
* 线索编辑
* 结构化规则编辑
* JSON 导出
* 草稿校验

---

### Case Library

正式案件库管理工具。

```text
tools/library.html
```

支持：

* 查看案件
* 搜索案件
* 检查案件信息
* 浏览案件库

---

### Case Uploader

AI 案件上传工具。

```text
tools/uploader.html
```

支持：

* JSON 上传
* JSON 粘贴
* 格式校验
* Solver 校验
* 入库前检查

---

### Case Validator

案件库完整性检查工具。

```text
tools/validator.html
```

检查内容包括：

* Case ID
* Version
* Difficulty
* Solution
* FullTruth
* Rules
* Solver
* 唯一解验证

---

## Difficulty Standard

案件 JSON 使用统一英文枚举：

| 存储值    | 页面显示 |
| ------ | ---- |
| easy   | 入门级  |
| medium | 中级   |
| hard   | 进阶版  |
| expert | 专家级  |

---

## 测试

当前测试：

```text
node tests/phase5.2-uploader-solver.test.js
node tests/phase5.3-case-library.test.js
node tests/phase5.3.3-bad-cases.test.js
node tests/phase5.3.5-difficulty.test.js
```

---

## 维护者说明

* 项目使用原生 HTML / CSS / JavaScript
* 项目保持静态网页架构
* 支持 GitHub Pages
* 当前不依赖 npm
* 当前不依赖构建工具
* 新案件推荐通过 Author Studio 或 Uploader 创建
* data.js 已废弃，仅用于迁移参考

---

## 当前限制

* Author Studio 当前属于 MVP 阶段
* 尚未接入正式 Validator Engine
* 尚未实现自动唯一解验证
* 尚未实现 Publisher 发布系统
* 尚未实现 AI Generator
* 移动端体验仍有优化空间

---

## Roadmap

### 已完成

* Case Library
* Case Uploader
* Case Validator
* Tools Hub
* Author Studio MVP

### 下一阶段（Phase 2）

#### Validator Engine

* 结构化规则解析
* 自动逻辑推导
* 冲突检测
* 唯一解验证
* 规则覆盖率分析

### 中期规划（Phase 3）

#### Publisher

* Draft → Case 转换
* 自动生成案件文件
* 发布流程管理
* 案件版本控制

### 长期规划（Phase 4）

#### AI Generator

* AI 辅助生成案件
* AI 辅助生成线索
* AI 辅助生成规则
* AI 辅助生成案件初稿

---

## License

本项目采用 GPL-3.0 License 开源协议。
