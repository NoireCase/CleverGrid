# CleverGrid

一个基于 Web 的逻辑推理网格游戏（Logic Grid Puzzle）。

玩家需要阅读案件线索，在推理网格中标记嫌疑人、凶器和地点之间的关系，最终提交“凶手 + 凶器 + 地点”的结案答案。

## 项目简介

CleverGrid 是一个轻量级静态网页游戏。项目不需要安装依赖，也不需要构建流程，适合直接部署到 GitHub Pages。

这个项目主要服务两类人：

- 玩家：打开网页即可游玩逻辑推理案件。
- 维护者：可以按照文档新增案件，并使用校验工具检查案件数据是否完整。

## 在线体验

当前仓库未在 README 中记录固定的 GitHub Pages 地址。

如果已经启用 GitHub Pages，可以访问项目对应的 Pages 地址；本地也可以直接打开 `index.html` 游玩。

## 当前功能

- 多案件推理玩法
- 嫌疑人、凶器、地点三类卡片
- 逻辑推理网格标记
- 钢笔、铅笔、橡皮擦工具
- 线索列表与线索划掉
- 拖拽卡片提交结案答案
- 本地浏览器存档
- 关卡完成后解锁下一案
- 暂存 / 读取笔记
- 撤销 / 重做
- 智能辅助标记
- 案件数据校验工具
- Case Uploader 和 Case Library Manager
- 案件编写规范文档

## 快速开始

### 玩家游玩

1. 下载或克隆本仓库。
2. 打开项目目录。
3. 用浏览器打开 `index.html`。

推荐使用 Chrome 或 Edge。

### 本地预览

如果直接双击打开页面遇到浏览器限制，可以使用任意静态服务器预览项目。

例如在项目目录中启动本地服务后，访问首页：

```text
http://localhost:端口号/index.html
```

## 项目结构

Legacy `data.js` is deprecated and kept only for migration reference.
Do not add new cases to `data.js`.
The source of truth is now `case-index.json` and `cases/*.json`.

```text
CleverGrid/
├── index.html                 游戏首页和主流程
├── case-index.json            正式案件索引
├── data.js                    旧案件兼容与迁移参考
├── cases/
│   ├── case-001.json          正式案件文件
│   ├── case-002.json
│   ├── *.json
│   ├── manifest.js            旧案件迁移参考
│   └── *.js                   旧案件迁移参考
├── assets/
│   └── styles.css             游戏样式
├── src/
│   ├── app.js                 游戏逻辑
│   ├── case-library.js        案件库读取、入库、迁移工具函数
│   ├── case-loader.js         案件脚本加载器
│   ├── solver.js              rules 求解器
│   └── validator.js           可复用案件校验逻辑
├── tools/
│   ├── library.html           正式案件库管理工具
│   ├── migrate-cases.html     旧案件一次性迁移工具
│   ├── validator.html         案件数据校验工具
│   └── uploader.html          AI 案件 JSON 上传校验工具
├── tests/
│   ├── phase5.2-uploader-solver.test.js
│   ├── phase5.3-case-library.test.js
│   ├── phase5.3.3-bad-cases.test.js
│   └── bad-cases/              故意错误的案件测试集
├── docs/
│   ├── ai-case-generation.md   AI 案件生成规范
│   ├── case-schema.md         案件数据格式规范
│   ├── case-template.md       案件编写规范
│   └── example-case.md        示例案件模板
├── .github/
│   └── workflows/
│       └── sync_to_gitee.yml  同步到 Gitee 的工作流
└── LICENSE                    开源协议
```

## 如何新增案件

新增案件建议按下面流程进行：

```text
AI 生成案件 JSON
↓
打开 Case Uploader
↓
格式校验
↓
Solver 验证唯一解
↓
加入案件库
↓
自动生成 case-xxx
↓
自动更新 case-index.json
↓
试玩验证
↓
发布
```

具体说明：

1. 先阅读 `docs/case-schema.md`，确认字段格式和 Case Uploader 输出格式。
2. 使用 `docs/ai-case-generation.md` 作为 AI 生成案件 JSON 的统一规范，案件 ID 可以留空或使用临时值。
3. 打开 `tools/uploader.html`。
4. 粘贴 JSON 或上传任意名称的 `.json` 文件。
5. 确认 JSON 解析、格式校验、答案校验、唯一解验证全部通过。
6. 点击“加入案件库”。
7. 系统自动生成 `case-xxx`，写入 `cases/case-xxx.json`，并更新 `case-index.json`。
8. 打开 `tools/validator.html` 检查正式案件库。
9. 打开 `index.html` 试玩，确认案件可以正常完成。

维护者新增案件时，建议先设计完整真相，再编写线索。不要先写线索，再拼凑答案。

`clues` 面向玩家展示，可以写成自然语言；`rules` 面向 Validator、Solver 和 Case Uploader，是机器可读的结构化线索。当前游戏仍按字符串显示 `clues`，所以新增可玩案件暂时应继续使用字符串线索；5 个正式案件已经配置 `rules`。

## 案件校验工具

校验工具路径：

```text
tools/validator.html
```

它会读取当前 `case-index.json` 和 `cases/*.json`，并检查每个案件：

- case id 是否存在
- case id 是否重复
- version 是否存在
- title 是否存在
- suspects / weapons / locations 是否为空
- suspects / weapons / locations 是否都有 id
- suspects / weapons / locations 内部 id 是否重复
- suspects / weapons / locations 数量是否一致
- solution 是否能解析为嫌疑人、凶器、地点
- solution 中的嫌疑人、凶器、地点是否存在
- fullTruth 是否覆盖所有嫌疑人
- fullTruth 每行 ID 是否有效
- fullTruth 是否完整
- solution 是否对应到 fullTruth
- clues 数量是否大于 0
- rules 是否存在；当前没有 rules 只给 warning
- rules 是否为数组
- rule id 是否存在且不重复
- rule type 是否为 same / notSame
- rule left / right 是否存在于 suspects / weapons / locations
- rule left / right 是否来自不同分类
- rule sourceClueId 如果存在，是否能在 clues 中找到
- rule 是否与 fullTruth 一致
- Solver 是否有解
- Solver 是否唯一解；本阶段多解显示为提醒
- Solver 唯一解是否与 fullTruth 完全一致

每次新增或修改案件后，都应该先运行校验工具，再试玩。

## 测试

项目当前包含两类测试：

- 正常流程测试：确认 Uploader、Solver、Case Library 的正常功能不回退。
- 错误案件测试：确认明显错误的案件不会被 Validator、Solver 或 Uploader 放行。

当前测试命令：

```text
node tests/phase5.2-uploader-solver.test.js
node tests/phase5.3-case-library.test.js
node tests/phase5.3.3-bad-cases.test.js
```

`tests/bad-cases/` 中的 JSON 文件都是故意写错的案件，用来防止未来修改规则系统时漏检。

## Case Uploader

AI 生成案件 JSON 后，可以先用上传工具检查格式：

```text
tools/uploader.html
```

当前工具支持粘贴 JSON 或上传任意名称的 `.json` 文件。它会执行解析、格式校验、基于 rules 的答案校验、唯一解验证，并在全部通过后写入正式案件库。

## Case Library Manager

正式案件库管理工具路径：

```text
tools/library.html
```

它会读取 `case-index.json`，显示 Case ID、Title、Difficulty、File Path，并支持按 ID 或 Title 搜索。点击案件后会读取对应 `cases/case-xxx.json` 并展示详情。

## 维护者说明

- 项目使用原生 HTML、CSS、JavaScript。
- 项目保持静态网页结构，适合 GitHub Pages 部署。
- 当前不需要安装依赖。
- 当前不需要 npm、打包工具或复杂框架。
- 非工程维护者优先使用 `tools/uploader.html` 和 `tools/library.html`。
- `data.js`、`cases/manifest.js` 和旧 `cases/*.js` 已废弃，只作为迁移参考，首页不再依赖它们。
- 不要再向 `data.js` 添加新案件；新案件应通过 `tools/uploader.html` 验证后加入案件库。
- 修改游戏主流程前，建议先备份并完整试玩所有案件。

## 当前限制

- 当前还没有可视化案件编辑器；Phase 5.3 提供案件 JSON 上传、格式校验、唯一解验证、正式入库和案件库管理入口。
- 校验工具现在能基于 rules 判断无解、唯一解、多解；复杂条件规则仍未支持。
- 移动端体验可能不如桌面端。
- README 中暂未记录正式在线体验地址。

## Roadmap

### 短期

- 补充更多原创案件
- 完善案件编写文档
- 扩展 validator 校验规则
- 在 README 中补充正式 GitHub Pages 地址

### 中期

- 开发无代码案件编辑工具
- 增加案件选择页
- 优化移动端布局
- 增加案件难度标签和完成状态展示

### 长期

- 建立完整原创案件库
- 增加更强的谜题唯一解检查
- 优化玩家新手引导
- 支持更丰富的案件主题和玩法变体

## License

本项目采用 [GPL-3.0 License](LICENSE) 开源协议。
