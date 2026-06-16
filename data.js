// 这里按 manifest 顺序组装所有案件数据。
// 每个案件对象维护在 cases/*.js 中，data.js 继续提供 GAME_DATA 给游戏和工具使用。
(function (global) {
    function getCaseId(entry) {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object' && entry.id) return entry.id;
        throw new Error('案件 manifest 条目缺少 id');
    }

    function buildGameData() {
        const manifest = global.CLEVERGRID_CASE_MANIFEST || [];
        const registry = global.CLEVERGRID_CASE_REGISTRY || {};

        return manifest.map(entry => {
            const caseId = getCaseId(entry);
            const item = registry[caseId];
            if (!item) {
                throw new Error(`案件未注册：${caseId}`);
            }
            return item;
        });
    }

    function install() {
        global.GAME_DATA = buildGameData();
        return global.GAME_DATA;
    }

    global.CleverGridData = {
        buildGameData,
        install
    };
})(globalThis);
