(function (global) {
    function hasText(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function parseSolution(solution) {
        if (solution && typeof solution === 'object' && !Array.isArray(solution)) {
            const parts = [solution.suspect, solution.weapon, solution.location];
            const hasAllParts = parts.every(hasText);
            const text = hasAllParts ? parts.join('-') : '';
            return {
                ok: hasAllParts,
                parts: hasAllParts ? parts : [],
                text,
                format: 'object',
                error: hasAllParts ? '' : 'solution 对象必须包含 suspect、weapon、location'
            };
        }

        if (!hasText(solution)) {
            return { ok: false, parts: [], text: '', error: 'solution 不存在' };
        }

        try {
            const text = atob(solution);
            const parts = text.split('-');
            return {
                ok: parts.length === 3,
                parts,
                text,
                format: 'base64',
                error: parts.length === 3 ? '' : 'solution 解码后不是三段 ID'
            };
        } catch (error) {
            return { ok: false, parts: [], text: '', error: 'solution 不是有效的 Base64' };
        }
    }

    function decodeSolution(solution) {
        return parseSolution(solution);
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

    function makeWarning(label, detail) {
        return { level: 'warning', label, detail: detail || '' };
    }

    function getItemCategory(id, suspectIds, weaponIds, locationIds) {
        if (suspectIds.has(id)) return 'suspects';
        if (weaponIds.has(id)) return 'weapons';
        if (locationIds.has(id)) return 'locations';
        return '';
    }

    function collectClueIds(clues) {
        return new Set(clues
            .map(clue => clue && typeof clue === 'object' ? clue.id : '')
            .filter(Boolean));
    }

    function idsShareTruthRow(left, right, fullTruth) {
        return fullTruth.some(row => Array.isArray(row) && row.includes(left) && row.includes(right));
    }

    function solutionMatchesFullTruth(solutionRows, fullTruth) {
        if (!Array.isArray(solutionRows) || !Array.isArray(fullTruth) || solutionRows.length !== fullTruth.length) {
            return false;
        }

        const expected = new Set(fullTruth
            .filter(row => Array.isArray(row) && row.length === 3)
            .map(row => row.join('|')));
        const actual = new Set(solutionRows.map(row => [row.suspect, row.weapon, row.location].join('|')));

        if (expected.size !== actual.size) return false;
        return Array.from(expected).every(rowKey => actual.has(rowKey));
    }

    function makeSkippedSolverResult(detail) {
        return {
            status: 'skipped',
            solutionCount: 0,
            matchesFullTruth: false,
            detail,
            errors: [],
            warnings: []
        };
    }

    function validateSolver(item, fullTruth) {
        if (!global.CleverGridSolver || typeof global.CleverGridSolver.solveCase !== 'function') {
            return {
                solverResult: makeSkippedSolverResult('未加载 src/solver.js'),
                checks: [],
                warnings: [makeWarning('Solver 是否已加载', '未加载 src/solver.js，无法进行唯一解校验。')]
            };
        }

        const result = global.CleverGridSolver.solveCase(item);
        const checks = [];
        const warnings = [];
        const statusText = {
            unique: '唯一解',
            multiple: '多解',
            none: '无解',
            invalid: '输入无效'
        }[result.status] || result.status;

        checks.push(makeCheck(result.status !== 'invalid', 'Solver 输入是否有效', result.errors.length ? result.errors.join('；') : statusText));
        checks.push(makeCheck(result.status !== 'none', 'Solver 是否有解', statusText));

        if (result.status === 'multiple') {
            warnings.push(makeWarning('Solver 是否唯一解', `当前 rules 可推出多个解，已找到 ${result.solutionCount} 个样例。`));
        } else {
            checks.push(makeCheck(result.status === 'unique', 'Solver 是否唯一解', statusText));
        }

        const matchesFullTruth = result.status === 'unique'
            && solutionMatchesFullTruth(result.solutions[0], fullTruth);

        if (result.status === 'unique') {
            checks.push(makeCheck(matchesFullTruth, 'Solver 唯一解是否匹配 fullTruth', matchesFullTruth ? '完全一致' : 'Solver 唯一解与 fullTruth 不一致'));
        }

        return {
            solverResult: {
                status: result.status,
                solutionCount: result.solutionCount,
                matchesFullTruth,
                detail: statusText,
                errors: result.errors,
                warnings: result.warnings
            },
            checks,
            warnings
        };
    }

    function validateRules(item, context) {
        const warnings = [];
        const checks = [];
        const rulesExists = Object.prototype.hasOwnProperty.call(item || {}, 'rules');

        if (!rulesExists) {
            warnings.push(makeWarning('rules 是否存在', '当前案件尚未配置 rules，无法进行推理唯一性校验。'));
            return { checks, warnings, count: 0 };
        }

        const rules = item.rules;
        checks.push(makeCheck(Array.isArray(rules), 'rules 是否为数组', Array.isArray(rules) ? `${rules.length} 条 rules` : 'rules 必须是数组'));

        if (!Array.isArray(rules)) {
            return { checks, warnings, count: 0 };
        }

        const ruleIds = rules.map(rule => rule && rule.id).filter(Boolean);
        const duplicateRuleIds = findDuplicates(ruleIds);
        const allowedTypes = new Set(['same', 'notSame']);
        const objectIds = new Set([
            ...context.suspectIds,
            ...context.weaponIds,
            ...context.locationIds
        ]);
        const clueIds = collectClueIds(context.clues);

        checks.push(makeCheck(rules.every(rule => hasText(rule && rule.id)), 'rule id 是否存在', `${ruleIds.length} / ${rules.length}`));
        checks.push(makeCheck(duplicateRuleIds.length === 0, 'rule id 是否重复', duplicateRuleIds.length ? duplicateRuleIds.join(', ') : '未重复'));

        rules.forEach((rule, ruleIndex) => {
            const labelPrefix = hasText(rule && rule.id) ? rule.id : `第 ${ruleIndex + 1} 条 rule`;
            const left = rule && rule.left;
            const right = rule && rule.right;
            const leftCategory = getItemCategory(left, context.suspectIds, context.weaponIds, context.locationIds);
            const rightCategory = getItemCategory(right, context.suspectIds, context.weaponIds, context.locationIds);
            const hasValidType = allowedTypes.has(rule && rule.type);
            const hasValidLeft = objectIds.has(left);
            const hasValidRight = objectIds.has(right);
            const hasDifferentCategories = hasValidLeft && hasValidRight && leftCategory !== rightCategory;
            const hasSourceClueId = hasText(rule && rule.sourceClueId);
            const hasRuleContext = hasValidType && hasDifferentCategories && context.fullTruthRowsValid;
            const sameTruthRow = hasRuleContext ? idsShareTruthRow(left, right, context.fullTruth) : false;
            const truthOk = !hasRuleContext || (rule.type === 'same' ? sameTruthRow : !sameTruthRow);

            checks.push(makeCheck(hasValidType, `${labelPrefix} type 是否合法`, hasValidType ? rule.type : '只允许 same / notSame'));
            checks.push(makeCheck(hasValidLeft, `${labelPrefix} left 是否存在`, left || '缺少 left'));
            checks.push(makeCheck(hasValidRight, `${labelPrefix} right 是否存在`, right || '缺少 right'));
            checks.push(makeCheck(hasDifferentCategories, `${labelPrefix} left/right 是否跨分类`, hasDifferentCategories ? `${leftCategory} / ${rightCategory}` : 'left 和 right 不能来自同一分类'));
            checks.push(makeCheck(!hasSourceClueId || clueIds.has(rule.sourceClueId), `${labelPrefix} sourceClueId 是否存在`, hasSourceClueId ? rule.sourceClueId : '未填写，可选'));
            checks.push(makeCheck(truthOk, `${labelPrefix} 是否与 fullTruth 一致`, hasRuleContext ? `${rule.type}: ${left} / ${right}` : '等待基础字段通过后校验'));
        });

        return { checks, warnings, count: rules.length };
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
        const decoded = parseSolution(item && item.solution);
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
        const rulesResult = validateRules(item, {
            clues,
            fullTruth,
            fullTruthRowsValid,
            suspectIds,
            weaponIds,
            locationIds
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
            makeCheck(decoded.ok, 'solution 是否可解析为三段 ID', decoded.ok ? decoded.text : decoded.error),
            makeCheck(decoded.ok && suspectIds.has(solutionSuspect), 'solution 嫌疑人是否存在', solutionSuspect || '无'),
            makeCheck(decoded.ok && weaponIds.has(solutionWeapon), 'solution 凶器是否存在', solutionWeapon || '无'),
            makeCheck(decoded.ok && locationIds.has(solutionLocation), 'solution 地点是否存在', solutionLocation || '无'),
            makeCheck(fullTruth.length > 0 && suspects.every(s => fullTruthSuspects.has(s.id)), 'fullTruth 是否覆盖所有嫌疑人', `${fullTruthSuspects.size} / ${suspects.length}`),
            makeCheck(fullTruth.length > 0 && fullTruthRowsValid, 'fullTruth 每行 ID 是否有效', `${fullTruth.length} 行`),
            makeCheck(fullTruthComplete, 'fullTruth 是否完整', `${fullTruth.length} / ${suspects.length} 行`),
            makeCheck(solutionInFullTruth, 'solution 是否对应到 fullTruth', decoded.ok ? decoded.text : decoded.error),
            makeCheck(clues.length > 0, 'clue 数量是否大于 0', `${clues.length} 条线索`),
            ...rulesResult.checks
        ];
        const solverValidation = checks.every(check => check.ok)
            ? validateSolver(item, fullTruth)
            : {
                solverResult: makeSkippedSolverResult('基础结构或 rules 存在错误，已跳过 Solver。'),
                checks: [],
                warnings: []
            };
        const allChecks = [
            ...checks,
            ...solverValidation.checks
        ];
        const allWarnings = [
            ...rulesResult.warnings,
            ...solverValidation.warnings
        ];

        return {
            index,
            title: hasText(item && item.title) ? item.title : `未命名案件 ${index + 1}`,
            difficulty: hasText(item && item.difficulty) ? item.difficulty : '未设置难度',
            counts: {
                suspects: suspects.length,
                weapons: weapons.length,
                locations: locations.length,
                clues: clues.length,
                rules: rulesResult.count
            },
            checks: allChecks,
            warnings: allWarnings,
            solver: solverValidation.solverResult,
            ok: allChecks.every(check => check.ok)
        };
    }

    global.CleverGridValidator = {
        hasText,
        parseSolution,
        decodeSolution,
        collectIds,
        findDuplicates,
        validateRules,
        validateSolver,
        validateCase
    };
})(globalThis);
