(function (global) {
    function collectIds(items) {
        return (Array.isArray(items) ? items : []).map(item => item && item.id).filter(Boolean);
    }

    function makeInvalid(errors, warnings) {
        return {
            status: 'invalid',
            count: 0,
            solutionCount: 0,
            solutions: [],
            messages: errors || [],
            warnings: warnings || [],
            errors: errors || []
        };
    }

    function permute(values) {
        const results = [];
        const used = new Array(values.length).fill(false);
        const current = [];

        function backtrack() {
            if (current.length === values.length) {
                results.push(current.slice());
                return;
            }

            values.forEach((value, index) => {
                if (used[index]) return;
                used[index] = true;
                current.push(value);
                backtrack();
                current.pop();
                used[index] = false;
            });
        }

        backtrack();
        return results;
    }

    function buildRows(suspectIds, weaponOrder, locationOrder) {
        return suspectIds.map((suspectId, index) => ({
            suspect: suspectId,
            weapon: weaponOrder[index],
            location: locationOrder[index]
        }));
    }

    function findRowIndex(rows, id) {
        return rows.findIndex(row => row.suspect === id || row.weapon === id || row.location === id);
    }

    function ruleMatches(rows, rule) {
        const leftIndex = findRowIndex(rows, rule.left);
        const rightIndex = findRowIndex(rows, rule.right);

        if (leftIndex < 0 || rightIndex < 0) return false;
        if (rule.type === 'same') return leftIndex === rightIndex;
        if (rule.type === 'notSame') return leftIndex !== rightIndex;
        return false;
    }

    function solveCase(caseData, options) {
        const config = options || {};
        const solutionLimit = Number.isFinite(config.solutionLimit) ? config.solutionLimit : 5;
        const stopAfterMultiple = config.stopAfterMultiple !== false;
        const suspects = collectIds(caseData && caseData.suspects);
        const weapons = collectIds(caseData && caseData.weapons);
        const locations = collectIds(caseData && caseData.locations);
        const rules = Array.isArray(caseData && caseData.rules) ? caseData.rules : [];
        const errors = [];
        const warnings = [];

        if (!caseData || typeof caseData !== 'object') {
            return makeInvalid(['caseData 不存在或格式错误'], warnings);
        }

        if (!suspects.length || !weapons.length || !locations.length) {
            errors.push('suspects / weapons / locations 不能为空');
        }

        if (suspects.length !== weapons.length || weapons.length !== locations.length) {
            errors.push('suspects / weapons / locations 数量必须一致');
        }

        if (!Array.isArray(caseData.rules)) {
            errors.push('rules 必须是数组');
        }

        const allIds = new Set([...suspects, ...weapons, ...locations]);
        rules.forEach((rule, index) => {
            const label = rule && rule.id ? rule.id : `第 ${index + 1} 条 rule`;
            if (!rule || (rule.type !== 'same' && rule.type !== 'notSame')) {
                errors.push(`${label} type 不合法`);
            }
            if (!rule || !allIds.has(rule.left)) {
                errors.push(`${label} left 不存在`);
            }
            if (!rule || !allIds.has(rule.right)) {
                errors.push(`${label} right 不存在`);
            }
        });

        if (errors.length) {
            return makeInvalid(errors, warnings);
        }

        const weaponPermutations = permute(weapons);
        const locationPermutations = permute(locations);
        const solutions = [];
        let solutionCount = 0;

        for (let weaponIndex = 0; weaponIndex < weaponPermutations.length; weaponIndex += 1) {
            for (let locationIndex = 0; locationIndex < locationPermutations.length; locationIndex += 1) {
                const rows = buildRows(suspects, weaponPermutations[weaponIndex], locationPermutations[locationIndex]);
                const matchesAllRules = rules.every(rule => ruleMatches(rows, rule));

                if (!matchesAllRules) continue;
                solutionCount += 1;
                if (solutions.length < solutionLimit) {
                    solutions.push(rows);
                }

                if (stopAfterMultiple && solutions.length >= 2) {
                    return {
                        status: 'multiple',
                        count: solutionCount,
                        solutionCount,
                        solutions,
                        messages: ['当前 rules 可推出多个解。'],
                        warnings,
                        errors
                    };
                }
            }
        }

        const status = solutionCount === 1 ? 'unique' : (solutionCount > 1 ? 'multiple' : 'none');

        return {
            status,
            count: solutionCount,
            solutionCount,
            solutions,
            messages: solutionCount === 0 ? ['当前 rules 无可行解。'] : (solutionCount > 1 ? ['当前 rules 可推出多个解。'] : []),
            warnings,
            errors
        };
    }

    global.CleverGridSolver = {
        solveCase
    };
})(globalThis);
