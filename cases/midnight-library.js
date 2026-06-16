window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["midnight-library"] = {
        id: "midnight-library",
        version: 1,
        title: "深夜图书馆之谜",
        difficulty: "中级",
        intro: "市图书馆的管理员在闭馆后听到了一声惨叫。一本珍贵的古籍不见了，地上留下了一滩墨水。谁是那个深夜潜入的破坏者？",
        suspects: [
            { id: 'S1', name: '暴躁的管理员', icon: '👴', desc: '在这个图书馆工作了40年，讨厌任何发出声音的人。', traits: '右撇子 · 戴眼镜 · 驼背' },
            { id: 'S2', name: '历史系学生', icon: '🎓', desc: '为了写论文已经连续三天泡在图书馆了，看起来精神恍惚。', traits: '左撇子 · 黑眼圈 · 总是背着书包' },
            { id: 'S3', name: '神秘的收藏家', icon: '🧐', desc: '无论去哪里都带着白手套，对古书有种病态的痴迷。', traits: '右撇子 · 穿风衣 · 拄拐杖' }
        ],
        locations: [
            { id: 'L1', name: '珍本藏书室', icon: '📚', tag: '上锁区域', desc: '平时大门紧锁，只有特定的钥匙才能打开。' },
            { id: 'L2', name: '阅览大厅', icon: '🏛️', tag: '公共区域', desc: '巨大的穹顶下排列着数百张桌子，回声很大。' },
            { id: 'L3', name: '地下档案库', icon: '🗄️', tag: '限制区域', desc: '空气中弥漫着发霉的纸张味道，灯光昏暗。' }
        ],
        weapons: [
            { id: 'W1', name: '沉重的字典', icon: '📕', tag: '钝器', desc: '知识就是力量，物理意义上的力量。' },
            { id: 'W2', name: '拆信刀', icon: '🗡️', tag: '利器', desc: '锋利无比，通常用来裁开信封，或者是别的什么。' },
            { id: 'W3', name: '古董台灯', icon: '🛋️', tag: '钝器', desc: '底座是纯铜铸造的，非常压手。' }
        ],
        clues: [
            "历史系学生从来不去地下档案库，因为怕鬼。",
            "暴躁的管理员手里拿着那把拆信刀。",
            "被盗古籍的展示柜是被锋利的利器撬开的。",
            "拿着沉重字典的人正是收藏家。",
            "有人在珍本藏书室看到了那个戴眼镜的人。"
        ],
        rules: [
            { id: "R1", type: "notSame", left: "S2", right: "L3", note: "对应线索：历史系学生从来不去地下档案库，因为怕鬼。" },
            { id: "R2", type: "same", left: "S1", right: "W2", note: "对应线索：暴躁的管理员手里拿着那把拆信刀。" },
            { id: "R3", type: "same", left: "W1", right: "S3", note: "对应线索：拿着沉重字典的人正是收藏家。" },
            { id: "R4", type: "same", left: "S1", right: "L1", note: "对应线索：有人在珍本藏书室看到了那个戴眼镜的人。" }
        ],
        solution: "UzEtVzItTDE=",
        // 补充真相：S1(管理员)-W2(拆信刀)-L1(珍本室)[凶手], S2(学生)-W3(台灯)-L2(阅览室), S3(收藏家)-W1(字典)-L3(档案库)
        fullTruth: [
            ['S1', 'W2', 'L1'],
            ['S2', 'W3', 'L2'],
            ['S3', 'W1', 'L3']
        ]
    };
