# 示例案件：雨夜美术馆失窃案

这是一份可以复制后修改的完整案件模板。它符合当前 `cases/*.js` 独立案件文件格式，也可以作为未来 Editor 的导出参考。

## 基础信息

```text
id：rainy-museum-theft
version：1
title：雨夜美术馆失窃案
difficulty：入门级
```

id 对应文件名：

```text
cases/rainy-museum-theft.js
```

## suspects

```text
S1
name：值夜班保安
icon：🧢
desc：负责夜间巡逻，声称整晚都在监控室。
traits：戴蓝色帽子

S2
name：年轻修复师
icon：🎨
desc：负责修复展厅中央的油画，对馆内动线非常熟悉。
traits：手上有颜料

S3
name：古董收藏家
icon：🧐
desc：失窃前一天刚参观过美术馆，对被盗展品表现出浓厚兴趣。
traits：戴白手套
```

## weapons

```text
W1
name：铜制钥匙
icon：🗝️
tag：钥匙
desc：可以打开后门的旧钥匙，平时锁在办公室抽屉里。

W2
name：强光手电
icon：🔦
tag：工具
desc：巡逻时使用的手电，灯光非常刺眼。

W3
name：画框碎片
icon：🖼️
tag：证物
desc：从被盗画作的外框上掉落，边缘有新鲜断痕。
```

## locations

```text
L1
name：主展厅
icon：🏛️
tag：展区
desc：被盗画作原本挂在这里。

L2
name：修复室
icon：🧰
tag：工作区
desc：存放颜料、工具和未完成修复品的房间。

L3
name：后门走廊
icon：🚪
tag：出入口
desc：通往小巷的狭窄走廊，监控角度很差。
```

## clues

```text
C1. 戴蓝色帽子的人拿着强光手电。
C2. 年轻修复师整晚都待在修复室。
C3. 铜制钥匙出现在后门走廊。
C4. 古董收藏家没有拿强光手电。
C5. 画框碎片不在主展厅。
```

## rules

```text
R1. C1 => S1 与 W2 是同一组。
R2. C2 => S2 与 L2 是同一组。
R3. C3 => W1 与 L3 是同一组。
R4. C4 => S3 与 W2 不是同一组。
R5. C5 => W3 与 L1 不是同一组。
```

说明：

```text
clues 面向玩家展示。
rules 面向 Validator、Solver 和未来 Editor。
一个 clue 可以对应多个 rules。
当前游戏 UI 仍按字符串显示 clues，所以可复制案件文件暂时使用字符串 clues。
```

## fullTruth

```text
S1-W2-L1
S2-W3-L2
S3-W1-L3
```

含义：

```text
值夜班保安 - 强光手电 - 主展厅
年轻修复师 - 画框碎片 - 修复室
古董收藏家 - 铜制钥匙 - 后门走廊
```

## solution

当前案件文件中写入结构化对象：

```js
solution: {
    suspect: "S3",
    weapon: "W1",
    location: "L3"
}
```

含义：

```text
古董收藏家 - 铜制钥匙 - 后门走廊
```

## Validator / Solver 预期结果

这份示例案件的 `rules` 应该能推出唯一解：

```text
status: unique
solutionCount: 1
matchesFullTruth: true
```

如果 Validator 显示多解，说明 rules 不足；如果显示无解或不匹配 `fullTruth`，说明 rules、clues 或 fullTruth 存在矛盾。

## cases/manifest.js 登记方式

新增案件文件后，在 `cases/manifest.js` 中加入案件 id：

```js
window.CLEVERGRID_CASE_MANIFEST = [
    "rainy-museum-theft"
];
```

如果已有其他案件，把 `"rainy-museum-theft"` 加到希望出现的位置即可。

## 可复制案件文件

保存为：

```text
cases/rainy-museum-theft.js
```

内容：

```js
window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["rainy-museum-theft"] = {
    id: "rainy-museum-theft",
    version: 1,
    title: "雨夜美术馆失窃案",
    difficulty: "入门级",
    intro: "暴雨之夜，美术馆最珍贵的一幅画作不翼而飞。监控只拍到一道模糊的身影从后门离开，真正带走画作的人是谁？",
    suspects: [
        { id: 'S1', name: '值夜班保安', icon: '🧢', desc: '负责夜间巡逻，声称整晚都在监控室。', traits: '戴蓝色帽子' },
        { id: 'S2', name: '年轻修复师', icon: '🎨', desc: '负责修复展厅中央的油画，对馆内动线非常熟悉。', traits: '手上有颜料' },
        { id: 'S3', name: '古董收藏家', icon: '🧐', desc: '失窃前一天刚参观过美术馆，对被盗展品表现出浓厚兴趣。', traits: '戴白手套' }
    ],
    weapons: [
        { id: 'W1', name: '铜制钥匙', icon: '🗝️', tag: '钥匙', desc: '可以打开后门的旧钥匙，平时锁在办公室抽屉里。' },
        { id: 'W2', name: '强光手电', icon: '🔦', tag: '工具', desc: '巡逻时使用的手电，灯光非常刺眼。' },
        { id: 'W3', name: '画框碎片', icon: '🖼️', tag: '证物', desc: '从被盗画作的外框上掉落，边缘有新鲜断痕。' }
    ],
    locations: [
        { id: 'L1', name: '主展厅', icon: '🏛️', tag: '展区', desc: '被盗画作原本挂在这里。' },
        { id: 'L2', name: '修复室', icon: '🧰', tag: '工作区', desc: '存放颜料、工具和未完成修复品的房间。' },
        { id: 'L3', name: '后门走廊', icon: '🚪', tag: '出入口', desc: '通往小巷的狭窄走廊，监控角度很差。' }
    ],
    clues: [
        "戴蓝色帽子的人拿着强光手电。",
        "年轻修复师整晚都待在修复室。",
        "铜制钥匙出现在后门走廊。",
        "古董收藏家没有拿强光手电。",
        "画框碎片不在主展厅。"
    ],
    rules: [
        { id: "R1", type: "same", left: "S1", right: "W2", note: "来自 C1" },
        { id: "R2", type: "same", left: "S2", right: "L2", note: "来自 C2" },
        { id: "R3", type: "same", left: "W1", right: "L3", note: "来自 C3" },
        { id: "R4", type: "notSame", left: "S3", right: "W2", note: "来自 C4" },
        { id: "R5", type: "notSame", left: "W3", right: "L1", note: "来自 C5" }
    ],
    solution: {
        suspect: "S3",
        weapon: "W1",
        location: "L3"
    },
    fullTruth: [
        ['S1', 'W2', 'L1'],
        ['S2', 'W3', 'L2'],
        ['S3', 'W1', 'L3']
    ]
};
```

## 使用提醒

复制这个模板新增案件后，请一定打开：

```text
tools/validator.html
```

确认新案件全部通过，再打开游戏首页试玩。
