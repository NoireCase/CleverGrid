window.CLEVERGRID_CASE_REGISTRY = window.CLEVERGRID_CASE_REGISTRY || {};
window.CLEVERGRID_CASE_REGISTRY["hollywood-murder"] = {
        id: "hollywood-murder",
        version: 1,
        title: "好莱坞杀人事件",
        difficulty: "入门级",
        intro: "当图威利·洛基克受邀参加好莱坞山庄豪宅的高级晚宴时，他以为自己终于出人头地了。遗憾的是，他并不是主宾：他之所以被邀请，是为了破解主宾遇害的案子。",
        suspects: [
            { id: 'A', name: '神奇的奥瑞林', icon: '🎩', desc: '魔术师，完美地表演了将丈夫锯成两半的魔术。然后，她把他的尸体变没了。', traits: '5英尺6英寸 · 左撇子 · 绿眼睛 · 金发' },
            { id: 'B', name: '米德耐特三世', icon: '🕶️', desc: '电影制片厂创始人的孙子，自称是白手起家。', traits: '5英尺8英寸 · 左撇子 · 深棕色眼睛 · 深棕色头发' },
            { id: 'C', name: '奥比斯迪亚夫人', icon: '👒', desc: '推理小说家，其作品销量超过《圣经》和莎士比亚作品的总和。', traits: '5英尺4英寸 · 左撇子 · 绿眼睛 · 黑发' }
        ],
        locations: [
            { id: 'BATH', name: '巨大的浴室', icon: '🛁', tag: '室内', desc: '比图威利·洛基克的房子还大。' },
            { id: 'BED', name: '卧室', icon: '🛏️', tag: '室内', desc: '一尘不染的白色房间内摆放着一张加州特大号床，床铺尚未整理。' },
            { id: 'THEATER', name: '放映室', icon: '📺', tag: '室内', desc: '红色天鹅绒座椅和爆米花机使这里成为看电影的最佳场所。' }
        ],
        weapons: [
            { id: 'FORK', name: '一把餐叉', icon: '🍴', tag: '轻量级', desc: '您仔细琢磨琢磨，这玩意儿其实比刀可怕得多。' },
            { id: 'PIPE', name: '一根铅管', icon: '💈', tag: '重量级', desc: '铅比铝安全，可是对着您的脑袋来一下就不一定了。' },
            { id: 'CANDLE', name: '有分量的蜡烛', icon: '🕯️', tag: '重量级', desc: '重量足够杀人，不过本职是用来给房间照明的。' }
        ],
        clues: [
            "神奇的奥瑞林信任持有餐叉的嫌疑人。",
            "洛基克赶到时，米德耐特三世还在挥舞铅管。",
            "卧室里没发现颇有分量的蜡烛。",
            "奥比斯迪亚夫人被发现躲在红色天鹅绒座椅下。",
            "尸体是在一个大理石浴缸内被发现的。"
        ],
        rules: [
            { id: "R1", type: "notSame", left: "A", right: "FORK", note: "对应线索：神奇的奥瑞林信任持有餐叉的嫌疑人。" },
            { id: "R2", type: "same", left: "B", right: "PIPE", note: "对应线索：洛基克赶到时，米德耐特三世还在挥舞铅管。" },
            { id: "R3", type: "notSame", left: "CANDLE", right: "BED", note: "对应线索：卧室里没发现颇有分量的蜡烛。" },
            { id: "R4", type: "same", left: "C", right: "THEATER", note: "对应线索：奥比斯迪亚夫人被发现躲在红色天鹅绒座椅下。" }
        ],
        solution: { suspect: "A", weapon: "CANDLE", location: "BATH" },
        // 补充真相：A(奥瑞林)-CANDLE-BATH, B(米德耐特)-PIPE-BED, C(奥比斯迪亚)-FORK-THEATER
        fullTruth: [
            ['A', 'CANDLE', 'BATH'],
            ['B', 'PIPE', 'BED'],
            ['C', 'FORK', 'THEATER']
        ]
    };
