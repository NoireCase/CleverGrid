window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["qingqing-grassland-trap"] = {
        id: "qingqing-grassland-trap",
        version: 1,
        title: "青青草原陷阱之谜",
        difficulty: "进阶版",
        intro: "有人在青青草原设下了埋伏！村长慢羊羊发现了一个伪装的很好的陷阱，这到底是谁干的？",
        suspects: [
            { id: 'S1', name: '喜羊羊', icon: '⚡', desc: '跑得最快的羊。', traits: '戴着铃铛' },
            { id: 'S2', name: '懒羊羊', icon: '🍰', desc: '除了吃就是睡。', traits: '便便发型' },
            { id: 'S3', name: '灰太狼', icon: '🐺', desc: '青青草原反派。', traits: '戴着破帽子' },
            { id: 'S4', name: '慢羊羊', icon: '🐌', desc: '羊村村长。', traits: '头上有草' }
        ],
        locations: [
            { id: 'L1', name: '狼堡', icon: '🏰', tag: '危险区域', desc: '灰太狼的家。' },
            { id: 'L2', name: '羊村学校', icon: '🏫', tag: '安全区域', desc: '上课的地方。' },
            { id: 'L3', name: '小河边', icon: '🌊', tag: '户外', desc: '钓鱼的地方。' },
            { id: 'L4', name: '实验室', icon: '🧪', tag: '室内', desc: '搞发明的地方。' }
        ],
        weapons: [
            { id: 'W1', name: '平底锅', icon: '🍳', tag: '钝器', desc: '红太狼的专属武器。' },
            { id: 'W2', name: '青草蛋糕', icon: '🍰', tag: '诱饵', desc: '好吃的零食。' },
            { id: 'W3', name: '隐形药水', icon: '💧', tag: '高科技', desc: '能让人消失。' },
            { id: 'W4', name: '捕兽夹', icon: '⚙️', tag: '陷阱', desc: '踩上去很疼。' }
        ],
        clues: [
            "懒羊羊正在吃青草蛋糕。",
            "慢羊羊现在不在实验室。",
            "平底锅没有出现在小河边。",
            "喜羊羊就在实验室里。",
            "拿着隐形药水的人正是喜羊羊。",
            "捕兽夹被安放在了小河边。",
            "灰太狼并没有拿捕兽夹。",
            "在小河边的羊并没有拿平底锅。",
            "慢羊羊要么在小河边，要么在羊村学校。",
            "懒羊羊说狼堡太危险，他没有去那里。"
        ],
        rules: [
            { id: "R1", type: "same", left: "S2", right: "W2", note: "对应线索：懒羊羊正在吃青草蛋糕。" },
            { id: "R2", type: "notSame", left: "S4", right: "L4", note: "对应线索：慢羊羊现在不在实验室。" },
            { id: "R3", type: "notSame", left: "W1", right: "L3", note: "对应线索：平底锅没有出现在小河边。" },
            { id: "R4", type: "same", left: "S1", right: "L4", note: "对应线索：喜羊羊就在实验室里。" },
            { id: "R5", type: "same", left: "W3", right: "S1", note: "对应线索：拿着隐形药水的人正是喜羊羊。" },
            { id: "R6", type: "same", left: "W4", right: "L3", note: "对应线索：捕兽夹被安放在了小河边。" },
            { id: "R7", type: "notSame", left: "S3", right: "W4", note: "对应线索：灰太狼并没有拿捕兽夹。" },
            { id: "R8", type: "notSame", left: "L3", right: "W1", note: "对应线索：在小河边的羊并没有拿平底锅。" },
            { id: "R9", type: "notSame", left: "S2", right: "L1", note: "对应线索：懒羊羊说狼堡太危险，他没有去那里。" }
        ],
        solution: "UzMtVzEtTDE=", // 灰太狼-平底锅-狼堡
        // 补充真相：
        // S1(喜羊羊)-W3(隐形药水)-L4(实验室)
        // S2(懒羊羊)-W2(蛋糕)-L2(学校)
        // S3(灰太狼)-W1(平底锅)-L1(狼堡) [凶手]
        // S4(慢羊羊)-W4(捕兽夹)-L3(小河边)
        fullTruth: [
            ['S1', 'W3', 'L4'],
            ['S2', 'W2', 'L2'],
            ['S3', 'W1', 'L1'],
            ['S4', 'W4', 'L3']
        ]
    };
