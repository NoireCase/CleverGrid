# CleverGrid 案件格式规范

这份文档定义当前案件文件格式，也作为未来 `tools/editor.html` 的导出标准。当前项目仍使用普通 JS 文件，不使用标准 JSON、不需要构建工具、不依赖后端。

## 当前案件文件格式

每个案件是 `cases/` 目录下的一个独立 JS 文件。文件名必须和案件 `id` 一致：

```text
cases/rainy-museum-theft.js
```

文件内容使用全局注册方式：

```js
window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["rainy-museum-theft"] = {
    id: "rainy-museum-theft",
    version: 1,
    title: "雨夜美术馆失窃案",
    difficulty: "入门级",
    intro: "暴雨之夜，美术馆最珍贵的一幅画作不翼而飞。",
    suspects: [],
    weapons: [],
    locations: [],
    clues: [],
    rules: [],
    solution: "UzMtVzEtTDM=",
    fullTruth: []
};
```

案件顺序由 `cases/manifest.js` 决定：

```js
window.CLEVERGRID_CASE_MANIFEST = [
    "rainy-museum-theft"
];
```

`data.js` 会按 manifest 顺序组装 `GAME_DATA`。新增案件不需要修改 `index.html` 或 `tools/validator.html`。

## 字段含义

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 案件稳定编号，也是存档 key 和注册表 key 的基础。 |
| `version` | number | 是 | 案件内容版本。首次发布为 `1`。 |
| `title` | string | 是 | 玩家看到的案件标题。 |
| `difficulty` | string | 是 | 难度展示文本，例如 `入门级`、`中级`、`进阶版`、`专家级`。 |
| `intro` | string | 是 | 案件开场描述。 |
| `suspects` | array | 是 | 嫌疑人列表。 |
| `weapons` | array | 是 | 凶器、道具或关键物品列表。 |
| `locations` | array | 是 | 地点列表。 |
| `clues` | array | 是 | 玩家阅读的文字线索列表。 |
| `rules` | array | 建议必填 | 机器可读的结构化线索，供 Solver、Validator、Editor 使用。没有 rules 时无法进行唯一解校验。 |
| `fullTruth` | array | 是 | 完整真相表，说明每个嫌疑人对应哪个物品和地点。 |
| `solution` | string | 是 | 最终结案答案，当前为 `嫌疑人-物品-地点` 的 Base64 编码。 |

## id 命名规则

案件 `id` 使用稳定英文短横线格式：

```text
rainy-museum-theft
```

规则：

- 只使用小写英文字母、数字和英文短横线 `-`。
- 不使用空格、中文、下划线、标点或 emoji。
- 一旦发布，不要修改已有案件 `id`，否则玩家旧存档会找不到对应案件。
- 案件文件名、注册表 key、manifest 条目必须保持一致。

对象 id 规则：

- `suspects` 推荐用 `S1`、`S2`、`S3`。
- `weapons` 推荐用 `W1`、`W2`、`W3`。
- `locations` 推荐用 `L1`、`L2`、`L3`。
- 同一组内 id 不能重复。
- 正式案件尽量不要用中文 id。

## version 使用规则

`version` 用于记录案件内容版本：

- 新案件从 `version: 1` 开始。
- 只改错别字、描述润色，通常可以不升级。
- 改 `suspects`、`weapons`、`locations`、`fullTruth`、`solution` 或关键线索时，建议版本加 1。
- 当前游戏暂未用 version 做存档迁移，但 Editor 和后续工具会依赖这个字段判断内容变化。

## 三类对象格式

`suspects` 每项：

```js
{ id: 'S1', name: '值夜班保安', icon: '🧢', desc: '负责夜间巡逻。', traits: '戴蓝色帽子' }
```

`weapons` 每项：

```js
{ id: 'W1', name: '铜制钥匙', icon: '🗝️', tag: '钥匙', desc: '可以打开后门。' }
```

`locations` 每项：

```js
{ id: 'L1', name: '主展厅', icon: '🏛️', tag: '展区', desc: '被盗画作原本挂在这里。' }
```

规则：

- 三类对象数量必须一致。
- 每个对象都必须有 id。
- name 尽量短，避免卡片显示太挤。
- desc 用于叙事和氛围。
- traits/tag 应该能帮助写线索。

## clues 写法要求

`clues` 面向玩家展示，负责自然语言线索。当前老案件仍兼容字符串数组：

```js
clues: [
    "戴蓝色帽子的人拿着强光手电。",
    "年轻修复师整晚都待在修复室。"
]
```

未来 Editor/Solver 阶段可以升级为带 `id` 的对象，方便 `rules` 通过 `sourceClueId` 关联：

```js
clues: [
    { id: "C1", text: "戴蓝色帽子的人拿着强光手电。" },
    { id: "C2", text: "年轻修复师整晚都待在修复室。" }
]
```

写法要求：

- 至少 1 条线索，正式案件建议 5 条以上。
- 每条线索尽量只表达一个重点。
- 线索必须和 `fullTruth` 一致。
- 不要用线索直接重复最终答案，除非是新手教学关。
- 可以写肯定关系、排除关系、条件关系、二选一关系。
- `clues` 只给玩家阅读，不作为 Solver 的直接输入。

## rules 写法要求

`rules` 面向 Solver、Validator 和未来 Editor，负责把自然语言线索转成机器可读的规则。

最小格式：

```js
rules: [
    {
        id: "R1",
        type: "notSame",
        left: "S1",
        right: "L4",
        sourceClueId: "C1",
        note: "可选备注"
    }
]
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 规则稳定编号，例如 `R1`、`R2`。 |
| `type` | string | 是 | 当前只允许 `same` 或 `notSame`。 |
| `left` | string | 是 | 左侧对象 id，可来自 suspects、weapons、locations。 |
| `right` | string | 是 | 右侧对象 id，可来自 suspects、weapons、locations。 |
| `sourceClueId` | string | 否 | 对应的 clue id。填写后必须能在 `clues` 中找到。 |
| `note` | string | 否 | 给维护者或未来 Editor 使用的备注，不参与游戏逻辑。 |

当前支持的规则类型：

```js
{ type: "same", left: "S1", right: "W2" }
```

表示 `S1` 与 `W2` 属于同一组真相。

```js
{ type: "notSame", left: "W1", right: "L3" }
```

表示 `W1` 与 `L3` 不属于同一组真相。

规则要求：

- `left` 和 `right` 必须存在于 suspects、weapons、locations。
- `left` 和 `right` 不能来自同一分类。
- 一条 `clue` 可以对应多条 `rules`。
- `rules` 必须与 `fullTruth` 一致。
- 本阶段只支持 `same` / `notSame`，暂不设计复杂条件规则。
- 当前游戏 UI 仍按字符串显示 clues，所以正式可玩的案件暂时应继续使用字符串 clues。
- 当前 5 个正式案件已经包含 `rules`；未来新增案件也应包含 `rules`。

## fullTruth 写法要求

`fullTruth` 是完整真相，不只是最终答案。每一行格式固定：

```js
['嫌疑人 id', '物品 id', '地点 id']
```

示例：

```js
fullTruth: [
    ['S1', 'W2', 'L1'],
    ['S2', 'W3', 'L2'],
    ['S3', 'W1', 'L3']
]
```

要求：

- 覆盖所有嫌疑人。
- 每个嫌疑人只能出现一次。
- 每个物品应该只出现一次。
- 每个地点应该只出现一次。
- 每个 id 必须存在于对应列表中。
- 行数必须等于嫌疑人数量。

## solution 与 fullTruth 的关系

`solution` 是玩家最终要提交的那一行真相，必须来自 `fullTruth`。

维护者可读原文：

```text
S3-W1-L3
```

当前案件文件中的字段：

```js
solution: "UzMtVzEtTDM="
```

规则：

- 原文顺序固定为 `suspectId-weaponId-locationId`。
- 中间使用英文短横线 `-`。
- `solution` 解码后必须正好等于 `fullTruth` 中的一行。
- 未来 Editor 应允许维护者填写原文，并自动导出 Base64 编码。

## 新增案件标准流程

1. 复制 `docs/example-case.md` 的可复制案件内容。
2. 新建 `cases/xxx.js`，其中 `xxx` 必须等于案件 `id`。
3. 修改案件内容。
4. 为自然语言 `clues` 补充机器可读 `rules`。
5. 在 `cases/manifest.js` 中加入案件 id。
6. 打开 `tools/validator.html` 校验。
7. 打开 `index.html` 手动试玩。
8. 能正常破案后再发布。

## Validator 检查范围

Validator 当前检查：

- case id 是否存在。
- case id 是否重复。
- version 是否存在。
- title 是否存在。
- suspects / weapons / locations 是否为空。
- suspects / weapons / locations 是否都有 id。
- suspects / weapons / locations 内部 id 是否重复。
- suspects / weapons / locations 数量是否一致。
- solution 是否能解码为三段 id。
- solution 中的嫌疑人、物品、地点是否存在。
- fullTruth 是否覆盖所有嫌疑人。
- fullTruth 每行 id 是否有效。
- fullTruth 是否完整。
- solution 是否对应到 fullTruth。
- clues 数量是否大于 0。
- rules 是否存在；当前没有 rules 只给 warning。
- rules 是否为数组。
- rule id 是否存在且不重复。
- rule type 是否为 same / notSame。
- rule left / right 是否存在于 suspects / weapons / locations。
- rule left / right 是否来自不同分类。
- rule sourceClueId 如果存在，是否能在 clues 中找到。
- rule 是否与 fullTruth 一致。
- Solver 是否能基于 rules 找到解。
- Solver 是否唯一解；本阶段多解显示为 warning。
- Solver 唯一解是否与 fullTruth 完全一致。

Validator 暂不检查：

- 线索语义是否正确。
- 条件关系、二选一关系等复杂规则。
- 文案是否自然。
- 难度是否合理。

## Editor 未来导出格式

未来 Editor 应导出一个完整 JS 案件文件，而不是直接修改 `data.js`。

推荐导出文件：

```text
cases/rainy-museum-theft.js
```

推荐导出内容：

```js
window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["rainy-museum-theft"] = {
    id: "rainy-museum-theft",
    version: 1,
    title: "雨夜美术馆失窃案",
    difficulty: "入门级",
    intro: "暴雨之夜，美术馆最珍贵的一幅画作不翼而飞。",
    suspects: [
        { id: 'S1', name: '值夜班保安', icon: '🧢', desc: '负责夜间巡逻。', traits: '戴蓝色帽子' },
        { id: 'S2', name: '年轻修复师', icon: '🎨', desc: '熟悉馆内动线。', traits: '手上有颜料' },
        { id: 'S3', name: '古董收藏家', icon: '🧐', desc: '对被盗展品很感兴趣。', traits: '戴白手套' }
    ],
    weapons: [
        { id: 'W1', name: '铜制钥匙', icon: '🗝️', tag: '钥匙', desc: '可以打开后门。' },
        { id: 'W2', name: '强光手电', icon: '🔦', tag: '工具', desc: '巡逻时使用。' },
        { id: 'W3', name: '画框碎片', icon: '🖼️', tag: '证物', desc: '从画框上掉落。' }
    ],
    locations: [
        { id: 'L1', name: '主展厅', icon: '🏛️', tag: '展区', desc: '被盗画作原本挂在这里。' },
        { id: 'L2', name: '修复室', icon: '🧰', tag: '工作区', desc: '存放修复工具。' },
        { id: 'L3', name: '后门走廊', icon: '🚪', tag: '出入口', desc: '监控角度很差。' }
    ],
    clues: [
        "戴蓝色帽子的人拿着强光手电。",
        "年轻修复师整晚都待在修复室。",
        "铜制钥匙出现在后门走廊。"
    ],
    rules: [
        { id: "R1", type: "same", left: "S1", right: "W2", note: "来自第 1 条 clue" },
        { id: "R2", type: "same", left: "S2", right: "L2", note: "来自第 2 条 clue" },
        { id: "R3", type: "same", left: "W1", right: "L3", note: "来自第 3 条 clue" }
    ],
    solution: "UzMtVzEtTDM=",
    fullTruth: [
        ['S1', 'W2', 'L1'],
        ['S2', 'W3', 'L2'],
        ['S3', 'W1', 'L3']
    ]
};
```

Editor 同时应该提示维护者把案件 id 加入 `cases/manifest.js`。后续如果 Editor 支持下载多个文件，可以同时导出案件文件和更新后的 manifest 内容。
