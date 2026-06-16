window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["inui-juice-poisoning"] = {
        id: "inui-juice-poisoning",
        version: 1,
        title: "乾汁中毒事件",
        difficulty: "进阶版",
        intro: "网球部的正选队员喝下了恐怖的“乾汁”后倒地不起。这杯生化武器到底是谁在这个地点递给他的？",
        suspects: [
            { id: 'S1', name: '越前龙马', icon: '🧢', desc: '口头禅是“还差得远呢”。', traits: '白色帽子' },
            { id: 'S2', name: '手冢国光', icon: '👓', desc: '青学网球部部长。', traits: '严肃 · 眼镜' },
            { id: 'S3', name: '乾贞治', icon: '📊', desc: '数据网球高手。', traits: '反光眼镜' },
            { id: 'S4', name: '不二周助', icon: '🌵', desc: '被称为天才。', traits: '总是眯眯眼' }
        ],
        locations: [
            { id: 'L1', name: '网球场', icon: '🎾', tag: '比赛区', desc: '挥洒汗水的地方。' },
            { id: 'L2', name: '社办', icon: '🚪', tag: '休息区', desc: '存放资料的地方。' },
            { id: 'L3', name: '更衣室', icon: '👕', tag: '室内', desc: '大家换衣服的地方。' },
            { id: 'L4', name: '天台', icon: '☁️', tag: '室外', desc: '适合午睡。' }
        ],
        weapons: [
            { id: 'W1', name: '红色球拍', icon: '🟥', tag: '球具', desc: '一只红色的备用球拍。' },
            { id: 'W2', name: '蓝色球拍', icon: '🟦', tag: '球具', desc: '一只蓝色的主力球拍。' },
            { id: 'W3', name: '绷带', icon: '🤕', tag: '医疗', desc: '用来保护手肘。' },
            { id: 'W4', name: '特制乾汁', icon: '🍵', tag: '生化武器', desc: '绿色的粘稠液体。' }
        ],
        clues: [
            "越前龙马正在天台休息。",
            "拿特制乾汁的人不是越前龙马。",
            "不二周助绝对不在网球场。",
            "蓝色球拍被遗忘在了网球场。",
            "手冢国光使用的是蓝色球拍。",
            "拿着绷带的人正在更衣室里。",
            "乾贞治手里拿的不是红色球拍。",
            "待在社办里的人不是不二周助。",
            "特制乾汁要么在不二周助手里，要么就在社办里（只能是其中一种情况）。"
        ],
        solution: "UzMtVzQtTDI=", // 乾贞治-乾汁-社办
        // 补充真相：
        // S1(龙马)-W1(红球拍)-L4(天台)
        // S2(手冢)-W2(蓝球拍)-L1(网球场)
        // S3(乾)-W4(乾汁)-L2(社办) [凶手]
        // S4(不二)-W3(绷带)-L3(更衣室)
        fullTruth: [
            ['S1', 'W1', 'L4'],
            ['S2', 'W2', 'L1'],
            ['S3', 'W4', 'L2'],
            ['S4', 'W3', 'L3']
        ]
    };
