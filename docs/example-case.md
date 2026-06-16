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
1. 戴蓝色帽子的人拿着强光手电。
2. 年轻修复师整晚都待在修复室。
3. 铜制钥匙出现在后门走廊。
4. 古董收藏家没有拿强光手电。
5. 被盗画作最后一次被看到是在主展厅。
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

答案原文：

```text
S3-W1-L3
```

当前案件文件中写入 Base64：

```text
UzMtVzEtTDM=
```

含义：

```text
古董收藏家 - 铜制钥匙 - 后门走廊
```

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
        "被盗画作最后一次被看到是在主展厅。"
    ],
    solution: "UzMtVzEtTDM=",
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
