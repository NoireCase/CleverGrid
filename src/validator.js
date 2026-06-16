(function (global) {
    function hasText(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function decodeSolution(solution) {
        if (!hasText(solution)) {
            return { ok: false, parts: [], text: '', error: 'solution 不存在' };
        }

        try {
            const text = atob(solution);
            const parts = text.split('-');
            return { ok: parts.length === 3, parts, text, error: parts.length === 3 ? '' : 'solution 解码后不是三段 ID' };
        } catch (error) {
            return { ok: false, parts: [], text: '', error: 'solution 不是有效的 Base64' };
        }
    }

    function collectIds(items) {
        return new Set((Array.isArray(items) ? items : []).map(item => item && item.id).filter(Boolean));
    }

    function findDuplicates(values) {
        const seen = new Set();
        const duplicates = new Set();

        values.filter(Boolean).forEach(value => {
            if (seen.has(value)) duplicates.add(value);
            seen.add(value);
        });

        return Array.from(duplicates);
    }

    function collectItemIds(items) {
        return (Array.isArray(items) ? items : []).map(item => item && item.id).filter(Boolean);
    }

    function makeCheck(ok, label, detail) {
        return { ok, label, detail: detail || '' };
    }

    function validateCase(item, index, allCases) {
        const suspects = Array.isArray(item && item.suspects) ? item.suspects : [];
        const weapons = Array.isArray(item && item.weapons) ? item.weapons : [];
        const locations = Array.isArray(item && item.locations) ? item.locations : [];
        const clues = Array.isArray(item && item.clues) ? item.clues : [];
        const fullTruth = Array.isArray(item && item.fullTruth) ? item.fullTruth : [];
        const allCaseIds = Array.isArray(allCases) ? allCases.map(caseItem => caseItem && caseItem.id).filter(Boolean) : [];
        const duplicateCaseIds = findDuplicates(allCaseIds);
        const suspectDuplicates = findDuplicates(collectItemIds(suspects));
        const weaponDuplicates = findDuplicates(collectItemIds(weapons));
        const locationDuplicates = findDuplicates(collectItemIds(locations));

        const suspectIds = collectIds(suspects);
        const weaponIds = collectIds(weapons);
        const locationIds = collectIds(locations);
        const decoded = decodeSolution(item && item.solution);
        const [solutionSuspect, solutionWeapon, solutionLocation] = decoded.parts;
        const fullTruthSuspects = new Set(fullTruth.map(row => Array.isArray(row) ? row[0] : null).filter(Boolean));
        const fullTruthWeapons = new Set(fullTruth.map(row => Array.isArray(row) ? row[1] : null).filter(Boolean));
        const fullTruthLocations = new Set(fullTruth.map(row => Array.isArray(row) ? row[2] : null).filter(Boolean));
        const fullTruthRowsValid = fullTruth.every(row => {
            if (!Array.isArray(row) || row.length !== 3) return false;
            return suspectIds.has(row[0]) && weaponIds.has(row[1]) && locationIds.has(row[2]);
        });
        const fullTruthComplete = fullTruth.length === suspects.length
            && suspects.every(s => fullTruthSuspects.has(s.id))
            && weapons.every(w => fullTruthWeapons.has(w.id))
            && locations.every(l => fullTruthLocations.has(l.id));
        const solutionInFullTruth = decoded.ok && fullTruth.some(row => {
            if (!Array.isArray(row) || row.length !== 3) return false;
            return row[0] === solutionSuspect && row[1] === solutionWeapon && row[2] === solutionLocation;
        });

        const checks = [
            makeCheck(hasText(item && item.id), 'case id 是否存在', hasText(item && item.id) ? item.id : '缺少 id'),
            makeCheck(hasText(item && item.id) && !duplicateCaseIds.includes(item.id), 'case id 是否重复', duplicateCaseIds.includes(item && item.id) ? item.id : '未重复'),
            makeCheck(item && item.version !== undefined && item.version !== null && String(item.version).trim().length > 0, 'version 是否存在', item && item.version !== undefined ? `version ${item.version}` : '缺少 version'),
            makeCheck(hasText(item && item.title), 'title 是否存在', hasText(item && item.title) ? item.title : '缺少 title'),
            makeCheck(suspects.length > 0, 'suspects 是否为空', `${suspects.length} 个嫌疑人`),
            makeCheck(weapons.length > 0, 'weapons 是否为空', `${weapons.length} 个凶器`),
            makeCheck(locations.length > 0, 'locations 是否为空', `${locations.length} 个地点`),
            makeCheck(suspects.length > 0 && suspects.every(s => hasText(s.id)), 'suspects id 是否存在', `${suspects.length} 个嫌疑人`),
            makeCheck(weapons.length > 0 && weapons.every(w => hasText(w.id)), 'weapons id 是否存在', `${weapons.length} 个凶器`),
            makeCheck(locations.length > 0 && locations.every(l => hasText(l.id)), 'locations id 是否存在', `${locations.length} 个地点`),
            makeCheck(suspectDuplicates.length === 0, 'suspects id 是否重复', suspectDuplicates.length ? suspectDuplicates.join(', ') : '未重复'),
            makeCheck(weaponDuplicates.length === 0, 'weapons id 是否重复', weaponDuplicates.length ? weaponDuplicates.join(', ') : '未重复'),
            makeCheck(locationDuplicates.length === 0, 'locations id 是否重复', locationDuplicates.length ? locationDuplicates.join(', ') : '未重复'),
            makeCheck(suspects.length === weapons.length && weapons.length === locations.length && suspects.length > 0, '三类对象数量是否一致', `${suspects.length} / ${weapons.length} / ${locations.length}`),
            makeCheck(decoded.ok, 'solution 是否可解码为三段 ID', decoded.ok ? decoded.text : decoded.error),
            makeCheck(decoded.ok && suspectIds.has(solutionSuspect), 'solution 嫌疑人是否存在', solutionSuspect || '无'),
            makeCheck(decoded.ok && weaponIds.has(solutionWeapon), 'solution 凶器是否存在', solutionWeapon || '无'),
            makeCheck(decoded.ok && locationIds.has(solutionLocation), 'solution 地点是否存在', solutionLocation || '无'),
            makeCheck(fullTruth.length > 0 && suspects.every(s => fullTruthSuspects.has(s.id)), 'fullTruth 是否覆盖所有嫌疑人', `${fullTruthSuspects.size} / ${suspects.length}`),
            makeCheck(fullTruth.length > 0 && fullTruthRowsValid, 'fullTruth 每行 ID 是否有效', `${fullTruth.length} 行`),
            makeCheck(fullTruthComplete, 'fullTruth 是否完整', `${fullTruth.length} / ${suspects.length} 行`),
            makeCheck(solutionInFullTruth, 'solution 是否对应到 fullTruth', decoded.ok ? decoded.text : decoded.error),
            makeCheck(clues.length > 0, 'clue 数量是否大于 0', `${clues.length} 条线索`)
        ];

        return {
            index,
            title: hasText(item && item.title) ? item.title : `未命名案件 ${index + 1}`,
            difficulty: hasText(item && item.difficulty) ? item.difficulty : '未设置难度',
            counts: {
                suspects: suspects.length,
                weapons: weapons.length,
                locations: locations.length,
                clues: clues.length
            },
            checks,
            ok: checks.every(check => check.ok)
        };
    }

    global.CleverGridValidator = {
        hasText,
        decodeSolution,
        collectIds,
        findDuplicates,
        validateCase
    };
})(globalThis);
