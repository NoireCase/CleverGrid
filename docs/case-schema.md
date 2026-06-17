# CleverGrid 案件格式规范

这份文档定义当前正式案件库格式，也作为 `tools/uploader.html` 校验 AI 案件 JSON 的参考。当前正式案件使用独立 JSON 文件和 `case-index.json`，不需要构建工具、不依赖后端。

## 当前案件文件格式

每个正式案件是 `cases/` 目录下的一个独立 JSON 文件。文件名由系统自动生成：

```text
cases/case-001.json
```

文件内容是标准 JSON：

```json
{
  "id": "case-001",
  "version": 1,
  "title": "雨夜美术馆失窃案",
  "difficulty": "入门级",
  "intro": "暴雨之夜，美术馆最珍贵的一幅画作不翼而飞。",
  "suspects": [],
  "weapons": [],
  "locations": [],
  "clues": [],
  "rules": [],
  "solution": {
    "suspect": "S3",
    "weapon": "W1",
    "location": "L3"
  },
  "fullTruth": []
}
```

案件顺序由 `case-index.json` 决定：

```json
{
  "version": 1,
  "cases": [
    {
      "id": "case-001",
      "title": "雨夜美术馆失窃案",
      "difficulty": "入门级",
      "file": "cases/case-001.json"
    }
  ]
}
```

首页会先读取 `case-index.json`，再按索引读取对应 `cases/case-xxx.json`。新增案件不需要修改 `index.html` 或 `data.js`。

## 字段含义

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 正式库必填 | 正式案件编号，格式为 `case-001`。Uploader 草稿可以不填，入库时自动生成。 |
| `version` | number | 是 | 案件内容版本。首次发布为 `1`。 |
| `title` | string | 是 | 玩家看到的案件标题。 |
| `difficulty` | string | 是 | 难度展示文本，例如 `入门级`、`中级`、`进阶版`、`专家级`。 |
| `intro` | string | 是 | 案件开场描述。 |
| `suspects` | array | 是 | 嫌疑人列表。 |
| `weapons` | array | 是 | 凶器、道具或关键物品列表。 |
| `locations` | array | 是 | 地点列表。 |
| `clues` | array | 是 | 玩家阅读的文字线索列表。 |
| `rules` | array | 建议必填 | 机器可读的结构化线索，供 Solver、Validator、Uploader 使用。没有 rules 时无法进行唯一解校验。 |
| `fullTruth` | array | 是 | 完整真相表，说明每个嫌疑人对应哪个物品和地点。 |
| `solution` | object | 是 | 最终结案答案，格式为 `{ suspect, weapon, location }`。 |

## id 命名规则

正式案件 `id` 使用固定三位数字格式：

```text
case-001
```

规则：

- 固定 `case-` 前缀。
- 数字固定三位。
- 自动递增。
- 不允许用户手动输入正式 id。
- 不允许重复。
- 文件路径必须是 `cases/case-xxx.json`。

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
- 当前游戏暂未用 version 做存档迁移，但 Uploader 和后续工具会依赖这个字段判断内容变化。

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

`clues` 面向玩家展示，负责自然语言线索。当前格式仍兼容字符串数组：

```js
clues: [
    "戴蓝色帽子的人拿着强光手电。",
    "年轻修复师整晚都待在修复室。"
]
```

未来 Uploader/Solver 阶段可以升级为带 `id` 的对象，方便 `rules` 通过 `sourceClueId` 关联：

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

`rules` 面向 Solver、Validator 和 Uploader，负责把自然语言线索转成机器可读的规则。

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
| `note` | string | 否 | 给维护者或 Uploader 使用的备注，不参与游戏逻辑。 |

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

## Solver 工作方式

Solver 用 `rules` 计算案件是否有解，不会把 `fullTruth` 或 `solution` 当作求解条件。

当前输入：

- `suspects`
- `weapons`
- `locations`
- `rules`

当前输出状态：

| 状态 | 含义 | Validator 处理 |
| --- | --- | --- |
| `unique` | rules 只能推出 1 个解 | 通过，并继续对比 `fullTruth`。 |
| `multiple` | rules 能推出多个解 | warning；说明线索不足或有复杂线索未结构化。 |
| `none` | rules 推不出任何解 | error；说明 rules 互相矛盾或和基础数据不一致。 |
| `invalid` | 输入格式不合法 | error。 |

算法说明：

- 固定 suspects 顺序。
- 枚举 weapons 和 locations 的排列组合。
- 用 `same` / `notSame` 检查每个候选解。
- 找到第 2 个解后即可判定多解。
- 当前 3x3 到 5x5 案件规模可以直接运行，不需要后端或构建工具。

## unique validation

Validator 会在基础结构和 rules 结构都通过后运行 Solver：

1. 如果 Solver 返回 `none`，案件失败。
2. 如果 Solver 返回 `multiple`，本阶段显示 warning。
3. 如果 Solver 返回 `unique`，Validator 会把唯一解和 `fullTruth` 完整对比。
4. 如果唯一解不匹配 `fullTruth`，案件失败。
5. 如果唯一解匹配 `fullTruth`，案件通过唯一解校验。

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

当前案件文件中的字段：

```js
solution: {
    suspect: "S3",
    weapon: "W1",
    location: "L3"
}
```

规则：

- `suspect` 必须是一个有效嫌疑人 id。
- `weapon` 必须是一个有效物品 id。
- `location` 必须是一个有效地点 id。
- `solution` 解析后必须正好等于 `fullTruth` 中的一行。
- 旧版 Base64 字符串仍可被读取，用于兼容历史案件；新案件和 Uploader 输出必须使用对象格式。

## 新增案件标准流程

1. 复制 `docs/example-case.md` 的可复制 JSON 内容。
2. 修改案件内容，不需要填写正式 `case-xxx` id。
3. 为自然语言 `clues` 补充机器可读 `rules`。
4. 打开 `tools/uploader.html` 粘贴或上传 JSON。
5. 确认解析、格式、答案、唯一解验证全部通过。
6. 点击“加入案件库”，自动生成 `case-xxx` 并更新 `case-index.json`。
7. 打开 `tools/validator.html` 校验正式案件库。
8. 打开 `index.html` 手动试玩。
9. 能正常破案后再发布。

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
- solution 是否能解析为三段 id。
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

## Case Uploader 输出格式

`tools/uploader.html` 当前负责验证 AI 生成的案件 JSON，并输出格式化后的标准 JSON。全部校验通过后，可以加入正式案件库，系统会自动写入 `cases/case-xxx.json` 并更新 `case-index.json`。

Uploader 校验顺序：

1. JSON 解析。
2. 格式校验。
3. 基于 `rules` 的答案校验。
4. 基于 `rules` 的唯一解验证。

唯一解验证返回结构：

```js
{
  status: "unique" | "multiple" | "none" | "unsupported" | "error",
  solutions: [],
  count: 0,
  matchesSolution: false,
  messages: []
}
```

当前 Solver 支持的 rule type：

- `same`：两个实体在同一行真相中。
- `notSame`：两个实体不在同一行真相中。

当前 Solver 不支持的 rule type：

- 条件关系。
- 二选一关系。
- 至少一个 / 至多一个。
- 自然语言 clue 语义解析。

如果案件缺少结构化 `rules`，Uploader 会显示唯一解验证暂未启用，不会假装理解自然语言线索。

推荐 AI 生成和 Uploader 输出的草稿 JSON 结构。草稿不需要正式 `id`，入库时会自动生成：

```json
{
  "version": 1,
  "title": "雨夜美术馆失窃案",
  "difficulty": "入门级",
  "intro": "暴雨之夜，美术馆最珍贵的一幅画作不翼而飞。",
  "suspects": [
    { "id": "S1", "name": "值夜班保安", "icon": "🧢", "desc": "负责夜间巡逻。", "traits": "戴蓝色帽子" },
    { "id": "S2", "name": "年轻修复师", "icon": "🎨", "desc": "熟悉馆内动线。", "traits": "手上有颜料" },
    { "id": "S3", "name": "古董收藏家", "icon": "🧐", "desc": "对被盗展品很感兴趣。", "traits": "戴白手套" }
  ],
  "weapons": [
    { "id": "W1", "name": "铜制钥匙", "icon": "🗝️", "tag": "钥匙", "desc": "可以打开后门。" },
    { "id": "W2", "name": "强光手电", "icon": "🔦", "tag": "工具", "desc": "巡逻时使用。" },
    { "id": "W3", "name": "画框碎片", "icon": "🖼️", "tag": "证物", "desc": "从画框上掉落。" }
  ],
  "locations": [
    { "id": "L1", "name": "主展厅", "icon": "🏛️", "tag": "展区", "desc": "被盗画作原本挂在这里。" },
    { "id": "L2", "name": "修复室", "icon": "🧰", "tag": "工作区", "desc": "存放修复工具。" },
    { "id": "L3", "name": "后门走廊", "icon": "🚪", "tag": "出入口", "desc": "监控角度很差。" }
  ],
  "clues": [
    "戴蓝色帽子的人拿着强光手电。",
    "年轻修复师整晚都待在修复室。",
    "铜制钥匙出现在后门走廊。"
  ],
  "rules": [
    { "id": "R1", "type": "same", "left": "S1", "right": "W2", "note": "来自第 1 条 clue" },
    { "id": "R2", "type": "same", "left": "S2", "right": "L2", "note": "来自第 2 条 clue" },
    { "id": "R3", "type": "same", "left": "W1", "right": "L3", "note": "来自第 3 条 clue" }
  ],
  "solution": {
    "suspect": "S3",
    "weapon": "W1",
    "location": "L3"
  }
}
```

上传文件名不需要规范化。加入案件库时会自动生成标准文件名，格式为 `cases/case-001.json`、`cases/case-002.json`、`cases/case-003.json`。
