(function (global) {
    const DIFFICULTY_LABELS = {
        easy: '入门级',
        medium: '中级',
        hard: '进阶版',
        expert: '专家级'
    };
    const LEGACY_DIFFICULTY_VALUES = {
        '入门级': 'easy',
        '中级': 'medium',
        '进阶版': 'hard',
        '专家级': 'expert'
    };
    const STANDARD_DIFFICULTIES = new Set(Object.keys(DIFFICULTY_LABELS));

    function hasText(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function isStandardDifficulty(value) {
        return STANDARD_DIFFICULTIES.has(value);
    }

    function isLegacyDifficulty(value) {
        return Object.prototype.hasOwnProperty.call(LEGACY_DIFFICULTY_VALUES, value);
    }

    function formatDifficulty(value) {
        return DIFFICULTY_LABELS[value] || DIFFICULTY_LABELS[LEGACY_DIFFICULTY_VALUES[value]] || value || '';
    }

    function normalizeDifficulty(value) {
        if (isLegacyDifficulty(value)) return LEGACY_DIFFICULTY_VALUES[value];
        return value || '';
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

    function isPlainObject(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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
        const difficultyValue = item && item.difficulty;
        const difficultyExists = hasText(difficultyValue);
        const difficultyStandard = isStandardDifficulty(difficultyValue);
        const difficultyLegacy = isLegacyDifficulty(difficultyValue);

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
            makeCheck(difficultyExists, 'difficulty 是否存在', difficultyExists ? difficultyValue : '缺少 difficulty'),
            makeCheck(difficultyExists && (difficultyStandard || difficultyLegacy), 'difficulty 是否为标准枚举', difficultyStandard ? `${difficultyValue} / ${formatDifficulty(difficultyValue)}` : (difficultyLegacy ? `${difficultyValue} / 建议迁移为 ${LEGACY_DIFFICULTY_VALUES[difficultyValue]}` : '只允许 easy / medium / hard / expert')),
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

        if (difficultyLegacy) {
            allWarnings.unshift(makeWarning('difficulty 使用旧版中文文案', `检测到旧版 difficulty 文案：${difficultyValue}，建议迁移为 ${LEGACY_DIFFICULTY_VALUES[difficultyValue]}。`));
        }

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

    function collectStructuredClueRefs(value, refs) {
        if (Array.isArray(value)) {
            value.forEach(item => collectStructuredClueRefs(item, refs));
            return;
        }

        if (isPlainObject(value)) {
            Object.keys(value).forEach(key => {
                if (['id', 'text', 'note', 'desc', 'description'].includes(key)) return;
                if (['entityId', 'entityIds', 'left', 'right', 'suspect', 'weapon', 'location', 'references', 'refs'].includes(key)) {
                    collectStructuredClueRefs(value[key], refs);
                }
            });
            return;
        }

        if (hasText(value)) {
            refs.push(value.trim());
        }
    }

    function collectTextClueRefs(text, knownIds) {
        if (!hasText(text)) return [];

        const refs = [];
        const tokens = text.match(/[A-Za-z][A-Za-z0-9_-]*/g) || [];
        tokens.forEach(token => {
            if (knownIds.has(token) || /^[SWL]\d+$/i.test(token)) {
                refs.push(token);
            }
        });
        return refs;
    }

    function formatDuplicateMessage(label, duplicates) {
        return duplicates.length ? `${label} 中存在重复 id: ${duplicates.join(', ')}` : '';
    }

    function validateUploadedCase(item) {
        const errors = [];
        const warnings = [];

        if (!isPlainObject(item)) {
            return {
                ok: false,
                errors: ['案件 JSON 必须是一个对象。'],
                warnings
            };
        }

        const requiredTextFields = ['title', 'difficulty'];
        requiredTextFields.forEach(field => {
            if (!hasText(item[field])) errors.push(`${field} 是否存在：缺少 ${field}`);
        });

        if (hasText(item.difficulty)) {
            if (isLegacyDifficulty(item.difficulty)) {
                warnings.push(`检测到旧版 difficulty 文案：${item.difficulty}，建议迁移为标准枚举：${LEGACY_DIFFICULTY_VALUES[item.difficulty]}。`);
            } else if (!isStandardDifficulty(item.difficulty)) {
                errors.push(`difficulty 必须是 easy / medium / hard / expert：${item.difficulty}`);
            }
        }

        const suspects = item.suspects;
        const weapons = item.weapons;
        const locations = item.locations;
        const clues = item.clues;
        const fullTruth = item.fullTruth;

        [
            ['suspects', suspects],
            ['weapons', weapons],
            ['locations', locations],
            ['clues', clues],
            ['fullTruth', fullTruth]
        ].forEach(([field, value]) => {
            if (!Array.isArray(value)) errors.push(`${field} 是否存在且为数组`);
        });

        if (!Object.prototype.hasOwnProperty.call(item, 'solution')) {
            errors.push('solution 是否存在：缺少 solution');
        } else if (Array.isArray(item.solution)) {
            errors.push('当前案件使用旧版 solution 数组格式，请迁移为对象格式。');
        } else if (!isPlainObject(item.solution)) {
            errors.push('solution 必须使用对象格式：{ suspect, weapon, location }');
        }

        const safeSuspects = Array.isArray(suspects) ? suspects : [];
        const safeWeapons = Array.isArray(weapons) ? weapons : [];
        const safeLocations = Array.isArray(locations) ? locations : [];
        const safeClues = Array.isArray(clues) ? clues : [];
        const safeFullTruth = Array.isArray(fullTruth) ? fullTruth : [];

        if (safeSuspects.length > 0 || safeWeapons.length > 0 || safeLocations.length > 0) {
            if (!(safeSuspects.length === safeWeapons.length && safeWeapons.length === safeLocations.length)) {
                errors.push(`suspects / weapons / locations 数量不一致：${safeSuspects.length} / ${safeWeapons.length} / ${safeLocations.length}`);
            }
        }

        [
            ['suspects', safeSuspects],
            ['weapons', safeWeapons],
            ['locations', safeLocations]
        ].forEach(([field, items]) => {
            items.forEach((entry, index) => {
                if (!isPlainObject(entry)) {
                    errors.push(`${field}[${index}] 必须是对象`);
                    return;
                }
                if (!hasText(entry.id)) errors.push(`${field}[${index}] 缺少 id`);
                if (!hasText(entry.name)) errors.push(`${field}[${index}] 缺少 name`);
            });

            const duplicates = findDuplicates(collectItemIds(items));
            const message = formatDuplicateMessage(field, duplicates);
            if (message) errors.push(message);
        });

        const suspectIds = collectIds(safeSuspects);
        const weaponIds = collectIds(safeWeapons);
        const locationIds = collectIds(safeLocations);
        const knownIds = new Set([...suspectIds, ...weaponIds, ...locationIds]);
        const idCategories = new Map();
        [
            ['suspects', safeSuspects],
            ['weapons', safeWeapons],
            ['locations', safeLocations]
        ].forEach(([category, items]) => {
            collectItemIds(items).forEach(id => {
                if (!idCategories.has(id)) idCategories.set(id, new Set());
                idCategories.get(id).add(category);
            });
        });
        const duplicateKnownIds = Array.from(idCategories.entries())
            .filter(([, categories]) => categories.size > 1)
            .map(([id]) => id);

        if (duplicateKnownIds.length) {
            errors.push(`实体中存在跨分类重复 id: ${duplicateKnownIds.join(', ')}`);
        }

        if (isPlainObject(item.solution)) {
            const solution = item.solution;
            if (!hasText(solution.suspect)) {
                errors.push('solution.suspect 缺少值');
            } else if (!suspectIds.has(solution.suspect)) {
                errors.push(`solution.suspect 引用了不存在的 suspect: ${solution.suspect}`);
            }

            if (!hasText(solution.weapon)) {
                errors.push('solution.weapon 缺少值');
            } else if (!weaponIds.has(solution.weapon)) {
                errors.push(`solution.weapon 引用了不存在的 weapon: ${solution.weapon}`);
            }

            if (!hasText(solution.location)) {
                errors.push('solution.location 缺少值');
            } else if (!locationIds.has(solution.location)) {
                errors.push(`solution.location 引用了不存在的 location: ${solution.location}`);
            }
        }

        const fullTruthSuspects = new Set();
        const fullTruthWeapons = new Set();
        const fullTruthLocations = new Set();
        safeFullTruth.forEach((row, index) => {
            if (!Array.isArray(row) || row.length !== 3) {
                errors.push(`fullTruth[${index}] 必须是 [suspect, weapon, location]`);
                return;
            }
            const [suspect, weapon, location] = row;
            fullTruthSuspects.add(suspect);
            fullTruthWeapons.add(weapon);
            fullTruthLocations.add(location);
            if (!suspectIds.has(suspect)) errors.push(`fullTruth[${index}] suspect 不存在: ${suspect}`);
            if (!weaponIds.has(weapon)) errors.push(`fullTruth[${index}] weapon 不存在: ${weapon}`);
            if (!locationIds.has(location)) errors.push(`fullTruth[${index}] location 不存在: ${location}`);
        });

        if (safeFullTruth.length !== safeSuspects.length) {
            errors.push(`fullTruth 行数应等于 suspects 数量：${safeFullTruth.length} / ${safeSuspects.length}`);
        }

        safeSuspects.forEach(suspect => {
            if (suspect && suspect.id && !fullTruthSuspects.has(suspect.id)) errors.push(`fullTruth 缺少 suspect: ${suspect.id}`);
        });
        safeWeapons.forEach(weapon => {
            if (weapon && weapon.id && !fullTruthWeapons.has(weapon.id)) errors.push(`fullTruth 缺少 weapon: ${weapon.id}`);
        });
        safeLocations.forEach(location => {
            if (location && location.id && !fullTruthLocations.has(location.id)) errors.push(`fullTruth 缺少 location: ${location.id}`);
        });

        if (isPlainObject(item.solution) && safeFullTruth.length) {
            const solutionInFullTruth = safeFullTruth.some(row => {
                return Array.isArray(row)
                    && row[0] === item.solution.suspect
                    && row[1] === item.solution.weapon
                    && row[2] === item.solution.location;
            });
            if (!solutionInFullTruth) {
                errors.push('solution 未对应到 fullTruth 中的任意一行');
            }
        }

        safeClues.forEach((clue, index) => {
            const refs = [];
            if (isPlainObject(clue) || Array.isArray(clue)) {
                collectStructuredClueRefs(clue, refs);
                if (isPlainObject(clue) && hasText(clue.text)) {
                    refs.push(...collectTextClueRefs(clue.text, knownIds));
                }
            } else if (hasText(clue)) {
                refs.push(...collectTextClueRefs(clue, knownIds));
            }

            refs.forEach(ref => {
                if (!knownIds.has(ref)) {
                    errors.push(`clue[${index}] 引用了不存在的 entity id: ${ref}`);
                }
            });
        });

        if (Array.isArray(item.rules)) {
            const ruleResult = validateUploadedRules(item.rules, knownIds);
            errors.push(...ruleResult.errors);
        }

        return {
            ok: errors.length === 0,
            errors,
            warnings
        };
    }

    function validateUploadedRules(rules, knownIds) {
        const errors = [];
        const allowedTypes = new Set(['same', 'notSame']);
        const ruleIds = rules.map(rule => rule && rule.id).filter(Boolean);
        const duplicateRuleIds = findDuplicates(ruleIds);

        if (duplicateRuleIds.length) {
            errors.push(`rules 中存在重复 id: ${duplicateRuleIds.join(', ')}`);
        }

        rules.forEach((rule, index) => {
            if (!isPlainObject(rule)) {
                errors.push(`rules[${index}] 必须是对象`);
                return;
            }
            if (!hasText(rule.id)) errors.push(`rules[${index}] 缺少 id`);
            if (!allowedTypes.has(rule.type)) errors.push(`rules[${index}] type 必须是 same 或 notSame`);
            if (!hasText(rule.left)) errors.push(`rules[${index}] 缺少 left`);
            if (!hasText(rule.right)) errors.push(`rules[${index}] 缺少 right`);
            if (hasText(rule.left) && !knownIds.has(rule.left)) errors.push(`rules[${index}].left 引用了不存在的 entity id: ${rule.left}`);
            if (hasText(rule.right) && !knownIds.has(rule.right)) errors.push(`rules[${index}].right 引用了不存在的 entity id: ${rule.right}`);
        });

        return { errors };
    }

    function getRuleSourceLabel(rule, ruleIndex, clues) {
        if (Number.isInteger(rule && rule.sourceClueIndex)) {
            return `clue[${rule.sourceClueIndex}]`;
        }

        if (hasText(rule && rule.sourceClueId) && Array.isArray(clues)) {
            const clueIndex = clues.findIndex(clue => isPlainObject(clue) && clue.id === rule.sourceClueId);
            if (clueIndex >= 0) return `clue[${clueIndex}]`;
        }

        if (Array.isArray(clues) && ruleIndex < clues.length) {
            return `clue[${ruleIndex}]`;
        }

        return `rule[${ruleIndex}]`;
    }

    function validateUploadedCaseAnswer(item) {
        if (!isPlainObject(item) || !isPlainObject(item.solution)) {
            return {
                enabled: false,
                ok: false,
                messages: ['答案校验：格式校验未通过，已跳过。']
            };
        }

        if (!Array.isArray(item.rules) || item.rules.length === 0) {
            return {
                enabled: false,
                ok: true,
                messages: ['答案校验：暂未启用 / 缺少结构化 rules。当前不会理解自然语言 clues。']
            };
        }

        const solutionIds = new Set([
            item.solution.suspect,
            item.solution.weapon,
            item.solution.location
        ].filter(Boolean));
        const conflicts = [];

        item.rules.forEach((rule, index) => {
            if (!isPlainObject(rule) || !hasText(rule.left) || !hasText(rule.right)) return;

            const leftInSolution = solutionIds.has(rule.left);
            const rightInSolution = solutionIds.has(rule.right);
            const sourceLabel = getRuleSourceLabel(rule, index, item.clues);

            if (rule.type === 'same' && leftInSolution !== rightInSolution) {
                conflicts.push(`${sourceLabel} 与 solution 冲突：${rule.left} 和 ${rule.right} 应该在同一答案组合中`);
            }

            if (rule.type === 'notSame' && leftInSolution && rightInSolution) {
                conflicts.push(`${sourceLabel} 与 solution 冲突：${rule.left} 和 ${rule.right} 不应在同一答案组合中`);
            }
        });

        return {
            enabled: true,
            ok: conflicts.length === 0,
            messages: conflicts
        };
    }

    function findSolutionRow(rows, solution) {
        if (!Array.isArray(rows) || !isPlainObject(solution)) return null;

        const bySuspect = rows.find(row => row && row.suspect === solution.suspect);
        if (bySuspect) return bySuspect;

        const byWeaponAndLocation = rows.find(row => row && row.weapon === solution.weapon && row.location === solution.location);
        if (byWeaponAndLocation) return byWeaponAndLocation;

        return rows[0] || null;
    }

    function formatSolutionTriplet(row) {
        if (!row) return '无';
        return `${row.suspect || '?'} / ${row.weapon || '?'} / ${row.location || '?'}`;
    }

    function formatSolutionSample(rows, solution) {
        const row = findSolutionRow(rows, solution);
        return {
            suspect: row && row.suspect,
            weapon: row && row.weapon,
            location: row && row.location,
            text: formatSolutionTriplet(row),
            fullTruth: Array.isArray(rows) ? rows : []
        };
    }

    function solutionMatchesRow(solution, row) {
        return Boolean(row)
            && row.suspect === solution.suspect
            && row.weapon === solution.weapon
            && row.location === solution.location;
    }

    function validateUploadedUniqueSolution(item) {
        const baseResult = {
            status: 'error',
            solutions: [],
            count: 0,
            matchesSolution: false,
            messages: []
        };

        if (!isPlainObject(item)) {
            return {
                ...baseResult,
                messages: ['唯一解验证失败：案件数据格式错误。']
            };
        }

        if (!Array.isArray(item.rules) || item.rules.length === 0) {
            return {
                status: 'unsupported',
                solutions: [],
                count: 0,
                matchesSolution: false,
                messages: ['当前案件缺少结构化 rules，无法执行唯一解验证。']
            };
        }

        if (!global.CleverGridSolver || typeof global.CleverGridSolver.solveCase !== 'function') {
            return {
                status: 'error',
                solutions: [],
                count: 0,
                matchesSolution: false,
                messages: ['唯一解验证失败：未加载 src/solver.js。']
            };
        }

        try {
            const result = global.CleverGridSolver.solveCase(item, {
                solutionLimit: 5,
                stopAfterMultiple: false
            });
            const count = Number.isFinite(result.count) ? result.count : result.solutionCount || 0;
            const solutions = (Array.isArray(result.solutions) ? result.solutions : [])
                .slice(0, 5)
                .map(rows => formatSolutionSample(rows, item.solution));

            if (result.status === 'invalid') {
                return {
                    status: 'error',
                    solutions,
                    count,
                    matchesSolution: false,
                    messages: result.errors && result.errors.length
                        ? result.errors
                        : ['唯一解验证失败：Solver 输入无效。']
                };
            }

            if (result.status === 'none') {
                return {
                    status: 'none',
                    solutions: [],
                    count: 0,
                    matchesSolution: false,
                    messages: [
                        '唯一解验证失败：无可行解。',
                        '可能原因：rules 之间互相冲突。',
                        '可能原因：solution 与 rules 冲突。',
                        '可能原因：某些实体被所有可能性排除。'
                    ]
                };
            }

            if (result.status === 'multiple') {
                return {
                    status: 'multiple',
                    solutions,
                    count,
                    matchesSolution: false,
                    messages: [
                        `唯一解验证失败：存在多个可行解。`,
                        `当前找到 ${count} 个可行解，已展示前 ${solutions.length} 个。`
                    ]
                };
            }

            if (result.status === 'unique') {
                const uniqueRows = result.solutions && result.solutions[0];
                const solvedRow = findSolutionRow(uniqueRows, item.solution);

                if (!solutionMatchesRow(item.solution, solvedRow)) {
                    return {
                        status: 'unique',
                        solutions: solutions.length ? solutions : [formatSolutionSample(uniqueRows, item.solution)],
                        count,
                        matchesSolution: false,
                        messages: [
                            '唯一解验证失败：Solver 得出的唯一答案与 solution 不一致。',
                            `当前 solution: ${formatSolutionTriplet(item.solution)}`,
                            `Solver 解出答案: ${formatSolutionTriplet(solvedRow)}`
                        ]
                    };
                }

                return {
                    status: 'unique',
                    solutions: solutions.length ? solutions : [formatSolutionSample(uniqueRows, item.solution)],
                    count,
                    matchesSolution: true,
                    messages: [
                        '当前案件存在唯一解。',
                        '唯一解与 solution 一致。'
                    ]
                };
            }

            return {
                status: 'error',
                solutions,
                count,
                matchesSolution: false,
                messages: result.messages && result.messages.length
                    ? result.messages
                    : ['唯一解验证失败：Solver 返回了未知状态。']
            };
        } catch (error) {
            return {
                status: 'error',
                solutions: [],
                count: 0,
                matchesSolution: false,
                messages: [`唯一解验证失败：${error && error.message ? error.message : 'Solver 执行异常。'}`]
            };
        }
    }

    function normalizeUploadedCase(item) {
        if (!isPlainObject(item)) return item;

        const orderedKeys = [
            'id',
            'version',
            'title',
            'difficulty',
            'intro',
            'suspects',
            'weapons',
            'locations',
            'clues',
            'rules',
            'solution',
            'fullTruth'
        ];
        const normalized = {};

        orderedKeys.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                normalized[key] = key === 'difficulty' ? normalizeDifficulty(item[key]) : item[key];
            }
        });

        Object.keys(item).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(normalized, key)) {
                normalized[key] = item[key];
            }
        });

        return normalized;
    }

    global.CleverGridValidator = {
        hasText,
        DIFFICULTY_LABELS,
        LEGACY_DIFFICULTY_VALUES,
        normalizeDifficulty,
        isStandardDifficulty,
        isLegacyDifficulty,
        formatDifficulty,
        parseSolution,
        decodeSolution,
        collectIds,
        findDuplicates,
        validateRules,
        validateSolver,
        validateCase,
        validateUploadedCase,
        validateUploadedCaseAnswer,
        validateUploadedUniqueSolution,
        normalizeUploadedCase
    };
})(globalThis);
