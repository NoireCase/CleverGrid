// Deprecated legacy data bridge.
// Kept only for tools/migrate-cases.html and old cases/*.js migration reference.
// Do not add new cases here. The source of truth is case-index.json + cases/*.json.
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
