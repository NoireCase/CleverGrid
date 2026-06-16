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

```text
CleverGrid/
├── index.html                 游戏首页和主流程
├── data.js                    按案件目录组装 GAME_DATA
├── cases/
│   ├── manifest.js            案件顺序目录
│   └── *.js                   独立案件文件
├── assets/
│   └── styles.css             游戏样式
├── src/
│   ├── app.js                 游戏逻辑
│   └── validator.js           可复用案件校验逻辑
├── tools/
│   └── validator.html         案件数据校验工具
├── docs/
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
阅读 docs/case-schema.md
↓
阅读 docs/case-template.md
↓
复制 docs/example-case.md
↓
修改案件内容
↓
加入 cases/ 并登记 manifest.js
↓
运行 tools/validator.html
↓
试玩验证
```

具体说明：

1. 先阅读 `docs/case-schema.md`，确认字段格式和 Editor 未来导出格式。
2. 阅读 `docs/case-template.md`，理解案件需要哪些内容。
3. 复制 `docs/example-case.md` 中的示例结构。
4. 修改案件 id、标题、难度、嫌疑人、凶器、地点、线索、答案原文和完整真相。
5. 将整理好的案件保存为 `cases/` 下的独立案件文件。
6. 在 `cases/manifest.js` 中登记新案件。
7. 打开 `tools/validator.html` 检查数据。
8. 校验通过后，打开 `index.html` 试玩，确认案件可以正常完成。

维护者新增案件时，建议先设计完整真相，再编写线索。不要先写线索，再拼凑答案。

## 案件校验工具

校验工具路径：

```text
tools/validator.html
```

它会读取当前 `data.js` 中的 `GAME_DATA`，并检查每个案件：

- case id 是否存在
- case id 是否重复
- version 是否存在
- title 是否存在
- suspects / weapons / locations 是否为空
- suspects / weapons / locations 是否都有 id
- suspects / weapons / locations 内部 id 是否重复
- suspects / weapons / locations 数量是否一致
- solution 中的嫌疑人、凶器、地点是否存在
- fullTruth 是否覆盖所有嫌疑人
- fullTruth 每行 ID 是否有效
- fullTruth 是否完整
- solution 是否对应到 fullTruth
- clues 数量是否大于 0

每次新增或修改案件后，都应该先运行校验工具，再试玩。

## 维护者说明

- 项目使用原生 HTML、CSS、JavaScript。
- 项目保持静态网页结构，适合 GitHub Pages 部署。
- 当前不需要安装依赖。
- 当前不需要 npm、打包工具或复杂框架。
- 非工程维护者优先修改 `cases/` 和 `docs/` 文档。
- 未来 Editor 应导出 `cases/*.js` 案件文件，并提示更新 `cases/manifest.js`。
- 修改游戏主流程前，建议先备份并完整试玩所有案件。

## 当前限制

- 新增案件仍需要编辑案件文件和 `cases/manifest.js`。
- 当前还没有无代码案件编辑器。
- 校验工具只能检查数据结构，不能自动判断谜题是否一定有唯一解。
- 移动端体验可能不如桌面端。
- 当前没有自动化测试流程。
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
